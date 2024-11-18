package mdt

import (
	"sort"
	"strconv"
)

// LioLi is encoded as a forest of records
// It should only be used as an opaque type, and rely instead on LView and LViewIterator
// TODO move the counters at this level
type LioLi []Record

func (ll LioLi) Empty() bool { return len(ll) == 0 }

// LView represents the frontend state of a lioli
// ll is an ordered lioli
// m is a list of pointers to the lioli
// => sorting m allows to filter/sort during display
// without actually altering the lioli
type LView struct {
	ll LioLi
	m  []lptr
}

// index, textual and structural offset of a record in original lioli
type lptr struct{ idx, pos int }

func (lv LView) Len() int { return len(lv.m) }

// Match creates a projection of the LioLi, returning records matching predicate.
// The int argument of the predicate is the offset in the lioli, and the string the textual value.
func (ll LioLi) Match(predicate func(Position, string) bool) *LView {
	lv := LView{ll: ll}
	var pos Position
	for i, v := range ll {
		if predicate(pos, v.origin) {
			lv.m = append(lv.m, lptr{i, int(pos)})
		}
		pos += v.len()
	}
	return &lv
}

// AllRecords is a matcher that matches all records
func AllRecords(Position, string) bool { return true }

// Sort the current visible lines
// should be preceded by a call that creates the LView, eg lioli.Match
//
//	vp.lioli.Match(keepOnlyOddLines).Sort(ByCol("ip"))
//
// Returns the LView for further chaining
func (lv *LView) Sort(less func(r, c Record) bool) *LView {
	if less == nil {
		return lv
	}

	sort.SliceStable(lv.m, func(i, j int) bool {
		return less(lv.ll[lv.m[i].idx], lv.ll[lv.m[j].idx])
	})
	return lv
}

// Do not sort the underlying data
var NoSort func(r, c Record) bool = nil // used only for fast track

type LViewIterator struct {
	lv LView
	// i is a pointer to the LView pointer array
	// @example if  m == 3 (max) and lv.m = [1,7,2,3,6] (selected records idx)
	// we can iterate over records 1, 7, 2 and 3 of the lioli
	// by changing the value of i
	i, m int
}

func (lv LView) Iter(min, upto int) *LViewIterator {
	max := min + upto - 1
	if max > len(lv.m)-1 {
		max = len(lv.m) - 1
	}
	return &LViewIterator{lv: lv, i: min - 1, m: max}
}

func (lv LView) IterAll() *LViewIterator { return &LViewIterator{lv: lv, i: -1, m: len(lv.m) - 1} }

func (lvi *LViewIterator) Next() bool {
	if lvi.i == lvi.m {
		return false
	}

	lvi.i++
	return true
}

func (lvi *LViewIterator) Pos() Position { return Position(lvi.lv.m[lvi.i].pos) }
func (lvi *LViewIterator) Range() (lo, hi Position) {
	p := lvi.Pos()

	return p, p + lvi.lv.ll[lvi.lv.m[lvi.i].idx].len()
}

// ValueOf returns the textual value located at range
func (ll LioLi) ValueOf(p Position) string {
	var cap string
	for i := range ll {
		l := ll[i].len()
		if p < l {
			ll[i].preorder(func(q Position, c *capnd) {
				if p == q {
					cap = ll[i].origin[c.lo:c.hi]
				}
			})
			break
		}
		p -= l
	}
	return cap
}

func (ll LioLi) PathOf(pos Position) string {
	var i int
	for i = 0; i < len(ll) && pos > Position(ll[i].len()); i++ {
		pos -= Position(ll[i].len())
	}
	rc := ll[i]
	var cap *capnd
	rc.preorder(func(p Position, c *capnd) {
		if p == pos {
			cap = c
		}
	})
	var path string
	for p := cap; p != nil; p = p.parent {
		if path == "" {
			path = p.name
		} else if p.name == "root" {
			path = "$." + path
		} else {
			path = p.name + "." + path
		}
	}
	return path
}

// WalkRecord is a top-level walker over a record at pos
func (ll LioLi) WalkRecord(pos Position, opts ...WalkOpts) *RecordWalker {
	var off Position
	for i := range ll {
		l := ll[i].len()
		if l > pos {
			return ll[i].walkWithOffset(off, opts...)
		}
		pos -= l
		off += l
	}
	return &RecordWalker{p: &capnd{}}
}

func (lvi LViewIterator) WalkRecord(opts ...WalkOpts) *RecordWalker {
	return lvi.lv.ll.WalkRecord(lvi.Pos(), opts...)
}

// Shortcut to get the current record
// Other alternatives:
// - lvi.lv.ll.ValueOf(lvi.Pos()) gives the record string, based on its position (range)
// - using a record walker to iterate on each node of the record
func (lvi LViewIterator) Record() Record {
	return lvi.lv.ll[lvi.lv.m[lvi.i].idx]
}

func (lvi LViewIterator) Err() error { return nil }

// Position represents a unique index in the full Lioli.
//
// All entries are numbered in pre-order traversal, where
//   - intermediate nodes count as one
//   - final nodes count as one + the number of bytes they point to
type Position int

func (p Position) String() string { return strconv.FormatInt(int64(p), 10) }
