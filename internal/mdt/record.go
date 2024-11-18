package mdt

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"hash/maphash"
	"io"
	"strconv"
	"strings"
	"sync"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/internal/features"
)

var ShowNestedRecords = features.HasFlag("nestedrecords")
var ExpandRecordsFeature = !features.HasFlag("kill-expandedrecords")

var (
	gcache   = make(map[uint64]*Instr)
	gcachemx sync.Mutex
	hseed    = maphash.MakeSeed()
)

// A Record is a structured view of the information reported as an event.
type Record struct {
	capture *capnd
	origin  string

	capsize int // number of nodes
}

// ReadLine returns the record matching an input line.
//
// Each production of the grammar is associated with one entry in the record.
// The grammar compilation is cached between lines for reuse, using the EBNF representation.
func ReadLine(g Grammar, s []byte) (Record, bool) {
	var start *Instr
	h := maphash.String(hseed, g.PrettyPrint("root"))

	gcachemx.Lock()
	start = gcache[h]
	if start == nil {
		// release global lock while compiling regexp
		// two compilations could race, but this is (fairly) cheap operation, waste is OK
		gcachemx.Unlock()

		p1 := g["root"]
		if p1 == nil {
			return Record{}, false
		}
		start = new(Instr)
		newCompiler(g).compileExpr(p1, nil, start, &matchI)

		gcachemx.Lock()
		gcache[h] = start
	}
	gcachemx.Unlock()

	return backtrack(start, s)
}

func (r Record) PrintDot(dst io.Writer) {
	fmt.Fprintln(dst, `digraph g {
		graph [
rankdir = "LR"
]`)
	r.capture.PrintDot(dst, r.origin)
	fmt.Fprintln(dst, "}")
}

type RecordBuilder struct {
	buf strings.Builder
	cr  *capnd  // current record
	pn  **capnd // pointer next
}

func (b *RecordBuilder) Reset() {
	b.buf.Reset()
	b.cr = nil
	b.pn = nil
}

// merge the record into the new builder
// rc is not valid afterwards
func (b *RecordBuilder) Into(rc Record) {
	off := b.buf.Len()
	rc.preorder(func(_ Position, c *capnd) {
		c.lo += off
		c.hi += off
	})

	b.buf.WriteString(rc.origin)
	if b.cr == nil {
		b.cr = rc.capture
		for b.pn = &rc.capture.chil; *b.pn != nil; b.pn = &(*b.pn).next {
			b.cr = *b.pn
		}
		return
	}
	if rc.capture.chil == nil {
		return
	}

	*b.pn = rc.capture.chil
	p := b.cr.parent
	for ; *b.pn != nil; b.pn = &(*b.pn).next {
		b.cr = *b.pn
		b.cr.parent = p
	}
}

func (b *RecordBuilder) Len() int { return b.buf.Len() }

func (b *RecordBuilder) AppendSeparator(value string) {
	if b.cr == nil {
		b.cr = &capnd{name: "root"}
		b.pn = &b.cr.chil
	}
	b.buf.WriteString(value)
}

// Append adds a new key and value to the record.
// This operation is only valid for top-level nodes (but it does accept repeated ones).
func (b *RecordBuilder) Append(key, value string) {
	if len(value) == 0 {
		return
	}
	if b.cr == nil {
		b.cr = &capnd{name: "root"}
		b.pn = &b.cr.chil
	}

	b.wnode(key, value)
	b.pn = &b.cr.next
}

func (b *RecordBuilder) wnode(key, value string) {
	lo := b.buf.Len()
	b.buf.WriteString(value)
	hi := b.buf.Len()

	*b.pn = &capnd{
		name: key,
		lo:   lo,
		hi:   hi,
	}
	if *b.pn == b.cr.chil {
		(*b.pn).parent = b.cr
	} else {
		(*b.pn).parent = b.cr.parent
	}
	b.cr = *b.pn
}

func (b *RecordBuilder) Push(key string) {
	if b.cr == nil {
		b.cr = &capnd{name: "root"}
		b.pn = &b.cr.chil
	}

	b.wnode(key, "")
	b.pn = &b.cr.chil
}

