package storage

import (
	"context"
	"testing"

	"github.com/fxamacker/cbor/v2"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

func TestSQLiteListPath(t *testing.T) {
	type ExValue struct {
		Key1 string `cbor:"1,keyasint"`
		Key2 int
	}
	ignoreorder := cmpopts.SortSlices(func(e1, e2 ExValue) bool { return e1.Key2 < e2.Key2 })

	// key1 double as path, for simplicity
	entries := []ExValue{
		{Key1: "/realm/castle/user/bob", Key2: 42}, {Key1: "/realm/castle/user/john", Key2: 43},
		{Key1: "/realm/castle/user/jane", Key2: 44}, {Key1: "/realm/castle/user/paul", Key2: 45},
		{Key1: "/realm/bouncy/user/bob", Key2: 46}, {Key1: "/realm/bouncy/user/john", Key2: 47},
		{Key1: "/realm/bouncy/user/jane", Key2: 48}, {Key1: "/realm/bouncy/user/paul", Key2: 49},
		{Key1: "/realm/bastion/user/bob", Key2: 50}, {Key1: "/realm/bastion/user/john", Key2: 51},
		{Key1: "/realm/castle", Key2: 52}, {Key1: "/realm/bouncy", Key2: 53}, {Key1: "/realm/bastion", Key2: 54},
	}

	db := TestDB()
	ctx := context.Background()
	for _, e := range entries {
		if err := PutValue(ctx, db, e.Key1, CBWrapper[ExValue]{V: e}); err != nil {
			t.Fatal(err)
		}
	}

	t.Run("simple path", func(t *testing.T) {
		got := make([]CBWrapper[ExValue], 5)
		got, err := ListPath(ctx, db, "/realm/castle/user", got)
		if err != nil {
			t.Fatal(err)
		}

		want := entries[0:4]
		if !cmp.Equal(want, unwrap(got), ignoreorder) {
			t.Errorf("listing path /realm/castle/user: diff %s", cmp.Diff(unwrap(got), want, ignoreorder))
		}
	})

	t.Run("limit return", func(t *testing.T) {
		got := make([]CBWrapper[ExValue], 3)
		got, err := ListPath(ctx, db, "/realm/bouncy/user", got)
		if err != nil {
			t.Fatal(err)
		}

		want := entries[4:7] // only length of got
		if !cmp.Equal(want, unwrap(got), ignoreorder) {
			t.Errorf("listing path /realm/bouncy/user: diff %s", cmp.Diff(unwrap(got), want, ignoreorder))
		}
	})

	t.Run("apply predicates", func(t *testing.T) {
		got := make([]CBWrapper[ExValue], 4)
		got, err := ListPath(ctx, db, "/realm/castle/user", got, func(v CBWrapper[ExValue]) bool { return v.V.Key2 < 45 }, func(v CBWrapper[ExValue]) bool { return v.V.Key2 > 42 })
		if err != nil {
			t.Fatal(err)
		}

		want := entries[1:3] // only first values, rest ignored by predicate
		if !cmp.Equal(want, unwrap(got), ignoreorder) {
			t.Errorf("listing path /realm/castle/user: diff %s", cmp.Diff(unwrap(got), want, ignoreorder))
		}
	})

	t.Run("limit depth of traversal", func(t *testing.T) {
		got := make([]CBWrapper[ExValue], 4)
		got, err := ListPath(ctx, db, "/realm", got)
		if err != nil {
			t.Fatal(err)
		}

		want := []ExValue{{Key1: "/realm/castle", Key2: 52}, {Key1: "/realm/bouncy", Key2: 53}, {Key1: "/realm/bastion", Key2: 54}}
		if !cmp.Equal(want, unwrap(got), ignoreorder) {
			t.Errorf("listing path /realm/: diff %s", cmp.Diff(unwrap(got), want, ignoreorder))
		}
	})

	t.Run("accept prefix in search", func(t *testing.T) {
		got := make([]CBWrapper[ExValue], 4)
		got, err := ListPath(ctx, db, "/realm/bou", got)
		if err != nil {
			t.Fatal(err)
		}

		want := []ExValue{{Key1: "/realm/bouncy", Key2: 53}}
		if !cmp.Equal(want, unwrap(got), ignoreorder) {
			t.Errorf("listing path /realm/: diff %s", cmp.Diff(unwrap(got), want, ignoreorder))
		}
	})

}

type CBWrapper[T any] struct{ V T }

func (w CBWrapper[T]) MarshalBinary() ([]byte, error) { return cbor.Marshal(w.V) }
func (w *CBWrapper[T]) UnmarshalBinary(dt []byte) error {
	var v T
	if err := cbor.Unmarshal(dt, &v); err != nil {
		return err
	}
	w.V = v
	return nil
}
func unwrap[T any](in []CBWrapper[T]) []T {
	out := make([]T, len(in))
	for i, w := range in {
		out[i] = w.V
	}
	return out
}
