package hub

import (
	"context"
	"encoding"
	"errors"
	"fmt"

	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
)

var _storeLog = tasks.NewLogger("storage")

// forward definition of functions, helps during migration
func ListPath[T any](ctx context.Context, c storage.Executor,
	prefix string, values []T, preds ...func(T) bool) ([]T, error) {
	return storage.ListPath(ctx, c, prefix, values, preds...)
}

func FindOne[T any](ctx context.Context, ctn storage.Executor, prefix string, preds ...func(T) bool) (T, error) {
	return storage.FindOne(ctx, ctn, prefix, preds...)
}

func PutValue(ctx context.Context, c storage.Executor, path string, v encoding.BinaryMarshaler) error {
	return storage.PutValue(ctx, c, path, v)
}

type Executor = storage.Executor

// Ensure SQLiteSchema runs statements required to migrate the DB to a given version (starting at 1).
// It is always safe to run this function multiple times, even if the schema already exist.
// This function is also safe to run against later instanciation of the database, where it gracefully exists.
func (app App) EnsureSQLiteSchema(version int) error {
	ctx := context.Background()

	var dbv int
	if err := app.db.Exec(ctx, "pragma user_version").ScanOne(&dbv); err != nil {
		return fmt.Errorf("cannot read version: %w", err)
	}

	const magic_id = 1802658155 // "krak" in uint32 big-endian
	// note that https://www.sqlite.org/pragma.html#pragma_application_id states that this is a signed int.
	// this is an … interesting choice for a serialization of bytes, but we are below MaxInt32, cast is ok.

	var appid int
	switch err := app.db.Exec(ctx, "pragma application_id;").ScanOne(&appid); {
	case err != nil:
		return fmt.Errorf("error reading application id: %w", err)
	case dbv == 0:
		if err := app.db.Exec(ctx, "pragma application_id = 1802658155;").Err(); err != nil {
			return fmt.Errorf("cannot write application id: %w", err)
		}
	case appid != magic_id:
		return errors.New("invalid file signature: does not look like a Security Hub database")
	}

	for i := dbv; i < version; i++ {
		_storeLog.Info("update schema", "version", i)
		for _, sts := range dbSchema[i] {
			if err := app.db.Exec(ctx, sts).Err(); err != nil {
				return fmt.Errorf("error running %s: %w", sts, err)
			}

		}
		// seems that pragma does not accept binding arguments
		if err := app.db.Exec(ctx, fmt.Sprintf("pragma user_version = %d;", i+1)).Err(); err != nil {
			return fmt.Errorf("error updating version: %w", err)
		}
	}

	for _, s := range dbSchema[minInt] {
		if err := app.db.Exec(ctx, s).Err(); err != nil {
			return fmt.Errorf("error running %s: %w", s, err)
		}
	}

	return nil
}

const intSize = 32 << (^uint(0) >> 63) // 32 or 64
const minInt = -1 << (intSize - 1)

// list of statements to run when migrating from a given version
var dbSchema = map[int][]string{
	// we use min int as a marker key for statements that should always run.
	// it is such a large negative value that it is very unlikely to be hit by mistake.
	minInt: {"pragma threads = 10;",
		"pragma synchronous = normal;",
		"pragma soft_heap_limit=31457280"}, // that’s 30mb
	0: {"create table entities (pkey text primary key, value blob) without rowid;",
		"create table blobs (pkey primary key, value blob);",
		"create virtual table search using fts5(rkey unindexed, tags, authors, date, body, tokenize='porter', prefix='2');",
		"create table nbar (pkey text primary key, manifest text, sz int, data blob);"},
	1: {"create virtual table search_col using fts5vocab(search, col);",
		"create virtual table search_instance using fts5vocab(search, instance);"},
	2: {"delete from entities where pkey = '/keyring'"},
	3: {"create virtual table search_headings using fts5(pkey unindexed, content, prefix='3');"},
	4: {"update users set labels = json_insert(labels, '$[1]', 't.sftw/sysadmin_t');"},
	5: {},
}

const CurrentSchemaVersion = 6
