package main

import (
	"fmt"
	"hash/maphash"

	"trout.software/kraken/webapp/internal/mdt"
)

type Selection []mdt.Position

func (s1 Selection) includes(p mdt.Position) bool {
	for _, v := range s1 {
		if v == p {
			return true
		}
	}
	return false
}

func (s Selection) in(lo, hi mdt.Position) bool {
	for _, v := range s {
		if lo <= v && v <= hi {
			return true
		}
	}
	return false
}

var selfp = maphash.MakeSeed()

func (s Selection) footprint() uint64 {
	return maphash.String(selfp, fmt.Sprintf("%v", s))
}
