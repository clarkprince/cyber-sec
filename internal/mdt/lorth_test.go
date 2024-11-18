package mdt

import (
	"testing"

	"trout.software/kraken/webapp/internal/diff"
)

func TestLORTHSerialization(t *testing.T) {
	cases := []struct {
		label string
		lorth string
	}{
		{"two-entries", `
		datetime "now" .
		"--[" .
		url {
		  verb "GET" .
		  " " .
		  path "/test/mine" .
		};
		datetime "yersterday" .;
	`},
		{"space-only", `"hello".;`},
	}

	for _, c := range cases {
		t.Run(c.label, func(t *testing.T) {
			if got := ParseLORTH(c.lorth).DumpLORTH(); got != c.lorth {
				t.Log(diff.Diff("want", []byte(c.lorth), "got", []byte(got)))
			}
		})
	}
}

func TestZeroRecord(t *testing.T) {
	var r Record
	ll := LioLi{r}

	if got := ll.DumpLORTH(); got != "" {
		t.Error("zero record: got", got)
	}
}
