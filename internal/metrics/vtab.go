//go:build linux

package metrics

import (
	"sync"

	"trout.software/kraken/webapp/internal/sqlite"
)

var ObsMetrics = sqlite.RegisterTable("obs_metrics", rrcounter{})

type rrcounter struct {
	Name    string `vtab:"name"`
	LastM   int    `vtab:"lastm"`
	Last5M  int    `vtab:"last5m"`
	Last15M int    `vtab:"last15m"`
}

var registeredCounters = make(map[string]*RRCounters)
var registerMx sync.RWMutex

func (rr rrcounter) Filter(_ int, _ sqlite.Constraints) sqlite.Iter[rrcounter] {
	registerMx.RLock()
	defer registerMx.RUnlock()

	out := make([]rrcounter, 0, len(registeredCounters))
	for k, c := range registeredCounters {
		lm, l5m, l15m := c.Values()
		out = append(out, rrcounter{
			Name: k, LastM: lm, Last5M: l5m, Last15M: l15m,
		})
	}

	return sqlite.FromArray(out)
}

// NewRRCounter creates a new round-robin counter, and registers it in the obs_metrics table.
func NewRRCounter(name string) *RRCounters {
	cnt := new(RRCounters)

	registerMx.Lock()
	_, ok := registeredCounters[name]
	if ok {
		panic("already a counter with name " + name)
	}
	registeredCounters[name] = cnt
	registerMx.Unlock()

	return cnt
}
