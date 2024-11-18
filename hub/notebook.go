package hub

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"expvar"
	"fmt"
	"hash/maphash"
	"io"
	"net/http"
	"strings"
	"time"

	"log/slog"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

type Notebook = msg.Playbook
type Manifest = msg.Cell
type Tag = msg.Tag

var apicalls = expvar.NewMap("notebooklegacy")

// Display an existing playbook, or create new one and display it
func (app *App) OpenNotebook(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	const nbpfix = "/notebook/"
	if !strings.HasPrefix(r.URL.Path, nbpfix) {
		panic("handler registered in the wrong path " + r.URL.Path)
	}
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	apicalls.Add(r.URL.Path, 1)

	if r.URL.Path == nbpfix+"create" {
		if err := ssn.CheckAccess(iam.PermPlaybookCreate, iam.ResourceLabel); err != nil {
			tasks.AuditLogger.Info("access denied: creating playbook", "user", ssn.UserName)
			http.Error(w, "access denied", http.StatusForbidden)
			return
		}
		// keep in sync with api create
		user, err := FindOrCreateUser(ctx, app.db, app.Domain, iam.Profile{Name: ssn.UserName, ExternalID: ssn.UserName})
		if err != nil {
			tasks.SecureErr(ctx, w, err, "cannot find or create user")
		}
		nb := Notebook{ID: ulid.Make(), Created: time.Now(), Owner: user}
		if err := StoreNotebook(ctx, app.db, nb); err != nil {
			tasks.SecureErr(ctx, w, err, "cannot save notebook")
		}

		http.Redirect(w, r, nbpfix+nb.ID.String(), http.StatusFound)
		return
	}

	idRouteParam := strings.TrimPrefix(r.URL.Path, nbpfix)
	id, err := ulid.ParseStrict(idRouteParam)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid notebook ID:"+idRouteParam)
		return
	}

	nb, err := FindOne[Notebook](ctx, app.db, "/notebooks/"+id.String())
	if err != nil {
		ssn.SendNotification(fmt.Errorf("error finding notebook: %s", err))
		http.Redirect(w, r, "/home", http.StatusFound)
		return
	}

	tpl := app.templ.get("notebook")
	if tpl == nil {
		http.Error(w, "broken link", http.StatusNotFound)
		return
	}

	if err := tpl.Execute(w, RenderContext{
		Context:  ctx,
		Session:  ssn,
		Notebook: nb,
		Conn:     app.db,
	}); err != nil {
		tasks.SecureErr(ctx, w, err, "cannot execute template")
	}
}

func (app *App) ServeCellData(ctx context.Context, ssn *iam.Session, wtr http.ResponseWriter, rq *http.Request) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	var cell Manifest
	switch rq.Header.Get("content-type") {
	case "application/cbor":
		if err := cbor.NewDecoder(rq.Body).Decode(&cell); err != nil {
			tasks.SecureErr(ctx, wtr, err, "invalid payload")
			return
		}
	case "application/json":
		if err := json.NewDecoder(rq.Body).Decode(&cell); err != nil {
			tasks.SecureErr(ctx, wtr, err, "invalid payload")
			return
		}
	}

	tasks.Annotate(ctx, "notebook-id", cell.Notebook)

	ours, err := FindCell(ctx, app.db, cell)
	if err != nil {
		tasks.SecureErr(ctx, wtr, err, "invalid notebook")
		return
	}
	if cell.Pattern != "" {
		tasks.Annotate(ctx, "pattern", cell.Pattern)
		grm, err := mdt.CompilePattern(cell.Pattern)
		if err != nil {
			http.Error(wtr, err.Error(), http.StatusBadRequest)
			return
		}
		cell.Grammar = grm.PrettyPrint("root")
	}

	if !cell.ForceReload && cellSignature(ours) == cellSignature(cell) {
		tasks.Annotate(ctx, "cell-data", "save-only")
		if err := StoreCell(ctx, app.db, cell.Notebook, cell, ssn.User, nil); err != nil {
			tasks.SecureErr(ctx, wtr, err, "cannot save cell")
		}

		wtr.WriteHeader(http.StatusNoContent)
		return
	}

	tasks.Annotate(ctx, "cell-data", "refresh-content")

	if err := StoreCell(ctx, app.db, cell.Notebook, cell, ssn.User, nil); err != nil {
		tasks.SecureErr(ctx, wtr, err, "cannot save cell")
		return
	}

	iter, err := startQuery(ctx, &cell, app.db, ssn)
	if err != nil {
		tasks.SecureErr(ctx, wtr, err, "cannot run query")
		return
	}
	wtr.Header().Set("Content-Type", "application/cbor")

	var w io.WriteCloser
	if acceptsGZ(rq.Header.Get("Accept-Encoding")) {
		wtr.Header().Set("Content-Encoding", "gzip")
		w = gzip.NewWriter(wtr)
	} else {
		w = nopCloser{wtr}
	}

	enc := cbor.NewEncoder(w)
	enc.StartIndefiniteArray()

	for i := 0; i < 10_000 && iter.Next(); i++ {
		enc.Encode(iter.Record())
	}
	enc.EndIndefinite()
	w.Close()

	if err := iter.Err(); err != nil {
		tasks.Annotate(ctx, "", err)
	}
}

