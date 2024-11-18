package shards

import (
	"errors"
	"fmt"
	"strings"
	"unicode"
	"unicode/utf8"
)

// [TO DO] Clean code and tests

// this set of constants define the identifiable elements (slash and different segments) that conform a string pattern:
// "apache/<domain>/<month>/*""
// type of segments:
// any segment element between < and > defines a segmentname
// any other segment element defines a regular element
const (
	segmentname = iota
	regular
)

type token struct {
	value string
	kind  int
}

// compile returns the compiled shard pattern.
// Every shardname in the path is replaced by its shard value.
// For example:
//
//	"apache/<domain>/<month>/*"  shardName="domain" and shardValue="prod"
//
// results in:
//
//	"apache/prod/*"
func ReplaceShard(shardName string, shardValues []string, pattern Pattern) ([]Pattern, error) {
	tokens, perr := Parse(string(pattern))
	if err := perr.GetError(); err != nil {
		return []Pattern{}, err
	}
	var paths []Pattern
	for _, sv := range shardValues {
		var s strings.Builder
		for _, tk := range tokens {
			switch tk.kind {
			case segmentname:
				if shardName == tk.value && sv != "" {
					s.WriteString(sv)
					continue
				}
				s.WriteRune('<')
				s.WriteString(tk.value)
				s.WriteRune('>')
			default:
				s.WriteString(tk.value)
			}
		}
		paths = append(paths, Pattern(s.String()))
	}

	return paths, nil
}

// CompileWithWildcards
//
//		"apache/<domain>/<month>/*"
//	 results in "apache/*/*/*"
func CompileWithWildcards(pattern string) (string, error) {
	tokens, perr := Parse(pattern)
	if err := perr.GetError(); err != nil {
		return "", err
	}

	var s strings.Builder
	for _, tk := range tokens {
		switch tk.kind {
		case segmentname:
			s.WriteString("*")
		default:
			s.WriteString(tk.value)
		}
	}
	return s.String(), nil
}

// tokenizeGlobPattern transforms a literal format using separators to delimit matches into a set of tokens
// A (simple) pattern could look like:
//
//	"apache/<domain>/<month>/*"
//
// Every segment of the pattern can match a glob pattern, so glob special characters are allowed.
// If the segments of the pattern are sorrounded by the special glob characters an error will be raised.
// Any name between delimeters < and > represent a shardname. Shardnames are kept by removing their sorrounding delimiters.
// If an error is returned, it is of type PatternError.
func Parse(pattern string) ([]token, patternError) {
	if !strings.ContainsRune(pattern, '<') && !strings.ContainsRune(pattern, '>') {
		if !validPatternSyntax(pattern) {
			return []token{}, patternError{9, "invalid name"}
		}
		return []token{{value: pattern, kind: regular}}, patternError{}
	}

	var tokens []token
	var lexitem struct {
		hi, lo, st int
	}
	lexitem.lo = -1
	for idx, r := range pattern {
		switch r {
		case '<':
			if lexitem.lo != -1 {
				return []token{}, patternError{idx, "found duplicated <"}
			}
			if idx > 0 {
				if globSymbols[pattern[idx-1]] {
					return []token{}, patternError{idx, "invalid glob symbol before <"}
				}
			}

			lexitem.lo = idx
			lexitem.hi = 0
			if lexitem.lo == 0 {
				//It means that there is no chunk before of '<' so nothing will be stored.
				continue
			}
			regName := pattern[lexitem.st:idx]
			if !validPatternSyntax(regName) {
				return []token{}, patternError{idx, "invalid name"}
			}
			tokens = append(tokens, token{value: regName, kind: regular})
		case '>':
			if lexitem.lo == -1 {
				return []token{}, patternError{idx, "didn't find a < before >"}
			}
			if lexitem.hi != 0 {
				return []token{}, patternError{idx, "found duplicated >"}
			}
			if lexitem.lo+1 == idx {
				return []token{}, patternError{idx, "empty segment <>"}
			}
			segmentName := pattern[lexitem.lo+1 : idx]
			if !validShardName(segmentName) {
				return []token{}, patternError{idx, "invalid segment name"}
			}
			lexitem.hi = idx
			lexitem.st = lexitem.hi + 1
			lexitem.lo = -1
			tokens = append(tokens, token{value: segmentName, kind: segmentname})

			if idx+1 < len(pattern) {
				if globSymbols[pattern[idx+1]] {
					return []token{}, patternError{idx, "invalid glob symbol after >"}
				}
			}
		}
	}
	if lexitem.hi == 0 && lexitem.lo > 0 {
		return []token{}, patternError{lexitem.lo, "didn't found the closing element >"}
	}

	if len(pattern) >= lexitem.st {
		regName := pattern[lexitem.st:]
		if !validPatternSyntax(regName) {
			return []token{}, patternError{lexitem.st, "invalid name"}
		}
		tokens = append(tokens, token{value: regName, kind: regular})
	}

	return tokens, patternError{}
}

