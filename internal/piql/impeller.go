package piql

import (
	"bytes"
	"context"
	"fmt"
	"math/bits"
	"runtime/trace"
	"sort"
	"sync/atomic"
	"time"

	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/shards"
)

var (
	_logger = tasks.NewLogger("impeller")

	obsNoTimeFieldCount     atomic.Int64
	obsBadTimeFormat        atomic.Int64
	obsTotalRecordProcessed atomic.Int64
)

const (
	IsMatch      = true
	IgnoreRecord = false
)

// Evaluator is the component used to match multiple rules against a (possibly streaming) data source.
type Evaluator struct {
	err error // write-before closing all dst

	rules []rule
	dst   []chan mdt.Record
	idx   map[string]*rnode // hamt probably better suited with nested structs. Top-level for now

	track  int
	wmax   int64
	tsname string
	win    []recordref
}

type recordref struct {
	mdt.Record

	ts  int64
	ref uint64 // ref acts as a bitmap against rules, and index to ptn
	ptn []string
	unq uint64 // bitmap, only return once
}

type rule struct {
	xs nodes

	num int // index in evaluator

	// single-record lines
	clauses  uint64 // bitset
	wantnull uint64
	winops   bool

	// storage space
	mtch uint64
	ptn  string

	// window functions
	over int64
	hop  int64

	wmin int64
}

// by construction, the partition is always the last member of the clauses => rest is scalars
func (r *rule) scalars() uint64 { return r.clauses ^ 1<<(bits.OnesCount64(r.clauses)-1) }

// # Implementation notes
//
// The impeller query engine is half-way through an interpreter and a bytecode VM – the later being the desired outcome, but takes longer to implement :).
// We also somewhat gleefully mix the front-end (expr) and back-end (instr / winstr) parts; this is convenient for direct functions implementations.
type expr interface {
	SortKey() int
}

type instr interface {
	Step(value, metadata string) bool
}
type winstr interface {
	instr
	Exit(value, metadata string)

	// Invert() winstr
}

const (
	// note on SortKey: the int value is used in both use of the “sort” word – to arrange by class, and to order from small to big (see Knuth, chap. 5 for a longer discussion)
	// the order is carefully chosen to help the compilation stage in MatchRules.
	// currently, the trailing 3 bits are used to order within a category.
	filterSortKey = 0
	windowSortKey = 8
)

type rnode struct {
	instr
	n, s *rnode
	r    *rule
	i    int // index in rule xs
}

// Iter is an abstraction over any data source.
// It mirrors the definitions in `hub/driver`, copied here to prevent an import cycle.
type Iter interface {
	Next() bool
	Record() mdt.Record
	Err() error
}

func (ev *Evaluator) Run(ctx context.Context, src Iter, grm mdt.Grammar) {
	defer trace.StartRegion(ctx, "piql:impeller:run").End()

	_totalrecords := 0
	var _region_filter *trace.Region
	_region_waitnext := trace.StartRegion(ctx, "piql:impeller:firstwait")

	for src.Next() {
		_region_waitnext.End()
		_region_filter = trace.StartRegion(ctx, "piql:impeller:filter")

		rc := src.Record()
		_totalrecords++

		// step 2. slide window
		var nw int
		if ev.track > 0 {
			nw = ev.slidewindow(rc, grm)
			if nw == -1 {
				continue
			}
		}

		// step 1. walk record once, executing rules in turn, flag matches.
		for wlk := rc.WalkRoot(mdt.SkipSeparator); wlk.Next(); {
			for p := ev.idx[wlk.Name()]; p != nil; p = p.n {
				if p.Step(wlk.Value(), grm.Metadata(wlk.Name())) {
					p.r.mtch |= 1 << p.i
				} else {
					p.r.mtch ^= (1 << p.i) & p.r.wantnull
				}
			}
		}

		// step 3. run window functions on all rows that are not already filtered out
		for i, r := range ev.rules {
			if !r.winops || r.mtch&r.clauses != r.scalars() {
				continue
			}

			p := r.xs.first // find partition, this is always the last scalar clause by compiler construction
			for i := 1; i < bits.OnesCount64(r.clauses); i++ {
				p = p.s
			}

			// side-effect of Step is to set the partition on ev.rules[i].ptn (not r!)
			if p.Step("", "") {
				p.r.mtch |= 1 << p.i
			}

			ev.win[nw].ref |= 1 << i
			ev.win[nw].ptn[i] = ev.rules[i].ptn
		}

		// step 4. walk rules, return when all predicates match
		for i, r := range ev.rules {
			switch {
			case r.mtch&r.clauses == r.clauses:
				if !r.winops {
					// fast path for non-window functions
					select {
					case ev.dst[i] <- rc:
					case <-time.After(400 * time.Millisecond):
						// lossy push
						trace.Log(ctx, "piql:impeller:drop", "downstream-lag")
					}
					break
				}

				for j, rc := range ev.win {
					if rc.ref&1<<i != 0 && rc.unq&1<<i == 0 && rc.ptn[bits.OnesCount64(rc.ref&(1<<i-1))] == r.ptn {
						ev.win[j].unq |= 1 << i

						select {
						case ev.dst[i] <- rc.Record:
						case <-time.After(400 * time.Millisecond):
							// lossy push
							trace.Log(ctx, "piql:impeller:drop", "downstream-lag")
						}
					}
				}
			}

			ev.rules[i].mtch = r.wantnull
		}

		_region_filter.End()
		_region_waitnext = trace.StartRegion(ctx, "piql:impeller:wait")
	}
	_region_waitnext.End()
	obsTotalRecordProcessed.Add(int64(_totalrecords))

	_region_close := trace.StartRegion(ctx, "piql:impeller:close")
	ev.err = src.Err()
	for _, c := range ev.dst {
		close(c)
	}
	_region_close.End()
}

