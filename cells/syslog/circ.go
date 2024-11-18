package syslog

import (
	"sync"
)

var nodepool = sync.Pool{New: func() any { return &bnode{buf: make([]byte, 2048)} }}

// buffer is a limited window over the last max records.
// new records are inserted at end, when more than max records are found, first is dropped.
type buffer struct {
	first, last *bnode
	cnt, max    int

	gen int64
	mx  sync.Mutex
	cnd sync.Cond
}

func newbuffer(max int) *buffer {
	b := &buffer{max: max}
	b.cnd.L = &b.mx
	return b
}

const closedgen = -1

func (b *buffer) close() {
	b.mx.Lock()
	b.gen = closedgen
	b.mx.Unlock()
	b.cnd.Broadcast()
}

func (b *buffer) iter() *iter { return &iter{b: b} }

func (b *buffer) append(v string) {
	// possible alloc out of the critical path
	next := nodepool.Get().(*bnode)
	if len(next.buf) < len(v) {
		next.buf = make([]byte, len(v))
	}
	sz := copy(next.buf, v)
	next.buf = next.buf[:sz]

	b.mx.Lock()
	if b.gen == closedgen {
		b.mx.Unlock()
		return
	}

	b.gen++
	next.gen = b.gen
	if b.last != nil {
		b.last.next = next
	}
	b.last = next
	if b.first == nil {
		b.first = next
	}

	if b.cnt == b.max {
		frst := b.first
		// only safe to reuse nodes if no reader is using them
		if b.first.refs == 0 {
			b.first.next = nil
			nodepool.Put(b.first)
		}
		b.first = frst.next
		b.cnt--
	}

	b.mx.Unlock()
	b.cnd.Broadcast()
}

type bnode struct {
	next *bnode
	buf  []byte

	gen, refs int64
}

type iter struct {
	nd *bnode
	b  *buffer
}

func (i *iter) next() bool {
	i.b.mx.Lock()
	defer i.b.mx.Unlock()

	if i.b.gen == closedgen || i.nd != nil && i.nd.gen < i.b.first.gen {
		// falling behind, returns
		return false
	}

	for i.b.first == nil || i.nd != nil && i.nd.next == nil {
		i.b.cnd.Wait()
		if i.b.gen == closedgen {
			return false
		}
	}

	if i.nd == nil {
		i.nd = i.b.first
		return true
	}

	i.nd.refs--
	i.nd = i.nd.next
	i.nd.refs++
	return true
}

func (i *iter) value() string { return string(i.nd.buf) }
