package main

import (
	"net/netip"

	"trout.software/kraken/webapp/internal/mdt"
)

// go:generate stringer -type SortDirection
type SortDirection int8

func (d SortDirection) AriaSort() string {
	switch d {
	case NoSort:
		return "" // equivalent to none
	case SortDesc:
		return "descending"
	case SortAsc:
		return "ascending"
	default:
		panic("invalid sort direction")
	}
}

func (d SortDirection) String() string {
	return d.AriaSort()
}

const (
	NoSort SortDirection = iota
	SortDesc
	SortAsc
)

func (f *Fields) Sort(by []int) func(i, j mdt.Record) bool {
	if len(by) == 0 {
		return mdt.NoSort
	}

	return func(r, s mdt.Record) bool {
		for _, i := range by {
			c := f.At(i)
			v := r.FindPath(c.name)
			w := s.FindPath(c.name)
			switch {
			case len(v) == 0:
				return false
			case len(w) == 0:
				return true
			case c.metadata == "ip":
				ip1, _ := netip.ParseAddr(v[0])
				ip2, _ := netip.ParseAddr(w[0])
				if ip1.Compare(ip2) > 0 {
					return c.sorted == SortDesc
				} else {
					return c.sorted == SortAsc
				}
			case v[0] > w[0]:
				return c.sorted == SortDesc
			case v[0] < w[0]:
				return c.sorted == SortAsc
			default:
				// tie, move to next sort column
			}
		}
		return true
	}
}
