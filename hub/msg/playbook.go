package msg

import (
	"time"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/internal/sqlite/stability"
	"trout.software/kraken/webapp/internal/ulid"
)

type Playbook struct {
	_ stability.SerializedValue

	Rev int       `nbar:"-"`
	ID  ulid.ULID `nbar:"id"`

	Title    string    `json:",omitempty" nbar:"title"`
	Cells    []Cell    `json:",omitempty" nbar:"cells"`
	Urgent   bool      `json:",omitempty" nbar:"-"`
	Resolved bool      `json:",omitempty" nbar:"-"`
	Archived bool      `json:",omitempty" nbar:"-"`
	Owner    User      `json:",omitempty" nbar:"-"`
	Created  time.Time `json:",omitempty" nbar:"created"`
	LastEdit time.Time `json:",omitempty" nbar:"lastedit"`
	Tag      []Tag     `json:",omitempty" nbar:"-"`
	Origin   ulid.ULID `json:",omitempty" nbar:"-"`
}

func (n Playbook) MarshalBinary() ([]byte, error) {
	type W Playbook
	dt, err := cbor.Marshal(W(n))
	return dt, err
}

func (n *Playbook) UnmarshalBinary(dt []byte) error {
	type W Playbook
	var w W
	if err := cbor.Unmarshal(dt, &w); err != nil {
		return err
	}
	*n = (Playbook)(w)
	return nil
}
