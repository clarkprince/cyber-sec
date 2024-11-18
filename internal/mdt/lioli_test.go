package mdt

import (
	"fmt"
	"io"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func (ll LioLi) PrintDot(dst io.Writer) {
	// note: OK to peek inside internals here, we _want_ to see the sausage making
	fmt.Fprintln(dst, `digraph g {
		graph [
rankdir = "LR"
]`)
	for i, r := range ll {
		fmt.Fprintf(dst, `subgraph rc_%d {`, i)
		r.capture.PrintDot(dst, r.origin)
		fmt.Fprintln(dst, `}`)
	}

	fmt.Fprintln(dst, "}")
}

func (ll LioLi) first() *Record {
	wlk := ll.Match(AllRecords).IterAll()
	if !wlk.Next() {
		panic("empty LioLi")
	}
	rc := wlk.Record()
	return &rc
}

func TestIterAll(t *testing.T) {
	cases := []struct {
		gram  Grammar
		lines []string
		want  []nv
	}{
		// test boundaries on the left
		{mustparse(`root = "--" fruit . fruit = { 'a' … 'z' } .`),
			[]string{`--banana`, `--potato`},
			[]nv{{"$.fruit", "banana"}, {"$.fruit", "potato"}},
		},
		// test boundaries on the right
		{mustparse(`root = fruit "--" . fruit = { 'a' … 'z' } .`),
			[]string{`apple--`, `potato--`},
			[]nv{{"$.fruit", "apple"}, {"$.fruit", "potato"}},
		},
		// test boundaries on both sides
		{mustparse(`root = "--" fruit "--" . fruit = { 'a' … 'z' } .`),
			[]string{`--banana--`, `--potato--`},
			[]nv{{"$.fruit", "banana"}, {"$.fruit", "potato"}},
		},
	}

	for i, c := range cases {
		spitDot(t, c.gram, fmt.Sprintf("gram%d.png", i))
		var rcs []Record
		for _, l := range c.lines {
			rc, ok := ReadLine(c.gram, []byte(l))
			if !ok {
				t.Fatalf("line %s cannot be parsed by grammar %s", l, c.gram)
			}
			spitDot(t, rc, fmt.Sprintf("capture_%s.png", l))
			rcs = append(rcs, rc)
		}
		got := collect(LioLi(rcs).Match(AllRecords), 10)
		if !cmp.Equal(got, c.want, cmp.AllowUnexported(nv{})) {
			t.Error(cmp.Diff(got, c.want, cmp.AllowUnexported(nv{})))
		}
	}
}

type nv struct{ name, value string }

func collect(v *LView, n int) []nv {
	var found []nv
	for i := v.Iter(0, 10); i.Next(); {
		for w := v.ll.WalkRecord(i.Pos()); w.Next(); {
			if w.IsSeparator() {
				continue
			}
			found = append(found, nv{w.Name(), w.Value()})
		}
	}
	return found
}

func TestIterPreds(t *testing.T) {
	gram := mustparse(`root = { 'a' … 'z' } .`)
	doc := []string{`banana`, `potato`, `apple`, `tomato`, `kiwi`}

	var ll LioLi
	for _, d := range doc {
		rc, ok := ReadLine(gram, []byte(d))
		if !ok {
			t.Fatal("invalid parse for", d)
		}

		ll = append(ll, rc)
	}

	t.Run("numskip", func(t *testing.T) {
		var got []string
		i := ll.Match(func(i Position, s string) bool { return true }).Iter(1, 3)
		for i.Next() {
			recordText := ll.ValueOf(i.Pos())
			got = append(got, recordText)
			if recordText != i.Record().String() {
				t.Fatalf("Text at position and record not matching: %s != %s", recordText, i.Record().String())
			}
		}

		want := []string{`potato`, `apple`, `tomato`}
		if !cmp.Equal(got, want) {
			t.Error(cmp.Diff(got, want))
		}
	})

	t.Run("valskip", func(t *testing.T) {
		var got []string
		i := ll.Match(func(i Position, s string) bool { return s[0] != 'a' }).Iter(0, 10)
		for i.Next() {
			recordText := ll.ValueOf(i.Pos())
			got = append(got, recordText)
			if recordText != i.Record().String() {
				t.Fatalf("Text at position and record not matching: %s != %s", recordText, i.Record().String())
			}
		}

		want := []string{`banana`, `potato`, `tomato`, `kiwi`}
		if !cmp.Equal(got, want) {
			t.Error(cmp.Diff(got, want))
		}
	})
}
