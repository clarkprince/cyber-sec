package aws

import (
	"encoding/json"
	"errors"
	"io"
	"strconv"
	"strings"

	"trout.software/kraken/webapp/internal/mdt"
)

// BuildRecordFromJSON parses record from JSON values, which must be formated as:
//
//   - objects are encoded as individual entries
//   - arrays mark the parent entry as repeated
func BuildRecordFromJSON(js string) *mdt.Record {
	var buf mdt.RecordBuilder
	keys := keys{"root"}
	dec := json.NewDecoder(strings.NewReader(js))
	dec.UseNumber()

	for {
		tk, err := dec.Token()
		if errors.Is(err, io.EOF) {
			rc := buf.Build()
			return &rc
		}
		if err != nil {
			panic(err)
		}

		switch tk := tk.(type) {
		case nil:
			keys.popscope()

		case bool:
			buf.Append(keys.top(), strconv.FormatBool(tk))
			buf.AppendSeparator(", ")
			keys.popscope()

		case json.Number:
			buf.Append(keys.top(), tk.String())
			buf.AppendSeparator(", ")
			keys.popscope()

		case string:
			switch keys.top() {
			case "{":
				keys.push(tk)
			default:
				buf.Append(keys.top(), tk)
				buf.AppendSeparator(", ")
				keys.popscope()
			}

		case json.Delim:
			switch tk {
			case '{':
				buf.Push(keys.top())
				keys.push("{")
			case '}':
				buf.Pop()
				keys.pop() // leading '{'
				keys.popscope()
			case '[':
				key := keys.top()
				keys.pop()
				keys.push("#" + key)
			case ']':
				keys.pop()
			}

		}
	}
}

type keys []string

func (k *keys) pop()          { *k = (*k)[:len(*k)-1] }
func (k *keys) push(s string) { *k = append(*k, s) }
func (k *keys) top() string   { return (*k)[len(*k)-1] }

// pop only if not repeated
func (k *keys) popscope() {
	if k.top()[0] != '#' {
		k.pop()
	}
}
