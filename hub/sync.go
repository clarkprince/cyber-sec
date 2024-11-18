package hub

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"time"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/nbar"
	"trout.software/kraken/webapp/hub/prose"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

const (
	errEmptyID      = "01HD3JNVF0SYAAE7EA47825R0K"
	errMissingEntry = "01HD3HRFNCE1PARJPTE6K5ZDC1"
)

// SynchError is the definition of an error that carries a ULID code to be read by the client and
// obligate the user interacting with the app to take action.
// Each Code is strictely linked to a user action.
type SynchError struct {
	Msg  string
	Code ulid.ULID
}

func (e SynchError) Error() string {
	return e.Msg
}

func (app *App) ExportForSynch(ctx context.Context, artifact ulid.ULID) (string, error) {
	ctx, task := tasks.New(context.Background(), "export")
	defer task.End()

	dbpath, err := os.CreateTemp("", "sync_"+artifact.String()+".nbar")
	if err != nil {
		return "", err
	}
	nbarExportDB, err := sqlite.OpenPool(dbpath.Name())
	if err != nil {
		return "", err
	}

	stn := nbarExportDB.Exec(ctx, `create table nbar (pkey text primary key, manifest blob) without rowid;`)
	if stn.Err() != nil {
		return "", stn.Err()
	}

	fw, err := FindOne[Framework](ctx, app.db, fmt.Sprint("/frameworks/", artifact.String()))
	if err != nil {
		return "", err
	}
	var ed prose.Editor
	if err := json.Unmarshal(fw.Content, &ed); err != nil {
		return "", err
	}

	b := new(bytes.Buffer)
	nbar.ToMfst(reflect.ValueOf(nbar.Framework{
		ID:       fw.ID,
		UPN:      fw.UPN,
		Title:    fw.Title,
		Owner:    nbar.User{ID: fw.Owner},
		Content:  fw.Content,
		Link:     fw.Link.String(),
		Audit:    fw.Audit,
		LastEdit: fw.LastEdit,
		DueDate:  fw.DueDate}), b)

	stn = nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?)", "nbar/framework"+artifact.String(), b.String())
	if stn.Err() != nil {
		return "", stn.Err()
	}

	for pb := prose.Pills[Notebook](&ed, prose.PillPlaybook); pb.Next(); {
		if err := app.exportNotebook(ctx, pb.Value().ID.String(), nbarExportDB); err != nil {
			return "", err
		}
	}

	tasks.Annotate(ctx, "export in file", dbpath.Name())

	return dbpath.Name(), nil
}

func (app *App) exportNotebook(ctx context.Context, nb string, nbarExportDB *sqlite.Connections) error {
	ctn := app.db
	notebook, err := FindOne[Notebook](ctx, ctn, "/notebooks/"+nb)
	if err != nil {
		return err
	}

	var nbarNotebook = nbar.Playbook{
		ID:       notebook.ID,
		Title:    notebook.Title,
		Owner:    nbar.User{ID: notebook.Owner.ID},
		Created:  notebook.Created,
		LastEdit: notebook.LastEdit,
		Cell:     make([]nbar.Cell, len(notebook.Cells)),
	}
	//register notebook owner
	if err := exportnbarUser(ctx, nbarExportDB, notebook.Owner.ID, notebook.Owner.Name, notebook.Owner.ExternalID); err != nil {
		return err
	}
	pivots := make(map[ulid.ULID]bool)

	for i, c := range notebook.Cells {
		nbarNotebook.Cell[i].ID = c.ID
		//Cells are kept as independent units within the nbar exported file
		nbarCell := nbar.Cell{
			ID:         c.ID,
			Author:     nbar.User{ID: c.Author.ID},
			Created:    c.Created,
			Timestamp:  c.Timestamp,
			DataSource: nbar.DataSource{ID: c.DataSource},
			Title:      c.Title,
		}

		if c.Author.ID != notebook.Owner.ID {
			if err := exportnbarUser(ctx, nbarExportDB, c.Author.ID, c.Author.Name, c.Author.ExternalID); err != nil {
				return err
			}
		}

		for _, p := range c.Pivots {
			if _, ok := pivots[p.Pivot]; !ok {
				pivots[p.Pivot] = true
				pvt, err := FindOne[Pivot](ctx, ctn, "/pivots/"+p.Pivot.String())
				if err != nil {
					return err
				}
				if pql, ok := pvt.Impl.(*PiQLPivot); ok {
					nbarPivot := nbar.Application{
						Pivot: nbar.Pivot{ID: p.Pivot, Exp: string(*pql)},
						On:    p.On[0],
					}
					b := new(bytes.Buffer)
					nbar.ToMfst(reflect.ValueOf(nbarPivot), b)
					stn := nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?)", "nbar/pivot"+p.Pivot.String(), b.String())
					if stn.Err() != nil {
						return stn.Err()
					}
					nbarCell.Pivot = append(nbarCell.Pivot, nbar.Application{Pivot: nbar.Pivot{ID: p.Pivot}})
				}
			}
		}
		rc := new(bytes.Buffer)
		nbar.ToMfst(reflect.ValueOf(nbarCell), rc)
		stn := nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?)", "nbar/cell"+nbarCell.ID.String(), rc.String())
		if stn.Err() != nil {
			return stn.Err()
		}
	}

	mfst := new(bytes.Buffer)
	nbar.ToMfst(reflect.ValueOf(nbarNotebook), mfst)

	stn := nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?)", "nbar/playbook"+nb, mfst.String())
	if stn.Err() != nil {
		return stn.Err()
	}

	return nil
}