func (app *App) SnapshotAPI(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	action := r.URL.Query().Get("action")

	switch action {
	case "save":
		app.TakeSnapshot(ctx, ssn, w, r)
	case "list":
		app.ListSnapshots(ctx, ssn, w, r)
	}
}

func (app *App) TakeSnapshot(ctx context.Context, ssn *iam.Session, wtr http.ResponseWriter, rq *http.Request) {
	var cell Manifest
	if err := json.NewDecoder(rq.Body).Decode(&cell); err != nil {
		tasks.SecureErr(ctx, wtr, err, "invalid payload")
		return
	}
	currentTime := time.Now()
	cell.Snapshot = &currentTime

	snapshot := Snaphot{
		ID:   ulid.Make(),
		Cell: cell,
	}

	PutValue(ctx, app.db, "/cells/"+cell.ID.String()+"/snapshots/"+snapshot.ID.String(), snapshot)
	app.StoreSnapshotData(ctx, ssn, wtr, rq, cell)

	json.NewEncoder(wtr).Encode(snapshot)
}

func (app *App) StoreSnapshotData(ctx context.Context, ssn *iam.Session, wtr http.ResponseWriter, rq *http.Request, cell msg.Cell) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	tasks.Annotate(ctx, "snapshot-data", "refresh-content")

	iter, err := startQuery(ctx, &cell, app.db, ssn)
	if err != nil {
		tasks.SecureErr(ctx, wtr, err, "cannot run query")
		return
	}

	var w *SnapshotWriter
	if acceptsGZ(rq.Header.Get("Accept-Encoding")) {
		w = &SnapshotWriter{writer: gzip.NewWriter(wtr)}
	} else {
		w = &SnapshotWriter{writer: nopCloser{wtr}}
	}

	enc := cbor.NewEncoder(w)
	enc.StartIndefiniteArray()

	for i := 0; i < 10_000 && iter.Next(); i++ {
		enc.Encode(iter.Record())
	}
	enc.EndIndefinite()
	w.Flush()

	if err := iter.Err(); err != nil {
		tasks.Annotate(ctx, "", err)
	}
}

func (app *App) ListSnapshots(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, rq *http.Request) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	var cell msg.Cell
	if err := json.NewDecoder(rq.Body).Decode(&cell); err != nil {
		tasks.SecureErr(ctx, w, err, "invalid payload")
		return
	}

	snapshots := make([]Snaphot, 20)
	snapshots, err := ListPath[Snaphot](context.Background(), ssn.UnlockedStorage.Executor, "/cells/"+cell.ID.String(), snapshots)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "cannot find snapshot")
		return
	}
	json.NewEncoder(w).Encode(snapshots)
}

func acceptsGZ(hdr string) bool {
	accepts := strings.Split(hdr, ", ")
	for _, a := range accepts {
		// drop q=xxx
		i := strings.IndexRune(a, ';')
		if i != -1 {
			a = a[:i]
		}
		if a == "gzip" {
			return true
		}
	}
	return false
}

type nopCloser struct{ w io.Writer }

func (c nopCloser) Write(dt []byte) (int, error) { return c.w.Write(dt) }
func (c nopCloser) Close() error                 { return nil }

var pivotsSeed = maphash.MakeSeed()

func cellSignature(m Manifest) uint64 {
	var h maphash.Hash
	h.SetSeed(pivotsSeed)
	for _, p := range m.Pivots {
		for _, o := range p.On {
			h.WriteString(o)
		}
		h.Write(p.Pivot.Bytes())
	}
	h.WriteString(m.Grammar)
	return h.Sum64()
}

