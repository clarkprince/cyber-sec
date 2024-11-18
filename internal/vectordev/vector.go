// Package vectordev implements common infrastructure for Vector.dev forwarder management
package vectordev

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type GlobalOptions struct {
	DataDir string `json:"data_dir"`
}

type Topology struct {
	sources    []configuredsource
	transforms []configuredtransform
	sinks      []configuredsink
}

type configuredsource struct {
	Source
	CommonSourceConfig
}
type configuredtransform struct {
	Transform
	CommonTransformConfig
}
type configuredsink struct {
	Sink
	CommonSinkConfig
}

func (t *Topology) AddSource(src Source, cfg CommonSourceConfig) *Topology {
	t.sources = append(t.sources, configuredsource{src, cfg})
	return t
}

func (t *Topology) AddTransform(tr Transform, cfg CommonTransformConfig) *Topology {
	t.transforms = append(t.transforms, configuredtransform{tr, cfg})
	return t
}

func (t *Topology) AddSink(sk Sink, cfg CommonSinkConfig) *Topology {
	t.sinks = append(t.sinks, configuredsink{sk, cfg})
	return t
}

func Marshal(t Topology, opts GlobalOptions) ([]byte, error) {
	cfg := struct {
		GlobalOptions
		Sources    map[string]json.RawMessage `json:"sources"`
		Transforms map[string]json.RawMessage `json:"transforms"`
		Sinks      map[string]json.RawMessage `json:"sinks"`
	}{
		GlobalOptions: opts,
		Sources:       make(map[string]json.RawMessage),
		Transforms:    make(map[string]json.RawMessage),
		Sinks:         make(map[string]json.RawMessage),
	}

	for _, src := range t.sources {
		dt, err := src.MarshalVector(src.CommonSourceConfig)
		if err != nil {
			return nil, fmt.Errorf("cannot marshal source %s: %w", src.Name(), err)
		}
		cfg.Sources[src.Name()] = dt
	}

	for _, tr := range t.transforms {
		dt, err := tr.MarshalVector(tr.CommonTransformConfig)
		if err != nil {
			return nil, fmt.Errorf("cannot marshal transform %s: %w", tr.Name(), err)
		}
		cfg.Transforms[tr.Name()] = dt
	}

	for _, sk := range t.sinks {
		dt, err := sk.MarshalVector(sk.CommonSinkConfig)
		if err != nil {
			return nil, fmt.Errorf("cannot marshal sink %s: %w", sk.Name(), err)
		}
		cfg.Sinks[sk.Name()] = dt
	}

	return json.Marshal(cfg)
}

type CommonSourceConfig struct{}

type Source interface {
	Name() string
	MarshalVector(CommonSourceConfig) ([]byte, error)
}

type CommonTransformConfig struct {
	Inputs []string `json:"inputs"`
}
type Transform interface {
	Name() string
	MarshalVector(CommonTransformConfig) ([]byte, error)
}

type CommonSinkConfig struct {
	Inputs   []string `json:"inputs"`
	Encoding Encoding `json:"encoding"`
}

type Encoding struct {
	Codec           string   `json:"codec"`
	ExceptFields    []string `json:"except_fields,omitempty"`
	TimestampFormat string   `json:"timestamp_format,omitempty"`
}

type Sink interface {
	Name() string
	MarshalVector(CommonSinkConfig) ([]byte, error)
}

// CondBuilder is a helper type to build VRL conditional expressions
type CondBuilder struct {
	buf *bytes.Buffer
	c   int
}

func (b *CondBuilder) Condition() string { return b.buf.String() }

func (b *CondBuilder) AddMultiExpr(f, e string) {
	if b.buf == nil {
		b.buf = new(bytes.Buffer)
	}

	if e == "" {
		return
	}

	vs := splitcommas(e)
	if len(vs) == 0 {
		return
	}
	if b.c > 0 {
		fmt.Fprint(b.buf, " && ")
	}
	b.c++
	switch len(vs) {
	default:
		fmt.Fprintf(b.buf, "includes([%s], .appname)", joinquoted(vs))

	case 1:
		fmt.Fprintf(b.buf, "%s == %s", f, joinquoted(vs))
	}
}

// splitcommas split the sentences at commas, ignoring leading and trailing spaces.
// an empty leading, trailing, or double comma is also ignored.
func splitcommas(s string) []string {
	// number of commas defines upper boundary
	parts := make([]string, strings.Count(s, ",")+1)
	var lexitem struct{ start, sp int }
	lexitem.sp = -1
	j := 0

	for i, r := range s {
		switch r {
		case ' ':
			if lexitem.start == i {
				lexitem.start++
			} else if lexitem.sp == -1 {
				lexitem.sp = i
			}
		case ',':
			end := i
			if lexitem.sp != -1 {
				end = lexitem.sp
			}

			if lexitem.start < end {
				parts[j] = s[lexitem.start:end]
				j++
			}
			lexitem.start = i + 1
			lexitem.sp = -1
		}
	}

	end := len(s)
	if lexitem.sp != -1 {
		end = lexitem.sp
	}

	if lexitem.start < end {
		parts[j] = s[lexitem.start:end]
		j++
	}
	return parts[:j]
}

// joinquoted returns the quoted version of the string, joined by comma
func joinquoted(ss []string) string {
	var buf strings.Builder
	for i, s := range ss {
		if i > 0 {
			buf.WriteString(", ")
		}
		buf.WriteString(strconv.Quote(s))
	}
	return buf.String()
}