func exportnbarUser(ctx context.Context, nbarExportDB Executor, userID ulid.ULID, userName, externalID string) error {
	owner := new(bytes.Buffer)
	nbar.ToMfst(reflect.ValueOf(nbar.User{ID: userID, Name: userName, Contact: externalID}), owner)
	stn := nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?)", "nbar/user"+userID.String(), owner.String())
	if stn.Err() != nil {
		return stn.Err()
	}
	return nil
}

func (app *App) syncPivot(ctx context.Context, pivot ulid.ULID, importDB Executor) (msg.PivotApplication, error) {
	var mfst string
	if err := importDB.Exec(ctx, "select manifest from nbar where pkey = ?", fmt.Sprintf("nbar/pivot%s", pivot.String())).ScanOne(&mfst); err != nil {
		return msg.PivotApplication{}, err
	}
	if len(mfst) == 0 {
		return msg.PivotApplication{}, fmt.Errorf("could not import pivot %s", pivot.String())
	}
	var ipivot nbar.Application
	if err := nbar.Unmarshal([]byte(mfst), &ipivot); err != nil {
		return msg.PivotApplication{}, err
	}

	var p Pivot
	p.Type = piqlpivotsig
	p.ID = pivot
	p.Name = ipivot.Exp
	p.Impl = PiQLPivot(ipivot.Exp)

	if err := PutValue(ctx, app.db, "/pivots/"+p.ID.String(), p); err != nil && err != storage.ConflictAvoided {
		return msg.PivotApplication{}, err
	}

	return msg.PivotApplication{Pivot: ipivot.ID, On: []string{ipivot.On}}, nil
}