func startQuery(ctx context.Context, cell *Manifest, db Executor, ssn *iam.Session) (driver.Iter, error) {
	ctx, tsk := tasks.New(ctx, "qng:build-query")
	defer tsk.End()

	var ds DataSource
	{
		dsQuery := `select value from entities, streams_in(entities.value)
					  where pkey like '/datasources/%' and streams_in.ulid = ?`
		err := db.Exec(ctx, dsQuery, cell.DataSource).ScanOne(&ds)
		switch {
		case errors.Is(err, io.EOF):
			// if the data source is deleted, we default to a deleted source
			ds.Config = NewSourceOfType("deleted")
		case err != nil:
			return nil, err
		}
	}

	var stream driver.Stream
	for _, s := range ds.Streams {
		if s.ID == cell.DataSource {
			stream = s
		}
	}

	var grm mdt.Grammar
	if cell.Grammar != "" {
		tasks.Annotate(ctx, "grammar", "custom")
		grm, _ = mdt.ParseGrammar(cell.Grammar) // TODO(rdo) stop back and fro
	} else {
		if !ds.Grammar.IsZero() {
			tasks.Annotate(ctx, "grammar", ds.Grammar)
		}

		g, err := FindOne[driver.Grammar](ctx, db, "/grammars/"+ds.Grammar.String())
		switch {
		case errors.Is(err, storage.MissingEntry):
			grm = anygram
		case err != nil:
			tasks.Annotate(ctx, "", err)
			return nil, err
		case err == nil:
			// the grammar is always well-known
			grm, _ = mdt.ParseGrammar(g.EBNF)
		}
	}

	var pivots piql.Pivots
	for _, pivot := range cell.Pivots {
		pvt, err := FindOne[Pivot](ctx, db, "/pivots/"+pivot.Pivot.String())
		if err != nil {
			return nil, fmt.Errorf("finding pivot=%s: %w", pivot.Pivot.String(), err)
		}
		if pql, ok := pvt.Impl.(*PiQLPivot); ok {
			if len(pivot.On) == 0 {
				continue // not applied
			}
			p, err := piql.NewPivot(string(*pql), pivot.On[0])
			if err != nil {
				slog.Error("cannot apply pivot", "piql", *pql, "err", err)
			}
			if len(p.On) > 0 {
				pivots = append(pivots, p)
			}
		}
	}

	s2, ok := ds.Config.(driver.Selectable)
	if !ok {
		return nil, fmt.Errorf("data source does not implement the new Impeller API datasource=%s", ds.Key)
	}

	var ng piql.Evaluator
	dst := ng.MatchRules(pivots)
	var iter driver.Iter
	if sh, ok := ds.Config.(shards.Sharded); ok {
		patterns := []shards.Pattern{shards.Pattern(sh.ShardPattern())}
		for _, p := range pivots {
			patterns = p.ExpandTemplate(p.On, patterns)
		}
		parts := make([]driver.Iter, len(patterns))
		for i, s := range patterns {
			ss, err := shards.CompileWithWildcards(string(s))
			if err != nil {
				return nil, fmt.Errorf("internal error: cannot compile string %q: %w", s, err)
			}
			parts[i] = s2.Select(stream, ssn, grm, shards.Shard(ss), pivots)
		}
		iter = driver.MultiIter(parts...)
	} else {
		iter = s2.Select(stream, ssn, grm, "", pivots)
	}
	go ng.Run(ctx, iter, grm)
	return dst, nil
}

var anygram = mdt.MustParseGrammar(`root = any . any = _ .`)

type TemplateExpander interface {
	ExpandTemplate(shard string, patterns []string) []string
}

type pshards []string

func (s pshards) SQL(qbuf *strings.Builder) []any {
	if len(s) == 0 {
		return []any{}
	}
	var args []any
	qbuf.WriteString(` and "main"."pattern" in (`)
	for i, path := range s {
		if i == len(s)-1 {
			qbuf.WriteString(`?)`)
		} else {
			qbuf.WriteString(`?, `)
		}
		args = append(args, path)
	}
	return args
}

// getShardName returns the shard value and true if it is a shard.
//
// By specification only shards in the top level are accepted
func getShardName(pivot msg.PivotApplication) (string, bool) {
	if len(pivot.On) == 0 {
		return "", false
	}
	var path = pivot.On[0]
	const topLevel = "$."
	const fullPrefix = topLevel + string(mdt.ShardPrefix)
	if !strings.HasPrefix(path, fullPrefix) {
		return path, false
	}
	return path[len(fullPrefix):], true
}

