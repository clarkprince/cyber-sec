package rand

import (
	"math"
	"math/rand"
	"sync"
	"testing"
)

func BenchmarkConcurrentGeneration(b *testing.B) {
	b.RunParallel(func(p *testing.PB) {
		for p.Next() {
			Uint32()
		}
	})
}

func BenchmarkStdLib(b *testing.B) {
	var mx sync.Mutex
	b.RunParallel(func(p *testing.PB) {
		for p.Next() {
			mx.Lock()
			rand.Uint32()
			mx.Unlock()
		}
	})

}

func TestQuality(t *testing.T) {
	counts := make([]int, 32)
	max := 100_000
	for i := 0; i < max; i++ {
		ng := Uint32()
		for i := 0; i < 32; i++ {
			counts[i] += int((ng >> i) & 1)
		}
	}

	// quality check by uniform law vs chi-squared
	var chi float64
	e := float64(max) / 2
	t.Log("expecting", e)
	for i := uint(0); i < 32; i++ {
		t.Logf("count at %d: %f", i, float64(counts[i]))
		chi += math.Pow(float64(counts[i])-e, 2.0) / e
	}

	// stats at p=0.005 for 20 degrees of freedom
	if chi > 39.997 {
		t.Errorf("not very random: got chi stat of %f", chi)
	}
}
