package hub

import (
	"trout.software/kraken/webapp/internal/sqlite"
)

var StreamsIn = sqlite.RegisterTable("streams_in", dsStreams{})

//go:generate constrainer dsStreams
type dsStreams struct {
	Source []byte `vtab:"datasource,required,hidden"`
	ID     []byte `vtab:"ulid"`
}

func (r dsStreams) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[dsStreams] {
	var ds DataSource
	if err := ds.UnmarshalBinary(r.GetSource(cs)); err != nil {
		return sqlite.FromError[dsStreams](err)
	}

	streams := ds.Streams
	var table = make([]dsStreams, len(streams))
	for i, s := range streams {
		table[i] = dsStreams{Source: r.GetSource(cs), ID: s.ID.Bytes()}
	}
	return sqlite.FromArray(table)
}
