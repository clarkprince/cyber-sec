package xlsx

import (
	"testing"
)

func TestBase26(t *testing.T) {
	type inout struct {
		Name string
		Int  int
	}

	cases := []inout{
		{"", 0}, // TODO specify
		{"A", 1}, {"B", 2}, {"C", 3}, {"Z", 26},
		{"AA", 27}, {"AB", 28}, {"ZA", 677}, {"ZZ", 702},
		{"XFD", 16384},
	}

	t.Run("frombase26", func(t *testing.T) {
		cases := append(cases,
			inout{"AAAAAAAAAA", 1},
		)
		for _, c := range cases {
			if frombase26(c.Name) != c.Int {
				t.Errorf("frombase26(%s): want %d, got %d", c.Name, c.Int, frombase26(c.Name))
			}
		}
	})

	t.Run("tobase26", func(t *testing.T) {
		cases := append(cases,
			inout{"", 121000},
		)
		for _, c := range cases {
			if tobase26(c.Int) != c.Name {
				t.Errorf("tobase26(%d): want %q, got %q", c.Int, c.Name, tobase26(c.Int))
			}
		}
	})
}
