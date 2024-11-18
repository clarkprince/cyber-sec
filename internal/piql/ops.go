package piql

import (
	"strings"
)

// opCapture persists val at specific destination
type opCapture struct{ val, mdt *string }

func (opCapture) String() string { return "store" }

func (s opCapture) Step(val, metadata string) bool {
	*s.val = val
	if s.mdt != nil {
		*s.mdt = metadata
	}
	return IgnoreRecord // actually does not matter, not a clause
}

func (s opCapture) Exit(val, metadata string) { s.Step(val, metadata) }

// opCont represents a continuation of the instructions given a value
type opCont struct {
	val, mdt *string
	instr    instr
}

func (opCont) String() string { return "load" }

func (l opCont) Step(_, _ string) bool { return l.instr.Step(*l.val, *l.mdt) }
func (l opCont) Exit(_, _ string)      { l.instr.Step(*l.val, *l.mdt) }

// opGroup accumulate levels of the partition during the walk,
// then execute all window functions against name
type opGroup struct {
	locals []string // scratch space to store elements of the partition (avoid allocating in non-window rules)
	name   *string  // destination of the partition name (prevent re-compute during window output)

	groups map[string][]winstr // A "group" is a set of rows that all have equivalent values for all terms of the window
	ictor  []func() winstr     // populate the groups on demand
}

// TODO check if the enter/exit could work with a counter to delete unused groups

func groupop(name *string) *opGroup {
	return &opGroup{locals: make([]string, 0, 64), groups: make(map[string][]winstr), name: name}
}

func (p *opGroup) newlevel() *string {
	p.locals = p.locals[:len(p.locals)+1] // safe by init
	return &p.locals[len(p.locals)-1]
}

func (opGroup) String() string { return "partition" }

// step / exit are never called with value – signature has this form to match the interface
func (agg *opGroup) Step(_, _ string) bool {
	const subsep = "\x1C" // FS in ascii – thanks AWK :)
	key := strings.Join(agg.locals, subsep)

	*agg.name = key
	ins := agg.groups[key]
	if ins == nil {
		ins = make([]winstr, len(agg.ictor))
		for i, c := range agg.ictor {
			ins[i] = c()
		}
		agg.groups[key] = ins
	}

	ok := true
	for _, i := range ins {
		ok = ok && i.Step(key, "")
	}
	return ok
}

func (agg *opGroup) Exit(_, _ string) {
	const subsep = "\x1C" // FS in ascii – thanks AWK :)
	key := strings.Join(agg.locals, subsep)

	*agg.name = key

	for _, wi := range agg.groups[key] {
		wi.Exit(key, "")
	}
}