func (app *App) syncCell(ctx context.Context, notebook, cell ulid.ULID, importDB Executor) (msg.Cell, error) {
	var mfst string
	if err := importDB.Exec(ctx, "select manifest from nbar where pkey =?", fmt.Sprintf("nbar/cell%s", cell.String())).ScanOne(&mfst); err != nil {
		return msg.Cell{}, err
	}
	if len(mfst) == 0 {
		return msg.Cell{}, fmt.Errorf("could not import cell %s", cell.String())
	}

	var iCell nbar.Cell
	if err := nbar.Unmarshal([]byte(mfst), &iCell); err != nil {
		return msg.Cell{}, err
	}

	// resolve user
	author, err := FindOrCreateAnonymousUser(ctx, app.db, app.Domain,
		iam.Profile{Name: iCell.Author.Name, ExternalID: iCell.Author.Name}, iCell.Author.ID)
	if err != nil {
		return msg.Cell{}, err
	}

	if _, err := syncDataSource(ctx, app.db, cell); err != nil {
		return msg.Cell{}, err
	}

	var pivots = make([]msg.PivotApplication, len(iCell.Pivot))
	for _, p := range iCell.Pivot {
		pivApp, err := app.syncPivot(ctx, p.ID, importDB)
		if err != nil {
			return msg.Cell{}, err
		}
		pivots = append(pivots, pivApp)
	}
	//As per specs: if value is zero, set local time,otherwise keep it
	var created = iCell.Created
	if iCell.Created.IsZero() {
		created = time.Now()
	}
	var timeStamp = iCell.Timestamp
	if iCell.Timestamp.IsZero() {
		timeStamp = time.Now()
	}
	var c = msg.Cell{
		ID:         cell,
		Author:     author,
		Pivots:     pivots,
		Created:    created,
		Timestamp:  timeStamp,
		DataSource: iCell.DataSource.ID,
		Notebook:   notebook,
		Title:      iCell.Title}
	return c, nil
}

func (app *App) syncNotebook(ctx context.Context, notebook ulid.ULID, importDB Executor) (Notebook, error) {
	var mfst string
	if err := importDB.Exec(ctx, "select manifest from nbar where pkey =?", fmt.Sprintf("nbar/playbook%s", notebook.String())).ScanOne(&mfst); err != nil {
		return Notebook{}, err
	}
	if len(mfst) == 0 {
		return Notebook{}, fmt.Errorf("could not import playbook %s", notebook.String())
	}

	var nb nbar.Playbook
	if err := nbar.Unmarshal([]byte(mfst), &nb); err != nil {
		return Notebook{}, err
	}

	//resolve user
	owner, err := FindOrCreateAnonymousUser(ctx, app.db, app.Domain,
		iam.Profile{Name: nb.Owner.Name, ExternalID: nb.Owner.Name}, nb.Owner.ID)
	if err != nil {
		return Notebook{}, err
	}

	//As per specs: if value is zero, set local time,otherwise keep it
	var created = nb.Created
	if nb.Created.IsZero() {
		created = time.Now()
	}
	var lastEdit = nb.LastEdit
	if nb.LastEdit.IsZero() {
		lastEdit = time.Now()
	}
	pl := Notebook{
		ID:       notebook,
		Title:    nb.Title,
		Cells:    make([]msg.Cell, len(nb.Cell)),
		Owner:    owner,
		Created:  created,
		LastEdit: lastEdit,
	}

	for i, c := range nb.Cell {
		pl.Cells[i].ID = c.ID
	}
	return pl, nil
}

// syncDataSource performs a strict match between a DataSource in DB with the imported DataSource in the manifest.
// when a match is not found the datasource can not be synched and an error message is sent.
func syncDataSource(ctx context.Context, ctn Executor, ID ulid.ULID) (DataSource, error) {
	var d nbar.DataSource
	if ID.IsZero() {
		return DataSource{}, SynchError{Msg: "Please, fill DataSource ID properly", Code: ulid.MustParse(errEmptyID)}
	}
	ds, err := FindOne[DataSource](ctx, ctn, fmt.Sprintf("/datasources/%s", d.ID))
	switch {
	case err == storage.MissingEntry:
		return DataSource{}, SynchError{Msg: "DataSource not found in DB", Code: ulid.MustParse(errMissingEntry)}
	case err != nil:
		return DataSource{}, err
	}
	return ds, nil
}

