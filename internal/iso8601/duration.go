// Package iso8601 implements parsing and conversion of dates, time, periods, intervals and repetition.
// The package does not aim for completeness, but instead for meaningful use for notebook scheduling.
// Likewise, we handle IANA time zones.
// When possible, types are compatible (or taken from) the standard [time] package.
package iso8601

import (
	"errors"
	"fmt"
	"strconv"
	"time"
	"unicode/utf8"
)

// ParseDate parses a point in time.
// Dates are parsed using a variant of the ISO8601 extended format:
//
//	year, month, day:  2007-03-01T08[Europe/Paris]
//
// Hours, prefixed by a T separators, are optional.
//
// Time locations are accepted in terminal position, and default to their IANA counterparts.
// If no time location is given, it defaults to UTC.
func ParseDate(s string) (time.Time, error) {
	tkz := &tknz{orig: s}
	return tkz.parseDate()
}

func (tkz *tknz) parseDate() (time.Time, error) {
	tkz.expect(tkint)
	year := tkz.int()
	tkz.expect('-')

	tkz.expect(tkint)
	month := time.Month(tkz.int())
	tkz.expect('-')

	tkz.expect(tkint)
	day := tkz.int()

	var hour int
	var loc *time.Location
	next := tkz.next()
	if next == 'T' {
		tkz.expect(tkint)
		hour = tkz.int()
		next = tkz.next()
	}

	switch next {
	case tkeof, '/':
		loc = time.UTC
	case '[':
		tkz.locate(']')
		loc = tkz.loc()
	default:
		tkz.err = errors.New("invalid rune")
	}

	if tkz.err != nil {
		return time.Time{}, tkz
	}

	return time.Date(year, month, day, hour, 0, 0, 0, loc), nil
}

const maxReps = 520 // ten years of weekly run or a year and a half of daily runs

// ParseRepetition parses a repeated interval (the intervening time between two time points).
// The following format specifies three weekly occurences starting on the first of March 2007.
//
//	R31/2007-03-01/P10W
func ParseRepetition(s string) ([]time.Time, error) {
	tkz := &tknz{orig: s}
	tkz.expect('R')

	var reps int
	switch tkz.next() {
	case tkint:
		reps = tkz.int()
		if tkz.err != nil {
			return nil, tkz
		}
		if reps > maxReps {
			return nil, errors.New("too many repetitions")
		}
	case 'I':
		reps = maxReps
	default:
		return nil, errors.New("unrecognized format")
	}

	tkz.expect('/')
	start, err := tkz.parseDate()
	if err != nil {
		return nil, err
	}

	// date parser consumes trailing '/'
	tkz.expect('P')

	// we accept a few invalid formats
	var year, month, day int
	for tkz.next() == tkint {
		val := tkz.int()
		switch tkz.next() {
		case 'Y':
			year = val
		case 'M':
			month = val
		case 'D':
			day = val
		case 'W':
			day = 7 * val
		}
	}
	if tkz.err != nil {
		return nil, tkz
	}

	tss := make([]time.Time, reps)
	for i := range tss {
		tss[i] = start
		start = start.AddDate(year, month, day)
	}

	return tss, nil
}

// tokenizer around numbers
type tknz struct {
	orig string
	pos  int
	end  int

	err error
}

const (
	tkeof rune = -(iota + 1)
	tkint
)

func isnum(r byte) bool { return '0' <= r && r <= '9' }

func (tk *tknz) next() rune {
	if tk.end == len(tk.orig) || tk.err != nil {
		return tkeof
	}
	tk.pos = tk.end

	num := false
	for tk.end < len(tk.orig) && isnum(tk.orig[tk.end]) {
		num = true
		tk.end++
	}
	if num {
		return tkint
	}

	tk.end++ // did not advance in non-num
	return rune(tk.orig[tk.pos])
}

func (tk *tknz) expect(r rune) {
	n := tk.next()
	if n != r {
		tk.err = fmt.Errorf("expected %d, got %d", r, n)
	}
}

func (tk *tknz) text() string {
	return tk.orig[tk.pos:tk.end]
}

// strip first and last char
func (tk *tknz) tstrip() string {
	txt := tk.text()
	if len(txt) > 0 {
		return txt[1 : len(txt)-1]
	}
	return txt
}

func (tk *tknz) int() int {
	i, err := strconv.ParseInt(tk.text(), 10, 64)
	if err != nil {
		tk.err = err
	}
	return int(i)
}

func (tk *tknz) loc() *time.Location {
	if tk.err != nil {
		return nil
	}
	loc, err := time.LoadLocation(tk.tstrip())
	if err != nil {
		tk.err = err
		return nil
	}

	return loc
}

func (tk *tknz) locate(r rune) {
	for tk.end = tk.pos; tk.end < len(tk.orig); {
		q, sz := utf8.DecodeRuneInString(tk.orig[tk.end:])
		tk.end += sz

		switch q {
		case r:
			return
		case utf8.RuneError:
			tk.err = errors.New("invalid rune in stream")
			return
		}
	}

	tk.err = fmt.Errorf("cannot find rune %q", r)
}

func (tk *tknz) Error() string {
	if tk.err == nil {
		return ""
	}

	return fmt.Sprintf("parsing %s: at %d ([%s]): %s", tk.orig, tk.pos, tk.orig[tk.pos:tk.end+1], tk.err)
}

// GetDescription returns the lexical description of a duration.
// For example for an input parameter like "R322/2007-03-01/P1333D" the description is the following:
// "Repeat 322 time(s) every 1333 day (s) starting 2007-03-01T00:00:00Z"
// The description is set to the empty string if the error is not null.
func GetDescription(s string) (string, error) {
	tkz := &tknz{orig: s}
	tkz.expect('R')

	var reps int
	next := tkz.next()
	if next == tkint {
		reps = tkz.int()
	}
	if next == 'I' {
		reps = maxReps
	}

	tkz.expect('/')
	start, err := tkz.parseDate()
	if err != nil {
		return "", err
	}

	// date parser consumes trailing '/'
	tkz.expect('P')

	// we accept a few invalid formats
	var period string
	var numOfPeriods int
	for tkz.next() == tkint {
		numOfPeriods = tkz.int()
		switch tkz.next() {
		case 'Y':
			period = "year"
		case 'M':
			period = "month"
		case 'D':
			period = "day"
		case 'W':
			period = "week"
		}
	}
	if tkz.err != nil {
		return "", tkz
	}

	if numOfPeriods > 1 {
		return fmt.Sprintf("Repeat %v time(s) every %v %vs at %vh", reps, numOfPeriods, period, start.Format("15")), nil
	} else {
		return fmt.Sprintf("Repeat %v time(s) every %v at %vh", reps, period, start.Format("15")), nil
	}
}
