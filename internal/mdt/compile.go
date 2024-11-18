package mdt

import (
	"fmt"
	"io"
	"sort"
	"strings"
	"unicode/utf8"
)

type opcode byte

const (
	opInvalid opcode = iota
	// expecting next rune to exist and to be in range
	// to get any rune, use range 0..int32(^uint32(0) >> 1)) == range 0..4294967295
	opRange
	// ignore the next characters
	opSkip
	// check next rune range and follow one branch or the other depending on result
	opLA1
	// advance to literal (there can be intermediate runes before the literal)
	opScan
	// keep going with branch x and create a new thread for branch y
	opSplit
	// init a capture range at current position with provided name (setting capture "lo")
	opSave
	// accept anything at the end
	opEnd
	// finalize capture range at current position (setting capture "hi")
	opTerm opcode = 0xff
)

var opnames = [...]string{"inv", "range", "skip", "la1", "scan", "split", "save"}

func (i opcode) String() string {
	if uint(i) >= uint(len(opnames)) {
		return "term"
	}
	// if the name seems incorrect, check if you have added operations without giving them a proper name
	return opnames[i]
}

// TODO(rdo) linearize to quick jumps
type Instr struct {
	op opcode
	rn []runerange // expected range for next character
	st string      // literal to expect, or capture name

	x, y *Instr // x is the preferred instruction to follow => longest match rule
}

func (i *Instr) ReadLine(dt []byte) (Record, bool) { return backtrack(i, dt) }

var matchI = Instr{op: opTerm}

func singlechar(op *Instr) bool {
	return op.op == opRange && len(op.rn) == 1 && op.rn[0].lo == op.rn[0].hi
}

func CompileGrammar(g Grammar) *Instr {
	start := new(Instr)
	p1 := g["root"]
	newCompiler(g).compileExpr(p1, nil, start, &matchI)
	return start
}

type compiler struct {
	cache map[string]*Instr
	grm   Grammar
}

func newCompiler(g Grammar) *compiler { return &compiler{cache: make(map[string]*Instr), grm: g} }

func (c *compiler) compileExpr(exp Expression, la1 []runerange, pc, pn *Instr) {
	switch exp := exp.(type) {
	case *ebList:
		*pc = Instr{op: opRange,
			rn: []runerange{{exp.Begin, exp.End}},
			x:  pn,
		}
	case ebToken:
		for i := len(exp) - 1; i > 0; i-- {
			pn = &Instr{op: opRange,
				rn: []runerange{{rune(exp[i]), rune(exp[i])}},
				x:  pn}

		}
		*pc = Instr{op: opRange,
			rn: []runerange{{rune(exp[0]), rune(exp[0])}},
			x:  pn}

	case ebAny:
		// coalesce end of matches
		var pop, endpop *Instr
		for pn.op == opTerm {
			if pop == nil {
				pop = pn
			}
			endpop = pn

			if pn == &matchI {
				*pc = Instr{op: opEnd, x: pop}
				return
			}

			pn = pn.x
		}

		// coalesce tokens
		var tk []byte
		for ; pn != nil && singlechar(pn); pn = pn.x {
			tk = utf8.AppendRune(tk, pn.rn[0].lo)
		}

		if len(tk) > 0 {
			px := &Instr{op: opSkip, st: string(tk), x: pn}
			if pop != nil {
				endpop.x = px
				px = pop
			}
			*pc = Instr{op: opScan, st: string(tk), x: px}
			return
		}

		// TODO(rdo) LA1 opt??
		instr := &Instr{op: opSplit, x: pn}
		instr.y = &Instr{op: opRange,
			rn: []runerange{{0, maxRune}},
			x:  instr,
		}
		*pc = *instr

	case ebSequence:
		if len(exp) == 0 {
			panic("found empty sequence")
		}
		for i := len(exp) - 1; i > 0; i-- {
			p := new(Instr)
			c.compileExpr(exp[i], la1, p, pn)
			if c.carry(exp[i]) {
				la1 = mergeranges(la1, c.runesIn(exp[i]))
			} else {
				la1 = c.runesIn(exp[i])
			}
			pn = p
		}
		c.compileExpr(exp[0], la1, pc, pn)

	case ebAlternative:
		if len(exp) != 2 {
			panic("multi-branch not implemented yet")
		}

		// special case: unify multiple ranges as a single op
		x1, m1 := exp[0].(*ebList)
		x2, m2 := exp[1].(*ebList)
		if m1 && m2 {
			*pc = Instr{op: opRange,
				rn: []runerange{{x1.Begin, x1.End}, {x2.Begin, x2.End}},
				x:  pn,
			}
			return
		}

		px, py := new(Instr), new(Instr)
		ra, rb := c.runesIn(exp[0]), c.runesIn(exp[1])

		xa := rangeexcl(ra, rb)
		if ab := rangeexcl(ra, xa); len(ab) == 0 {
			c.compileExpr(exp[0], mergeranges(la1, rb), px, pn)
			c.compileExpr(exp[1], mergeranges(la1, ra), py, pn)
			*pc = Instr{op: opLA1, rn: xa, x: px, y: py}
			return
		}

		instr := &Instr{op: opSplit, x: px, y: py}
		if len(xa) > 0 {
			c.compileExpr(exp[0], mergeranges(la1, rb), px, pn)
			instr = &Instr{op: opLA1, rn: xa, x: px, y: instr}
		} else {
			c.compileExpr(exp[0], mergeranges(la1, rb), px, pn)
		}

		if xb := rangeexcl(rb, ra); len(xb) > 0 {
			c.compileExpr(exp[1], mergeranges(la1, ra), py, pn)
			instr = &Instr{op: opLA1, rn: xb, x: py, y: instr}
		} else {
			c.compileExpr(exp[1], mergeranges(la1, ra), py, pn)
		}

		*pc = *instr

	case *ebRepetition:
		// ebRepetition will max out the number of repetitions seen.
		pb := new(Instr)
		rs := c.runesIn(exp.Body)
		c.compileExpr(exp.Body, la1, pb, pc)
		if len(rangeexcl(rs, rangeexcl(rs, la1))) == 0 {
			*pc = Instr{op: opLA1, rn: rs, x: pb, y: pn}
			return
		}

		instr := &Instr{op: opSplit, x: pb, y: pn}
		if rn := rangeexcl(rs, la1); len(rn) > 0 {
			instr = &Instr{op: opLA1, rn: rn, x: pb, y: instr}
		}

		*pc = *instr

	case *ebOption:
		pb := new(Instr)
		c.compileExpr(exp.Body, la1, pb, pn)
		*pc = Instr{op: opSplit,
			x: pb, y: pn,
		}

	case *ebGroup:
		c.compileExpr(exp.Body, la1, pc, pn)

	case ebName:
		pm := c.cache[string(exp)]
		if pm == nil {
			pm = new(Instr)
			c.cache[string(exp)] = pm
			pop := &Instr{op: opTerm, x: pn}
			c.compileExpr(c.grm[string(exp)].Expr, la1, pm, pop)
		}
		*pc = Instr{op: opSave,
			st: string(exp),
			x:  pm,
		}

	case *ebProduction:
		c.compileExpr(exp.Expr, la1, pc, pn)
	}
}

