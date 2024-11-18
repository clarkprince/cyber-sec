package metrics

import (
	"math/bits"
	"sync/atomic"
	"unsafe"
)

const (
	// For the time histogram type, we use an HDR histogram.
	// Values are placed in buckets based solely on the most
	// significant set bit. Thus, buckets are power-of-2 sized.
	// Values are then placed into sub-buckets based on the value of
	// the next histSubBucketBits most significant bits. Thus,
	// sub-buckets are linear within a bucket.
	//
	// Therefore, the number of sub-buckets (histNumSubBuckets)
	// defines the error. This error may be computed as
	// 1/histNumSubBuckets*100%. For example, for 16 sub-buckets
	// per bucket the error is approximately 6%.
	//
	// The number of buckets (histNumBuckets), on the
	// other hand, defines the range. To avoid producing a large number
	// of buckets that are close together, especially for small numbers
	// (e.g. 1, 2, 3, 4, 5 ns) that aren't very useful, histNumBuckets
	// is defined in terms of the least significant bit (histMinBucketBits)
	// that needs to be set before we start bucketing and the most
	// significant bit (histMaxBucketBits) that we bucket before we just
	// dump it into a catch-all bucket.
	//
	// As an example, consider the configuration:
	//
	//    histMinBucketBits = 9
	//    histMaxBucketBits = 48
	//    histSubBucketBits = 2
	//
	// Then:
	//
	//    011000001
	//    ^--
	//    │ ^
	//    │ └---- Next 2 bits -> sub-bucket 3
	//    └------- Bit 9 unset -> bucket 0
	//
	//    110000001
	//    ^--
	//    │ ^
	//    │ └---- Next 2 bits -> sub-bucket 2
	//    └------- Bit 9 set -> bucket 1
	//
	//    1000000010
	//    ^-- ^
	//    │ ^ └-- Lower bits ignored
	//    │ └---- Next 2 bits -> sub-bucket 0
	//    └------- Bit 10 set -> bucket 2
	//
	// Following this pattern, bucket 38 will have the bit 46 set. We don't
	// have any buckets for higher values, so we spill the rest into an overflow
	// bucket containing values of 2^47 - 1 or more.
	histMinBucketBits = 9
	histMaxBucketBits = 48 // Note that this is exclusive; 1 higher than the actual range.
	histSubBucketBits = 4
	histNumSubBuckets = 1 << histSubBucketBits
	histNumBuckets    = histMaxBucketBits - histMinBucketBits + 1
	// Two extra buckets, one for underflow, one for overflow.
	histTotalBuckets = histNumBuckets*histNumSubBuckets + 2
)

// Histogram represents a distribution, aimed at representing with good accuracy values in the [0,  2^47 - 1] range.
//
// The Histogram is safe for concurrent reads and writes.
type Histogram struct {
	counts [histNumBuckets * histNumSubBuckets]atomic.Uint64

	underflow atomic.Uint64
	overflow  atomic.Uint64
}

// Record adds the given duration to the distribution.S
func (h *Histogram) Record(value int64) {
	// If the duration is negative, capture that in underflow.
	if value < 0 {
		h.underflow.Add(1)
		return
	}
	// bucketBit is the target bit for the bucket which is usually the
	// highest 1 bit, but if we're less than the minimum, is the highest
	// 1 bit of the minimum (which will be zero in the duration).
	//
	// bucket is the bucket index, which is the bucketBit minus the
	// highest bit of the minimum, plus one to leave room for the catch-all
	// bucket for samples lower than the minimum.
	var bucketBit, bucket uint
	if l := bits.Len64(uint64(value)); l < histMinBucketBits {
		bucketBit = histMinBucketBits
		bucket = 0 // bucketBit - histMinBucketBits
	} else {
		bucketBit = uint(l)
		bucket = bucketBit - histMinBucketBits + 1
	}
	// If the bucket we computed is greater than the number of buckets,
	// count that in overflow.
	if bucket >= histNumBuckets {
		h.overflow.Add(1)
		return
	}
	// The sub-bucket index is just next histSubBucketBits after the bucketBit.
	subBucket := uint(value>>(bucketBit-1-histSubBucketBits)) % histNumSubBuckets
	h.counts[bucket*histNumSubBuckets+subBucket].Add(1)
}

type Float64Histogram struct {
	Counts  []uint64
	Buckets []float64
}

// per spec (§Constants), there is no way to describe constant values for float infs.
// use direct bit pattern on the stack
//
//	Numeric constants represent exact values of arbitrary precision and do not overflow. Consequently, there are no constants denoting the IEEE-754 negative zero, infinity, and not-a-number values.
var (
	fInfBits    uint64 = 0x7FF0000000000000
	fNegInfBits uint64 = 0xFFF0000000000000
)

func float64NegInf() float64 { return *(*float64)(unsafe.Pointer(&fNegInfBits)) }
func float64Inf() float64    { return *(*float64)(unsafe.Pointer(&fInfBits)) }

var Buckets []float64 = histbuckets()

func histbuckets() []float64 {
	b := make([]float64, histTotalBuckets+1)
	// Underflow bucket.
	b[0] = float64NegInf()

	for j := 0; j < histNumSubBuckets; j++ {
		b[j+1] = float64(uint64(j) << (histMinBucketBits - 1 - histSubBucketBits))
	}
	// Generate the rest of the buckets. It's easier to reason
	// about if we cut out the 0'th bucket.
	for i := histMinBucketBits; i < histMaxBucketBits; i++ {
		for j := 0; j < histNumSubBuckets; j++ {
			// Set the bucket bit.
			bval := uint64(1) << (i - 1)
			// Set the sub-bucket bits.
			bval |= uint64(j) << (i - 1 - histSubBucketBits)
			// The index for this bucket is going to be the (i+1)'th bucket
			// (note that we're starting from zero, but handled the first bucket
			// earlier, so we need to compensate), and the j'th sub bucket.
			// Add 1 because we left space for -Inf.
			bucketIndex := (i-histMinBucketBits+1)*histNumSubBuckets + j + 1
			b[bucketIndex] = float64(bval)
		}
	}
	// Overflow bucket.
	b[len(b)-2] = float64(uint64(1) << (histMaxBucketBits - 1))
	b[len(b)-1] = float64Inf()
	return b
}
