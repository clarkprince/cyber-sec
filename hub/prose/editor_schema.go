package prose

import (
	"encoding/json"
	"errors"

	"trout.software/kraken/webapp/internal/sqlite/stability"
)

// Editor represents a JSON-serialized editor.
// This is meant only to read from the underlying data structure, and not to represents things faithfully.
// Therefore, all attempts to serialize this structure will panic.
type Editor struct {
	_ stability.SerializedValue // Field order matters

	Type    string         `json:"type,omitempty"`
	Attrs   map[string]any `json:"attrs,omitempty"`
	Content []*Editor      `json:"content,omitempty"`
	Marks   []struct {
		Type string `json:"type,omitempty"`
	} `json:"marks,omitempty"`
	Text string `json:"text,omitempty"`
}

const (
	PillPivot    = "pivot"
	PillCell     = "cell"
	PillUser     = "user"
	PillPlaybook = "playbook"
	PillDat      = "datapill"
)

type Iter[T any] interface {
	Next() bool
	Err() error
	Value() *T
}

func Pills[T any](ed *Editor, ptype string) Iter[T] {
	return &stackiter[T]{
		stack: []*Editor{ed},
		pred:  func(ed *Editor) bool { return ed.Type == "pill" },
		infl: func(ed *Editor) (*T, error) {
			v := new(T)
			js, ok := ed.Attrs["data-entity-json"].(string)
			if !ok {
				return v, errors.New("invalid pill entry")
			}
			err := json.Unmarshal([]byte(js), v)
			return v, err
		},
		defl: func(v *T, ed *Editor) error {
			pl, err := json.Marshal(v)
			if err != nil {
				return err
			}
			ed.Attrs["data-entity-json"] = string(pl)
			return nil
		},
	}
}

type stackiter[T any] struct {
	stack []*Editor
	pred  func(*Editor) bool
	infl  func(*Editor) (*T, error)
	defl  func(*T, *Editor) error

	last *T
	err  error
}

// iterate breadth-first. Beg for coroutines
func (it *stackiter[T]) Next() bool {
	if it.err != nil {
		return false
	}

	if it.last != nil {
		err := it.defl(it.last, it.stack[0])
		it.last = nil
		copy(it.stack, it.stack[1:])
		it.stack = it.stack[:len(it.stack)-1]
		if err != nil {
			it.err = err
			return false
		}
	}

	j := 0
stackLoop:
	for j <= len(it.stack) {
		switch {
		default:
			it.stack = append(it.stack, it.stack[j].Content...)
			j++
		case j == len(it.stack):
			it.stack = it.stack[:0]
			return false
		case it.pred(it.stack[j]):
			break stackLoop
		}
	}

	v, err := it.infl(it.stack[j])
	if err != nil {
		it.err = err
		return false
	}

	copy(it.stack, it.stack[j:])
	it.stack = it.stack[:len(it.stack)-j]
	it.last = v
	return true
}

func (it *stackiter[T]) Err() error { return it.err }
func (it *stackiter[T]) Value() *T  { return it.last }
