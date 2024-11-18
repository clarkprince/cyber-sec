package metrics

import (
	"sync"
	"time"
)

// RRCounters provide a minute-level counter, with 15 minutes of history.
// The type is safe for concurrent use.
type RRCounters struct {
	counters [16]uint64
	mx       sync.Mutex
}

var minute = func() int64 { return time.Now().UnixMilli() / int64(time.Minute) }

func (c *RRCounters) Inc() {
	now := minute()
	bkt, gen := now&0xF, uint64(now>>4&0xFFFF)
	c.mx.Lock()
	defer c.mx.Unlock()

	prev := c.counters[bkt]
	if prev>>48 == gen {
		c.counters[bkt]++
	} else {
		c.counters[bkt] = 1 | gen<<48
	}
}

func (c *RRCounters) Values() (lastm, last5m, last15m int) {
	now := minute()
	bkt, gen := now&0xF, uint64(now>>4&0xFFFF)
	c.mx.Lock()
	defer c.mx.Unlock()

	const msk = (1 << 48) - 1

	// skip the current minute, to avoid janky reads in the middle
	for i, j := bkt-1, 0; i != bkt; i, j = (i-1)&0xF, j+1 {
		val := 0
		// wraparound is a once-in-a 45-days event
		if cgn := c.counters[i] >> 48; cgn >= gen-1 || gen == 0 && cgn == 0xFFFF {
			val = int(c.counters[i] & msk)
		}
		if j < 1 {
			lastm = val
		}
		if j < 5 {
			last5m += val
		}
		last15m += val
	}
	return
}