var globAndUnixsymbols = [utf8.RuneSelf]bool{
	'/': true,
	'.': true,
	':': true,
	'!': true,
	'-': true,
	'_': true,
	'*': true,
	'?': true,
	'[': true,
	']': true,
	' ': true,
}

var globSymbols = [utf8.RuneSelf]bool{
	'*':  true,
	'?':  true,
	'[':  true,
	']':  true,
	'\\': true,
}

// validShardName checks that a string is a valid shard name.
// shard names are part of the pattern and are expressed as enclosed by that symbols <>
func validShardName(s string) bool {
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsNumber(r) {
			continue
		}
		return false
	}
	return true
}

// validPatternSyntax accepts globs elements but also accepts a single file match.
func validPatternSyntax(s string) bool {
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsNumber(r) || (r < utf8.RuneSelf && globAndUnixsymbols[r]) {
			continue
		}
		return false
	}
	return true
}

type patternError struct {
	Offset  int
	Message string
}

func (err patternError) Error() string { return fmt.Sprintf("at %d: %s", err.Offset, err.Message) }
func (err patternError) GetError() error {
	if err.Message != "" || err.Offset != 0 {
		return err
	}
	return nil
}

// ErrBadPattern indicates a pattern was malformed.
var ErrBadPattern = errors.New("syntax error in pattern")

// Match reports whether name matches the shell pattern.
// The pattern syntax is:
//
//	pattern:
//		{ term }
//	term:
//		'*'         matches any sequence of non-/ characters
//		'?'         matches any single non-/ character
//		'[' [ '^' ] { character-range } ']'
//		            character class (must be non-empty)
//		c           matches character c (c != '*', '?', '\\', '[')
//		'\\' c      matches character c
//
//	character-range:
//		c           matches character c (c != '\\', '-', ']')
//		'\\' c      matches character c
//		lo '-' hi   matches character c for lo <= c <= hi
//
// Match requires pattern to match all of name, not just a substring.
// The only possible returned error is ErrBadPattern, when pattern
// is malformed.
func Match(pattern, name string) (shards map[string]string, matched bool, err error) {
	shards = make(map[string]string)
Pattern:
	for len(pattern) > 0 {
		var star, segment bool
		var chunk, nm string
		star, segment, chunk, pattern = scanChunk(pattern)
		if star && chunk == "" {
			// Trailing * matches rest of string unless it has a /.
			return shards, strings.IndexByte(name, '/') < 0, nil
		}

		if segment {
			i := strings.IndexRune(chunk, '>')
			if i == -1 {
				// TODO(rdo) is this possible?
				return nil, false, errors.New("unterminated chunk")
			}
			nm = chunk[:i]
			if i == len(chunk)-1 {
				// trailing segment matches rest of string
				shards[nm] = name
				return shards, strings.IndexByte(name, '/') < 0, nil
			}

			chunk = chunk[i+1:]
			i = strings.IndexByte(name, chunk[0])
			if i == -1 {
				return shards, false, nil
			}

			shards[nm] = name[:i]
			name = name[i:]
		}

		// Look for match at current position.
		t, ok, err := matchChunk(chunk, name)
		// if we're the last chunk, make sure we've exhausted the name
		// otherwise we'll give a false result even if we could still match
		// using the star
		if ok && (len(t) == 0 || len(pattern) > 0) {
			name = t
			continue
		}
		if err != nil {
			return shards, false, err
		}
		if star {
			// Look for match skipping i+1 bytes.
			// Cannot skip /.
			for i := 0; i < len(name) && name[i] != '/'; i++ {
				t, ok, err := matchChunk(chunk, name[i+1:])
				if ok {
					// if we're the last chunk, make sure we exhausted the name
					if len(pattern) == 0 && len(t) > 0 {
						continue
					}
					name = t
					continue Pattern
				}
				if err != nil {
					return shards, false, err
				}
			}
		}
		// Before returning false with no error,
		// check that the remainder of the pattern is syntactically valid.
		for len(pattern) > 0 {
			_, _, chunk, pattern = scanChunk(pattern)
			if _, _, err := matchChunk(chunk, ""); err != nil {
				return shards, false, err
			}
		}
		return shards, false, nil
	}
	return shards, len(name) == 0, nil
}

