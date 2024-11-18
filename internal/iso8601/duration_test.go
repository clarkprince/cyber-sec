package iso8601

import (
	"fmt"
	"strconv"
	"strings"
	"testing"
	"time"

	_ "time/tzdata"

	"github.com/google/go-cmp/cmp"
)

func mp(s string) time.Time {
	t, err := time.Parse("2006-01-02T15:04:05Z07 MST", s)
	if err != nil {
		panic("invalid time spec" + s + "( " + err.Error() + ")")
	}

	return t
}

func TestParseDate(t *testing.T) {
	cases := []struct {
		s string
		t time.Time
	}{
		{"2007-03-01T13", mp("2007-03-01T13:00:00Z UTC")},
		{"2007-03-01", mp("2007-03-01T00:00:00Z UTC")},
		{"2007-03-01T13[Europe/Paris]", mp("2007-03-01T13:00:00+01 CET")},
		{"2007-03-01[Europe/Paris]", mp("2007-03-01T00:00:00+01 CET")},
	}

	for _, c := range cases {
		u, err := ParseDate(c.s)
		if err != nil {
			t.Fatal(err)
		}
		if !u.Equal(c.t) {
			t.Errorf("ParseDate(%s): want %s got %s", c.s, c.t, u)
		}
	}
}

func TestParseRepetition(t *testing.T) {
	type checker func([]time.Time, *error)

	var checkLen = func(length int) func(u []time.Time, err *error) {
		return func(u []time.Time, err *error) {
			if len(u) != length {
				*err = fmt.Errorf("expected length of ts %v got %v", length, len(u))
			}
		}
	}
	var checkTs = func(want []time.Time) func(u []time.Time, err *error) {
		return func(u []time.Time, err *error) {
			if !cmp.Equal(want, u) {
				*err = fmt.Errorf("ParseRepetition(%s): %s", want, cmp.Diff(u, want))
			}
		}
	}

	cases := []struct {
		s        string
		checkers checker
	}{
		{s: "R0/2007-03-01/P1W",
			checkers: checkTs([]time.Time{}),
		},
		{s: "R3/2007-03-01/P1W",
			checkers: checkTs([]time.Time{
				mp("2007-03-01T00:00:00Z UTC"),
				mp("2007-03-08T00:00:00Z UTC"),
				mp("2007-03-15T00:00:00Z UTC")}),
		},
		{s: "R2/2007-01-05/P1M",
			checkers: checkTs([]time.Time{
				mp("2007-01-05T00:00:00Z UTC"),
				mp("2007-02-05T00:00:00Z UTC")}),
		},
		{s: "RI/2007-01-05/P1M",
			checkers: checkLen(maxReps),
		},
	}

	for _, c := range cases {
		u, err := ParseRepetition(c.s)
		if err != nil {
			t.Fatal(err)
		}
		c.checkers(u, &err)
		if err != nil {
			t.Fatal(err)
		}
	}
}

func FuzzParseRepetition(f *testing.F) {
	f.Add("R1/2007-03-01/P1W")
	f.Add("R2/2007-02-01/P1D")
	f.Add("R3/2007-05-01/P3M")
	f.Add("R4/2008-05-01/P3Y")

	f.Fuzz(func(t *testing.T, a string) {
		u, err := ParseRepetition(a)
		if err != nil {
			return // most case
		}
		if !strings.HasPrefix(a, "R") {
			t.Errorf("parsed invalid string %s", a)
		}

		sli := strings.IndexRune(a, '/')
		if sli == -1 {
			t.Errorf("parsed invalid string %s", a)
		}

		reps, err := strconv.ParseInt(a[1:sli], 10, 32)
		if err != nil {
			t.Errorf("parsed invalid string %s", a)
		}

		if int(reps) != len(u) {
			t.Errorf("Parsing %s: want %d reps, got %d", a, reps, len(u))
		}
	})

}
