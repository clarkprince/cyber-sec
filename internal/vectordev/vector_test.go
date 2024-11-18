package vectordev

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestSplitComma(t *testing.T) {
	cases := []struct {
		in  string
		out []string
	}{
		{"a", []string{"a"}},
		{", a", []string{"a"}},
		{" , a", []string{"a"}},
		{"a,b", []string{"a", "b"}},
		{"a,,b", []string{"a", "b"}},
		{"a, b", []string{"a", "b"}},
		{"a ,b", []string{"a", "b"}},
		{"a,b ", []string{"a", "b"}},
		{"a,b, ", []string{"a", "b"}},
		{"a, b, cd", []string{"a", "b", "cd"}},
	}

	for _, c := range cases {
		got := splitcommas(c.in)
		if !cmp.Equal(got, c.out) {
			t.Errorf("in splitcommas(%s): %s", c.in, cmp.Diff(got, c.out))
		}
	}
}