func (c *compiler) carry(exp Expression) bool {
	switch x := exp.(type) {
	case ebAny:
		return true
	case *ebOption:
		return true
	case *ebRepetition:
		return true
	case *ebProduction:
		return c.carry(x.Expr)
	case ebName:
		return c.carry(c.grm[string(x)])
	}

	return false
}

type runerange struct{ lo, hi rune }

func (r runerange) String() string { return fmt.Sprintf("%q … %q", r.lo, r.hi) }

func (r runerange) IsAny() bool { return r.lo == 0 && r.hi == maxRune }

// rangeexcl returns the ranges in 1, excluding all ranges in 2
func rangeexcl(runes1, runes2 []runerange) []runerange {
	out := make([]runerange, 0, len(runes1))
	j := 0

topLoop:
	for _, v := range runes1 {
		p := v.lo
		for j < len(runes2) && runes2[j].lo <= v.hi {
			if p < runes2[j].lo {
				// no empty range
				out = append(out, runerange{p, runes2[j].lo - 1})
			}
			if v.hi >= runes2[j].hi {
				p = runes2[j].hi + 1
				if p < v.lo {
					p = v.lo
				}
				j++
			} else {
				continue topLoop
			}
		}
		if p <= v.hi {
			out = append(out, runerange{p, v.hi})
		}
	}
	return out
}

func (r1 runerange) insersects(r2 runerange) bool {
	return r2.hi >= r1.lo && r1.hi >= r2.lo
}

var maxRune = rune(1<<31 - 1)
var allRunes runerange = runerange{
	lo: 0,
	hi: maxRune,
}