func (b *RecordBuilder) Pop() {
	b.cr = b.cr.parent
	b.pn = &b.cr.next
	b.cr.hi = b.buf.Len()
}

func (b *RecordBuilder) Build() Record {
	if b.cr == nil {
		return Record{capture: &capnd{name: "root"}}
	}

	// hop back to root node. Allow to be called arbitrary deep.
	for b.cr.name != "root" {
		b.cr = b.cr.parent
	}

	b.cr.hi = b.buf.Len()
	return Record{
		origin:  b.buf.String(),
		capture: b.cr,
	}
}

// Empty records can be the results of execution cancelation
func (r Record) Empty() bool { return len(r.origin) == 0 }

// FindPath takes a path expressed as a a JSON path [jsonPath] and returns the values captured the record.
// If the actual string is not found, it returns the closest parent which matches.
// We currently do not accept value-based filters in the path.
//
// [jsonPath]: https://goessner.net/articles/JsonPath/
func (r Record) FindPath(path string) []string {
	parts := strings.Split(path, ".")
	if parts[0] != "root" && parts[0] != "$" {
		return nil
	}
	if len(parts) == 0 {
		return []string{r.origin}
	}
	parts = parts[1:]
	ps := []*capnd{r.capture}
	var qs []*capnd

	for i := range parts {
		for _, p := range ps {
			for p = p.chil; p != nil; p = p.next {
				if p.name == parts[i] {
					qs = append(qs, p)
					if !isLOD(p.name) {
						break
					}
				}
			}
		}

		if len(qs) == 0 {
			return []string{""}
		}
		ps, qs = qs, ps[:0]
	}

	m := make([]string, len(ps))
	for i, p := range ps {
		m[i] = r.origin[p.lo:p.hi]
	}

	return m
}

// String returns the original record, without any processing
func (r Record) String() string { return r.origin }

// len is the number of adressable positions in this record
func (r *Record) len() Position {
	if r.capsize == 0 {
		r.capsize = int(r.preorder(func(p Position, c *capnd) {}))
	}
	return Position(r.capsize)
}

func (r Record) preorder(f func(Position, *capnd)) Position {
	var pos Position
	for p := r.capture; p != nil; {
		f(Position(pos), p)
		pos++
		if p.chil != nil {
			p = p.chil
			continue
		}
		for p.next == nil && p != r.capture {
			p = p.parent
		}
		p = p.next
	}
	return pos
}

func (r Record) pos(c *capnd) (p Position) {
	r.preorder(func(q Position, d *capnd) {
		if c == d {
			p = q
		}
	})
	return
}

func addocc(n string, o int) string { return n + "[" + strconv.FormatInt(int64(o), 10) + "]" }

func (r Record) MarshalBinary() (data []byte, err error) {
	rs := struct {
		Origin string `cbor:"1,keyasint"`
		Buf    []byte `cbor:"2,keyasint"`
	}{
		Origin: r.origin,
	}

	if !r.Empty() {
		rs.Buf = serNode(r.capture.chil, 0, []byte{})
	}

	return cbor.Marshal(rs)
}

func (r *Record) UnmarshalBinary(data []byte) error {
	var rs struct {
		Origin string `cbor:"1,keyasint"`
		Buf    []byte `cbor:"2,keyasint"`
	}
	if err := cbor.Unmarshal(data, &rs); err != nil {
		return err
	}

	if len(rs.Origin) == 0 {
		return errors.New("empty record")
	}

	r.origin = rs.Origin
	r.capture = &capnd{name: "root", hi: len(rs.Origin)}
	if err := dsrNode(rs.Buf, r.capture); err != nil {
		return err
	}

	return nil
}

// capnd is a node in a triple-linked tree
type capnd struct {
	name   string
	lo, hi int
	parent *capnd
	next   *capnd
	chil   *capnd

	// remark: a threaded implementation would trade a pointer to a bool
}

func (c *capnd) add(d *capnd) *capnd {
	if c == nil {
		return d
	}

	last := &c.chil
	if c.chil != nil {
		p := c.chil
		for p.next != nil {
			p = p.next
		}

		last = &p.next
	}
	d.parent = c
	*last = d
	return *last
}

