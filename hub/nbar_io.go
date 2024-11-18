package hub

import (
	"context"
	"fmt"
	"time"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/nbar"
	"trout.software/kraken/webapp/internal/ulid"
)

type importer struct {
	readmanifest func(string, any) error

	app *App
}

type ImportNotes struct {
	OriginalID ulid.ULID
}

type importerror struct{ err error }

func (imp *importer) ImportPlaybook(ctx context.Context, pb *nbar.Playbook) (pberror error) {
	if err := imp.readmanifest(fmt.Sprint("/notebooks/", pb.ID), pb); err != nil {
		return fmt.Errorf("invalid playbook manifest: %w", err)
	}

	// panic mode for errors, synchronize at the playbook level
	defer func() {
		r := recover()
		if r == nil {
			return
		}

		if err, ok := r.(importerror); ok {
			pberror = err.err
		} else {
			panic(r)
		}
	}()

	ours := Notebook{
		ID:       ulid.Make(),
		LastEdit: time.Now(),
	}

	for i := range pb.Cell {
		ours.Cells = append(ours.Cells, imp.ImportCell(ctx, &pb.Cell[i]))
	}

	imp.ImportUser(ctx, &pb.Owner)

	return PutValue(ctx, imp.app.db, fmt.Sprint("/notebooks/", pb.ID), ours)
}

func (imp *importer) errf(msg string, args ...any) { panic(importerror{fmt.Errorf(msg, args...)}) }

func (imp *importer) ImportCell(ctx context.Context, cell *nbar.Cell) msg.Cell {
	if err := imp.readmanifest(fmt.Sprint("/cells/", cell.ID), cell); err != nil {
		imp.errf("reading manifest for cell %s: %w", cell.ID, err)
	}

	ours := msg.Cell{
		ID:      ulid.Make(),
		Created: cell.Created,
		Author:  imp.ImportUser(ctx, &cell.Author),
	}

	for i := range cell.Pivot {
		imp.ImportPivot(ctx, &cell.Pivot[i])
	}

	return ours
}

func (imp *importer) ImportPivot(ctx context.Context, pvt *nbar.Application) {
	err := imp.readmanifest(fmt.Sprint("/pivots/", pvt.ID), pvt)
	if err != nil {
		imp.errf("reading manifest for pivots %s: %w", pvt.ID, err)
	}

	// TODO(rdo) match on pivot expression
}

func (imp *importer) ImportUser(ctx context.Context, u *nbar.User) iam.User {
	err := imp.readmanifest(fmt.Sprint("/users", u.ID), u)
	if err != nil {
		imp.errf("reading user manifest: %w", err)
	}

	local, err := FindOrCreateUser(ctx, imp.app.db, imp.app.Domain, iam.Profile{
		Name: u.Name, ExternalID: u.Contact,
	})
	if err != nil {
		imp.errf("cannot find user %s: %w", u.Name, err)
	}

	return local
}

type exporter struct {
	writemanifest func(string, any) error

	err error // panic mode, resync at playbook
}

func (exp *exporter) ExportPlaybook(pb nbar.Playbook) {
	exp.err = exp.writemanifest(fmt.Sprint("/notebooks/", pb.ID), pb)

	for i := range pb.Cell {
		exp.ExportCell(pb.Cell[i])
	}
}

func (exp *exporter) ExportCell(cell nbar.Cell) {
	if exp.err != nil {
		return
	}

	exp.err = exp.writemanifest(fmt.Sprint("/cells", cell.ID), cell)

	for i := range cell.Pivot {
		exp.ExportPivot(cell.Pivot[i])
	}
}

func (exp *exporter) ExportPivot(pvt nbar.Application) {
	if exp.err != nil {
		return
	}

	exp.err = exp.writemanifest(fmt.Sprint("/pivots", pvt.ID), pvt)
}
