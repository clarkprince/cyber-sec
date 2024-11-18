package piql

import (
	"errors"
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"
	"text/scanner"
	"time"
	"unicode"
)

type bailout struct{}

// ParseSingle parses a single PiQL expression out of a sequence.
// It returns the expression, a pretty-printed version of it, and possibly an error.
// If an error is returned, it can be of type FrontEndError: in this case it is recommended to send the error unmodified to the front-end.
//
// See package documentation for full PiQL syntax.
func ParseSingle(s string) (pvt Pivot, pretty string, err error) {
	var xp xparser
	xp.Init(strings.NewReader(s))
	xp.IsIdentRune = func(ch rune, i int) bool {
		if ch == '_' || unicode.IsLetter(ch) {
			return true
		}

		if i > 0 && unicode.IsDigit(ch) {
			return true
		}

		switch i {
		default:
			return false
		case 0:
			return ch == '|' || ch == '!' || ch == '$'
		case 1:
			return ch == '=' || ch == '~' || ch == '<' || ch == '>' || ch == '.'
		case 2:
			return ch == '<'
		}
	}

	xp.Error = func(s *scanner.Scanner, msg string) {
		xp.err = FrontEndError{s.Line, s.Column, msg}
		panic(bailout{})
	}

	defer func() {
		if r := recover(); r != nil {
			_, ok := r.(bailout)
			if ok {
				err = xp.err
			} else {
				panic(r)
			}
		}
	}()

	var path string

	for {
		switch r := xp.Scan(); r {
		default:
			return Pivot{}, "", FrontEndError{0, 0, "Invalid PiQL expression"}
		case '[':
			path = xp.Expect(scanner.Ident, "application path")
			xp.Expect(']', "closing bracket")
		case scanner.EOF:
			if xp.xp == nil {
				return Pivot{Exp: AcceptAll{}}, "", nil
			}
			return Pivot{Exp: xp.xp, On: path}, xp.buf.String(), xp.err
		case scanner.Ident:
			xp.parsePivotOp(xp.TokenText())
		}
	}
}

// ParseEqualArguments returns the arguments for an Equal expression.
func ParseEqualArguments(s string) ([]string, error) {
	pvt, _, err := ParseSingle(s)
	if err != nil {
		return []string{}, nil
	}
	if v, ok := pvt.Exp.(Equal); ok {
		return v, nil
	}
	return []string{}, nil
}

// TODO(rdo) move this to using internal/docparse
type xparser struct {
	scanner.Scanner
	lasttok  rune // one token look-ahead
	lastread string

	xp  expr
	buf strings.Builder
	err error
}

// FrontEndError contains instructions about where the parsing failed.
type FrontEndError struct {
	Line, Col int
	Message   string
}

func (err FrontEndError) Error() string {
	return fmt.Sprintf("at %d,%d: %s", err.Line, err.Col, err.Message)
}

func (p *xparser) Init(r io.Reader) *scanner.Scanner {
	p.lasttok = scanner.EOF
	return p.Scanner.Init(r)
}

func (p *xparser) Scan() rune {
	if p.lasttok != scanner.EOF {
		last := p.lasttok
		p.lasttok = scanner.EOF
		return last
	}

	return p.Scanner.Scan()
}

func (p *xparser) TokenText() string {
	if p.lasttok != scanner.EOF {
		return p.lastread
	}

	return p.Scanner.TokenText()
}

func (p *xparser) Fprintf(format string, a ...any) {
	fmt.Fprintf(&p.buf, format, a...)
}

func (p *xparser) Peek() rune {
	if p.lasttok != scanner.EOF {
		return p.lasttok
	}
	s := p.Scanner.Scan()
	p.lasttok = s
	p.lastread = p.Scanner.TokenText()
	return s
}

func (p *xparser) Expect(w rune, what string) string {
	g := p.Scan()
	if g != w {
		p.Error(&p.Scanner, fmt.Sprintf("want %q got %q (%d, %d)", what, p.TokenText(), w, g))
	}
	return p.TokenText()
}

func (p *xparser) errorExpected(msg string) {
	p.Error(&p.Scanner, `expected "`+msg+", found "+p.TokenText())
}

func (p *xparser) parsePivotOp(tk string) {
	fmt.Fprintf(&p.buf, "%s ", tk)

	switch tk {
	default:
		p.Error(&p.Scanner, fmt.Sprintf("unknown keyword %s", tk))
	case "|=":
		p.xp = p.parseCSValues()
	case "!=":
		p.xp = Not{p.parseCSValues()}
	case "|~":
		p.xp = p.parseRegexp()
	case "!~":
		p.xp = Not{p.parseRegexp()}
	case "|>", "after":
		p.xp = TimeSpan{start: p.parseTimespec()}
	case "|<", "before":
		p.xp = TimeSpan{end: p.parseTimespec()}
	case "|><", "between":
		start := p.parseTimespec()

		p.Scan() // "and", ","
		p.Fprintf(" %s ", p.TokenText())
		end := p.parseTimespec()

		p.xp = TimeSpan{start: start, end: end}

	case "over":
		nval := p.Expect(scanner.Int, "duration, e.g. 5m")
		dspec := p.Expect(scanner.Ident, "duration, e.g. 5m")
		d, err := time.ParseDuration(nval + dspec)
		if err != nil {
			p.Error(&p.Scanner, fmt.Sprintf("invalid duration %s: %s", dspec, err))
		}
		p.Fprintf("%s", d)
		over := Over{over: d, hop: 10 * time.Second}

		if p.Peek() == scanner.String && p.TokenText() == "hop" {
			p.Scan()
			nval := p.Expect(scanner.Int, "duration, e.g. 5m")
			dspec := p.Expect(scanner.Ident, "duration, e.g. 5m")
			d, err := time.ParseDuration(nval + dspec)
			if err != nil {
				p.Error(&p.Scanner, fmt.Sprintf("invalid duration %s: %s", dspec, err))
			}
			over.hop = d
			p.Fprintf(" hop %s", d)
		}

		p.xp = over

	case "by":
		p.xp = By{}

	case "limit":
		ms := p.Expect(scanner.Int, "number")
		mi, _ := strconv.Atoi(ms)
		p.Fprintf("%d", mi)
		p.xp = &Limit{Max: mi}
	}
}