// slidewindow runs invertible expressions for each rule refering to a record that is now out of the tracked window
func (ev *Evaluator) slidewindow(rc mdt.Record, grm mdt.Grammar) int {

	// step 1. find the new wmax, timestamp of the latest record
	//          allow for out-of-order records (within grace period).
	fields := rc.FindPath(ev.tsname)
	if len(fields) != 1 {
		obsNoTimeFieldCount.Add(1)
		return -1
	}

	var wmax int64

	if metadata := grm.Metadata(ev.tsname); metadata != "" {
		ts, err := time.Parse(metadata, fields[0])
		if err != nil {
			obsBadTimeFormat.Add(1)
			_logger.Debug("invalid date format: "+err.Error(), "metadata", metadata, "ts", fields[0])
			return -1
		}
		wmax = ts.UnixMilli()
	} else {
		ts, _, err := parseTime(fields[0])
		if err != nil {
			obsBadTimeFormat.Add(1)
			_logger.Debug("invalid date format: "+err.Error(), "metadata", metadata, "ts", fields[0])
			return -1
		}
		wmax = ts.UnixMilli()
	}
	if ev.wmax < wmax {
		ev.wmax = wmax
	} else {
		return len(ev.win) - 1 // fast path, no invert
	}

	inv := make([]uint64, len(ev.win))
	// step 2. find all rules referring to records that are now out of the target window
	for i, r := range ev.rules {
		if r.wmin+r.over > ev.wmax {
			continue
		}

		ev.rules[i].wmin = (ev.wmax - r.over) / r.hop * r.hop

		// TODO(rdo) measure if need to use sorted jumps
		for j, w := range ev.win {
			if w.ref&(1<<i) != 0 && w.ts < ev.rules[i].wmin {
				inv[j] = 1 << i
				ev.unref(i, j)
			}
		}
	}

	// step 3. invert state, and drop unused values
	j := 0
	for i := 0; i < len(ev.win); i++ {
		if inv[i] != 0 {
			rc := ev.win[i]
			for wlk := rc.WalkRoot(mdt.SkipSeparator, mdt.AddEOR); wlk.Next(); {
				for p := ev.idx[wlk.Name()]; p != nil; p = p.n {
					if inv[i]&1<<p.r.num == 0 {
						continue
					}

					xp, ok := p.instr.(winstr)
					if !ok {
						continue
					}

					xp.Exit(wlk.Value(), grm.Metadata(wlk.Name()))
				}
			}
		}

		if ev.win[i].ref == 0 {
			continue
		}

		if i != j {
			ev.win[j] = ev.win[i]
		}
		j++
	}
	ev.win = ev.win[:j]

	// step 4. increase window with value
	// TODO(rdo) grace
	ev.win = append(ev.win, recordref{Record: rc, ts: wmax, ptn: make([]string, ev.track)})
	return len(ev.win) - 1
}

// unref removes reference from window record j to rule i
// TODO(rdo) bound check optimisation??
func (ev *Evaluator) unref(i, j int) {
	ptn := bits.OnesCount64(ev.win[j].ref & (1<<i - 1))
	if ptn < len(ev.win[j].ptn)-1 {
		ev.win[j].ptn = append(ev.win[j].ptn[:ptn], ev.win[j].ptn[ptn+1:]...)
	} else {
		ev.win[j].ptn = ev.win[j].ptn[:ptn]
	}
	ev.win[j].ref ^= 1 << i
}

type evstream struct {
	src chan mdt.Record
	rc  mdt.Record
	ev  *Evaluator
}

func (s *evstream) Next() (ok bool) {
	s.rc, ok = <-s.src
	return ok
}

func (s *evstream) Record() mdt.Record { return s.rc }
func (s *evstream) Err() error         { return s.ev.err }

type Pivot struct {
	On  string
	Exp expr
}

