package hub

import (
	"context"
	"errors"
	"fmt"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

func ReadGrammar(b []byte) (sqlite.PointerValue, error) {
	var g driver.Grammar
	if err := cbor.Unmarshal(b, &g); err != nil {
		return sqlite.PointerValue{}, err
	}
	h, err := logstream.ParseGrammar(g.EBNF)

	return sqlite.AsPointer(&logstream.Grammar{G: h}), err
}

func (app App) CreateOrUpdateGrammar(ctx context.Context, grammar driver.Grammar) error {
	g, err := FindOne(ctx, app.db, "/grammars", func(g driver.Grammar) bool { return g.Name == grammar.Name })
	switch {
	case errors.Is(err, storage.MissingEntry):
		g = driver.Grammar{
			ID:   ulid.Make(),
			Name: grammar.Name,
		}

	case err != nil:
		return fmt.Errorf("cannot find grammar: %w", err)
	}
	g.EBNF = grammar.EBNF
	if err := PutValue(ctx, app.db, "/grammars/"+g.ID.String(), g); err != nil {
		return fmt.Errorf("creating new grammar: %w", err)
	}
	return nil
}

type vtGrammar struct {
	ID   string `vtab:"grammar"`
	Name string `vtab:"name"`

	app *App `vtab:"-"`
}

func (vt vtGrammar) Filter(_ int, _ sqlite.Constraints) sqlite.Iter[vtGrammar] {
	grms := make([]driver.Grammar, 300)
	grms, err := ListPath(context.Background(), vt.app.db, "/grammars", grms)
	if err != nil {
		return sqlite.FromError[vtGrammar](err)
	}
	return sqlite.TransformArray(grms, func(g driver.Grammar) vtGrammar {
		return vtGrammar{ID: g.ID.String(), Name: g.Name}
	})
}