func (p *xparser) parseCSValues() Equal {
	s := p.Expect(scanner.String, "value")
	fmt.Fprintf(&p.buf, "%s", s)
	val, _ := strconv.Unquote(s)
	xp := Equal{val}
	for p.Peek() == ',' {
		fmt.Fprintf(&p.buf, ", ")
		p.Scan()
		s := p.Expect(scanner.String, "value")
		fmt.Fprintf(&p.buf, "%s", s)
		val, _ = strconv.Unquote(s)
		xp = append(xp, val)
	}
	return xp
}

func (p *xparser) parseRegexp() *Match {
	s, _ := strconv.Unquote(p.Expect(scanner.String, "regexp"))
	re, err := regexp.Compile(s)
	if err != nil {
		p.Error(&p.Scanner, err.Error())
	}
	p.Fprintf("%s", strconv.Quote(re.String()))

	return (*Match)(re)
}

func (p *xparser) parseTimespec() time.Time {
	switch p.Scan() {
	case scanner.Ident, scanner.Int:
		return p.parseDay()
	case scanner.String:
		s, _ := strconv.Unquote(p.TokenText())
		t, _, _ := parseTime(s)
		if t.IsZero() {
			p.Error(&p.Scanner, "invalid time specification: try RFC3339")
		}
		p.Fprintf("\"%s\"", t.Format(time.RFC3339))
		return t
	default:
		return time.Time{}
	}
}

// layout prioritize the format we also return
var Layouts = []string{
	time.RFC3339,
	time.RFC3339Nano,
	time.UnixDate,
}

func parseTime(t string) (time.Time, string, error) {
	var parsedTime time.Time
	for _, l := range Layouts {
		if t, err := time.Parse(l, t); err == nil {
			return t, l, nil
		}
	}
	return parsedTime, "", errors.New("could not use a preset layout")
}

// timeNow is timeNow() but pulled out as a variable for tests.
var timeNow = time.Now

func (p *xparser) parseDay() time.Time {
	var day time.Time
	switch p.TokenText() {
	case "today":
		p.Fprintf("%s", p.TokenText())
		day = timeNow()
	case "yesterday":
		p.Fprintf("%s", p.TokenText())
		day = timeNow().AddDate(0, 0, -1)
	case "last":
		p.Fprintf("%s ", p.TokenText())
		day = p.parseLastWeekDay()
	default:
		p.Fprintf("%s ", p.TokenText())
		// number period "ago"
		number, err := strconv.Atoi(p.TokenText())
		if err != nil {
			p.errorExpected(`number`)
		}
		if !(number >= 0 && number <= 100) {
			p.errorExpected(`0 … 100`)
		}
		period := p.Expect(scanner.Ident, "day, week or hour")
		p.Fprintf("%s ", period)
		switch period {
		case "day", "days":
			day = timeNow().AddDate(0, 0, -(number))
		case "week", "weeks":
			day = timeNow().AddDate(0, 0, -(number * 7))
		case "hour", "hours":
			day = timeNow().Add(time.Duration(-number) * time.Hour)
			//we don't expect something like "1 hour ago at 12H"
			// so we don't keep scanning for the hour information
			val := p.Expect(scanner.Ident, "ago")
			p.Fprintf("%s", val)
			return day
		default:
			p.errorExpected(`"day" | "week" | "hour"`)
		}
		val := p.Expect(scanner.Ident, "ago")
		p.Fprintf("%s", val)
	}
	p.Peek()
	if p.lastread == "at" {
		p.Fprintf(" at ")
		p.Expect(scanner.Ident, "at")
		h, m := p.parseDuration()
		day = time.Date(day.Year(), day.Month(), day.Day(), h, m, 0, 0, day.Location())
	} else {
		day = time.Date(day.Year(), day.Month(), day.Day(), 9, 0, 0, 0, day.Location())
		return day
	}
	return day
}

// american-style week, matches [time.Weekday]
var daysoftheweek = [...]string{
	"sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
}

// ParseLastWeekDay returns the time.Time value for the last weekday as the current scanned identifier.
func (p *xparser) parseLastWeekDay() time.Time {
	weekday := strings.ToLower(p.Expect(scanner.Ident, "monday … sunday"))
	p.Fprintf("%s", weekday)

	t := timeNow()
	for wd, loop := t.Weekday(), 0; daysoftheweek[wd] != weekday; wd, loop = t.Weekday(), loop+1 {
		if loop == 7 {
			p.Error(&p.Scanner, "expect day monday … sunday")
		}

		t = t.AddDate(0, 0, -1)
	}

	return t
}

func (p *xparser) parseDuration() (int, int) {
	h, err := strconv.Atoi(p.Expect(scanner.Int, "0 … 9"))
	if err != nil {
		p.errorExpected(`number`)
	}
	p.Fprintf("%d", h)
	p.Scan()
	if p.TokenText() == ":" {
		p.Fprintf(":")
		m, err := strconv.Atoi(p.Expect(scanner.Int, "0 … 9"))
		if err != nil {
			p.errorExpected(`number "H" | number ":" number`)
		}
		p.Fprintf("%d", m)
		return h, m
	} else {
		p.Fprintf("%s", p.TokenText())
	}
	return h, 0
}
