package hub

import (
	"context"
	"encoding/json"
	"errors"
	"expvar"
	"fmt"
	"net/http"
	"reflect"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/cells/aws"
	"trout.software/kraken/webapp/cells/journaltcl"
	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/cells/xlsx"

	"trout.software/kraken/webapp/cells/starlark"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/sqlite/stability"
	"trout.software/kraken/webapp/internal/ulid"
)

var datasourceTestConnectionError = expvar.NewMap("datasource_test_connection_error")

// knownSources is a registry of data sources known by name.
// it should not be access directly.
//
// TODO move to fully qualified names (e.g. ds:logstream:sftp)
var knownSources = map[string]reflect.Type{
	"s3log":             reflect.TypeOf(logstream.S3Stream{}),
	"awsassets":         reflect.TypeOf(aws.Assets{}),
	"starlark":          reflect.TypeOf(starlark.Script{}),
	"upload":            reflect.TypeOf(logstream.Upload{}),
	"filestream":        reflect.TypeOf(logstream.Filestream{}),
	"deleted":           reflect.TypeOf(logstream.Deleted{}),
	"journalctl":        reflect.TypeOf(journaltcl.JournalctlStream{}),
	"ds:logstream:sftp": reflect.TypeOf(logstream.SFTP{}),
	"excel":             reflect.TypeOf(xlsx.Excel{}),
	"snapshot":          reflect.TypeOf(logstream.Snaphot{}),
}

type configurableStreams interface {
	driver.HTTPConfigurable
	driver.Selectable
}

// NewSourceOfType returns a data source given the type tp.
func NewSourceOfType(tp string) configurableStreams {
	src, ok := knownSources[tp]
	if !ok {
		return nil
	}
	return reflect.New(src).Interface().(configurableStreams)
}

func (app *App) ListDataSources(ctx context.Context, ssn iam.Session, w http.ResponseWriter, r *http.Request) {
	ctx, task := tasks.New(ctx, "list-datasources")
	defer task.End()

	const maxSourcesInWebList = 30
	src := make([]DataSource, maxSourcesInWebList)
	src, err := ListPath(ctx, app.db, "/datasources", src, func(d DataSource) bool { return d.Type != "upload" })
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error finding datasources")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(src); err != nil {
		tasks.SecureErr(ctx, w, err, "Error encoding datasources")
		return
	}
}

const (
	defaultMaxMemory = 32 << 20 // 32 MB
)

func (app *App) DataSourceAPI(ctx context.Context, ssn iam.Session, w http.ResponseWriter, r *http.Request) {
	var res struct {
		Key, // created/updated datasource key
		Result, // "ok" or "error"
		Message string // error message if any
		Streams []ulid.ULID
	}
	var ds DataSource

	src := NewSourceOfType(r.PostFormValue("type"))
	if src == nil {
		http.Error(w, "no such datasource type", http.StatusBadRequest)
		return
	}
	src.Init(r)
	ds.Type = r.PostFormValue("type")
	ds.Config = src

	switch r.PostFormValue("action") {
	case "save":
		// get or assign key
		ds.Key = r.PostFormValue("key")
		if ds.Key == "" {
			ds.Key = ulid.Make().String()
		}
		res.Key = ds.Key
		if g := r.PostFormValue("grammar"); g != "" {
			grm, err := ulid.Parse(r.PostFormValue("grammar"))
			// ErrDataSize means no grammar => zero value instead
			if err != nil && !errors.Is(err, ulid.ErrDataSize) {
				http.Error(w, "no such grammar", http.StatusBadRequest)
				return
			}
			ds.Grammar = grm
		}

		if err := app.saveDatasource(ctx, ssn, app.db, w, r, &ds); err != nil {
			res.Result = "error"
			res.Message = "cannot add/update data source"
			tasks.Annotate(ctx, "err", err)
		} else {
			res.Streams = make([]ulid.ULID, len(ds.Streams))
			for i, s := range ds.Streams {
				res.Streams[i] = s.ID
			}
			res.Result = "ok"
		}
	case "test":
		err := src.Test(ctx, ssn)
		if err != nil {
			res.Result = "error"
			res.Message = err.Error()
			datasourceTestConnectionError.Add(err.Error(), 1)
			// TODO: Better grouping of expvar errors
			// https://www.notion.so/trout-software/rx-browser-Most-of-the-time-notifications-do-not-appear-when-a-test-connection-fails-in-data-sourc-249f87708a9b4f3eb26dac2697852441?pvs=4#0986e27677d24eb08c1493ac58a44d00
			tasks.Annotate(ctx, "err", err)
		} else {
			res.Result = "ok"
		}
	case "delete":
		key := r.PostFormValue("key")
		if key != "" {
			id, err := ulid.Parse(key)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "when parsing key")
				return
			}

			ds, err := FindOne[DataSource](ctx, app.db, fmt.Sprintf("/datasources/%s", id))
			if err != nil {
				tasks.SecureErr(ctx, w, err, "when finding file")
				return
			}

			// if the datasource is a upload, delete the file
			// when file is not found, ignore the error
			if ds.Type == "upload" {
				if err := logstream.DeleteUpload(src.(*logstream.Upload)); err != nil {
					tasks.Annotate(ctx, "", err)
				}
			}

			err = app.db.Exec(ctx, "DELETE FROM entities WHERE pkey = ?", fmt.Sprintf("/datasources/%s", id)).Err()
			if err != nil {
				tasks.SecureErr(ctx, w, err, "when deleting datasource")
				return
			}
		}

	default:
		http.Error(w, "unknown action: "+r.PostFormValue("action"), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(res)
}

