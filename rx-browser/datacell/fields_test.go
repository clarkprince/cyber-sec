package main

import (
	"sort"
	"testing"
	"testing/quick"
)

func TestOMap(t *testing.T) {
	maintainOrder := func(names []string) bool {
		if len(names) > hashFieldSize {
			return true
		}

		// remove duplicates
		sort.Strings(names)
		names = compact(names)
		t.Log("len names", len(names))
		var f Fields
		for _, n := range names {
			t.Logf("conj %x", n)
			f.Conj(n)
		}

		for i, n := range names {
			if f.At(i).name != n {
				t.Logf("at %d: want=%x got=%x", i, n, f.At(i).name)
				return false
			}
		}

		return true
	}

	t.Run("simple cases", func(t *testing.T) {
		cases := []struct {
			names []string
		}{
			{[]string{"a", "b", "c"}},
			{[]string{"a", "a", "b"}},
			{[]string{"b", "", "a", ""}},
		}

		for _, c := range cases {
			if !maintainOrder(c.names) {
				t.Error("invalid order", c.names)
			}
		}
	})

	t.Run("property testing", func(t *testing.T) {
		if err := quick.Check(maintainOrder, nil); err != nil {
			t.Error(err)
		}
	})
}

func compact[S ~[]E, E comparable](s S) S {
	if len(s) < 2 {
		return s
	}
	i := 1
	last := s[0]
	for _, v := range s[1:] {
		if v != last {
			s[i] = v
			i++
			last = v
		}
	}
	return s[:i]
}

func TestAPIFields(t *testing.T) {
	var f Fields

	f.Conj("col1").distrib[0] = 12
}
