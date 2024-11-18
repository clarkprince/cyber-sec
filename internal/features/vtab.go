//go:build cgo

package features

import "trout.software/kraken/webapp/internal/sqlite"

type row struct {
	Feature string `vtab:"feature"`
	Active  bool   `vtab:"active"`
}

func (r row) Filter(_ int, _ sqlite.Constraints) sqlite.Iter[row] {
	var rows []row
	for k := range Flags {
		rows = append(rows, row{Feature: k, Active: true})
	}

	return sqlite.FromArray(rows)
}

var ObsFeatures = sqlite.RegisterTable("obs_features", row{})
