package netwatch

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestBuildCommand(t *testing.T) {
	args := func(cs ...string) []string { return cs }
	t.Run("addr", func(t *testing.T) {
		type A1 struct {
			Name   string `cmd:"name"`
			Weight int    `cmd:"weight"`
		}

		type A2 struct {
			Name   string
			Weight int
			MTU    int
		}

		cases := []struct {
			want A1
			got  A2
			cmd  []string
		}{
			// single field diff, ignore other
			{A1{"host1", 12}, A2{"host1", 50, 200}, args("weight", "12")},
			// zero value in want is ignored
			{A1{"host1", 12}, A2{"host1", 0, 200}, args("weight", "12")},
			{A1{"host1", 0}, A2{"host1", 10, 200}, args()},
			// multiple fields can be set
			{A1{"host2", 23}, A2{"host1", 50, 200}, args("name", "host2", "weight", "23")},
		}

		for _, c := range cases {
			cmd := BuildCommand(c.want, c.got)
			if !cmp.Equal(cmd, c.cmd) {
				t.Errorf("BuildCommand(%v, %v): %s", c.want, c.got, cmp.Diff(cmd, c.cmd))
			}
		}
	})
}
