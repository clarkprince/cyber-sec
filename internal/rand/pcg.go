// Package rand is an implementation of a 64-bit permuted congruential generator as defined in
//
//	PCG: A Family of Simple Fast Space-Efficient Statistically Good Algorithms for Random Number Generation
//	Melissa E. O’Neill, Harvey Mudd College
//	http://www.pcg-random.org/pdf/toms-oneill-pcg-family-v1.02.pdf
//
// Implementation is safe for concurrent use, and optimised for zero lock contention.
package rand

import (
	"crypto/rand"
	"encoding/binary"
	"math/bits"
	"sync/atomic"
)

var global struct {
	state atomic.Uint64
	inc   uint64
}

func init() {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		panic("cannot get randomness")
	}

	global.state.Store(binary.BigEndian.Uint64(buf[:8]))
	global.inc = binary.BigEndian.Uint64(buf[8:])
}

func Uint32() uint32 {
	state := global.state.Load()
	xors := uint32(((state >> 18) ^ state) >> 27)

	rnd := bits.RotateLeft32(xors, int(state>>59))

	for !global.state.CompareAndSwap(state, state*6364136223846793005+global.inc) {
		state = global.state.Load()
		xors := uint32(((state >> 18) ^ state) >> 27)

		rnd = bits.RotateLeft32(xors, int(state>>59))
	}

	return rnd
}

// TODO(rdo) allow for custom prefix
func Name() string {
	val := Uint32()
	if val == 0 { // avoid string allocation
		return "a"
	}
	var buf [10]byte // big enough for 32bit value base 10
	i := len(buf) - 1
	for val >= 10 {
		q, r := bits.Div32(0, val, 10)
		buf[i] = byte('a' + r)
		i--
		val = q
	}
	// val < 10
	buf[i] = byte('a' + val)
	return string(buf[i:])

}
