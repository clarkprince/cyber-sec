package mdt

import (
	"fmt"
	"unicode"
)

// CompilePattern transforms a literal format using separators to delimit matches into a grammar.
// A (simple) pattern could look like:
//
//	<timestamp>: <value>
//
// The grammar is starting at the well-known "root" production.
// If an error is returned, it is of type PatternError.
func CompilePattern(pattern string) (Grammar, error) {
	var lexitem struct {
		tk, chev, cln int
	}
	lexitem.chev = -1
	lexitem.cln = -1
	var lastname string
	var seq ebSequence
	grm := make(Grammar)

	for idx, r := range pattern {
		switch r {
		case '<':
			lexitem.chev = idx
		case ':':
			if lexitem.chev == -1 || lexitem.cln != -1 {
				continue
			}
			lexitem.cln = idx
		case '>':
			if lexitem.chev == -1 {
				continue
			}
			if lexitem.chev > 0 && lexitem.chev == lexitem.tk {
				return nil, PatternError{lexitem.tk, "empty separator"}
			}
			name := pattern[lexitem.chev+1 : idx]
			if lexitem.cln != -1 {
				name = pattern[lexitem.chev+1 : lexitem.cln]
			}
			if !patternIdentifier(name) {
				return nil, PatternError{lexitem.chev, "invalid name"}

			}

			// repeated values are handled as nested records
			if xp, exists := grm[name]; exists {
				if name != lastname {
					return nil, PatternError{lexitem.chev, "repeated names can only be in sequence"}
				}

				var seq ebSequence
				switch xp := xp.Expr.(type) {
				case ebAny:
					seq = ebSequence{xp}
				case ebSequence:
					seq = xp
				}

				if lexitem.tk < lexitem.chev {
					seq = append(seq, ebToken(pattern[lexitem.tk:lexitem.chev]), ebAny{})
				}
				grm[name].Expr = seq

			} else {
				if lexitem.tk < lexitem.chev {
					seq = append(seq, ebToken(pattern[lexitem.tk:lexitem.chev]))
				}

				switch name {
				case "_":
					seq = append(seq, ebAny{})
				default:
					seq = append(seq, ebName(name))
					grm[name] = &ebProduction{Name: ebName(name), Expr: ebAny{}}
					if lexitem.cln != -1 {
						grm[name].Metadata = pattern[lexitem.cln+1 : idx]
					}
					lastname = name
				}
			}

			lexitem.tk = idx + 1
			lexitem.chev = -1
			lexitem.cln = -1
			// if lexitem > 0, check if valid identifier => create it
		}
	}

	if lexitem.tk < len(pattern) {
		seq = append(seq, ebToken(pattern[lexitem.tk:]))
	}

	grm["root"] = &ebProduction{Name: ebName("root"), Expr: seq}
	return grm, nil
}

func patternIdentifier(s string) bool {
	for i, r := range s {
		if unicode.IsLower(r) || (i > 0 && unicode.IsNumber(r)) || r == '_' {
			continue
		}
		return false
	}
	return true
}

type PatternError struct {
	Offset  int
	Message string
}

func (err PatternError) Error() string { return fmt.Sprintf("at %d: %s", err.Offset, err.Message) }
