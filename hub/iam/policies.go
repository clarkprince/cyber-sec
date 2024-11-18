package iam

import (
	"cmp"
	_ "embed"
	"errors"
	"fmt"
	"sort"
	"strings"
	"text/scanner"
	"unicode"

	"trout.software/kraken/webapp/internal/docparse"
)

const (
	// default labels for users and resources => same as no label
	UserLabel     = "t.sftw/user_t"
	ResourceLabel = "t.sftw/unlabeled_t"

	AdminLabel             = "t.sftw/sysadmin_t"
	ComplianceOfficerLabel = "t.sftw/complianceofficer_t"
)

// An action on a specific resource in the system.
// Must take a value generated in “policy_table.go”.
type Action uint16

func (a Action) String() string {
	idx, ok := sort.Find(len(policyActionTable), func(i int) int { return cmp.Compare(a, policyActionTable[i].Code) })
	if !ok {
		return "<invalid>"
	}
	return policyActionTable[idx].Name
}

type Rule struct {
	Forbid    bool
	BlockName string
	User      Label
	Resource  Label
	Actions   []string

	acodes []Action
}

// Syntax tree returned from the parsing stage
// This is only exported for polgen code generation
type Policy struct {
	Rules  []Rule
	Labels []Label

	Actions []string

	index map[Label][]int
}

func (p Policy) PrettyPrint() string {
	var buf strings.Builder

	for _, a := range p.Actions {
		fmt.Fprintln(&buf, "action", a)
	}
	fmt.Fprintln(&buf, "")

	for _, l := range p.Labels {
		fmt.Fprintln(&buf, "label", l)
	}

	blockname := ""
	for _, r := range p.Rules {
		if r.BlockName != blockname {
			if blockname != "" {
				fmt.Fprintln(&buf, "}")
			}
			fmt.Fprintln(&buf, "\nblock", r.BlockName, "{")
			blockname = r.BlockName
		}

		if r.Forbid {
			fmt.Fprint(&buf, "\tforbid ")
		} else {
			fmt.Fprint(&buf, "\tallow ")
		}
		fmt.Fprint(&buf, r.User, " ", r.Resource, " {")
		fmt.Fprint(&buf, strings.Join(r.Actions, " "))
		fmt.Fprintln(&buf, "}")
	}
	if len(p.Rules) > 0 {
		fmt.Fprintln(&buf, "}")
	}

	return buf.String()
}

var AccessDenied = errors.New("access denied")

// checkAccess ensures that a given action can be performed on a resource.
// Failure with this function should generally trigger an event in the audit log (cf example).
func (s *Session) CheckAccess(action Action, resource Label) error {
	for _, l := range s.Labels {
		if err := checkAccess(s.Policy, action, l, resource); err == nil {
			return nil
		}
	}

	return AccessDenied
}

func checkAccess(p *Policy, action Action, user, resource Label) error {
	const matchallmask = 0o77000

	ui := p.index[user]
	ri := p.index[resource]
	for i, j := 0, 0; i < len(ui) && j < len(ri); {
		switch {
		case ui[i] < ri[j]:
			i++
		case ri[j] < ui[i]:
			j++
		case ui[i] == ri[j]:
			for _, a := range p.Rules[ui[i]].acodes {
				if a == action || a&matchallmask == a && action&matchallmask == a {
					return nil
				}
			}
			i++
			j++
		}
	}

	return AccessDenied
}

//go:embed default_policy
var DefaultPolicy string

