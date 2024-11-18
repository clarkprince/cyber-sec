package main

import (
	"math/rand"
	"testing"
	"time"
)

// main benchmark: find a set of ~10 values in a very large set, sorted
func BenchmarkIntSet(b *testing.B) {
	ints := make([]int, 10)
	milli := time.Now().UnixMilli()
	b.Log("seeding at", milli)
	z := rand.NewZipf(rand.New(rand.NewSource(milli)), 2, 1, 10_000)

	var s intset
	for range ints {
		s.Add(int(z.Uint64()))
	}

	var counts int
	for i := 0; i < b.N; i++ {
		for j := 0; j < 10_000; j++ {
			if s.Test(i) {
				counts++
			}
		}
	}

	b.ReportMetric(float64(counts)/float64(b.N), "count/op")
}