func (app *App) ImportForSynch(ctx context.Context, filepath string) error {
	idb, err := sqlite.OpenPool(filepath)
	if err != nil {
		return err
	}

	var artifacts []nbar.Framework
	rows := idb.Exec(ctx, "select pkey, manifest from nbar where pkey like 'nbar/framework%'")
	for rows.Next() {
		var mfst, id string
		rows.Scan(&id, &mfst)
		var fw nbar.Framework
		if err := nbar.Unmarshal([]byte(mfst), &fw); err != nil {
			return err
		}
		fw.ID = ulid.MustParse(id[len("nbar/framework"):])
		artifacts = append(artifacts, fw)
	}

	if len(artifacts) == 0 {
		tasks.AuditLogger.Info("no artifacts to be imported for file ", "file", filepath)
		return nil
	}

	for _, importedFrmw := range artifacts {
		//if the artifact already exists in our DB it wont be imported.
		framw, err := FindFramework(ctx, app.db, func(f Framework) bool { return f.UPN == importedFrmw.UPN })
		switch {
		case err == storage.DuplicateEntry:
			tasks.AuditLogger.Info("upn duplicated key in DB", "key", importedFrmw.UPN)
			return nil
		case err == storage.MissingEntry:
		case err != nil:
			return err
		case !framw.ID.IsZero():
			tasks.AuditLogger.Info("framework has already been imported")
			return nil
		}

		//sync user
		u, err := FindOrCreateAnonymousUser(ctx, app.db, app.Domain,
			iam.Profile{Name: importedFrmw.Owner.Name, ExternalID: importedFrmw.Owner.Name}, importedFrmw.Owner.ID)
		if err != nil {
			return err
		}
		var ed prose.Editor
		if err := json.Unmarshal(importedFrmw.Content, &ed); err != nil {
			return err
		}

		/*
			//[TO-DO]overwritting context here breaks idb not sure why ????
			// TODO(rdo) stateful object for error handling
					ctx, err = app.db.Savepoint(ctx)
					if err != nil {
						return err
					}
					defer app.db.Rollback(ctx)
		*/

		for pb := prose.Pills[Notebook](&ed, prose.PillPlaybook); pb.Next(); {
			nb := pb.Value()
			nb.Origin = nb.ID

			iPlaybook, err := app.syncNotebook(ctx, pb.Value().ID, idb)
			if err != nil {
				return err
			}
			//[TO-DO] should we update this??
			nb.Owner = iPlaybook.Owner
			nb.Created = iPlaybook.Created
			nb.LastEdit = iPlaybook.LastEdit

			for _, c := range iPlaybook.Cells {
				app.syncCell(ctx, iPlaybook.ID, c.ID, idb)
			}
			if err := StoreNotebook(ctx, app.db, *nb); err != nil {
				return err
			}
		}
		framw.Content, err = json.Marshal(ed)
		if err != nil {
			return err
		}
		framw.ID = importedFrmw.ID
		framw.UPN = importedFrmw.UPN
		framw.Title = importedFrmw.Title
		framw.Owner = u.ID
		framw.LastEdit = importedFrmw.LastEdit
		if importedFrmw.LastEdit.IsZero() {
			framw.LastEdit = time.Now()
		}
		framw.DueDate = importedFrmw.DueDate
		framw.Audit = importedFrmw.Audit
		//as per specs links of audits/policies are kept while they point to artifacts in DB
		//or within the import
		framw.Link, err = getArtifactLink(ctx, ulid.MustParse(importedFrmw.Link), app, artifacts)
		if err != nil {
			return err
		}

		err = PutValue(ctx, app.db, fmt.Sprint("/frameworks/", framw.ID), framw)
		switch {
		case err == storage.ConflictAvoided:
			tasks.AuditLogger.Info("audit previously imported by another process", "frmw", framw.ID.String())
		case err != nil:
			return err
		default:
			tasks.AuditLogger.Info("new audit imported", "frmw", framw.ID.String())
		}
		/*
			[TO-DO]
				if err := app.db.Release(ctx); err != nil {
					return err
				}
		*/
	}
	return nil
}

// artifactIsIdentifiable returns the given Link if the policy that the artifact is pointing to
// exists in the imported DB or in the server DB.
func getArtifactLink(ctx context.Context, link ulid.ULID, app *App, artifacts []nbar.Framework) (ulid.ULID, error) {
	for _, a := range artifacts {
		if a.ID == link {
			return link, nil
		}
	}
	_, err := FindFramework(ctx, app.db, func(f Framework) bool { return f.ID == link })
	switch {
	case err == storage.MissingEntry:
		return ulid.ULID{}, nil
	case err != nil:
		return ulid.ULID{}, err
	default:
		return link, nil
	}
}
