package main

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestPivotList(t *testing.T) {
	var r PivotRack
	checkhas := func(want ...Pivot) {
		opts := cmp.Options{
			cmp.Comparer(func(x, y ulid.ULID) bool { return x.Compare(y) == 0 }),
			cmpopts.IgnoreUnexported(Pivot{}),
		}

		var got []Pivot
		for pivot := r.pivots; pivot != nil; pivot = pivot.next {
			got = append(got, *pivot)
		}

		if !cmp.Equal(want, got, opts...) {
			t.Error(cmp.Diff(want, got, opts...))
		}
	}

	checkhas()

	// rely insertion order through name
	p1 := Pivot{PivotDefinition: msg.PivotDefinition{ID: ulid.Make(), Name: "elephant"}}
	p2 := Pivot{PivotDefinition: msg.PivotDefinition{ID: ulid.Make(), Name: "lion"}}
	p3 := Pivot{PivotDefinition: msg.PivotDefinition{ID: ulid.Make(), Name: "bonobo"}}

	// simple sort
	r.insertpivot(p1)
	r.insertpivot(p2)
	r.insertpivot(p3)
	checkhas(p3, p1, p2)

	// relabel
	p1.Name = "orangutan"
	r.insertpivot(p1)
	checkhas(p3, p2, p1)

	// label before
	p2.Name = "anaconda"
	r.insertpivot(p2)
	checkhas(p2, p3, p1)

	// delete at back and front
	r.deletepivot(p1)
	checkhas(p2, p3)

	r.deletepivot(p2)
	checkhas(p3)
}

func TestQuoteEscape(t *testing.T) {
	cases := []struct {
		in, out string
	}{
		{`"yesterday"`, `"yesterday"`},
		{`'y'`, `'y'`},
		{`"yes", he "said"`, `"yes", he "said"`},
		{`del’arte`, `del'arte`},
		{`“yesterday”`, `"yesterday"`},
	}

	for _, c := range cases {
		if got := rewriteMacQuotes(c.in); got != c.out {
			t.Errorf("in rewriteMacQuotes(%q): want %q, got %q", c.in, c.out, got)
		}
	}
}
