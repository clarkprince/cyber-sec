package mdt

import (
	"strings"
	"testing"
	"unicode/utf8"

	"github.com/google/go-cmp/cmp"
)

func TestRunesIn(t *testing.T) {
	cases := []struct {
		gram   Grammar
		ranges []runerange
	}{
		{mustparse(`root = "a" .`), torange("a")},
		// this would be a nice optimization
		// {MustParse(`root = { "a" "bc"} .`), torange("a")},
		{mustparse(`root = "a" | "b" .`), torange("ab")},
		{mustparse(`root = "a" | "c" .`), torange("ac")},
		{mustparse(`root = {'a' … 'd'} .`), torange("abcd")},
		{mustparse(`root = ("a") .`), torange("a")},
		{mustparse(`root = {'a' … 'd'} | 'f'.`), torange("abcdf")},
		{mustparse(`root = {'a' … 'd'} 'f'.`), torange("abcdf")},
		{mustparse(`root = {'a' … 'd'} [ 'f' ].`), torange("abcdf")},
		{mustparse(`root = "a" B. B = "b" .`), torange("a")},
	}
	cmpranges := cmp.AllowUnexported(runerange{})

	for _, c := range cases {
		t.Run("", func(t *testing.T) {
			d := newCompiler(c.gram)
			la := d.runesIn(c.gram["root"])
			if !cmp.Equal(la, c.ranges, cmpranges) {
				t.Errorf("lookahead for %s: %s", c.gram, cmp.Diff(la, c.ranges, cmpranges))
			}
		})
	}
}

func TestRangeExcl(t *testing.T) {
	cases := []struct {
		l, r, w []runerange
	}{
		{torange("ab"), torange("b"), torange("a")},
		{torange("bc"), torange("b"), torange("c")},
		{torange("ac"), torange("c"), torange("a")},
		{torange("ac"), torange("cd"), torange("a")},
		{torange("ac"), torange("d"), torange("ac")},
		{torange("abcd"), torange("bc"), torange("ad")},
		{[]runerange{{0, maxRune}}, torange("EI="),
			[]runerange{{0, '<'}, {'>', 'D'}, {'F', 'H'}, {'J', maxRune}}},
		{torange("EI="), []runerange{{0, maxRune}}, []runerange{}},
		{[]runerange{{'0', '9'}}, torange(" a"),
			[]runerange{{'0', '9'}}},
	}
	cmpranges := cmp.AllowUnexported(runerange{})

	for _, c := range cases {
		t.Run("", func(t *testing.T) {
			g := rangeexcl(c.l, c.r)
			if !cmp.Equal(g, c.w, cmpranges) {
				t.Errorf("rangeexcl(%v, %v): %s", c.l, c.r, cmp.Diff(g, c.w, cmpranges))
			}
		})
	}
}

func TestMinRange(t *testing.T) {
	cases := []struct {
		in, out []runerange
	}{
		{in: []runerange{{'=', '='}, {'I', 'I'}, {'E', 'E'}},
			out: []runerange{{'=', '='}, {'E', 'E'}, {'I', 'I'}}},
		{in: []runerange{{0, maxRune}, {':', ':'}},
			out: []runerange{{0, maxRune}}},
	}
	cmpranges := cmp.AllowUnexported(runerange{})

	for _, c := range cases {
		t.Run("", func(t *testing.T) {
			r := minrange(c.in)
			if !cmp.Equal(r, c.out, cmpranges) {
				t.Errorf("minrange(%v): %s", c.in, cmp.Diff(r, c.out, cmpranges))
			}
		})
	}
}

func torange(s string) []runerange {
	rr := make([]runerange, utf8.RuneCountInString(s))
	for i, r := range s {
		rr[i] = runerange{lo: r, hi: r}
	}
	return minrange(rr)
}

func mustparse(s string) Grammar {
	g, err := ParseFile("test", strings.NewReader(s))
	if err != nil {
		panic(err)
	}
	return g
}
