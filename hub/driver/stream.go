package driver

import (
	"context"
	"net/http"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
	"trout.software/kraken/webapp/internal/ulid"
)

// A stream represents, within a data source, a single stream of data.
type Stream struct {
	ID ulid.ULID

	// Name should be a human-friendly way to address the stream.
	// It will be displayed on the UI.
	Name string

	// Type is a globally unique resource name identifying the type of the stream.
	// It has no meaning for the Hub, but can be used for data sources to perform a dispatch.
	// To prevent conflict, always use a full URN following the scheme:
	//
	//
	//   stream:<datasource type>:<stream type>
	//   stream:aws-assets:ec2-instances
	Type string
}

// Selectable systems return an iterator over a LioLi generated from stream.
// Data transforms are specified in the grammar, and session carries permissions (and push feedback).
// Pivots are only informational, they can be used to apply constraints directly on the driver.
// The query engine is still going to apply pivot filtering afterwards.
type Selectable interface {
	Select(Stream, *iam.Session, mdt.Grammar, shards.Shard, []piql.Pivot) Iter
}

// HTTPConfigurable is the minimal interface for data sources that can be configured from an HTTP request.
// The source will be serialized using cbor, it must implement BinaryMarshaller or consider exported fields as public.
type HTTPConfigurable interface {
	// New should create a new instance of the type
	Init(*http.Request)
	// Test should return a code indicating if the configuration is correct
	// Test is always called before the stream is saved, and can be used to mutate it based on the result of the test
	Test(context.Context, iam.Session) error
	// Streams should return the list of available streams in this data source.
	// Only Name and Type need be set.
	// When the data source is updated, streams will be matched by their types.
	Streams() []Stream
}

type HTTPDefiner interface {
	DefineForm(ssn *iam.Session) []httpform.Field
}

type Iter interface {
	Next() bool
	Record() mdt.Record
	Err() error
}

type erriter struct{ error }       // convenience wrapper
func (erriter) Next() bool         { return false }
func (erriter) Record() mdt.Record { return mdt.Record{} }
func (e erriter) Err() error       { return e.error }

func ErrWrap(err error) Iter { return erriter{err} }

type multiIter struct{ iters []Iter }

func (m *multiIter) Next() bool {
readMore:
	res := m.iters[0].Next()
	if res {
		return true
	}

	if m.iters[0].Err() == nil && len(m.iters) > 1 {
		m.iters = m.iters[1:]
		goto readMore
	}
	return false
}

func (m *multiIter) Record() mdt.Record { return m.iters[0].Record() }
func (m *multiIter) Err() error         { return m.iters[0].Err() }

func MultiIter(iters ...Iter) Iter { return &multiIter{iters} }

type aryter struct {
	rcs []mdt.Record
	i   int
}

func (it *aryter) Next() bool         { it.i++; return it.i < len(it.rcs) }
func (*aryter) Err() error            { return nil }
func (it *aryter) Record() mdt.Record { return it.rcs[it.i] }

func IterateArray(rcs []mdt.Record) Iter { return &aryter{rcs: rcs, i: -1} }

type noneiter struct{}

func (noneiter) Next() bool         { return false }
func (noneiter) Record() mdt.Record { panic("record asked from none iter") }
func (noneiter) Err() error         { return nil }

var singlenoneiter = noneiter{}

func None() Iter { return singlenoneiter }