// clean drops nil nodes
func (c *capnd) clean() {
	// note we need to walk pre-order to keep counts
	for p := c; p != nil; p = p.next {
		if p.next != nil && p.next.hi == p.next.lo {
			p.next = p.next.next
		}

		if p.chil != nil {
			if p.chil.lo == p.chil.hi {
				p.chil = nil
				return
			}

			p.chil.clean()
		}
	}
}

const (
	Separator   = '.'
	RootKey     = '$'
	LODPrefix   = '#'
	ShardPrefix = '&'
)

func isLOD(s string) bool { return len(s) > 0 && s[0] == LODPrefix }

func (c *capnd) PrintDot(dst io.Writer, origin string) {
	if c == nil {
		fmt.Fprintf(dst, `"NIL" color="red"`)
		return
	}

	fmt.Fprintf(dst, `"%p" [
		label = "%s  | %d - %d | <next> next  | <table> children  "
		shape = "record"
	]
`, c, c.name, c.lo, c.hi)
	if c.next != nil {
		fmt.Fprintf(dst, "\"%p\":<next> -> \"%p\":<ptr>\n", c, c.next)
	}

	if c.chil != nil {
		fmt.Fprintf(dst, "\"%p\":<table> -> \"%p\":<ptr>\n", c, c.chil)
	}

	for q := c.chil; q != nil; q = q.next {
		q.PrintDot(dst, origin)
	}
}

// RecordWalker is an iterator over Record fields and separators
type RecordWalker struct {
	rc   *Record
	p    *capnd
	off  Position
	path string

	skipsep  bool
	eor      bool
	trvchild bool

	depth int // The current depth

	buf capnd
}

// Function that runs through every field in a record
// For each field the enc function is called, with the name and value of the field
// The enc function should return a bool, that if true indicates that field should be encrypted
// If the field is encrypted, its value will be replaced by the string returned by enc
// If a field is encrypted any children of the field will be removed from the tree
// If the enc function returns false, the current value will remain untouched and the children will be visited
func (rc *Record) Encrypt(grm Grammar, enc func(grm Grammar, name, fullpath, value string) (bool, string)) {
	// Bail if nothing to do
	if rc == nil || rc.len() < 1 {
		return
	}

	type repOp struct {
		str string // replacement string

		idx, len int // copy from origin
	}

	rplist := make([]repOp, rc.len()+1) // This is (+1), as the beginning of the string might not be a field, but everything else must be or follow a field (rc.capsize)
	var rpcnt int

	var extrac int // Number of chars found that should be added to the output string

	for p := rc.capture; p != nil; {
		replace, with := enc(grm, p.name, "", rc.origin[p.lo:p.hi])
		rplist[rpcnt].idx = p.lo

		oldLo := p.lo
		p.lo = extrac

		if replace {
			rplist[rpcnt].len = oldLo - rplist[rpcnt].idx
			rpcnt++
			rplist[rpcnt].str = with
			rplist[rpcnt].idx = p.hi
			extrac += len(with)
			oldLo = p.hi // We don't want data from the old string, it's been replaced
			p.chil = nil // We don't care about children of an encrypted field
		}

		if p.chil == nil {
			extrac += p.hi - oldLo
			oldHi := p.hi
			p.hi = extrac

			if p.next != nil {
				// Add any data before the next to the output
				extrac += p.next.lo - oldHi
				p = p.next
			} else {
				// No children or next, the only way is up
				for p.parent != nil && p != rc.capture && p.next == nil {
					// We are going up
					extrac += p.parent.hi - oldHi
					oldHi = p.parent.hi
					p.parent.hi = extrac
					p = p.parent
				}

				// Stop if we are at the top
				if p.parent == nil || p == rc.capture {
					p = nil

				} else {
					p = p.next
				}

				if p == nil {
					rplist[rpcnt].len = oldHi - rplist[rpcnt].idx
				}
			}
		} else {
			extrac += p.chil.lo - oldLo
			p = p.chil
		}
	}

	// Now build the output string
	buf := new(strings.Builder)
	buf.Grow(extrac)
	rplist = rplist[:rpcnt]

	for _, v := range rplist {
		if v.len > 0 {
			buf.WriteString(rc.origin[v.idx : v.idx+v.len])
		} else {
			buf.WriteString(v.str)
		}
	}

	rc.origin = buf.String()
}

