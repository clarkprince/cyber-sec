package metrics

import (
	"testing"
)

func TestCounter(t *testing.T) {
	plays := []struct {
		at  int64
		inc int
	}{
		{28266601, 2},
		{28266701, 1},
		{28266702, 1},
		{28266703, 5},
		{28266704, 1},
		{28266704, 2},
		{28266708, 1},
		{28266710, 1},
		{28266712, 1},
	}

	var cnt RRCounters
	for _, p := range plays {
		minute = func() int64 { return p.at }
		for i := 0; i < p.inc; i++ {
			cnt.Inc()
		}
	}

	minute = func() int64 { return 28266712 }
	lastm, last5m, last15m := cnt.Values()
	if lastm != 0 || last5m != 2 || last15m != 12 {
		t.Errorf("counting values: got %d, %d, %d", lastm, last5m, last15m)
	}
}
