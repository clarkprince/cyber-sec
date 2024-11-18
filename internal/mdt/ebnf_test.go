package mdt

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestGrammarParser(t *testing.T) {
	cases := []struct {
		str string
		grm Grammar
	}{{`root = timestamp ":" message .
timestamp:"2006-01-02" = _ .
message = _ .`, Grammar{
		"root": &ebProduction{
			Name: "root",
			Expr: ebSequence{ebName("timestamp"), ebToken(":"), ebName("message")},
		},
		"message": &ebProduction{
			Name: "message",
			Expr: ebAny{},
		},
		"timestamp": &ebProduction{
			Name:     "timestamp",
			Expr:     ebAny{},
			Metadata: "2006-01-02",
		},
	}}}

	for _, c := range cases {
		got, err := ParseGrammar(c.str)
		if err != nil {
			t.Fatalf("invalid grammar %s: %s", c.str, err)
		}

		if !cmp.Equal(got, c.grm) {
			t.Errorf("invalid parse in %s: %s", c.grm, cmp.Diff(got, c.grm))
		}
	}
}