type WalkOpts func(r *RecordWalker)

func SkipSeparator(r *RecordWalker)    { r.skipsep = true }
func AddEOR(r *RecordWalker)           { r.eor = true }
func TraverseChildren(r *RecordWalker) { r.trvchild = true }

// ASCSII end of record.
const EOR string = "\x1E\x1E\x1E\x1E"

// WalkRoot performs a linear walk over direct children of the record,
// including both captured content and separators.
//
// WalkRoot should only be used in a single record.
// See [LView] and friends when iterating over a LioLi record.
func (rc *Record) WalkRoot(ops ...WalkOpts) *RecordWalker { return rc.walkWithOffset(0, ops...) }

func (rc *Record) walkWithOffset(pos Position, ops ...WalkOpts) *RecordWalker {
	if rc.capture == nil {
		// zero value
		return &RecordWalker{p: &capnd{}, rc: rc}
	}

	assert(rc.capture.lo == 0, "capture misses begining of record")
	assert(int(rc.capture.hi) == len(rc.origin), "capture misses end of record")

	const separatorName = "-"
	// no capture, create a mock makes the rest more regular
	w := &RecordWalker{
		rc: rc, off: pos,
		path: "$.",
		buf:  capnd{name: separatorName, parent: rc.capture, next: rc.capture.chil}}
	w.p = &w.buf
	for _, o := range ops {
		o(w)
	}
	return w
}

// Next advances the walker to the next record in the selected range.
// It returns false when there is nothing to consume.
func (wlk *RecordWalker) Next() bool {
	if (ShowNestedRecords || ExpandRecordsFeature) && wlk.trvchild {
		return wlk.nextNested()
	} else {
		return wlk.nextSibling()
	}
}

func (wlk *RecordWalker) nextSibling() bool {
	assert(wlk.p.lo <= wlk.p.hi, "invalid braket")
	assert(wlk.p.hi < 1<<15, "wraparound danger")
	assert(wlk.p.hi <= len(wlk.rc.origin), "high bound over limit")
	if len(wlk.rc.origin) == wlk.p.lo {
		if wlk.eor {
			wlk.eor = false
			wlk.buf = capnd{name: EOR, lo: len(wlk.rc.origin), hi: len(wlk.rc.origin)}
			wlk.p = &wlk.buf
			return true
		}
		return false
	}

	off := wlk.p.hi
	if wlk.p.next == nil {
		wlk.buf.lo, wlk.buf.hi = off, wlk.p.parent.hi
		wlk.buf.next = nil
		wlk.p = &wlk.buf
		if !wlk.skipsep && wlk.p.lo < wlk.p.parent.hi {
			return true
		}
		if wlk.eor {
			wlk.eor = false
			wlk.buf = capnd{name: EOR, lo: len(wlk.rc.origin), hi: len(wlk.rc.origin)}
			wlk.p = &wlk.buf
			return true
		}
		return false
	}

	wlk.p = wlk.p.next
	if !wlk.skipsep && wlk.p.lo > off {
		wlk.buf.lo, wlk.buf.hi = off, wlk.p.lo
		wlk.buf.next = wlk.p
		wlk.p = &wlk.buf
	}

	return true
}

// nextNested will traverse any child nodes before siblings
// todo(mike) make it handle separators, or rather, ignore them
func (wlk *RecordWalker) nextNested() bool {
	assert(ShowNestedRecords || ExpandRecordsFeature, "NextNested is an experimental function, not ready for general use yet")

	if wlk.Down() {
		wlk.depth++
		return true
	}

	for !wlk.nextSibling() {
		if wlk.depth == 0 || !wlk.Up() {
			return false
		}
		wlk.depth--
	}

	return true
}

// Down
func (wlk *RecordWalker) Down() bool {
	if wlk.p.chil == nil {
		return false
	}
	wlk.buf.parent = wlk.p
	wlk.p = wlk.p.chil
	return true
}

// TODO(rdo) Up does not advance, check this is right in loops
func (wlk *RecordWalker) Up() bool {
	if wlk.p.parent == nil {
		return false
	}
	wlk.p = wlk.p.parent
	wlk.buf.parent = wlk.p.parent
	return true
}