// scanChunk gets the next segment of pattern, which is a non-star string
// possibly preceded by a star.
func scanChunk(pattern string) (star, segment bool, chunk, rest string) {
	if len(pattern) == 0 {
		return false, false, "", ""
	}

	switch pattern[0] {
	case '*':
		pattern = pattern[1:]
		star = true
	case '<':
		pattern = pattern[1:]
		segment = true
	}

	inrange := false
	var i int
Scan:
	for i = 0; i < len(pattern); i++ {
		switch pattern[i] {
		case '\\':
			// error check handled in matchChunk: bad pattern.
			if i+1 < len(pattern) {
				i++
			}
		case '[':
			inrange = true
		case ']':
			inrange = false
		case '<':
			break Scan
		case '*':
			if !inrange {
				break Scan
			}
		}
	}
	return star, segment, pattern[:i], pattern[i:]
}

// matchChunk checks whether chunk matches the beginning of s.
// If so, it returns the remainder of s (after the match).
// Chunk is all single-character operators: literals, char classes, and ?.
func matchChunk(chunk, s string) (rest string, ok bool, err error) {
	// failed records whether the match has failed.
	// After the match fails, the loop continues on processing chunk,
	// checking that the pattern is well-formed but no longer reading s.
	failed := false
	for len(chunk) > 0 {
		if !failed && len(s) == 0 {
			failed = true
		}
		switch chunk[0] {
		case '[':
			// character class
			var r rune
			if !failed {
				var n int
				r, n = utf8.DecodeRuneInString(s)
				s = s[n:]
			}
			chunk = chunk[1:]
			// possibly negated
			negated := false
			if len(chunk) > 0 && chunk[0] == '^' {
				negated = true
				chunk = chunk[1:]
			}
			// parse all ranges
			match := false
			nrange := 0
			for {
				if len(chunk) > 0 && chunk[0] == ']' && nrange > 0 {
					chunk = chunk[1:]
					break
				}
				var lo, hi rune
				if lo, chunk, err = getEsc(chunk); err != nil {
					return "", false, err
				}
				hi = lo
				if chunk[0] == '-' {
					if hi, chunk, err = getEsc(chunk[1:]); err != nil {
						return "", false, err
					}
				}
				if lo <= r && r <= hi {
					match = true
				}
				nrange++
			}
			if match == negated {
				failed = true
			}

		case '?':
			if !failed {
				if s[0] == '/' {
					failed = true
				}
				_, n := utf8.DecodeRuneInString(s)
				s = s[n:]
			}
			chunk = chunk[1:]

		case '\\':
			chunk = chunk[1:]
			if len(chunk) == 0 {
				return "", false, ErrBadPattern
			}
			fallthrough

		default:
			if !failed {
				if chunk[0] != s[0] {
					failed = true
				}
				s = s[1:]
			}
			chunk = chunk[1:]
		}
	}
	if failed {
		return "", false, nil
	}
	return s, true, nil
}

// getEsc gets a possibly-escaped character from chunk, for a character class.
func getEsc(chunk string) (r rune, nchunk string, err error) {
	if len(chunk) == 0 || chunk[0] == '-' || chunk[0] == ']' {
		err = ErrBadPattern
		return
	}
	if chunk[0] == '\\' {
		chunk = chunk[1:]
		if len(chunk) == 0 {
			err = ErrBadPattern
			return
		}
	}
	r, n := utf8.DecodeRuneInString(chunk)
	if r == utf8.RuneError && n == 1 {
		err = ErrBadPattern
	}
	nchunk = chunk[n:]
	if len(nchunk) == 0 {
		err = ErrBadPattern
	}
	return
}
