// backtracking implementation of the parser used to capture all inputs
// inspration: https://cs.opensource.google/go/go/+/refs/tags/go1.19.1:src/regexp/backtrack.go

package mdt

import (
	"bytes"
	"sync"
	"sync/atomic"
	"unicode/utf8"
)

var (
	countLoopExit       atomic.Int64
	countThreadsCreated atomic.Int64
	countExecOps        atomic.Int64
)

// backtrack runs the capture engine against the string to find all sub-matches
//
// As every back-tracking implementation, this can lead to O(n^2) run time.
// Avoid this by making sure branches in your grammar are mutually exclusive early.
//
// TODO(rdo) use bitstate to track (rp, pc) pairs already visited
func backtrack(re *Instr, s []byte) (Record, bool) {
	const maxUint16 = 0xFFFF
	if len(s) > maxUint16 {
		panic("matching exceeds reasonable line size")
	}

	var (
		_threadsCreated int64
		_totalOps       int64
	)

	defer func() {
		countThreadsCreated.Add(_threadsCreated)
		countExecOps.Add(_totalOps)
	}()

	type thread struct {
		pc *Instr
		rp int
		cp int
	}

	const initThreads = 0xF  // start small, but enough when optimized grammars
	const maxThreads = 0xFFF // prevent infinite backtrack
	ready := make([]thread, initThreads)
	ready[0] = thread{pc: re, rp: 0, cp: 1}
	caps := capsPool.Get().(*captures)
	caps.startcap("root", 0)

	// last rune read or RuneError if no new rune has been read
	// lookahead may fill this variable with the next rune, check for its presence before advancing
	lastrune := utf8.RuneError
	nn := 1
	for nn > 0 {
		nn--
		pc := ready[nn].pc
		rp := ready[nn].rp
		caps.rewind(ready[nn].cp)

	THREADLOOP:
		for pc != &matchI {
			_totalOps++

			switch pc.op {
			case opSkip:
				rp += len(pc.st)
				if rp > len(s) {
					panic("skip over more characters than available")
				}
				pc = pc.x
				lastrune = utf8.RuneError

			case opScan:
				advance := bytes.Index(s[rp:], []byte(pc.st))
				if advance < 0 {
					break THREADLOOP
				}

				rp += advance
				pc = pc.x
				lastrune = utf8.RuneError

			case opRange:
				if rp == len(s) {
					break THREADLOOP
				}

				var sz int
				if lastrune == utf8.RuneError {
					lastrune, sz = utf8.DecodeRune(s[rp:])
				} else {
					sz = utf8.RuneLen(lastrune)
				}

				if inrange(lastrune, pc.rn) {
					lastrune = utf8.RuneError
					rp += sz
					pc = pc.x
				} else {
					lastrune = utf8.RuneError
					break THREADLOOP
				}

			case opLA1:
				// match is greedy, if nothing is left, build out
				if rp == len(s) {
					pc = pc.y
					continue
				}

				var r rune
				const as = 0x80 // max ASCII range
				if s[rp] < as {
					r = rune(s[rp])
				} else {
					r, _ = utf8.DecodeRune(s[rp:])
				}
				lastrune = r

				if inrange(lastrune, pc.rn) {
					pc = pc.x
				} else {
					pc = pc.y
				}

			case opSplit:
				if nn >= maxThreads {
					countLoopExit.Add(1)
					break THREADLOOP
				}

				if nn >= len(ready) {
					r := make([]thread, len(ready)*2)
					copy(r, ready)
					ready = r
				}

				ready[nn] = thread{pc: pc.y, rp: rp, cp: len(caps.caps)}
				nn++
				_threadsCreated++
				pc = pc.x

			case opSave:
				caps.startcap(pc.st, rp)
				pc = pc.x

			case opTerm:
				caps.endcap(rp)
				pc = pc.x

			case opEnd:
				rp = len(s)
				pc = pc.x

			case opInvalid:
				panic("invalid op!")
			}
		}

		// no more threads, if we reached a terminal operation we are done with success
		if pc == &matchI && rp == len(s) {
			root := caps.record()
			root.hi = len(s)

			caps.refs = caps.refs[:0]
			caps.caps = caps.caps[:0]
			capsPool.Put(caps)

			return Record{capture: root, origin: string(s)}, true

		}
	}

	caps.refs = caps.refs[:0]
	caps.caps = caps.caps[:0]
	capsPool.Put(caps)

	// if no match, always return the full so we can display it to the user
	return Record{capture: &capnd{name: "root", hi: len(s)}, origin: string(s)}, false
}

type captures struct {
	refs []string
	caps []capture
}

var capsPool = sync.Pool{New: func() any { return new(captures) }}

func (c *captures) rewind(to int) { c.caps = c.caps[:to] }

func (c *captures) startcap(name string, rp int) {
	ref := -1
	for r, n := range c.refs {
		if n == name {
			ref = r
		}
	}
	if ref == -1 {
		c.refs = append(c.refs, name)
		ref = len(c.refs) - 1
	}

	c.caps = append(c.caps, capture{ref: byte(ref), rp: uint16(rp)})
}

const endmark = 1 << 7

func (c *captures) endcap(rp int) {
	c.caps = append(c.caps, capture{ref: endmark, rp: uint16(rp)})
}

func (caps *captures) record() *capnd {
	var p *capnd
	nds := make([]capnd, len(caps.caps))
	for i, c := range caps.caps {
		if c.ref == endmark {
			p.hi = int(c.rp)
			p = p.parent
		} else {
			nds[i].name = caps.refs[c.ref]
			p = p.add(&nds[i])
			p.lo = int(c.rp)
		}
	}
	p.clean()
	return p
}

type capture struct {
	ref byte
	rp  uint16
}

func inrange(r rune, ranges []runerange) bool {
	for _, rr := range ranges {
		if rr.lo <= r && r <= rr.hi {
			return true
		}
	}
	return false
}