// Name returns the name of the current node.
// The name is the last component of the path.
// Implementation should memoize and reuse the upper parts of the path.
func (wlk *RecordWalker) Name() string {
	if wlk.p.name == "-" || wlk.p.name == EOR {
		return wlk.p.name // separators are not named
	}
	return wlk.path + wlk.p.name
}
func (wlk *RecordWalker) IsSeparator() bool { return wlk.p.name == "-" }
func (wlk *RecordWalker) IsLOD() bool       { return isLOD(wlk.p.name) }
func (wlk *RecordWalker) Value() string     { return wlk.rc.origin[wlk.p.lo:wlk.p.hi] }
func (wlk *RecordWalker) Pos() Position     { return wlk.rc.pos(wlk.p) + wlk.off }
func (wlk *RecordWalker) ChildCount() int {
	count := 0
	for p := wlk.p.chil; p != nil; p = p.next {
		count++
	}
	return count
}

type CallOnRecordFunc func(*RecordWalker, int) bool
type CallOnRecordRecursive func(*RecordWalker) bool

func CallOnRecordRecursiveAlways(*RecordWalker) bool { return true }
func CallOnRecordRecursiveNever(*RecordWalker) bool  { return false }

// Call FuncToCall an all nodes, it is assume that the initial element is valid,
// If FuncToCall returns false, the traversing will stop and the func will return false, otherwise it will return true
func (wlk *RecordWalker) TraverseTree(FuncToCall CallOnRecordFunc, Recursive ...CallOnRecordRecursive) bool {
	assert(ShowNestedRecords, "TraverseTree is an experimental function, not ready for general use yet")
	var recursiveFunc CallOnRecordRecursive

	if 1 == len(Recursive) {
		recursiveFunc = Recursive[0]
	} else {
		recursiveFunc = CallOnRecordRecursiveAlways
	}

	depth := 0 // The current depth of the tree

	for {
		if !FuncToCall(wlk, depth) {
			// Return to top level
			for ; 0 != depth; depth-- {
				wlk.Up()
			}
			return false
		}

		// Check if the record has children
		if nil != wlk.p.chil && recursiveFunc(wlk) {
			wlk.Down()
			depth++
			continue
		}

		for !wlk.Next() {
			if 0 == depth {
				return true
			}
			wlk.Up()
			depth--
		}
	}
}

func (wlk *RecordWalker) GetDepth() int {
	return wlk.depth
}

func (wlk *RecordWalker) HasNonSeperatorChildren() bool {
	assert(ShowNestedRecords, "HasNonSeperatorChildren is an experimental function, not ready for general use yet")
	hasValidChild := false

	if !wlk.Down() {
		return false
	}

	wlk.TraverseTree(func(wlk *RecordWalker, debth int) bool {
		if wlk.IsSeparator() {
			return true
		}

		hasValidChild = true
		return false
	}, CallOnRecordRecursiveNever)

	// Get back to original element
	wlk.Up()

	return hasValidChild
}

// Hop jumps over all repetitions of the current element.
// If a separator exists between repetition, hop stops just before it.
func (wlk *RecordWalker) Hop() {
	for wlk.p.next != nil && wlk.p.next.name == wlk.p.name && wlk.p.next.lo == wlk.p.hi {
		wlk.p = wlk.p.next
	}
}

// preorder traversal of the tree.
// See Knuth, 2.3.3 (6)
// TODO(rdo) second level of recursion could be a loop
func serNode(c *capnd, delta int, buf []byte) []byte {
	const lnode = 1 << 15
	const maxu15 = 1<<15 - 1

	for c := c; c != nil; c = c.next {
		li := len(buf)
		if c.chil != nil {
			buf = append(buf, []byte{0, 0}...)
		}

		buf = encodeNode(c, delta, buf)
		if c.chil != nil {
			// one rec, but our trees are shallow
			buf = serNode(c.chil, c.lo, buf)
			d := len(buf) - li
			if d > maxu15 {
				panic("buffer too large")
			}
			binary.BigEndian.PutUint16(buf[li:], uint16(d)|lnode)
		}
		delta = c.hi
	}
	return buf
}

