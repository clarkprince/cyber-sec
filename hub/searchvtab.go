package hub

import (
	"encoding/json"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/sqlite"
)

var VTabDSInPlaybook = sqlite.RegisterTable("pb_datasources", pbDatasources{})
var VTabPivotsInPlaybook = sqlite.RegisterTable("pb_pivots", pbPivots{})
var VTabUsersInPlaybook = sqlite.RegisterTable("pb_users", pbUsers{})

type pbDatasources struct {
	Source     []byte `vtab:"notebook,required,hidden"`
	Datasource []byte `vtab:"datasource"`
}

func (p pbDatasources) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[pbDatasources] {
	nb, s, err := notebookFromConstraint(cs)
	if err != nil {
		return sqlite.FromError[pbDatasources](err)
	}
	results := make([]pbDatasources, len(nb.Cells))
	for i, c := range nb.Cells {
		results[i] = pbDatasources{Source: s, Datasource: c.DataSource.Bytes()}
	}

	return sqlite.FromArray(results)
}

func notebookFromConstraint(cs sqlite.Constraints) (Notebook, []byte, error) {
	var nb Notebook
	var s []byte
	for _, c := range cs {
		if c.Column == "notebook" {
			if c.Operation == sqlite.ConstraintEQ {
				s := c.Value.([]byte)
				if err := nb.UnmarshalBinary(s); err != nil {
					return Notebook{}, s, err
				}
			}
		}
	}

	return nb, s, nil
}

type pbPivots struct {
	Source []byte `vtab:"notebook,required,hidden"`
	Pivots string `vtab:"pivots"`
}

func (p pbPivots) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[pbPivots] {
	nb, s, err := notebookFromConstraint(cs)
	if err != nil {
		return sqlite.FromError[pbPivots](err)
	}

	var results []pbPivots
	for _, c := range nb.Cells {
		results = make([]pbPivots, len(c.Pivots))
		for j, p := range c.Pivots {
			results[j] = pbPivots{Source: s, Pivots: p.Pivot.String()}
		}
	}

	return sqlite.FromArray(results)
}

type pbUsers struct {
	Source []byte `vtab:"notebook,required,hidden"`
	Owner  string `vtab:"owner"`
}

func (u pbUsers) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[pbUsers] {
	nb, s, err := notebookFromConstraint(cs)
	if err != nil {
		return sqlite.FromError[pbUsers](err)
	}

	results := make([]pbUsers, 1)
	results[0] = pbUsers{Source: s, Owner: nb.Owner.ID.String()}

	return sqlite.FromArray(results)
}

func ExtractDatasourceToJson(in []byte) string {
	var ds DataSource
	if err := ds.UnmarshalBinary(in); err != nil {
		return `{}`
	}
	return toJSON(ds)
}

func ExtractPivotToJson(in []byte) string {
	var p Pivot
	if err := p.UnmarshalBinary(in); err != nil {
		return `{}`
	}

	return toJSON(p)
}

func ExtractUserToJson(in []byte) string {
	var u iam.User
	if err := u.UnmarshalBinary(in); err != nil {
		return `{}`
	}
	return toJSON(u)
}

func toJSON(in any) string {
	json, err := json.Marshal(in)
	if err != nil {
		return `{}`
	}
	return string(json)
}
