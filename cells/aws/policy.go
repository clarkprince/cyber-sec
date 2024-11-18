package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"unicode/utf8"

	"trout.software/kraken/webapp/internal/mdt"
)

type policyParser struct {
	dec *json.Decoder
	buf *bytes.Buffer

	tk json.Token

	err error
}

func (p *policyParser) expect(d rune) {
	tk := p.Token()
	s, ok := tk.(json.Delim)
	if p.err != nil && (!ok || rune(s) != d) {
		p.err = fmt.Errorf("at offset %d: expected %q, got %q", p.dec.InputOffset(), d, s)
	}
}

func (p *policyParser) expectString() string {
	tk := p.Token()
	s, ok := tk.(string)
	if p.err != nil && (!ok) {
		p.err = fmt.Errorf("at offset %d: expected string, got %s", p.dec.InputOffset(), tk)

	}
	return s
}

func (p *policyParser) Token() json.Token {
	tk, err := p.dec.Token()
	if err != nil && p.err == nil {
		p.err = fmt.Errorf("at offset %d: %w", p.dec.InputOffset(), err)
	}
	p.tk = tk

	return tk
}

func (p *policyParser) until(d json.Delim) bool {
	p.tk = p.Token()
	if p.err != nil {
		return false
	}

	g, ok := p.tk.(json.Delim)
	return !ok || g != d
}

type Policy struct {
	id  string
	stt []statement
}

func ParsePolicy(p string) (mdt.LioLi, error) {
	var id string
	var stt []statement

	pr := &policyParser{
		dec: json.NewDecoder(strings.NewReader(p)),
	}

	pr.expect('{')
	for pr.until('}') {
		switch pr.tk {
		case "Version":
			pr.expectString()
		case "Id":
			id = pr.expectString()
		case "Statement":
			pr.expect('[')
			for pr.until(']') {
				stt = append(stt, pr.parseStatement(id))
			}
		}
	}

	var ll mdt.LioLi
	for _, st := range stt {
		ll = append(ll, st.toRecords()...)
	}

	return ll, pr.err

}

func (p *policyParser) parseStatement(policy string) statement {
	s := statement{Policy: policy}
	for p.until('}') { // opening '{' read at previous level
		switch p.tk {
		case "Sid":
			s.Sid = p.expectString()
		case "Effect":
			s.Effect = p.expectString()
		case "Principal", "NotPrincipal":
			switch tk := p.Token().(type) {
			case string:
				s.Principals = []kv{{k: tk}}
			case json.Delim:
				s.Principals = p.parsePrincipals()
			}
		case "Action", "NotAction":
			k := p.tk.(string)
			switch tk := p.Token().(type) {
			case string:
				s.Actions = []kv{{k: k, v: tk}}
			case json.Delim:
				for p.until(']') {
					s.Actions = append(s.Actions, kv{k: k, v: p.tk.(string)})
				}
			}
		case "Resource", "NotResource":
			k := p.tk.(string)
			switch tk := p.Token().(type) {
			case string:
				s.Resources = []kv{{k: k, v: tk}}
			case json.Delim:
				for p.until(']') {
					s.Resources = append(s.Resources, kv{k: k, v: p.tk.(string)})
				}
			}
		case "Condition":
			s.Conditions = p.parseConditions()
		default:
			p.err = fmt.Errorf("at offset %d: unexpected token %v", p.dec.InputOffset(), p.tk)
		}
	}
	return s
}

func (p *policyParser) parsePrincipals() (pals []kv) {
	for p.until('}') {
		t := p.tk.(string)
		switch tk := p.Token().(type) {
		case string:
			pals = append(pals, kv{k: t, v: tk})
		case json.Delim:
			for p.until(']') {
				pals = append(pals, kv{k: t, v: p.tk.(string)})
			}
		}
	}
	return pals
}

func (p *policyParser) parseConditions() (conds []kv) {
	p.expect('{')
	for p.until('}') {
		// TODO(rdo) infer types from p.tk
		p.expect('{')
		p.expectString()
	pCond:
		k := p.tk.(string)
		conds = append(conds, kv{k: k, v: p.expectString()})
		switch p.Token().(type) {
		case json.Delim:
			// continue loop
		case string:
			goto pCond
		}
	}
	return conds
}

type statement struct {
	Policy     string
	Sid        string
	Effect     string
	Principals []kv
	Actions    []kv
	Resources  []kv
	Conditions []kv
}

type kv struct{ k, v string }

func (st statement) toRecords() (rc []mdt.Record) {
	rc = make([]mdt.Record, len(st.Actions)*len(st.Resources)*len(st.Principals))
	i := 0

	for _, a := range st.Actions {
		for _, r := range st.Resources {
			for _, p := range st.Principals {
				var rb mdt.RecordBuilder

				rb.Append("policy", st.Policy)
				rb.Append("statement", st.Sid)
				rb.Append("effect", st.Effect)
				rb.Append("action", a.v)
				rb.Append("resource", r.v)
				rb.Append("principal", p.v)
				for _, c := range st.Conditions {
					rb.Append(prettify(c.k), c.v)
				}
				rc[i] = rb.Build()
				i++
			}

		}
	}

	return rc
}

func prettify(s string) string {
	isvalidrune := func(i int, r rune) bool { return 'a' <= r && r <= 'z' || (i > 0 && r == '_' || '0' <= r && r <= '9') }

	// fast path, no alloc
	j := 0
	for i, r := range s {
		if isvalidrune(i, r) {
			j = i
		} else {
			break
		}
	}
	if j == len(s) {
		return s
	}

	out := make([]byte, j, len(s))
	copy(out, s[:j])

	for i, r := range s[j:] {
		switch {
		default:
			out = utf8.AppendRune(out, '_')
			j++

		case isvalidrune(i+j, r):
			out = utf8.AppendRune(out, r)
			j += utf8.RuneLen(r)
		case 'A' <= r && r <= 'Z':
			const toLower = 0x20
			out = utf8.AppendRune(out, r+toLower)
			j++
		}
	}
	return string(out)
}

/*
policy  = {
     <version_block?>
     <id_block?>
     <statement_block>
}

<version_block> = "Version" : ("2008-10-17" | "2012-10-17")

<id_block> = "Id" : <policy_id_string>

<statement_block> = "Statement" : [ <statement>, <statement>, ... ]

<statement> = {
    <sid_block?>,
    <principal_block?>,
    <effect_block>,
    <action_block>,
    <resource_block>,
    <condition_block?>
}

<sid_block> = "Sid" : <sid_string>

<effect_block> = "Effect" : ("Allow" | "Deny")

<principal_block> = ("Principal" | "NotPrincipal") : ("*" | <principal_map>)

<principal_map> = { <principal_map_entry>, <principal_map_entry>, ... }

<principal_map_entry> = ("AWS" | "Federated" | "Service" | "CanonicalUser") :
    [<principal_id_string>, <principal_id_string>, ...]

<action_block> = ("Action" | "NotAction") :
    ("*" | [<action_string>, <action_string>, ...])

<resource_block> = ("Resource" | "NotResource") :
    ("*" | [<resource_string>, <resource_string>, ...])

<condition_block> = "Condition" : { <condition_map> }
<condition_map> = {
  <condition_type_string> : { <condition_key_string> : <condition_value_list> },
  <condition_type_string> : { <condition_key_string> : <condition_value_list> }, ...
}
<condition_value_list> = [<condition_value>, <condition_value>, ...]
<condition_value> = ("string" | "number" | "Boolean")
*/
