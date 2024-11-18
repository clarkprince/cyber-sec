package piql

import (
	"regexp"
	"strings"
	"time"
)

// AcceptAll returns all values
// It is useful as the default value when no PiQL expression is provided
type AcceptAll struct{}

func (x AcceptAll) SortKey() int        { return filterSortKey }
func (AcceptAll) String() string        { return "*" }
func (AcceptAll) Step(_, _ string) bool { return IsMatch }

type Equal []string

func (e Equal) String() string { return strings.Join(e, ",") }

func (e Equal) Step(v, _ string) bool {
	for _, e := range e {
		if v == e {
			return IsMatch
		}
	}
	return IgnoreRecord
}

func (Equal) SortKey() int { return filterSortKey }

type Match regexp.Regexp

func (m *Match) String() string { return "~ " + (*regexp.Regexp)(m).String() }

func (m *Match) Step(v, _ string) bool {
	// invalid match is a parser error, not a runtime one
	if m == nil {
		return IsMatch
	}

	return (*regexp.Regexp)(m).MatchString(v)
}

func (*Match) SortKey() int { return filterSortKey }

type TimeSpan struct {
	start, end time.Time
}

func (s TimeSpan) String() string { return s.start.String() + "/" + s.end.String() }

func (s TimeSpan) Step(v, metadata string) bool {
	var ts time.Time
	var err error
	if metadata != "" {
		ts, err = time.Parse(metadata, v)
		if err != nil {
			return IgnoreRecord
		}
	} else {
		ts, _, err = parseTime(v)
		if err != nil {
			return IgnoreRecord
		}
	}

	match := false
	switch {
	case !s.end.IsZero() && !s.start.IsZero():
		match = ts.After(s.start) && ts.Before(s.end)
	case !s.end.IsZero():
		match = ts.Before(s.end)
	case !s.start.IsZero():
		match = ts.After(s.start)
	default:
		panic("we are trying to apply a pivot on time with no end or start values")
	}
	return match
}

func (TimeSpan) SortKey() int { return filterSortKey }

type Not struct{ p instr }

func (x Not) Step(v, metadata string) bool { return !x.p.Step(v, metadata) }

func (Not) SortKey() int { return filterSortKey }
