package metrics

import (
	"math"
	"math/rand"
	"testing"
)

// use a chi-square test to expect normal distribution
func TestRecordAccuracy(t *testing.T) {
	const maxHistRecord = 2<<46 - 1
	const sigma = maxHistRecord / 4
	const mu = maxHistRecord / 2

	seed := rand.Int63()
	t.Log("seeding with", seed)
	src := rand.New(rand.NewSource(seed))
	var h Histogram
	for i := 0; i < 300_000; i++ {
		h.Record(int64(mu + src.NormFloat64()*sigma))
	}

	chistat := float64(0)
	for i := 1; i < histNumBuckets*histNumSubBuckets+1; i++ {
		// estimating probability in interval
		e := math.Erf((Buckets[i+1]-mu)/(sigma*math.Sqrt2))/2 -
			math.Erf((Buckets[i]-mu)/(sigma*math.Sqrt2))/2
		g := float64(h.counts[i-1].Load()) / 300_000
		chistat += math.Pow(e-g, 2) / e
	}

	t.Log("chistat=", chistat)
	if chistat > 301274.2013 {
		t.Errorf("estimations are off the chart!")
	}
}
