package main

import (
	"testing"
)

func TestNorm(t *testing.T) {
	cases := []struct {
		label string

		h   hist
		max int
	}{
		{"uint16 wraparound", hist{0, 0, 1, 2, 0, 0, 1, 10, 3, 1983}, 9},
	}

	for _, c := range cases {
		t.Run(c.label, func(t *testing.T) {
			c.h.norm()
			if c.max != c.h.max() {
				t.Errorf("want max %d, got %d", c.max, c.h.max())
			}
		})
	}
}
