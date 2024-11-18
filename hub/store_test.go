package hub

import (
	"context"
	"log/slog"
	"os"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

func init() {
	// replace with a simpler form for debugging
	_storeLog = slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		AddSource: true,
		Level:     slog.LevelWarn,
	}))
}

// wireLocalDB is a test helper attaching a SQLite database to the current application.
// The database schema always match version.
// A mock domain is registered under the name "example.com"
func wireLocalDB(t interface {
	TempDir() string
	Helper()
	Fatal(...any)
}, app *App, version int, exts ...func(sqlite.SQLITE3)) {
	t.Helper()

	exts = append(exts,
		storage.DropLastElement,
		sqlite.RegisterTable("users", vtUsers{app: app}),
		storage.ObsSecrets("obs_secrets", &app.keyring),
	)

	db, err := sqlite.OpenPool(t.TempDir()+"/db", exts...)
	if err != nil {
		t.Fatal("opening database", err)
	}
	app.db = db
	dmn := iam.Domain{Name: "example.com", ID: ulid.Make()}
	app.Domain = dmn.Name
	if err := app.EnsureSQLiteSchema(version); err != nil {
		t.Fatal("migrating schema", err)
	}
	app.KeyringInit(dmn.ID, func(s string) string { return t.TempDir() + "/" + s })

	storage.PutValue(context.Background(), app.db, "/domain", dmn)
}
