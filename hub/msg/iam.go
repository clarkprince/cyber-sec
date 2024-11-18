package msg

import (
	"time"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/internal/sqlite/stability"
	"trout.software/kraken/webapp/internal/ulid"
)

// Domain represents a hierarchical naming system for entity in the sense of [rfc1034].
// There is only one domain per installation. Top-level entities (e.g. identity key) are registered per domain.
// Domain is also used during authentication, to restrict origin of third-party users.
//
// [rfc1034]: https://datatracker.ietf.org/doc/html/rfc1034
type Domain struct {
	ID    ulid.ULID `cbor:"1,keyasint"`
	Name  string
	Alias string
}

func (d Domain) MarshalBinary() ([]byte, error) {
	type D Domain
	return cbor.Marshal(D(d))
}

func (d *Domain) UnmarshalBinary(dt []byte) error {
	type D Domain
	return cbor.Unmarshal(dt, (*D)(d))
}

type User struct {
	_ stability.SerializedValue

	ID      ulid.ULID `cbor:"1,keyasint"`
	Domain  ulid.ULID `cbor:"2,keyasint"`
	HasLeft time.Time `cbor:"left_at"`

	Profile

	Labels []Label
}

func (u User) IsZero() bool {
	if u.ID.IsZero() && u.Domain.IsZero() && u.Profile.IsZero() && len(u.Labels) == 0 {
		return true
	}
	return false
}

func (u User) MarshalBinary() ([]byte, error) {
	type U User
	return cbor.Marshal(U(u))
}

func (u *User) UnmarshalBinary(dt []byte) error {
	type U User
	var v U

	if err := cbor.Unmarshal(dt, &v); err != nil {
		return err
	}

	*u = User(v)
	return nil
}

// A profile is the user-representable view of a person.
type Profile struct {
	Name       string
	ExternalID string
	Picture    string
}

func (p Profile) IsZero() bool {
	if p.ExternalID == "" && p.Name == "" && p.Picture == "" {
		return true
	}
	return false
}

// A label is attached to a user or a resource to limit the breadth of its possible actions.
type Label string
