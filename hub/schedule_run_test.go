package hub

import (
	"testing"
	"time"
)

func TestFindTheClosestRun(t *testing.T) {
	now := time.Now()
	var cases = []struct {
		rules string
		runs  []time.Duration
		want  int
	}{
		{
			rules: "next iteration within the hour, return it",
			runs:  []time.Duration{-time.Hour * 6, -time.Hour * 3, time.Minute * 30},
			want:  2,
		},
		{
			rules: "next iteration today, but not withing the hour, return nothing",
			runs:  []time.Duration{-time.Hour * 6, -time.Hour * 3, time.Hour * 3},
			want:  -1,
		},
		{
			rules: "next execution tomorrow, return past one",
			runs:  []time.Duration{-time.Hour * 6, -time.Minute * 10, time.Hour * 15},
			want:  1,
		},
		{
			rules: "two in the past, return most recent",
			runs:  []time.Duration{-time.Hour * 6, -time.Minute * 10},
			want:  1,
		},
		{
			rules: "one instance in the past, return it",
			runs:  []time.Duration{-time.Hour * 6},
			want:  0,
		},
		{
			rules: "one instance too far away, return nothing",
			runs:  []time.Duration{time.Hour * 6},
			want:  -1,
		},
		{
			rules: "one instance in the next hour, return it",
			runs:  []time.Duration{time.Minute * 30},
			want:  0,
		},
	}

	for _, c := range cases {
		runs := make([]time.Time, len(c.runs))
		for i, r := range c.runs {
			runs[i] = now.Add(r)
		}
		var want time.Time
		if c.want > -1 {
			want = now.Add(c.runs[c.want])
		}

		got := NotebookSchedule{Runs: Repetitions{Occurences: runs}}.NextRun(now)
		if got != want {
			t.Errorf("got %v want %v", got, c.want)
		}
	}
}
