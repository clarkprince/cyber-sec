package msg

import (
	"encoding/json"
	"errors"
	"time"

	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/sqlite/stability"
	"trout.software/kraken/webapp/internal/ulid"
)

type Cell struct {
	_ stability.SerializedValue

	ID         ulid.ULID          `nbar:"id"`
	Author     User               `nbar:"-"`
	Created    time.Time          `nbar:"created"`
	Timestamp  time.Time          `nbar:"timestamp"`
	Tags       []Tag              `nbar:"-"`
	DataSource ulid.ULID          `nbar:"datasource"`
	Notebook   ulid.ULID          `nbar:"notebook"`
	Pivots     []PivotApplication `nbar:"pivots"`
	Viewport   Viewport           `nbar:"-"`
	Title      string             `nbar:"title"`
	CheckCell  bool               `nbar:"-"`
	Snapshot   *time.Time         `nbar:"-"`
	Keyword    string             `nbar:"-"`

	Pattern string `nbar:"-"` // TODO(rdo) can we infer from grammar?
	Grammar string `nbar:"-"`

	// Used by the client to signal a cache bypass
	ForceReload bool `nbar:"-"`
	// Used to render the cell in the UI
	Position Position `nbar:"-"`
}

type Position struct {
	Height int
	Col    int
	Row    int
}

func (m Cell) String() string { return "cell:" + m.ID.String() }

func (m *Cell) Set(from string) error { return json.Unmarshal([]byte(from), m) }

// ParseGrammar returns the compiled grammar used to parse the underlying stream.
// By order of preference, patterns will be chosen over stream-level grammars.
//
// The sentinel value [NoPatternNorGrammar] is returned if both are empty. In this case, the grammar is an empty dict.
func (m Cell) ParseGrammar() (mdt.Grammar, error) {
	if m.Pattern != "" {
		return mdt.CompilePattern(m.Pattern)
	}

	if m.Grammar != "" {
		return mdt.ParseGrammar(m.Grammar)
	}

	return mdt.Grammar{}, NoPatternNorGrammar
}

// NoPatternNorGrammar is a sentinel value
var NoPatternNorGrammar = errors.New("no pattern nor grammar")

type Tag struct {
	_ struct{} `cbor:",toarray"`

	Key, Value string
}

type Viewport struct {
	Pins   []mdt.Position
	Fields []string
	Search string
	Height int
}