func dsrNode(buf []byte, root *capnd) error {
	const lnode = 1 << 15
	const lmask = 1<<15 - 1

	type pnode struct {
		cap *capnd
		pos int
	}
	ancestors := []pnode{{pos: len(buf), cap: root}}
	ptr := &root.chil
	idx := 0
	delta := 0

	for idx < len(buf) {
		if ancestors[0].pos == idx {
			ptr = &ancestors[0].cap.next
			delta = ancestors[0].cap.hi
			ancestors = ancestors[1:]
		}

		var li int
		if sk := binary.BigEndian.Uint16(buf[idx:]); (sk & lnode) != 0 {
			li = int(sk&lmask) + idx
			idx += 2
		}

		c, sz := decodeNode(buf[idx:], delta)
		idx += sz
		c.parent = ancestors[0].cap
		*ptr = c
		if li > 0 {
			ancestors = append([]pnode{{pos: li, cap: *ptr}}, ancestors...)
			ptr = &(*ptr).chil
			delta = c.lo
		} else {
			ptr = &(*ptr).next
			delta = c.hi
		}
	}

	return nil
}

func encodeNode(c *capnd, d int, buf []byte) []byte {
	var h byte
	switch {
	case len(c.name) < 0b11_1111:
		h |= byte(len(c.name))
		buf = append(buf, h)
	case len(c.name) < 0b11_1111_1111_1111:
		h |= 1<<6 | byte(len(c.name)&0b1_1111)
		buf = append(buf, h, byte(len(c.name)>>6))
	default:
		panic("name too long")
	}
	buf = append(buf, c.name...)

	return encodeDelta(c.lo, c.hi, d, buf)
}

func decodeNode(buf []byte, d int) (*capnd, int) {
	h := buf[0]
	var c capnd

	l := 1
	switch {
	case h&(1<<7) != 0:
		panic("dict encoding not implemented")
	case h&(1<<6) != 0:
		l = 2 + (int(h&0b11_1111) | int(buf[1])<<6)
		c.name = string(buf[2:l])
	default:
		l = 1 + int(h&0b11_1111)
		c.name = string(buf[1:l]) // TODO(rdo) check if escapes to heap
	}

	lo, hi, sz := decodeDelta(buf[l:], d)
	c.lo = lo
	c.hi = hi
	l += sz

	return &c, l
}

func encodeDelta(lo, hi int, d int, buf []byte) []byte {
	d1, d2 := lo-d, hi-lo
	switch {
	case d1 <= 0b111 && d2 <= 0b1111:
		buf = append(buf, byte(d1<<4)|byte(d2))
	case d1 <= 0b11_1111 && d2 <= 0b1111_1111:
		buf = append(buf,
			byte(1<<7)|byte(d1),
			byte(d2))
	case d1 <= 0x3FFF && d2 <= 0xFFFF:
		buf = append(buf,
			byte(0b11<<6)|byte(d1>>8), byte(d1),
			byte(d2>>8), byte(d2))
	default:
		panic("values too large")
	}

	return buf
}

func decodeDelta(buf []byte, d int) (lo, hi int, sz int) {
	h := buf[0]
	switch {
	case h&(1<<7) == 0:
		lo := int(h>>4) + d
		return lo, lo + int(h&0b1111), 1
	case h&(1<<6) == 0:
		i := buf[1]
		lo := int(h&0b11_1111) + d
		return lo, lo + int(i), 2
	default:
		i, j, k := buf[1], buf[2], buf[3]
		lo := int(h&0b11_1111)<<8 | int(i) + d
		return lo, int(j)<<8 | int(k) + lo, 4
	}
}

// MarshalText returns a faithful, textual representation of a record
func (rc Record) MarshalText() ([]byte, error) {
	var buf bytes.Buffer
	for wlk := rc.WalkRoot(); wlk.Next(); {
		dumpLORTH(&buf, wlk, "")
	}
	if buf.Len() > 1 {
		buf.Truncate(buf.Len() - 1) // unwrite last line return
		buf.WriteString(";")
	}
	return bytes.TrimSpace(buf.Bytes()), nil
}