// NotebookAPI is a unified endpoint to store a notebook.
func (app *App) NotebookAPI(ctx context.Context, ssn iam.Session, w http.ResponseWriter, r *http.Request) {
	action := r.URL.Query().Get("action")

	var nb Notebook
	if err := json.NewDecoder(r.Body).Decode(&nb); err != nil {
		tasks.SecureErr(ctx, w, err, "invalid payload")
		return
	}

	switch action {
	case "create":
		// keep in sync with ui create
		user, err := FindOrCreateUser(ctx, app.db, app.Domain, iam.Profile{Name: ssn.UserName, ExternalID: ssn.UserName})
		if err != nil {
			tasks.SecureErr(ctx, w, err, "cannot find or create user")
			return
		}
		// we ignore the request content and create a new empty notebook
		nb := Notebook{ID: ulid.Make(), Created: time.Now(), Owner: user}
		if err := StoreNotebook(ctx, app.db, nb); err != nil {
			tasks.SecureErr(ctx, w, err, "cannot save notebook")
			return
		}
		json.NewEncoder(w).Encode(nb)
		return
	case "archive":
		nb.Archived = true
		err := StoreNotebook(ctx, app.db, nb)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "cannot save notebook")
		}
		return
	}

	if action == "read" {
		ours, err := FindOne[Notebook](ctx, app.db, "/notebooks/"+nb.ID.String())
		if err != nil {
			tasks.SecureErr(ctx, w, err, "cannot read notebook")
		}
		json.NewEncoder(w).Encode(ours)
		return
	}

	// save is used by the client to ask the server for new cells, we fill in the metadata
	for i, c := range nb.Cells {
		if c.ID.IsZero() {
			user, err := FindOrCreateUser(ctx, app.db, app.Domain, msg.Profile{Name: ssn.UserName, ExternalID: ssn.UserName})
			if err != nil {
				tasks.SecureErr(ctx, w, err, "cannot find user")
				return
			}

			nb.Cells[i].ID = ulid.Make()
			nb.Cells[i].Author = user
			nb.Cells[i].Timestamp = time.Now()
		}
	}
	nb.LastEdit = time.Now()
	// action=save
	if err := StoreNotebook(ctx, app.db, nb); err != nil {
		tasks.SecureErr(ctx, w, err, "cannot save notebook")
	}
}

func (app *App) EditorAPI(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	const maxEditorSize = 100_000_000

	action := r.URL.Query().Get("action")
	notebook := r.URL.Query().Get("notebook")

	nb, err := ulid.ParseStrict(notebook)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid notebook ID")
		return
	}

	switch action {
	case "read":
		content, err := FindOne[CompressedBytes](ctx, app.db, "/notebooks/data/"+nb.String())
		switch {
		case errors.Is(err, storage.MissingEntry):
			w.WriteHeader(http.StatusNoContent)
			return
		case err != nil:
			tasks.SecureErr(ctx, w, err, "invalid notebook ID")
			return
		}

		io.Copy(w, bytes.NewReader(content))
	case "save":
		var buf bytes.Buffer
		io.Copy(&buf, io.LimitReader(r.Body, maxEditorSize))
		if err := StoreEditor(ctx, app.db, nb, buf.String()); err != nil {
			tasks.SecureErr(ctx, w, err, "cannot save editor")
			return
		}
	}
}

var ClosedErrors = expvar.NewMap("notebook_data_errors")

//go:generate constrainer vtPlaybooks
type vtPlaybooks struct {
	Playbook string `vtab:"playbook,filtered"`
	Title    string `vtab:"title"`
	Archived bool   `vtab:"archived,filtered"`
	Created  string `vtab:"created"`

	Cells json.RawMessage `vtab:"cells"`

	app *App `vtab:"-"`
}

func (vt vtPlaybooks) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[vtPlaybooks] {
	if id, ok := vt.GetPlaybook(cs); ok {
		pb, err := FindOne[Notebook](context.Background(), vt.app.db, fmt.Sprint("/notebooks/", id))
		if err != nil {
			return sqlite.FromError[vtPlaybooks](err)
		}
		rv := vtPlaybooks{Playbook: id, Title: pb.Title, Archived: pb.Archived, Created: pb.Created.Format(time.RFC3339)}
		rv.Cells, err = json.Marshal(pb.Cells)
		if err != nil {
			return sqlite.FromError[vtPlaybooks](err)
		}
		return sqlite.FromOne(rv)
	}

	var filters []func(Notebook) bool

	if arch, ok := vt.GetArchived(cs); ok {
		filters = append(filters, func(n Notebook) bool { return n.Archived == arch })
	}

	pbs := make([]Notebook, 300)
	pbs, err := ListPath(context.Background(), vt.app.db, "/notebooks", pbs, filters...)
	if err != nil {
		return sqlite.FromError[vtPlaybooks](err)
	}

	rv := make([]vtPlaybooks, len(pbs))
	for i, v := range pbs {
		rv[i] = vtPlaybooks{Playbook: v.ID.String(), Title: v.Title, Archived: v.Archived, Created: v.Created.Format(time.RFC3339)}
		rv[i].Cells, err = json.Marshal(v.Cells)
		if err != nil {
			sqlite.FromError[vtPlaybooks](err)
		}
	}

	return sqlite.FromArray(rv)
}
