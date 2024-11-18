package mdt

import (
	"bytes"
	"fmt"
	"os"
	"strconv"
	"strings"
	"text/scanner"
	"unicode"
	"unicode/utf8"
)

// ParseLORTH reads the LORTH specification of a LioLi, and builds the final representation.
//
// LORTH is a simple, stack-based description language designed specifically to represent faithfully LioLi,
// while being readable to a human being.
//
// Here is a simple description of a LioLi with nested records (`//` are comments):
//
//	datetime "now" .             // a simple key and value
//	"--[" .                      // a separator field
//	url {                        // nested records. the value is the concatenation of all sub values.
//	  path "GET"
//	  url "/test/mine"
//	};                           // semi column terminates the record
//
//	datetime "yersterday".;
//
// Note that LORTH is only designed as an internal tool, not as an exposed format – hence error reporting is only through stderr
func ParseLORTH(s string) LioLi {
	var sc scanner.Scanner
	sc.Init(strings.NewReader(s))
	sc.IsIdentRune = func(ch rune, i int) bool {
		return i == 0 && ch < utf8.RuneSelf && prefixes[ch] || unicode.IsLetter(ch) || unicode.IsDigit(ch) && i > 0
	}
	sc.Mode = scanner.ScanIdents | scanner.ScanStrings | scanner.ScanComments | scanner.SkipComments
	sc.Error = func(s *scanner.Scanner, msg string) {
		pos := s.Position
		if !pos.IsValid() {
			pos = s.Pos()
		}
		fmt.Fprintf(os.Stderr, "%s: %s\n", pos, msg)
	}

	var buf RecordBuilder
	var ll LioLi
	var stack lorthstack

	for {
		switch tk := sc.Scan(); tk {
		case scanner.EOF:
			return ll
		case ';':
			if stack.d != 0 {
				sc.Error(&sc, "unterminated record: did you forget '.' ?")
				stack.d = 0
			}
			ll = append(ll, buf.Build())
			buf.Reset()

		case scanner.Ident:
			stack.push(sc.TokenText())
		case scanner.String:
			// error checking done by scanner
			val, _ := strconv.Unquote(sc.TokenText())
			stack.push(val)

		case '.':
			switch stack.d {
			default:
				sc.Error(&sc, "nothing to add to the LioLi. use <\"val\" .> or <key \"val\".>")
			case 1:
				buf.AppendSeparator(stack.v[0])
			case 2:
				buf.Append(stack.v[0], stack.v[1])
			}
			stack.d = 0
		case '{':
			switch stack.d {
			case 1:
				buf.Push(stack.v[0])
			case 2:
				sc.Error(&sc, "nested records only accepts keys (no value). use <key {>")
				buf.Push("<!error!>")
			case 0:
				sc.Error(&sc, "nothing to add to the LioLi. use <key {>")
				buf.Push("<!error!>") // so that pop works
			}
			stack.d = 0

		case '}':
			if stack.d != 0 {
				sc.Error(&sc, "unterminated record: did you forget '.' ?")
				stack.d = 0 // parse cleanly afterwards
			}
			buf.Pop()
		}
	}
}

type lorthstack struct {
	v [2]string
	d int
}

func (s *lorthstack) push(v string) { s.v[s.d] = v; s.d++ }

// TODO(rdo) root key and ampersand
var prefixes = [utf8.RuneSelf]bool{'$': true, LODPrefix: true, '&': true}

// ; on the same line
func (ll LioLi) DumpLORTH() string {
	var buf bytes.Buffer

	for wlk := ll.Match(AllRecords).IterAll(); wlk.Next(); {
		if wlk.Record().Empty() {
			continue
		}

		for wlk := wlk.WalkRecord(); wlk.Next(); {
			dumpLORTH(&buf, wlk, "")
		}
		buf.Truncate(buf.Len() - 1) // unwrite last line return
		buf.WriteString(";\n")
	}

	return buf.String()
}

func dumpLORTH(buf *bytes.Buffer, wlk *RecordWalker, indent string) {
	buf.WriteString(indent)

	switch {
	case wlk.IsSeparator():
		buf.WriteString(strconv.Quote(wlk.Value()))
		buf.WriteString(" .\n")

	case wlk.ChildCount() == 0:
		buf.WriteString(nopfix(wlk.Name()))
		buf.WriteString(" ")
		buf.WriteString(strconv.Quote(wlk.Value()))
		buf.WriteString(" .\n")

	default:
		buf.WriteString(nopfix(wlk.Name()))
		buf.WriteString(" {\n")
		wlk.Down()
		dumpLORTH(buf, wlk, indent+" ")
		for wlk.Next() {
			dumpLORTH(buf, wlk, indent+" ")
		}
		wlk.Up()
		buf.WriteString(indent + "}\n")
	}
}

func nopfix(s string) string {
	if strings.HasPrefix(s, "$.") {
		return s[2:]
	}
	return s
}
