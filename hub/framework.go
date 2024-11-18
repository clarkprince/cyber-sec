package hub

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/prose"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

type Framework struct {
	ID       ulid.ULID       `cbor:"id"`
	UPN      string          `cbor:"upn" form:"upn"`
	Title    string          `cbor:"title" form:"title"`
	Owner    ulid.ULID       `cbor:"owner" `
	LastEdit time.Time       `cbor:"lastEdit"`
	DueDate  time.Time       `cbor:"duedate" form:"duedate"`
	Audit    bool            `cbor:"audit"`
	Link     ulid.ULID       `cbor:"link"`
	Content  CompressedBytes `cbor:"content" form:"content"`
}

func (f Framework) MarshalBinary() ([]byte, error) {
	type W Framework
	return cbor.Marshal(W(f))
}

func (f *Framework) UnmarshalBinary(dt []byte) error {
	type W Framework
	var w W
	if err := cbor.Unmarshal(dt, &w); err != nil {
		return err
	}
	*f = Framework(w)
	return nil
}

// FindFramework looks for a framework in DB based on the preds argument.
func FindFramework(ctx context.Context, ctn Executor, preds ...func(Framework) bool) (Framework, error) {
	frmws := make([]Framework, 1)
	if len(preds) == 0 {
		return Framework{}, errors.New("search criteria required")
	}
	frmws, err := ListPath(context.Background(), ctn, "/frameworks/", frmws, preds...)
	switch {
	case err != nil:
		return Framework{}, err
	case len(frmws) == 0:
		return Framework{}, storage.MissingEntry
	case len(frmws) > 1:
		return Framework{}, storage.DuplicateEntry
	}
	return frmws[0], nil
}

func (app *App) FrameworkAPI(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	const maxEditorSize = 100_000_000

	action := r.FormValue("action")
	if action == "create" {
		usr, err := FindOrCreateUser(ctx, app.db, app.Domain, iam.Profile{Name: ssn.UserName, ExternalID: ssn.UserName})
		if err != nil {
			tasks.SecureErr(ctx, w, err, "can not find or create such user")
			return
		}

		fw := Framework{ID: ulid.Make(), LastEdit: time.Now(), Owner: usr.ID}
		if err := PutValue(ctx, app.db, fmt.Sprint("/frameworks/", fw.ID), fw); err == nil {
			http.Redirect(w, r, "/policy?framework="+fw.ID.String(), http.StatusFound)
		} else {
			tasks.SecureErr(ctx, w, err, "cannot store framework")
		}
		return
	}

	id, err := ulid.ParseStrict(r.FormValue("framework"))
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid framework ID")
		return
	}

	fw, err := FindOne[Framework](ctx, app.db, fmt.Sprint("/frameworks/", id))
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid framework ID")
	}
	switch action {
	default:
		app.DisplayTemplate(ctx, ssn, w, r)
	case "save":
		if err := httpform.Unmarshal(r, &fw); err != nil {
			tasks.SecureErr(ctx, w, err, "invalid framework dataset")
		}
		if err := PutValue(ctx, app.db, fmt.Sprint("/frameworks/", id), fw); err == nil {
			w.WriteHeader(http.StatusNoContent)
		} else {
			tasks.SecureErr(ctx, w, err, "cannot store framework")
		}
	case "schedule":
		if err := httpform.Unmarshal(r, &fw); err != nil {
			tasks.SecureErr(ctx, w, err, "invalid audit dataset")
		}
		fw.ID = ulid.Make()
		fw.Audit = true
		fw.Link = id

		var ed prose.Editor
		if err := json.Unmarshal(fw.Content, &ed); err != nil {
			tasks.SecureErr(ctx, w, err, "invalid policy document")
			return
		}

		// TODO(rdo) stateful object for error handling
		ctx, err := app.db.Savepoint(ctx)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "cannot create a new audit: DB issue.")
			return
		}

		// TODO use ID in the notebooks too, and remove this.
		prof, err := FindOne[iam.User](ctx, app.db, fmt.Sprint("/users/", fw.Owner))
		if err != nil {
			tasks.SecureErr(ctx, w, err, "cannot create a new audit: invalid user")
			return
		}

		defer app.db.Rollback(ctx)

		for pb := prose.Pills[Notebook](&ed, prose.PillPlaybook); pb.Next(); {
			nb := pb.Value()
			nb.Origin = nb.ID
			nb.ID = ulid.Make()
			nb.Owner = prof
			nb.Created = time.Now()
			// TODO(rdo) bring in notebook content
			// TODO(rdo) understand why the rest is carried through
			if err := StoreNotebook(ctx, app.db, *nb); err != nil {
				tasks.SecureErr(ctx, w, err, "cannot create a new audit: DB issue.")
			}
		}
		fw.Content, err = json.Marshal(ed)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "invalid policy document")
			return
		}

		if err := PutValue(ctx, app.db, fmt.Sprint("/frameworks/", fw.ID), fw); err != nil {
			tasks.SecureErr(ctx, w, err, "cannot store audit")
			return
		}

		if err := app.db.Release(ctx); err != nil {
			tasks.SecureErr(ctx, w, err, "cannot store audit")
			return
		}

		tasks.AuditLogger.Info("new audit scheduled", "user", ssn.UserName)
		// Status 200 is required to pass the Location header to the client, and have the client perform the redirect.
		// See https://github.com/whatwg/fetch/issues/601 for additional background.
		http.Redirect(w, r, "/audit?framework="+fw.ID.String(), http.StatusOK)
	}
}

type vtPolicies struct {
	ID       string            `vtab:"id,filtered,hidden"`
	Title    sqlite.NullString `vtab:"title"`
	Owner    string            `vtab:"owner"`
	Content  json.RawMessage   `vtab:"content"`
	Type     string            `vtab:"type"`
	Link     sqlite.NullString `vtab:"link"`
	LastEdit string            `vtab:"lastedit"`
	DueDate  string            `vtab:"duedate"`

	app *App `vtab:"-"`
}

func (t vtPolicies) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[vtPolicies] {
	var rmax = 8000
	buf := make([]Framework, rmax)
	buf, err := ListPath(context.Background(), t.app.db, "/frameworks", buf)
	if err != nil {
		return sqlite.FromError[vtPolicies](err)
	}

	rv := make([]vtPolicies, len(buf))
	for i, v := range buf {
		rv[i] = vtPolicies{
			ID:       v.ID.String(),
			Title:    sqlite.NullString(v.Title),
			Owner:    v.Owner.String(),
			Content:  json.RawMessage(v.Content),
			Link:     sqlite.NullString(v.Link.String()),
			LastEdit: v.LastEdit.Format(time.RFC3339),
			DueDate:  v.DueDate.Format(time.RFC3339),
		}
		if v.Audit {
			rv[i].Type = "audit"
		} else {
			rv[i].Type = "framework"
		}
	}

	return sqlite.FromArray(rv)
}

// sneakpeek will return a fully formatted, HTML-rich view of the underlying framework.
// for now, the first title suffice
func sneakpeek(editorjs string) (string, error) {
	if len(editorjs) == 0 {
		return "", nil
	}

	var es prose.Editor
	if err := json.Unmarshal([]byte(editorjs), &es); err != nil {
		return "", err
	}

	p := &es
	for p != nil && p.Type != "heading" && p.Content != nil {
		p = p.Content[0]
	}

	return p.Text, nil
}
