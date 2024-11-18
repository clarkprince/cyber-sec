package piql

import "time"

type valueType uint8

const (
	typeNull valueType = iota
	typeStr
	typeInt
	typeTime
	typeTable
)

type ivalue struct {
	typ valueType
	s   string
	n   int64
	t   *table
}

// TODO(rdo) we can probably squeeze in a lot of bits there:
// reuse the pointer for string and table
// reuse the int64 for the length of the string
// Future optimisation

// funcs or instr??
var inull = ivalue{}

func itime(t time.Time) ivalue { return ivalue{typ: typeTime, n: t.UnixMilli()} }

// array / map hybrid system
// based on the ideas in the [lua5] VM: most (short) values are stored inline,
// values indexed through large numbers or strings are stored in a sparse map.
// a table is not safe for concurrent access.
//
// [lua5]: https://www.lua.org/doc/jucs05.pdf
type table struct {
	ary [maxASize]ivalue
	ht  map[ivalue]ivalue

	// effectively measure the padding so we keep alignment in mind
	_ struct {
		_ uint64
		_ uint64
		_ uint64
		_ uint8
	}
}

const maxASize = 63

func (t *table) set(idx, val ivalue) {
	if idx.typ == typeInt && idx.n < maxASize {
		t.ary[int(idx.n)] = val
	} else {
		if t.ht == nil {
			t.ht = make(map[ivalue]ivalue)
		}
		t.ht[idx] = val
	}
}

func (t *table) get(idx ivalue) ivalue {
	if idx.typ == typeInt && idx.n < maxASize {
		return t.ary[int(idx.n)]
	} else if t.ht == nil {
		return inull
	} else {
		return t.ht[idx]
	}
}
