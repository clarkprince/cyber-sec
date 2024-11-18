package storage

import (
	"context"
	"fmt"
	"testing"

	"filippo.io/age"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestKeyring(t *testing.T) {
	id, err := age.GenerateX25519Identity()
	if err != nil {
		t.Fatal(err)
	}

	db := TestDB()
	domain := ulid.Make()

	const testkeyringsig = "secret:keyring-test"

	k, err := OpenKeyring(context.Background(), db, StaticIdentifier{id}, domain)
	if err != nil {
		t.Fatal(err)
	}

	t.Run("empty keyring", func(t *testing.T) {
		user := ulid.Make().String()
		tk, err := ReadSecret[string](context.Background(), k, testkeyringsig, user)
		if err != nil {
			t.Fatal(err)
		}

		if tk != "" {
			t.Errorf("non-empty token in empty keyring")
		}
	})

	t.Run("store and read single value", func(t *testing.T) {
		const sig = "secret:test:store-and-read"
		var secret = "Ancient-Exception-Till-Shadow-5"
		if err := StoreSecret(context.Background(), k, sig, "", secret); err != nil {
			t.Fatal(err)
		}

		back, err := ReadSecret[string](context.Background(), k, sig, "")
		if err != nil {
			t.Fatal(err)
		}
		if back != secret {
			t.Errorf("reading back secret: want %s, got %s", secret, back)
		}
	})

	t.Run("can update", func(t *testing.T) {
		users := make([]string, 3)
		for i := range users {
			users[i] = ulid.Make().String()

			tk := fmt.Sprintf("refreshme-%d", i)
			t.Log("storing refresh token for user", users[i])
			if err := StoreSecret(context.Background(), k, testkeyringsig, users[i], tk); err != nil {
				t.Fatal(err)
			}
		}

		if err := StoreSecret(context.Background(), k, testkeyringsig, users[1], "new-token"); err != nil {
			t.Fatal(err)
		}

		tk, err := ReadSecret[string](context.Background(), k, testkeyringsig, users[1])
		if err != nil {
			t.Fatal(err)
		}

		if tk != "new-token" {
			t.Errorf("read back invalid token: %s", string(tk))
		}
	})

	t.Run("can reopen", func(t *testing.T) {
		user := ulid.Make().String()
		if err := StoreSecret(context.Background(), k, testkeyringsig, user, "storeacross"); err != nil {
			t.Fatal(err)
		}

		k, err := OpenKeyring(context.Background(), db, StaticIdentifier{id}, domain)
		if err != nil {
			t.Fatal(err)
		}

		tk, err := ReadSecret[string](context.Background(), k, testkeyringsig, user)
		if err != nil {
			t.Fatal(err)
		}

		if tk != "storeacross" {
			t.Errorf("read back invalid token: %s", tk)
		}
	})
}