func NewPivot(query string, on string) (Pivot, error) {
	xp, _, err := ParseSingle(query)
	if err != nil {
		return Pivot{}, err
	}
	xp.On = on
	return xp, nil
}

func (x Pivot) ExpandTemplate(shard string, patterns []shards.Pattern) []shards.Pattern {

	switch f := x.Exp.(type) {
	default:
		return patterns
	case Equal:
		var xp []shards.Pattern
		for _, p := range patterns {
			ps, _ := shards.ReplaceShard(shard, f, p)
			xp = append(xp, ps...) // always include original pattern
		}

		return xp
	}
}

type Pivots []Pivot

func (p Pivots) MarshalText() ([]byte, error) {
	var buf bytes.Buffer
	sort.Slice(p, func(i, j int) bool { return p[i].Exp.SortKey() < p[j].Exp.SortKey() })

	// TODO(rdo) is that right?? The expression is not always the pretty
	for _, p := range p {
		fmt.Fprintf(&buf, "%s[%s]; ", p.Exp, p.On)
	}
	return buf.Bytes(), nil
}

func (p *Pivots) UnmarshalText(dt []byte) error {
	sb := bytes.Split(dt, []byte(";"))
	pts := make([]Pivot, len(sb))
	for i, sb := range sb {
		p, _, err := ParseSingle(string(sb))
		if err != nil {
			return err
		}
		pts[i] = p
	}
	*p = pts
	return nil
}

func (ev *Evaluator) MatchRules(ps Pivots) Iter {
	if ev.idx == nil {
		ev.idx = make(map[string]*rnode)
	}
	// implementation note: using a fully-fledged recursive descent parser makes little sense, especially since the user is not presented with a formal language.
	// instead, the complation to rule engine data structure is closer to macro expansion systems (e.g. Tex).
	// see https://www.overleaf.com/learn/latex/How_TeX_macros_actually_work for a very approachable introduction.

	sort.Slice(ps, func(i, j int) bool { return ps[i].Exp.SortKey() < ps[j].Exp.SortKey() })

	up := make(chan mdt.Record)
	ev.rules = append(ev.rules, rule{num: len(ev.rules)})
	ev.dst = append(ev.dst, up)
	rule := &ev.rules[len(ev.rules)-1]

	mode := filterSortKey
	var partition *opGroup
	for _, p := range ps {
		if p.On == "" {
			continue
		}

		// adding partition as last clause in the vector, even if no value specified.
		// this is possible with, for example shortcuts, in the Limit expression.
		if mode < bysortkey && p.Exp.SortKey() >= bysortkey {
			partition = groupop(&rule.ptn)
			x := rule.addNode(partition)
			ev.indexOn(mdt.EOR, x)
			rule.clauses |= 1 << x.i
			rule.winops = true
		}

		switch xp := p.Exp.(type) {
		default:
			x := rule.addNode(xp.(instr))
			ev.indexOn(p.On, x)
			rule.clauses |= 1 << x.i
		case Not:
			x := rule.addNode(xp)
			ev.indexOn(p.On, x)
			rule.clauses |= 1 << x.i
			rule.wantnull |= 1 << x.i

		case Over:
			if mode >= oversortkey {
				panic("multiple window definitions")
			}
			rule.over = xp.over.Milliseconds()
			rule.hop = xp.hop.Milliseconds()
			ev.tsname = p.On
			ev.track++

			mode = oversortkey
		case By:
			ev.indexOn(p.On, rule.addNode(opCapture{val: partition.newlevel()}))

			mode = bysortkey
		case *Limit:
			if p.On != "$" {
				ev.indexOn(p.On, rule.addNode(opCapture{val: partition.newlevel()}))
			}
			partition.ictor = append(partition.ictor, func() winstr { return &Limit{Max: xp.Max} })

			mode = limitsortkey
		case *FirstThen:
			addr, mdt := new(string), new(string)
			ev.indexOn(p.On, rule.addNode(opCapture{val: addr, mdt: mdt}))
			partition.ictor = append(partition.ictor, func() winstr { return opCont{val: addr, mdt: mdt, instr: xp} })

			mode = ftsortkey
		}
	}

	rule.mtch = rule.wantnull
	return &evstream{src: up, ev: ev}
}

func (ev *Evaluator) indexOn(name string, node *rnode) {
	r := ev.idx[name]
	if r == nil {
		ev.idx[name] = node
	} else {
		r := &r.n
		for *r != nil {
			r = &(*r).n
		}
		*r = node
	}
}

// linked-list allocation for pointer stability
type nodes struct {
	first, last *rnode

	len int
}

func (r *rule) addNode(op instr) *rnode {
	nd := &rnode{instr: op, i: r.xs.len, r: r}
	if r.xs.last != nil {
		r.xs.last.s = nd
	} else {
		r.xs.first = nd
	}
	r.xs.last = nd
	r.xs.len++
	return nd
}
