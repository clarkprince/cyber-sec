package msg

import (
	"trout.software/kraken/webapp/internal/ulid"
)

type JoinType int

const (
	InnerJoin JoinType = iota
	LeftJoin
	RightJoin
	CrossJoin
	AntiJoin
)

type PivotApplication struct {
	Pivot ulid.ULID `nbar:"pivot"`
	Join  JoinType  `nbar:"join"`
	On    []string  `json:"on" nbar:"on"` // record path used for the join operation
}

type PivotDefinition struct {
	ID   ulid.ULID `json:"pivotid" nbar:"id"`
	Name string    `json:"name" nbar:"name"`
	Type string    `json:"type" nbar:"type"`
	Note string    `json:"note" nbar:"-"`

	Args []string `json:"args" nbar:"-"` // only for front-end code, do we want to have type state instead?
}
