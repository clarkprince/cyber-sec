// Code generated by the constrainer; DO NOT EDIT.
//go:build linux

package hub

import (
	"trout.software/kraken/webapp/internal/sqlite"
)

func (r userRecord) GetEntity(cs sqlite.Constraints) (v []byte) {
	match := 0
	for _, c := range cs {
		if c.Column == "entity" {
			if c.Operation == sqlite.ConstraintEQ {
				v = c.ValueBytes()
				match++
			} else {
				panic("Value getter with non-constrained values")
			}
		}
	}

	if match != 1 {
		panic("field should have been filtered")
	}

	return v
}