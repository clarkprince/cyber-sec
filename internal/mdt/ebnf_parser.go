package mdt

import (
	"fmt"
	"io"
	"strconv"
	"strings"
	"text/scanner"
	"unicode/utf8"

	"trout.software/kraken/webapp/internal/multierr"
)

type parser struct {
	errors  multierr.E
	scanner scanner.Scanner
	pos     scanner.Position // token position
	tok     rune             // one token look-ahead
	lit     string           // token literal
}

func (p *parser) next() {
	p.tok = p.scanner.Scan()
	p.pos = p.scanner.Position
	p.lit = p.scanner.TokenText()
}

func (p *parser) error(pos scanner.Position, msg string) {
	p.errors = append(p.errors, fmt.Errorf("at %d,%d: %s", pos.Line, pos.Column, msg))
}

func (p *parser) errorExpected(pos scanner.Position, msg string) {
	msg = `expected "` + msg + `"`
	if pos.Offset == p.pos.Offset {
		// the error happened at the current position;
		// make the error message more specific
		msg += ", found " + scanner.TokenString(p.tok)
		if p.tok < 0 {
			msg += " " + p.lit
		}
	}
	p.error(pos, msg)
}

func (p *parser) expect(tok rune) scanner.Position {
	pos := p.pos
	if p.tok != tok {
		p.errorExpected(pos, scanner.TokenString(tok))
	}
	p.next() // make progress in any case
	return pos
}

func (p *parser) parseIdentifier() ebName {
	name := p.lit
	p.expect(scanner.Ident)
	return ebName(name)
}

func (p *parser) parseToken() ebToken {
	value := ""
	switch p.tok {
	case scanner.String, scanner.RawString, scanner.Char:
		value, _ = strconv.Unquote(p.lit)
		// Unquote may fail with an error, but only if the scanner found
		// an illegal string in the first place. In this case the error
		// has already been reported.
		p.next()
	default:
		p.expect(scanner.String)
	}
	return ebToken(value)
}

// ParseTerm returns nil if no term was found.
func (p *parser) parseTerm() (x Expression) {
	switch p.tok {
	case scanner.Ident:
		if p.lit == "_" {
			x = ebAny{}
		} else {
			x = ebName(p.lit)
		}
		p.next()

	case scanner.String, scanner.RawString, scanner.Char:
		tok := p.parseToken()
		const ellipsis = '…' // U+2026, the horizontal ellipsis character
		if p.tok == ellipsis {
			p.next()
			x = &ebList{p.assertRune(tok), p.assertRune(p.parseToken())}
		} else {
			x = tok
		}

	case '(':
		p.next()
		x = &ebGroup{p.parseExpression()}
		p.expect(')')

	case '[':
		p.next()
		x = &ebOption{p.parseExpression()}
		p.expect(']')

	case '{':
		p.next()
		x = &ebRepetition{p.parseExpression()}
		p.expect('}')
	}

	return x
}

func (p *parser) assertRune(tok ebToken) rune {
	if utf8.RuneCountInString(string(tok)) > 1 {
		p.errorExpected(p.pos, "single rune")
	}

	r, _ := utf8.DecodeRuneInString(string(tok))
	return r
}

func (p *parser) parseSequence() Expression {
	var list ebSequence

	for x := p.parseTerm(); x != nil; x = p.parseTerm() {
		list = append(list, x)
	}

	// no need for a sequence if list.Len() < 2
	switch len(list) {
	case 0:
		p.errorExpected(p.pos, "term")
		return &Bad{p.pos, "term expected"}
	case 1:
		return list[0]
	}

	return list
}

func (p *parser) parseExpression() Expression {
	var list ebAlternative

	for {
		list = append(list, p.parseSequence())
		if p.tok != '|' {
			break
		}
		p.next()
	}
	// len(list) > 0

	// no need for an Alternative node if list.Len() < 2
	if len(list) == 1 {
		return list[0]
	}

	return list
}

func (p *parser) parseProduction() *ebProduction {
	name := p.parseIdentifier()
	var metadata string
	if p.tok == ':' {
		p.next()
		metadata, _ = strconv.Unquote(p.lit)
		p.expect(scanner.String)
	}
	var expr Expression
	p.expect('=')
	if p.tok != '.' {
		expr = p.parseExpression()
	}
	p.expect('.')
	return &ebProduction{Name: name, Expr: expr, Metadata: metadata}
}

// ParseFile reads a grammar defined in the EBNF format:
//
//	Production  = name [":" Metadata] "=" [ Expression ] "." .
//	Metadata    = token .
//	Expression  = Alternative { "|" Alternative } .
//	Alternative = Term { Term } .
//	Term        = name | token [ "…" token ] | Group | Option | Repetition .
//	Group       = "(" Expression ")" .
//	Option      = "[" Expression "]" .
//	Repetition  = "{" Expression "}" .
//
// A name is a Go identifier, a token is a Go string, and comments and white space follow the same rules as for the Go language.
// Production names starting with an uppercase Unicode letter denote non-terminal productions (i.e., productions which allow white-space and comments between tokens); all other production names denote lexical productions.
func ParseFile(filename string, src io.Reader) (Grammar, error) {
	var p parser

	p.scanner.Init(src)
	p.scanner.Filename = filename
	p.next() // initializes pos, tok, lit

	grammar := make(Grammar)
	for p.tok != scanner.EOF {
		pos := p.pos
		prod := p.parseProduction()
		name := string(prod.Name)
		if _, found := grammar[name]; !found {
			grammar[name] = prod
		} else {
			p.error(pos, name+" declared already")
		}
	}

	return grammar, p.errors.ErrNil()
}

func ParseGrammar(grm string) (Grammar, error) {
	return ParseFile("inline", strings.NewReader(grm))
}

func MustParseGrammar(grm string) Grammar {
	gr, err := ParseGrammar(grm)
	if err != nil {
		panic(err)
	}
	return gr
}
