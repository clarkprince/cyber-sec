// Code generated by the constrainer; DO NOT EDIT.
//go:build linux

package hub

import (
	"trout.software/kraken/webapp/internal/sqlite"
)

func (r vtPlaybooks) GetPlaybook(cs sqlite.Constraints) (v string, ok bool) {
	match := 0
	for _, c := range cs {
		if c.Column == "playbook" {
			if c.Operation == sqlite.ConstraintEQ {
				v = c.ValueString()
				match++
			} else {
				panic("Value getter with non-constrained values")
			}
		}
	}
	if match == 0 {
		return v, false
	}
	if match == 1 {
		return v, true
	}

	panic("more than one match")
}

func (r vtPlaybooks) GetArchived(cs sqlite.Constraints) (v bool, ok bool) {
	match := 0
	for _, c := range cs {
		if c.Column == "archived" {
			if c.Operation == sqlite.ConstraintEQ {
				v = c.ValueBool()
				match++
			} else {
				panic("Value getter with non-constrained values")
			}
		}
	}
	if match == 0 {
		return v, false
	}
	if match == 1 {
		return v, true
	}

	panic("more than one match")
}
