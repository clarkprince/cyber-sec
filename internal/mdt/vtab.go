//go:build linux

package mdt

import "trout.software/kraken/webapp/internal/sqlite"

var LioLiPath = sqlite.RegisterTable("lioli_path", lpath{})

//go:generate constrainer lpath
type lpath struct {
	record []byte `vtab:"rc,hidden,required"`
	path   string `vtab:"path,hidden,required"`
	value  string `vtab:"value"`
}

func (vt lpath) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[lpath] {
	path := vt.Getpath(cs)

	var rc Record
	if err := rc.UnmarshalBinary(vt.Getrecord(cs)); err != nil {
		return sqlite.FromError[lpath](err)
	}

	vals := rc.FindPath(path)
	out := make([]lpath, len(vals))
	for i, v := range vals {
		out[i] = lpath{
			path:   path,
			record: vt.Getrecord(cs),
			value:  v,
		}
	}

	return sqlite.FromArray(out)
}