// ParsePolicy reads the inline policy document.
//
// The document should be formated per our policy syntax (undefined terminals consist of valid Go identifiers, incl. dot):
//
//	policy = { statement } .
//	statement = actiondef | label | block .
//	actiondef = "action" actionname .
//	label = "label" fqn .
//	block = "block" fqn "{" { rule } "}" .
//	rule = ( "allow" | "forbid" ) fqn fqn "{" actionname "}" .
//	actioname = system "/" identifier .
//	fqn = domain "/" identifier .
func ParsePolicy(doc string, check bool) (*Policy, error) {
	p := docparse.Init[Policy](doc,
		docparse.Filename("default_policy"),
		docparse.IsIdentRune(func(ch rune, i int) bool {
			return unicode.IsLetter(ch) || i == 0 && ch == '%' || i > 0 && (ch == '.' || ch == '_' || unicode.IsDigit(ch))
		}),
	)
	for p.More() {
		parsePolicyStatement(p)
	}

	pol, err := p.Finish()
	if err != nil {
		return nil, err
	}

	if !check {
		return pol, nil
	}
	if err := pol.checkAndIndex(); err != nil {
		return nil, err
	}

	return pol, nil
}

// ensure that all labels and actions are defined, then index them
func (stree *Policy) checkAndIndex() error {
	for _, a := range stree.Actions {
		if actionIndex(a) == noSuchAction {
			return fmt.Errorf("no such action: %s (did you forget to run `go generate`?)", a)
		}
	}

	// error reporting: the rules are only ever written directly by Trout developers
	// (custom rules are set by the SQL admin interface). Opt for a minimally useful form.
	labels := make(map[Label]bool)
	for _, l := range stree.Labels {
		labels[l] = true
	}

	stree.index = make(map[Label][]int)
	for i, r := range stree.Rules {
		if r.Forbid {
			return fmt.Errorf("rule %d contains a forbid statement: this is currently not implemented", i)
		}

		if !labels[r.User] {
			return fmt.Errorf("unknown user label %s in rule %d", r.User, i)
		}
		if !labels[r.Resource] {
			return fmt.Errorf("unknown user label %s in rule %d", r.Resource, i)
		}

		stree.Rules[i].acodes = make([]Action, len(r.Actions))
		for j, a := range r.Actions {
			if code := actionIndex(a); code != noSuchAction {
				stree.Rules[i].acodes[j] = code
			} else {
				return fmt.Errorf("no such action: %s", a)
			}
		}

		stree.index[r.User] = append(stree.index[r.User], i)
		stree.index[r.Resource] = append(stree.index[r.Resource], i)
	}

	return nil
}

func actionIndex(name string) Action {
	idx, ok := sort.Find(len(policyActionTable), func(i int) int { return cmp.Compare(name, policyActionTable[i].Name) })
	if !ok {
		return noSuchAction
	}
	return policyActionTable[idx].Code
}

func parsePolicyStatement(p *docparse.Parser[Policy]) {
	defer p.Synchronize()

	switch p.Match(scanner.Ident); p.Lit {
	case "action":
		name := parseFQN(p)
		p.Value.Actions = append(p.Value.Actions, name)
	case "label":
		name := parseFQN(p)
		p.Value.Labels = append(p.Value.Labels, Label(name))
	case "block":
		parsePolicyBlock(p)
	default:
		p.Errf("expected one of action, label or block")
	}
}

func parsePolicyBlock(p *docparse.Parser[Policy]) {
	name := parseFQN(p)

	p.Expect('{', "opening bracket after block")
	for !p.Match('}') {
		r := Rule{BlockName: name}
		switch p.Match(scanner.Ident); p.Lit {
		case "allow":
			// pass through
		case "forbid":
			r.Forbid = true
		default:
			p.Errf(`expected "allow" or "forbid"`)
		}

		r.User = Label(parseFQN(p))
		r.Resource = Label(parseFQN(p))

		p.Expect('{', "opening bracket after resource")
		for !p.Match('}') {
			r.Actions = append(r.Actions, parseFQN(p))
		}
		p.Value.Rules = append(p.Value.Rules, r)
	}
}

func parseFQN(p *docparse.Parser[Policy]) string {
	p.Expect(scanner.Ident, "domain name")
	domain := p.Lit

	p.Expect('/', "/")

	p.Expect(scanner.Ident, "base name")
	name := p.Lit

	return domain + "/" + name
}
