package main

import (
	"hash/maphash"
)

// Fields is a structure containing information about the values in the LioLi, or a view of it.
// If the different iterators provide a row view of the data, this is the columnar aspect.
//
// Structure is not safe for concurrent use,
// but designed for efficient reuse when re-calculating the view with the [Fields.Reset] method.
type Fields struct {
	idx  [hashFieldSize]int
	cols []stat
}

const hashFieldSize = 512 // optimized for ~ 400 keys

var fseed = maphash.MakeSeed()

// Reset clears the map
func (f *Fields) Reset() { f.cols = f.cols[:0] }

// Ins inserts the required column at the given position.
// The pointer returned is valid until the next modification ([Fields.Ins], [Fields.Conj], [Fields.Reset]).
// If pos is not within [0:f.Len], insertion panics.
func (f *Fields) Ins(col string, pos int) *stat {
	if pos > len(f.cols) {
		panic("insertion out of bounds")
	}
	if len(f.cols) == hashFieldSize {
		panic("capacity exceeded")
	}

	if n := len(f.cols) + 1; n <= cap(f.cols) {
		f.cols = f.cols[:n]
		copy(f.cols[pos+1:], f.cols[pos:])
	} else {
		c := make([]stat, n, n*2)
		copy(c, f.cols[:pos])
		copy(c[pos+1:], f.cols[pos:])
		f.cols = c
	}
	f.cols[pos] = stat{name: col}
	f.idx[f.fh(col)] = pos
	return &f.cols[pos]
}

func (f *Fields) fh(col string) int {
	const mask = hashFieldSize - 1
	const shift = 16 // just make sure 2^shift > mask

	h := maphash.String(fseed, col)
	p, s := h&mask, ((h>>shift)&mask)|1
	for {
		r := f.idx[p]
		if r == 0 || r >= len(f.cols) || r < len(f.cols) && f.cols[r].name == col {
			break
		}
		p = (p + s) & mask
	}
	return int(p)
}

func (f *Fields) At(pos int) *stat { return &f.cols[pos] }
func (f *Fields) Get(col string) *stat {
	if len(f.cols) == 0 {
		return nil
	}
	r := f.idx[f.fh(col)]
	if r < len(f.cols) && f.cols[r].name == col {
		return &f.cols[r]
	}
	return nil
}
func (f *Fields) Idx(col string) int {
	if len(f.cols) == 0 {
		return -1
	}
	r := f.idx[f.fh(col)]
	if r < len(f.cols) && f.cols[r].name == col {
		return r
	}
	return -1
}
func (f *Fields) Len() int { return len(f.cols) }

// Conj returns the record of colmun col, possibly creating it if it does not already exist
func (f *Fields) Conj(col string) *stat {
	if c := f.Get(col); c != nil {
		return c
	}
	return f.Ins(col, f.Len())
}

const (
	isShown  = false
	isHidden = true
)

func (f *Fields) Columns(getHidden bool) []int {
	lst := make([]int, 0, len(f.cols))
	for i, v := range f.cols {
		if v.hidden == getHidden {
			lst = append(lst, i)
		}
	}
	return lst
}

type stat struct {
	name     string
	distrib  hist
	lastgain int
	hidden   bool
	size     colsize
	sorted   SortDirection
	metadata string
	// bring your own data here
}
