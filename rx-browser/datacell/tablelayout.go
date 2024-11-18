package main

import (
	"container/heap"
)

// arrangecolumns to find the best fit on the screen.
// The best arrangement is found by looking at the sum of all individual columns.
//
// assumes viewport has already selected meaningful visible columns.
func arrangecolumns(fields *Fields, w int) {
	var opts scoredopts
	for _, i := range fields.Columns(isShown) {
		st := fields.At(i)
		st.size = 0
		st.lastgain = 0
		heap.Push(&opts, st)
	}
	// TODO(rdo) maybe in viewport?
	if len(opts) == 0 {
		return
	}

	type ds struct {
		name string
		sz   int
	}
	for i := 0; i < w/increment; i++ {
		gs := make([]ds, len(opts))
		for i, v := range opts {
			gs[i] = ds{v.name, gain(v)}
		}
		col := heap.Pop(&opts).(*stat)
		col.size++
		col.lastgain++
		heap.Push(&opts, col)
	}
}

type colsize int

func (s colsize) String() string { return tailwindSizeNames[s] }

var tailwindSizeNames = [...]string{
	"w-[8ch]", "w-[16ch]", "w-[24ch]", "w-[32ch]", "w-[40ch]",
	"w-[48ch]", "w-[56ch]", "w-[64ch]", "w-[72ch]", "w-[80ch]",
	"w-[88ch]", "w-[96ch]", "w-[104ch]", "w-[112ch]", "w-[120ch]",
	"w-[128ch]", "w-[136ch]", "w-[144ch]", "w-[152ch]", "w-[160ch]",
	"w-[168ch]", "w-[176ch]", "w-[184ch]", "w-[192ch]", "w-[200ch]",
	"w-[208ch]", "w-[216ch]", "w-[224ch]", "w-[232ch]", "w-[240ch]",
	"w-[248ch]", "w-[256ch]", "w-[264ch]", "w-[272ch]", "w-[280ch]",
	"w-[288ch]", "w-[296ch]", "w-[304ch]", "w-[312ch]", "w-[320ch]",
	"w-[328ch]", "w-[336ch]", "w-[344ch]", "w-[352ch]", "w-[360ch]",
}

const maxwidth = len(tailwindSizeNames)

type scoredopts []*stat

func (o scoredopts) Len() int { return len(o) }
func (o scoredopts) Less(i, j int) bool {
	gi, gj := gain(o[i]), gain(o[j])
	// max gain at front
	if gi > gj {
		return true
	} else if gj < gi {
		return false
	}

	// round-robin gain between values
	if o[i].lastgain < o[j].lastgain {
		return true
	} else if o[i].lastgain > o[j].lastgain {
		return false
	}

	return o[i].name < o[j].name // stable sort otherwise
}
func (o scoredopts) Swap(i, j int) { o[i], o[j] = o[j], o[i] }
func (o *scoredopts) Push(x any)   { *o = append(*o, x.(*stat)) }
func (o *scoredopts) Pop() any {
	it := (*o)[len(*o)-1]
	*o = (*o)[:len(*o)-1]
	return it
}

func gain(s *stat) int {
	const mingain = 8
	const oversizegain = 1

	if int(s.size) >= s.distrib.max() {
		return oversizegain

	}

	gain := int(s.distrib[s.size+1])
	if gain < mingain {
		gain = mingain
	}
	return gain
}

func gaindebug(s *stat) int {
	const mingain = 8
	const oversizegain = 1

	if int(s.size) >= s.distrib.max() {
		return oversizegain

	}

	gain := int(s.distrib[s.size])
	if gain < mingain {
		gain = mingain
	}
	return gain
}

const increment = 8 // 8 char pixel

// histogram implementation for compute per-column length distributions
type hist [maxwidth]uint16 // count of lines ~ 10k

// record a new observation of length
func (h *hist) record(length int) {
	i := length / increment
	if i >= len(h) {
		i = len(h) - 1
	}
	h[i]++
}

// norm normalize the distribution to percent of total per decile
func (h *hist) norm() {
	count := 0
	for _, v := range h {
		count += int(v)
	}

	for i := range h {
		h[i] = uint16(int(h[i]) * 100 / count)
	}
}

// max returns the decile containing the largest observed value
func (h *hist) max() int {
	i := len(h) - 1
	for h[i] == 0 {
		i--
	}
	return i
}
