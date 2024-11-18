package mdt

import (
	"fmt"
	"strings"
)

func (g Grammar) PrettyPrint(start string) string {
	var buf strings.Builder

	root, found := g[start]
	if !found {
		panic("no start " + start)
	}
	stack := []Expression{root}

	seen := make(map[ebName]bool)

	var ppe func(Expression)
	ppe = func(exp Expression) {
		switch exp := exp.(type) {
		case *ebProduction:
			fmt.Fprint(&buf, exp.Name)
			if exp.Metadata != "" {
				fmt.Fprintf(&buf, ":%q", exp.Metadata)
			}
			fmt.Fprint(&buf, " = ")
			ppe(exp.Expr)
			buf.WriteString(" .\n")
		case ebSequence:
			for i, exp := range exp {
				if i > 0 {
					buf.WriteRune(' ')
				}
				ppe(exp)
			}
		case *ebRepetition:
			buf.WriteString("{ ")
			ppe(exp.Body)
			buf.WriteString(" }")
		case *ebOption:
			fmt.Fprint(&buf, "[ ")
			ppe(exp.Body)
			fmt.Fprint(&buf, " ]")
		case *ebGroup:
			fmt.Fprint(&buf, "( ")
			ppe(exp.Body)
			fmt.Fprint(&buf, " )")
		case ebName:
			buf.WriteString(string(exp))
			if !seen[exp] {
				stack = append(stack, g[string(exp)])
				seen[exp] = true
			}
		case *ebList:
			fmt.Fprintf(&buf, "%q … %q", exp.Begin, exp.End)
		case ebAlternative:
			for i, exp := range exp {
				if i > 0 {
					buf.WriteString(" | ")
				}
				ppe(exp)
			}
		default:
			fmt.Fprintf(&buf, "%s", exp)
		}
	}
	for len(stack) > 0 {
		var exp Expression
		exp, stack = stack[0], stack[1:]
		ppe(exp)
	}
	return buf.String()
}
