package storage

import (
	"context"
	"encoding"
	"errors"
	"fmt"
	"runtime/trace"

	"trout.software/kraken/webapp/internal/sqlite"
)

type Executor interface {
	Exec(ctx context.Context, cmd string, args ...any) *sqlite.Rows
	Savepoint(ctx context.Context) (context.Context, error)
	Release(ctx context.Context) error
	Rollback(ctx context.Context) error
}

// ListPath returns up to len(values) records under prefix, with maximum depth one.
// If an error is returned, up to len(values) might have been written.
// The generic parameter T must have a corresponding pointer type implementing the binary.Unmarshaler interface.
//
// Match rules are as:
//
//	match("/path1", "/path1")              true
//	match("/path1", "/path1/value")        true
//	match("/path1/val", "/path1/value")    true
//	match("/path1", "/path1/value/nested") false
//
// There can be no more that wastefactor time the number of values scanned from the database.
// If you need more, an index is going to be required.
func ListPath[T any](ctx context.Context, c Executor,
	prefix string, values []T, preds ...func(T) bool) ([]T, error) {
	defer trace.StartRegion(ctx, "db:list-path").End()

	if len(values) == 0 {
		return nil, nil
	}

	stn := c.Exec(ctx, "select pkey, value from entities where pkey = ?1 or pkey like ?2 and drop_lastelement(pkey) in (?1, drop_lastelement(?1))", prefix, prefix+"%")

	i := 0
resLoop:
	for stn.Next() && i < len(values) {
		var k string
		stn.Scan(&k, &values[i])

		for _, p := range preds {
			if !p(values[i]) {
				continue resLoop
			}
		}
		i++
	}

	return values[:i], stn.Err()
}

var DropLastElement = sqlite.RegisterFunc("drop_lastelement", func(v string) string {
	for i := len(v) - 1; i >= 0; i-- {
		if v[i] == '/' {
			return v[:i]
		}
	}
	return v
})

// FindOne locates a single record matching the given preds.
// If no record is found, it returns a [missingEntry] error.
// If more than one records are found, it returns a [duplicateEntry] error.
func FindOne[T any](ctx context.Context, ctn Executor, prefix string, preds ...func(T) bool) (T, error) {
	vs := make([]T, 2)
	vs, err := ListPath(ctx, ctn, prefix, vs, preds...)
	var zero T
	switch {
	case err != nil:
		return zero, err
	case len(vs) == 0:
		return zero, MissingEntry
	case len(vs) == 2:
		return zero, DuplicateEntry
	}

	return vs[0], nil
}

// sentinel error values
var MissingEntry = errors.New("no known entry")
var DuplicateEntry = errors.New("more than one record matching")
var ConflictAvoided = errors.New("conflict avoided")

func PutValue(ctx context.Context, c Executor, path string, v encoding.BinaryMarshaler) error {
	// returning clause in the statement designed to know if the insert actually happens.
	// due to a programmer error, or an issue with the ULID generation, it is possible that insertion would overwrite a different value.
	var ikey string
	err := c.Exec(ctx, `insert into entities (pkey, value) values (?, ?)
				 on conflict(pkey) do update set value = excluded.value
				 returning pkey`, path, v).ScanOne(&ikey)
	if err != nil {
		return fmt.Errorf("inserting value at path=%s: %w", path, err)
	}
	if ikey == "" {
		return ConflictAvoided
	}
	return nil
}

// TestDB creates a new database connection, ready for use with functions in this package.
// This is a watered-down version of the actual storage in production, with no dependencies.
// To be only used in tests!!
func TestDB() *sqlite.Conn {
	db, err := sqlite.Open(sqlite.MemoryPath, DropLastElement)
	if err != nil {
		panic(err)
	}

	if err := db.Exec(context.Background(), "create table entities (pkey text primary key, value blob) without rowid;").Err(); err != nil {
		panic(err)
	}

	return db
}
