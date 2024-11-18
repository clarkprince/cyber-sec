package mdt

import (
	"strconv"
	"strings"
	"text/scanner"
)

type (
	// An Expression node represents a production expression.
	Expression interface {
		String() string
	}
	// A ebName node represents a production name.
	ebName string

	// A ebProduction node represents an EBNF production.
	ebProduction struct {
		Name     ebName
		Metadata string
		Expr     Expression
	}

	// An ebAlternative node represents a non-empty list of alternative expressions.
	ebAlternative []Expression // x | y | z

	// A ebSequence node represents a non-empty list of sequential expressions.
	ebSequence []Expression // x y z

	// A ebToken node represents a literal.
	ebToken string

	// A ebList node represents a range of characters.
	ebList struct {
		Begin, End rune // begin ... end
	}

	// A ebGroup node represents a grouped expression.
	ebGroup struct {
		Body Expression // (body)
	}

	// An ebOption node represents an optional expression.
	ebOption struct {
		Body Expression // [body]
	}

	// A ebRepetition node represents a repeated expression.
	ebRepetition struct {
		Body Expression // {body}
	}

	// ebAny is a specific matcher for all characters
	ebAny struct{}

	// A Bad node stands for pieces of source code that lead to a parse error.
	Bad struct {
		TokPos scanner.Position
		Error  string // parser error message
	}

	// A Grammar is a set of EBNF productions. The map
	// is indexed by production name.
	//
	Grammar map[string]*ebProduction
)

func (x ebAlternative) String() string {
	var buf strings.Builder
	for i, v := range x {
		if i > 0 {
			buf.WriteString(" | ")
		}

		buf.WriteString(v.String())
	}
	return buf.String()
}

func (x ebSequence) String() string {
	var buf strings.Builder
	for i, v := range x {
		if i > 0 {
			buf.WriteString(" ")
		}

		buf.WriteString(v.String())
	}
	return buf.String()
}
func (x ebProduction) String() string {
	if x.Metadata != "" {
		return x.Name.String() + ":" + strconv.Quote(x.Metadata) + "=" + x.Expr.String()
	}
	return x.Name.String() + "=" + x.Expr.String()
}

func (x ebList) String() string       { return string(x.Begin) + " … " + string(x.End) }
func (x ebGroup) String() string      { return "( " + x.Body.String() + " )" }
func (x ebOption) String() string     { return "[ " + x.Body.String() + " ]" }
func (x ebRepetition) String() string { return "{ " + x.Body.String() + " }" }
func (x Bad) String() string          { return "<ERROR>" }
func (x ebName) String() string       { return string(x) }
func (x ebToken) String() string      { return strconv.Quote(string(x)) }
func (x ebAny) String() string        { return "_" }

func (g Grammar) Metadata(name string) string {
	idx := strings.LastIndexByte(name, '.')
	if idx != -1 {
		name = name[idx+1:]
	}

	if p := g[name]; p == nil {
		return ""
	} else {
		return p.Metadata
	}
}