// Create a new datasource or update an existing one
// TODO don’t rely on the side-effect of setting streams
func (app *App) saveDatasource(ctx context.Context, ssn iam.Session, ctn Executor, w http.ResponseWriter, r *http.Request, ds *DataSource) error {
	d, err := FindOne[DataSource](ctx, app.db, "/datasources/"+ds.Key)
	if err != nil && !errors.Is(err, storage.MissingEntry) {
		return err
	}
	g0s := make(map[string]ulid.ULID, len(d.Streams))
	for _, s := range d.Streams {
		g0s[s.Type] = s.ID
	}

	r.ParseMultipartForm(defaultMaxMemory)

	// merge existing fields and updated fields to build a valid datasource
	// leave untouched fields as is
	// TODO: let’s reflect this kind of code out
	ds.Title = formValueOr(r, "title", d.Title)
	ds.Description = formValueOr(r, "description", d.Description)
	ds.Color = formValueOr(r, "color", d.Color)
	ds.Streams = d.Streams

	if r.FormValue("grammar") != "" {
		ds.Grammar, err = ulid.ParseStrict(r.FormValue("grammar"))
		if err != nil {
			return err
		}
	}

	// Test then Stream is used to allow data sources to selectively enable streams
	// cf spec of [driver.MultiStream]
	ds.Config.Test(ctx, ssn)
	streams := ds.Config.Streams()
	for i, s := range streams {
		if id, ok := g0s[s.Type]; ok {
			streams[i].ID = id
		} else {
			streams[i].ID = ulid.Make()
		}
	}
	ds.Streams = streams

	return PutValue(ctx, app.db, "/datasources/"+ds.Key, ds)
}

func formValueOr(r *http.Request, key string, fallback string) string {
	vs := r.Form[key]
	if len(vs) == 0 {
		return fallback
	}
	return vs[0]
}

// DataSource is the internal type used when storing configured data source into SQLite.
// It implements additional methods to know how to correctly read the type back and fro.
//
// Note that the underlying driver will be serialized using cbor.
// Implement a custom [encoding.BinaryMarshaler] method if you need to do something else.
type DataSource struct {
	_ stability.SerializedValue

	Type        string
	Config      configurableStreams
	Title       string
	Description string
	Key         string
	Grammar     ulid.ULID
	Color       string

	Streams []driver.Stream
}

func (w DataSource) MarshalBinary() ([]byte, error) {
	type W DataSource
	return cbor.Marshal(W(w))
}

func (w *DataSource) UnmarshalBinary(dt []byte) error {
	type W struct {
		Type        string
		Title       string
		RawCfg      cbor.RawMessage `cbor:"Config"`
		Description string
		Key         string
		Color       string
		Grammar     ulid.ULID

		Streams []driver.Stream
	}
	var t W

	if err := cbor.Unmarshal(dt, &t); err != nil {
		return fmt.Errorf("cannot read wrapper: %w", err)
	}
	w.Type = t.Type
	w.Title = t.Title
	w.Description = t.Description
	w.Streams = t.Streams
	w.Key = t.Key
	w.Color = t.Color
	w.Grammar = t.Grammar

	w.Config = NewSourceOfType(t.Type)
	return cbor.Unmarshal(t.RawCfg, w.Config)
}

type vtDataSources struct {
	ID          string `vtab:"id,filtered"`
	Type        string `vtab:"type"`
	Title       string `vtab:"title"`
	Description string `vtab:"description"`

	Config  json.RawMessage `vtab:"config"`
	Streams json.RawMessage `vtab:"streams"`

	app *App `vtab:"-"`
}

func (vt vtDataSources) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[vtDataSources] {
	dss := make([]DataSource, 4000)
	dss, err := ListPath(context.Background(), vt.app.db, "/datasources", dss)
	if err != nil {
		return sqlite.FromError[vtDataSources](err)
	}

	rv := make([]vtDataSources, len(dss))
	for i, v := range dss {
		rv[i] = vtDataSources{
			ID:          v.Key,
			Type:        v.Type,
			Title:       v.Title,
			Description: v.Description,
		}
		rv[i].Config, err = json.Marshal(v.Config)
		if err != nil {
			return sqlite.FromError[vtDataSources](err)
		}
		rv[i].Streams, err = json.Marshal(v.Streams)
		if err != nil {
			return sqlite.FromError[vtDataSources](err)
		}
	}

	return sqlite.FromArray(rv)
}
