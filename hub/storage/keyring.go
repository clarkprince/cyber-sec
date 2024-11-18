package storage

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"slices"

	"filippo.io/age"
	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

const (
	AdminPrivatekey = "secret:ssh:admin-pkey"
	SFTPIdentity    = "secret:ssh:sftp-pkey"

	//siganture values for obs_ssh_keys table
	ED25519KEY = "ed25519"
	RSAKEY     = "rsa"
	ECDSAKEY   = "ecdsa"
)

// Keyring stores securely arbitrary data.
// See [Keyring.StoreSecret] for a simple approach.
//
// # Security Model
//
// The keyring encrypts secrets using public key, and store the public key alongside the secret.
// The private key is stored outside the database, into a well-known location.
// The goal is that, with a back-up of the system only, an attacker is not able to recover secrets.
//
// The keyring might allow, in the future, to store the identity into a KMS if this level of security is required.
type Keyring struct {
	BLOB []byte

	// fields below are not serialized (esp. secrets)
	ctn     Executor
	secrets []secret

	// keys sorted by expiration: first key matters
	keys []*age.X25519Identity
}

func (k *Keyring) MarshalBinary() ([]byte, error) {
	type K Keyring
	return cbor.Marshal((*K)(k))
}
func (k *Keyring) UnmarshalBinary(data []byte) error {
	type K Keyring
	return cbor.Unmarshal(data, (*K)(k))
}

func OpenKeyring(ctx context.Context, ctn Executor, idt Identifier, domain ulid.ULID) (*Keyring, error) {
	kr, err := FindOne[Keyring](ctx, ctn, "/keyring")
	switch {
	case err == nil, errors.Is(err, MissingEntry):
		keys, err := idt.IdentityOf(domain)
		if err != nil {
			return nil, fmt.Errorf("finding identities of %s: %w", domain, err)
		}
		kr.ctn = ctn
		kr.keys = keys
		return &kr, kr.unlock()
	default:
		return nil, fmt.Errorf("listing key rings: %w", err)
	}
}

// Identifier is a system storing securely identities for a domain.
// When multiple identities are returned, only the first will be used for encryption.
type Identifier interface {
	IdentityOf(domain ulid.ULID) ([]*age.X25519Identity, error)
}

type StaticIdentifier []*age.X25519Identity

func (st StaticIdentifier) IdentityOf(_ ulid.ULID) ([]*age.X25519Identity, error) {
	return st, nil
}

// StoreSecret adds a new value to the keyring, indexed with signature and name.
func StoreSecret[T any](ctx context.Context, k *Keyring, sig, name string, v T) error {
	j := -1
	for i, s := range k.secrets {
		if s.Signature == sig && s.Name == name {
			j = i
			break
		}
	}
	if j == -1 {
		j = len(k.secrets)
		k.secrets = append(k.secrets, secret{Signature: sig, Name: name})
	}

	pl, err := cbor.Marshal(v)
	if err != nil {
		return fmt.Errorf("cannot marshal value: %w", err)
	}
	k.secrets[j].Value = pl

	if err := k.lock(); err != nil {
		return err
	}

	return PutValue(ctx, k.ctn, "/keyring", k)
}

type secret struct {
	Signature, Name string

	Value cbor.RawMessage
}

// ReadSecret reads a value from the keyring, indexed by signature and name.
// If the secret does not exist, the zero value of the type is returned.
func ReadSecret[T any](ctx context.Context, k *Keyring, sig, name string) (T, error) {
	var v T
	for _, s := range k.secrets {
		if s.Signature != sig || s.Name != name {
			continue
		}

		err := cbor.Unmarshal(s.Value, &v)
		return v, err
	}

	return v, nil
}

func ListSecrets[T any](ctx context.Context, k *Keyring, sig string) ([]T, error) {
	var vs []T
	for _, s := range k.secrets {
		if s.Signature != sig {
			continue
		}

		var v T
		err := cbor.Unmarshal(s.Value, &v)
		if err != nil {
			return vs, err
		}
		vs = append(vs, v)
	}

	return vs, nil
}

func (k *Keyring) lock() error {
	buf := sqlite.GetBuffer()
	defer sqlite.ReturnBuffer(buf)

	w, err := age.Encrypt(buf, k.keys[0].Recipient())
	if err != nil {
		return fmt.Errorf("starting encryption: %w", err)
	}
	if err := cbor.NewEncoder(w).Encode(k.secrets); err != nil {
		return fmt.Errorf("during CBOR serialization: %w", err)
	}

	if err := w.Close(); err != nil {
		return fmt.Errorf("finishing encryption: %w", err)
	}

	if buf.Len() > len(k.BLOB) {
		k.BLOB = make([]byte, buf.Len())
	}
	sz := copy(k.BLOB, buf.Bytes())
	k.BLOB = k.BLOB[:sz]
	return nil
}

func (k *Keyring) unlock() error {
	// at init, no value encoded
	if len(k.BLOB) == 0 {
		return nil
	}

	ids := make([]age.Identity, len(k.keys))
	for i, v := range k.keys {
		ids[i] = v
	}

	plain, err := age.Decrypt(bytes.NewReader(k.BLOB), ids...)
	if err != nil {
		return fmt.Errorf("reading encrypted keyring: %w", err)
	}

	return cbor.NewDecoder(plain).Decode(&k.secrets)
}

func ObsSecrets(name string, kr **Keyring) func(sqlite.SQLITE3) {
	return sqlite.RegisterTable(name, vtSecret{kr: kr})
}

type vtSecret struct {
	Signature string `vtab:"signature"`
	Name      string `vtab:"name"`

	kr **Keyring `vtab:"-"`
}

func (vt vtSecret) Filter(_ int, _ sqlite.Constraints) sqlite.Iter[vtSecret] {
	return sqlite.TransformArray((*vt.kr).secrets, func(s secret) vtSecret {
		return vtSecret{Signature: s.Signature, Name: s.Name}
	})
}

func (vt vtSecret) Hash64() int64 { return sqlite.HashString(vt.Signature + vt.Name) }

func (vt vtSecret) Update(ctx context.Context, index int64, value vtSecret) error {
	if index == -1 || value.Name != "" {
		return nil // only delete
	}

	k := *vt.kr
	k.secrets = slices.DeleteFunc(k.secrets, func(s secret) bool {
		return sqlite.HashString(s.Signature+s.Name) == index
	})
	if err := k.lock(); err != nil {
		return err
	}

	return PutValue(ctx, k.ctn, "/keyring", k)
}
