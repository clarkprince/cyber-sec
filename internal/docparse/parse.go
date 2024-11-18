// Package docparse implements a simple, reusable parser for simple grammars.
package docparse

import (
	"fmt"
	"strings"
	"text/scanner"

	"trout.software/kraken/webapp/internal/multierr"
)

type parseError struct {
	pos scanner.Position
	msg string
}

// Error implements error.
func (e parseError) Error() string { return fmt.Sprintf("at %s: %s", e.pos, e.msg) }

type Parser[T any] struct {
	sc *scanner.Scanner

	peek bool
	tok  rune   // token lookahead
	Lit  string // token literal

	Value  *T
	errors multierr.E

	config // embedded struct to allow non-generic parser options
}

type config struct {
	fname     string
	syncLit   []string
	identRune func(ch rune, i int) bool
}

type ParserOptions func(*config)

// Filename sets the file name that will be displayed in parser errors
func Filename(s string) ParserOptions            { return func(c *config) { c.fname = s } }
func SynchronizeAt(lits ...string) ParserOptions { return func(c *config) { c.syncLit = lits } }
func IsIdentRune(rec func(ch rune, i int) bool) ParserOptions {
	return func(c *config) { c.identRune = rec }
}

func (p *Parser[T]) Finish() (*T, error) { return p.Value, p.errors.ErrNil() }

// ErrLit is the literal value set after a failed call to [Parser.Expect]
const ErrLit = "<error>"

func Init[T any](doc string, opts ...ParserOptions) *Parser[T] {
	p := &Parser[T]{sc: new(scanner.Scanner)}
	for _, o := range opts {
		o(&p.config)
	}

	p.sc.Init(strings.NewReader(doc))
	p.sc.Filename = p.fname
	p.sc.Error = newParseError
	p.sc.IsIdentRune = p.identRune

	p.Value = new(T)

	return p
}

func newParseError(sc *scanner.Scanner, msg string) {
	pos := sc.Position
	if !sc.Position.IsValid() {
		pos = sc.Pos()
	}
	panic(parseError{pos, msg})
}

// Errf triggers a panic mode with the given formatted error
func (p *Parser[T]) Errf(format string, args ...any) {
	newParseError(p.sc, fmt.Sprintf(format, args...))
}

func (p *Parser[T]) More() bool { p.next(); p.peek = true; return p.tok != scanner.EOF }

func (p *Parser[T]) next() {
	if p.peek {
		p.peek = false
		return
	}

	if p.Lit == ErrLit {
		return
	}

	p.tok = p.sc.Scan()
	p.Lit = p.sc.TokenText()
}

func (p *Parser[T]) Expect(tk rune, msg string) {
	p.next()
	if p.tok == tk {
		return
	}
	p.Errf("expected: " + msg)
}

func (p *Parser[T]) Match(tk ...rune) bool {
	p.next()
	p.peek = true
	for _, tk := range tk {
		if p.tok == tk {
			p.next()
			return true
		}
	}
	return false
}

// Synchronize parsing: throw everything away until a top-level policy statement
// Run this in a top-level `defer` statement in at the level of the synchronisation elements
func (p *Parser[T]) Synchronize() {
	err := recover()
	if err == nil {
		return
	}
	pe, ok := err.(parseError)
	if !ok {
		panic(pe)
	}

	p.errors = append(p.errors, pe)
	p.Lit = "" // reset state

	for p.More() {
		p.next()
		for _, slit := range p.syncLit {
			if p.Lit == slit {
				return
			}
		}
	}
}
