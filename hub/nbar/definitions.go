package nbar

import (
	"time"

	"trout.software/kraken/webapp/internal/ulid"
)

// Note on structures declarations
// ======================
//
// The serialization code in this package is fully driven by the data structures here.
// The nbar format is designed for long-term archiving, and care must be taken to keep changes backward _and_ forward-compatible.
//
// Especially, always respect the rules:
//  - use singular field names, even for repeated values
//  - create entities as dedicated structures, starting with ID field (cf User)
//  - always refer to entities by their types, not their ID (cf Playbook.Cell)
//  - prefix types with a V<num> if the type change between version (e.g. V2Created)
//  - always add fields, and keep writing even to the older version of the field
//
// It is also good practice to add tests for older versions.
//
// Serialization codes differentiate between two kinds of structure:
//  - entities, starting with a field ID of type ulid.ULID and implement the ManifestType method.
//     entities are serialized in the parent manifest as a ULID only.
//     entities must be serialized in their own manifest at level 3.
//  - values, annotated with an empty field with tag `nbar:,inline`.
//     values are serialized as a single card of multiple fields in the parent manifest.

type Playbook struct {
	ID ulid.ULID

	Title string
	Cell  []Cell
	// or Cells []ulid.ULID
	Owner    User
	Created  time.Time
	LastEdit time.Time
}

func (Playbook) ManifestType() string { return "nbar/playbook" }

type User struct {
	ID ulid.ULID

	Name    string
	Contact string
}

func (User) ManifestType() string { return "nbar/user" }

type Cell struct {
	ID ulid.ULID

	Author     User
	Created    time.Time
	Timestamp  time.Time
	DataSource DataSource
	Pivot      []Application
	Title      string
}

func (Cell) ManifestType() string { return "nbar/cell" }

type Pivot struct {
	ID ulid.ULID

	Exp string
}

func (Pivot) ManifestType() string { return "nbar/pivot" }

type DataSource struct {
	ID ulid.ULID
}

func (DataSource) ManifestType() string { return "nbar/datasource" }

type Application struct {
	_ struct{} `nbar:",inline"`

	Pivot
	On string
}

type Framework struct {
	ID       ulid.ULID
	UPN      string
	Title    string
	Owner    User
	Content  []byte `nbar:",data"` //data tag refers to content that should not be serialized
	Link     string
	Audit    bool
	LastEdit time.Time
	DueDate  time.Time
}

func (Framework) ManifestType() string { return "nbar/policy" }
