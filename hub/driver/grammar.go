package driver

import (
	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/internal/ulid"
)

type Grammar struct {
	ID   ulid.ULID `cbor:"1,keyasint"`
	Name string    `cbor:"2,keyasint"`
	EBNF string    `cbor:"3,keyasint"`
}

func (g Grammar) MarshalBinary() ([]byte, error) {
	type G Grammar
	return cbor.Marshal(G(g))
}

func (g *Grammar) UnmarshalBinary(dt []byte) error {
	type G Grammar
	return cbor.Unmarshal(dt, (*G)(g))
}
