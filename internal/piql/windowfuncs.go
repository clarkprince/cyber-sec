package piql

import (
	"fmt"
	"time"
)

const (
	oversortkey = windowSortKey + iota
	bysortkey
	ftsortkey
	limitsortkey
)

type Over struct {
	over time.Duration
	hop  time.Duration
}

func (Over) SortKey() int     { return oversortkey }
func (o Over) String() string { return fmt.Sprint("over ", o.over, " hop ", o.hop) }

type By struct{}

func (By) SortKey() int   { return bysortkey }
func (By) String() string { return "by" }

type Limit struct {
	Max   int
	count int
}

func (l *Limit) Step(_, _ string) bool {
	l.count++
	return l.count >= l.Max
}
func (l *Limit) Exit(_, _ string) { l.count-- }

func (l *Limit) Invert() winstr { return l }
func (Limit) SortKey() int      { return limitsortkey }

func (l Limit) String() string { return fmt.Sprint("limit ", l.Max) }

type FirstThen struct {
	First, Then string // regexp matches maybe?

	countfirst int
}

// TODO(rdo) FirstThen probably not valid like this: impeller does not pass val, metadata
func (ft *FirstThen) Step(val, metadata string) bool {
	if ft.countfirst > 0 && val == ft.Then {
		return IsMatch
	}
	if val == ft.First {
		ft.countfirst++
	}
	return IgnoreRecord
}

func (ft *FirstThen) Exit(val, metadata string) {
	if val == ft.First {
		ft.countfirst--
	}
}

func (ft *FirstThen) Invert() winstr { return &FirstThen{First: ft.Then, Then: ft.First} }
func (FirstThen) SortKey() int       { return ftsortkey }