// runesIn walks the tree to find all runes useful as the next lookahead.
func (c compiler) runesIn(exp Expression) []runerange {
	switch x := exp.(type) {
	case *ebList:
		return []runerange{{lo: x.Begin, hi: x.End}}
	case ebToken:
		if len(x) == 0 {
			panic("found empty ebToken")
		}
		// first one must match
		return []runerange{{rune(x[0]), rune(x[0])}}
	case ebAlternative:
		var rr []runerange
		for i := range x {
			rr = append(rr, c.runesIn(x[i])...)
		}
		return minrange(rr)
	case *ebRepetition:
		return c.runesIn(x.Body)

	case ebSequence:
		var rr []runerange
		for i := range x {
			rr = append(rr, c.runesIn(x[i])...)
			if _, ok := x[i].(ebToken); ok {
				return minrange(rr)
			}
		}
		return minrange(rr)
	case ebName:
		return c.runesIn(c.grm[x.String()])

	case *ebProduction:
		return c.runesIn(x.Expr)
	case *ebGroup:
		return c.runesIn(x.Body)
	case *ebOption:
		return c.runesIn(x.Body)
	case ebAny:
		return []runerange{{0, maxRune}}
	default:
		panic("can't lookahead expression: " + x.String())
	}
}

// minrange returns the minimal form of the rune ranges
//   - no rune is present twice
//   - no range overlaps
//   - no range is contiguous to the next range
func minrange(runes []runerange) []runerange {
	sort.Slice(runes, func(i, j int) bool { return runes[i].lo < runes[j].lo })

	j := 0
	for i := 1; i < len(runes); i++ {
		if runes[i].lo > nextrune(runes[j].hi) {
			j++
			runes[j] = runes[i]
			continue
		}
		if runes[i].hi > runes[j].hi {
			runes[j].hi = runes[i].hi
		}

	}
	return runes[:j+1]
}

func mergeranges(r1, r2 []runerange) []runerange {
	r1 = append(r1, r2...)
	return minrange(r1)
}

func nextrune(r rune) rune {
	if r < maxRune-1 {
		return r + 1
	}
	return r
}

// PrintDot creates a [DOT] visualization of the machine used to parse the input.
// This function is mostly useful for troubleshooting, cf the opprint command.
//
// [DOT]: https://graphviz.org/doc/info/lang.html
func (g Grammar) PrintDot(buf io.Writer) {
	root, ok := g["root"]
	if !ok {
		return
	}

	start := new(Instr)
	newCompiler(g).compileExpr(root, nil, start, &matchI)

	fmt.Fprint(buf, "strict digraph {\n")
	visited := make(map[*Instr]bool)

	var loop func(pc *Instr, buf io.Writer)
	loop = func(pc *Instr, buf io.Writer) {
		if pc.x != nil {
			fmt.Fprintf(buf, "\"%p\" -> \"%p\"\n", pc, pc.x)
		}
		if pc.y != nil {
			fmt.Fprintf(buf, "\"%p\" -> \"%p\" [color=grey53]\n", pc, pc.y)
		}

		switch pc.op {
		case opInvalid:
			fmt.Fprintf(buf, "\"%p\" [label=invalid color=red]\n", pc)
		case opScan:
			fmt.Fprintf(buf, "\"%p\" [label=\"scan `%s`\"]\n", pc, quotedouble(pc.st))
		case opRange:
			fmt.Fprintf(buf, "\"%p\" [label=\"%s\"]\n", pc, prettyranges(pc.rn))
		case opSkip:
			fmt.Fprintf(buf, "\"%p\" [label=\"skip %d \"]\n", pc, len(pc.st))
		case opLA1:
			fmt.Fprintf(buf, "\"%p\" [label=\"la (%s)\"]\n", pc, prettyranges(pc.rn))
		case opSplit:
			fmt.Fprintf(buf, "\"%p\" [label=split]\n", pc)
		case opTerm:
			if pc.x == nil {
				fmt.Fprintf(buf, "\"%p\" [label=final shape=doublecircle]\n", pc)
			} else {
				fmt.Fprintf(buf, "\"%p\" [label=pop]\n", pc)
			}
		case opSave:
			fmt.Fprintf(buf, "\"%p\" [label=\"save: %s\"]\n", pc, quotedouble(pc.st))
		case opEnd:
			fmt.Fprintf(buf, "\"%p\" [label=\"matchend\"]\n", pc)
		default:
			panic("op not implemented " + pc.op.String())
		}
		if pc.x != nil && !visited[pc.x] {
			visited[pc.x] = true
			loop(pc.x, buf)
		}
		if pc.y != nil && !visited[pc.y] {
			visited[pc.y] = true
			loop(pc.y, buf)
		}
	}
	loop(start, buf)
	fmt.Fprint(buf, "}")
}

func prettyranges(rr []runerange) string {
	var buf strings.Builder
	for i, rr := range rr {
		if i > 0 {
			buf.WriteString("\n")
		}
		if rr.IsAny() {
			fmt.Fprintf(&buf, "any")
		} else {
			fmt.Fprintf(&buf, "%U … %U", rr.lo, rr.hi)
		}
	}
	return buf.String()
}

func quotedouble(s string) string {
	return strings.ReplaceAll(s, "\"", "\\\"")
}
