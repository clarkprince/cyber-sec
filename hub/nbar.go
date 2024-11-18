package hub

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

func (app *App) NBarAPI(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	action := r.FormValue("action")
	nb := r.FormValue("notebook")

	switch action {
	case "export":
		ExportNBar(ctx, app.db, ssn, w, r, nb)
		return
	case "import":
		ImportNBar(ctx, app, ssn, w, r)
		return
	case "replace":
		HTTPReplace(ctx, app.db, ssn, w, r)
		return
	}
}

func ArchiveNotebook(ctx context.Context, ctn Executor, nb Notebook) error {
	manifest := SerializeManifest(nb)
	buf, err := FindOne[CompressedBytes](ctx, ctn, "/notebooks/data/"+nb.ID.String())
	if err != nil {
		return fmt.Errorf("error finding notebook data: %w", err)
	}

	if err := ctn.Exec(ctx, "insert into nbar (pkey, manifest, sz, data) values (?, ?, ?, ?) on conflict do update set manifest = excluded.manifest, sz=excluded.sz, data=excluded.data",
		"/notebooks/"+nb.ID.String(), manifest, 0, buf).Err(); err != nil {
		return fmt.Errorf("action=%q notebook=%s err=%w", "inset_nbar", nb.ID, err)
	}
	return nil
}

func ArchiveCell(ctx context.Context, ctn Executor, cell Manifest) error {
	manifest := SerializeManifest(cell)
	if err := ctn.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?) on conflict do update set manifest = excluded.manifest, sz=excluded.sz, data=excluded.data",
		"/cells/"+cell.ID.String(), manifest).Err(); err != nil {
		return fmt.Errorf("action=%q cell=%s err=%w", "inset_nbar", cell.ID, err)
	}
	return nil
}

func ArchivePivot(ctx context.Context, ctn Executor, p msg.PivotApplication) error {
	pivot, err := FindOne[Pivot](ctx, ctn, "/pivots/"+p.Pivot.String())
	if err != nil {
		return fmt.Errorf("error finding pivot: %w", err)
	}

	manifest := SerializeManifest(pivot.PivotDefinition)
	if err := ctn.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?) on conflict do update set manifest = excluded.manifest, sz=excluded.sz, data=excluded.data",
		"/pivots/"+pivot.ID.String(), manifest).Err(); err != nil {
		return fmt.Errorf("action=%q pivot=%s err=%w", "inset_nbar", pivot.ID, err)
	}

	return nil
}

func ExportNBar(ctx context.Context, ctn Executor, ssn *iam.Session, w http.ResponseWriter, r *http.Request, nb string) {
	notebook, err := FindOne[Notebook](ctx, ctn, "/notebooks/"+nb)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error reading the notebook:")
		return
	}

	err = ArchiveNotebook(ctx, ctn, notebook)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error archiving the notebook:")
		return
	}
	for _, cell := range notebook.Cells {
		err := ArchiveCell(ctx, ctn, cell)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "Error archiving the cell:")
			return
		}

		for _, p := range cell.Pivots {
			err := ArchivePivot(ctx, ctn, p)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "Error archiving the pivot:")
				return
			}
		}
	}

	dbpath, err := os.CreateTemp("", notebook.ID.String()+".nbar")
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Cannot create database")
		return
	}
	nbarExportDB, err := sqlite.Open(dbpath.Name())
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error creating the new database:")
		return
	}

	stn := nbarExportDB.Exec(ctx, `create table nbar (pkey text primary key, manifest, sz, data blob) without rowid;`)
	if stn.Err() != nil {
		tasks.SecureErr(ctx, w, stn.Err(), "Error creating the nbar table in the new database: ")
		return
	}

	var id, mfst, sz string
	var data CompressedBytes
	if err := ctn.Exec(ctx, "select pkey, manifest, sz, data from nbar where pkey like ?", "/notebooks/"+nb).ScanOne(&id, &mfst, &sz, &data); err != nil {
		tasks.SecureErr(ctx, w, err, "Error reading the nbar from the database:")
		return
	}

	stn = nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest, sz, data) values (?, ?, ?, ?)", id, mfst, sz, data)
	if stn.Err() != nil {
		tasks.SecureErr(ctx, w, stn.Err(), "Error inserting the notebook into the new database:")
		return
	}

	for _, cell := range notebook.Cells {
		if err := ctn.Exec(ctx, "select pkey, manifest from nbar where pkey like ?", "/cells/"+cell.ID.String()).ScanOne(&id, &mfst); err != nil {
			tasks.SecureErr(ctx, w, err, "Error reading the nbar from the database:")
			return
		}

		stn = nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?)", id, mfst)
		if stn.Err() != nil {
			tasks.SecureErr(ctx, w, stn.Err(), "Error inserting the cell into the new database:")
			return
		}

		for _, p := range cell.Pivots {
			if err := ctn.Exec(ctx, "select pkey, manifest from nbar where pkey like ?", "/pivots/"+p.Pivot.String()).ScanOne(&id, &mfst); err != nil {
				tasks.SecureErr(ctx, w, err, "Error reading the nbar from the database:")
				return
			}

			stn = nbarExportDB.Exec(ctx, "insert into nbar (pkey, manifest) values (?, ?)", id, mfst)
			if stn.Err() != nil {
				tasks.SecureErr(ctx, w, stn.Err(), "Error inserting the pivot into the new database:")
				return
			}
		}
	}

	w.Header().Set("Content-Disposition", "attachment; filename="+notebook.ID.String()+".nbar")
	http.ServeFile(w, r, dbpath.Name())

	err = os.RemoveAll(dbpath.Name())
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error deleting the export directory:")
		return
	}

}

type NBarProcessTask struct {
	Notebook Notebook
	Content  string
	updates  chan Notebook
}

var ProcessingTasks = struct {
	sync.Mutex
	tasks map[string]*NBarProcessTask
}{
	tasks: make(map[string]*NBarProcessTask),
}

func ImportNBar(ctx context.Context, app *App, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	var ctn Executor = app.db
	upload, _, err := r.FormFile("nbar")
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid file upload")
		return
	}

	local, err := copyFormFile(upload)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "internal error")
	}

	nbarImportDB, err := sqlite.Open(local)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error opening the database file:")
		return
	}

	var id, mfst, sz string
	var data CompressedBytes
	if err := nbarImportDB.Exec(ctx, "select pkey, manifest, sz, data from nbar where pkey like '/notebooks/%'").ScanOne(&id, &mfst, &sz, &data); err != nil {
		tasks.SecureErr(ctx, w, err, "Error reading the nbar from the database:")
		return
	}

	var nb Notebook
	err = DeserializeManifest(mfst, &nb)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error unarchiving notebook: ")
		return
	}
	nb.ID = ulid.Make()
	nb.LastEdit = time.Now()

	user, err := FindOrCreateUser(ctx, ctn, app.Domain, iam.Profile{Name: ssn.UserName, ExternalID: ssn.UserName})
	if err != nil {
		tasks.SecureErr(ctx, w, err, "cannot find or create user")
	}
	nb.Owner = user

	for i, c := range nb.Cells {
		var cId, cMfst string
		err = nbarImportDB.Exec(ctx, "select pkey, manifest from nbar where pkey = ?", "/cells/"+c.ID.String()).ScanOne(&cId, &cMfst)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "Error reading cell in the nbar table: ")
			return
		}

		err = DeserializeManifest(cMfst, &nb.Cells[i])
		if err != nil {
			tasks.SecureErr(ctx, w, err, "Error unarchiving cell: ")
			return
		}
		nb.Cells[i].ID = ulid.Make()
		nb.Cells[i].Notebook = nb.ID
		nb.Cells[i].Author = user

		for _, p := range nb.Cells[i].Pivots {
			var pId, pMfst string
			err = nbarImportDB.Exec(ctx, "select pkey, manifest from nbar where pkey = ?", "/pivots/"+p.Pivot.String()).ScanOne(&pId, &pMfst)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "Error reading pivot in the nbar table: ")
				return
			}

			var pivot Pivot
			err = DeserializeManifest(pMfst, &pivot.PivotDefinition)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "Error unarchiving pivot: ")
				return
			}
			pivot.Impl = PiQLPivot(pivot.PivotDefinition.Name)

			err := PutValue(ctx, ctn, "/pivots/"+pivot.ID.String(), pivot)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "Error storing the pivot: ")
				return
			}
		}
	}

	err = os.RemoveAll(local)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "Error deleting the temporary file:")
		return
	}

	task := &NBarProcessTask{
		Notebook: nb,
		Content:  string(data),
		updates:  make(chan Notebook, 1),
	}
	ProcessingTasks.Lock()
	ProcessingTasks.tasks[nb.ID.String()] = task
	ProcessingTasks.Unlock()

	go notebookUpdates(ctn, task)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nb)
}

func copyFormFile(ff multipart.File) (string, error) {
	dst, err := os.CreateTemp("", "nbar_")
	if err != nil {
		return "", fmt.Errorf("creating temporary copy: %w", err)
	}

	if _, err = io.Copy(dst, ff); err != nil {
		return "", fmt.Errorf("copying file content: %w", err)
	}

	return dst.Name(), dst.Close()
}

// waits for datasource updates from the user
func notebookUpdates(ctn Executor, task *NBarProcessTask) {
	select {
	case <-time.After(120 * time.Second):
		// delete the task after a generous 120 seconds
		// user most likely would have left the page
		// therefore, we don't need to keep the task
		ProcessingTasks.Lock()
		delete(ProcessingTasks.tasks, task.Notebook.ID.String())
		ProcessingTasks.Unlock()
		return
	case nb := <-task.updates:
		ctx := context.Background()
		err := StoreNotebook(ctx, ctn, nb)
		if err != nil {
			fmt.Println("Error storing the notebook:", err)
		}

		err = StoreEditor(ctx, ctn, nb.ID, task.Content)
		if err != nil {
			fmt.Println("Error storing the notebook content:", err)
		}
		ProcessingTasks.Lock()
		delete(ProcessingTasks.tasks, nb.ID.String())
		ProcessingTasks.Unlock()
	}
}

func HTTPReplace(ctx context.Context, ctn Executor, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	var nb Notebook
	if err := json.NewDecoder(r.Body).Decode(&nb); err != nil {
		tasks.SecureErr(ctx, w, err, "invalid payload")
		return
	}
	ProcessingTasks.Lock()
	task := ProcessingTasks.tasks[nb.ID.String()]
	if task == nil {
		tasks.SecureErr(ctx, w, errors.New("no task found"), "no task found")
		return
	}
	task.updates <- nb
	ProcessingTasks.Unlock()
}

// NOTE: the serialization code below is being replaced per
// https://github.com/TroutSoftware/thehub/issues/32

type NBarTypes struct {
	Cells  NBarCellManifest  `nbar:"cells"`
	Pivots NBarPivotManifest `nbar:"pivots"`
}

type NBarCellManifest struct {
	ID    ulid.ULID `nbar:"id"`
	Title string    `nbar:"title"`
}

type NBarPivotManifest struct {
	Pivot ulid.ULID `nbar:"pivot"`
	On    []string  `nbar:"on"`
}

func SerializeManifest(obj any) string {
	var buf strings.Builder
	ot := reflect.TypeOf(obj)
	ov := reflect.ValueOf(obj)
	if ot.Kind() == reflect.Pointer {
		ot = ot.Elem()
		ov = ov.Elem()
	}

	for i := 0; i < ot.NumField(); i++ {
		f := ot.Field(i)
		if !f.IsExported() {
			continue
		}
		v := ov.Field(i).Interface()
		tag := f.Tag.Get("nbar")

		if tag == "" {
			panic("all members should be annotated")
		}
		if tag == "-" {
			continue
		}

		if reflect.TypeOf(v).Kind() == reflect.Slice {
			for j := 0; j < reflect.ValueOf(v).Len(); j++ {
				fmt.Fprint(&buf, tag, " ")
				hasMatchingTags, tt := matchingTags(tag, NBarTypes{})
				if hasMatchingTags {
					for k := 0; k < reflect.TypeOf(tt).NumField(); k++ {
						aTag := reflect.TypeOf(tt).Field(k).Tag.Get("nbar")
						vr := reflect.ValueOf(v).Index(j).Interface()
						matched, ef := matchingTags(aTag, vr)
						if matched {
							fmt.Fprint(&buf, parseValue(reflect.TypeOf(ef), ef), " ")
						}
					}
				}
				fmt.Fprint(&buf, "\n")
			}
			continue
		}
		fmt.Fprint(&buf, tag, " ")
		fmt.Fprint(&buf, parseValue(f.Type, v), "\n")
	}
	return buf.String()
}

func parseValue(vType reflect.Type, v any) string {
	switch vType {
	default:
		panic(fmt.Sprintf("unknown data type: %s. Please update the NBar specification.", vType))
	case ulidType, txtType, blbType:
		return fmt.Sprintf(`%q`, v)
	case tsType:
		return fmt.Sprintf(`%q`, v.(time.Time).Format(time.RFC3339))
	case txtArr:
		var buf strings.Builder
		for _, s := range v.([]string) {
			fmt.Fprintf(&buf, `%q `, s)
		}
		return buf.String()
	}
}

func matchingTags(aTag string, obj any) (bool, any) {
	nt := reflect.TypeOf(obj)
	for i := 0; i < nt.NumField(); i++ {
		f := nt.Field(i)
		v := reflect.ValueOf(obj).Field(i).Interface()
		if f.Tag.Get("nbar") == aTag {
			return true, v
		}
	}
	return false, nil
}

func DeserializeManifest(data string, mfst any) error {
	ot := reflect.TypeOf(mfst)
	ov := reflect.ValueOf(mfst)
	if ot.Kind() == reflect.Pointer {
		ot = ot.Elem()
		ov = ov.Elem()
	}
	scanner := bufio.NewScanner(strings.NewReader(data))
	for scanner.Scan() {
		if err := scanner.Err(); err != nil {
			return err
		}
		line := scanner.Text()
		if line == "" {
			continue
		}
		tag, _, ok := strings.Cut(line, " ")
		if !ok {
			return fmt.Errorf("invalid line: %s", line)
		}
		for i := 0; i < ot.NumField(); i++ {
			f := ot.Field(i)
			if !f.IsExported() {
				continue
			}
			v := ov.Field(i).Interface()
			if f.Tag.Get("nbar") == tag {
				ln := strings.TrimSpace(strings.TrimPrefix(line, tag))
				if reflect.TypeOf(v).Kind() == reflect.Slice {
					quoted := false
					quotedValues := strings.FieldsFunc(ln, func(r rune) bool {
						if r == '"' {
							quoted = !quoted
						}
						return !quoted && r == ' '
					})
					hasMatchingTags, tt := matchingTags(tag, NBarTypes{})
					if hasMatchingTags {
						sl := reflect.MakeSlice(reflect.TypeOf(v), 1, 1)
						for k := 0; k < reflect.TypeOf(tt).NumField(); k++ {
							fn := reflect.TypeOf(tt).Field(k).Name
							for j := 0; j < reflect.TypeOf(v).Elem().NumField(); j++ {
								if reflect.TypeOf(v).Elem().Field(j).Name == fn {
									fv := parseString(reflect.TypeOf(v).Elem().Field(j).Type, quotedValues[k])
									sl.Index(0).Field(j).Set(reflect.ValueOf(fv))
									break
								}
							}
						}
						ov.Field(i).Set(reflect.AppendSlice(ov.Field(i), sl))
					}
					continue
				}
				ov.Field(i).Set(reflect.ValueOf(parseString(f.Type, ln)))
			}
		}
	}

	return nil
}

func parseString(vType reflect.Type, v string) any {
	s, err := strconv.Unquote(strings.TrimSpace(v))
	if err != nil {
		return err
	}
	switch vType {
	default:
		panic(fmt.Sprintf("unknown data type: %s. Please update the NBar specification.", vType))
	case ulidType:
		uid, err := ulid.Parse(s)
		if err != nil {
			panic(err)
		}
		return uid
	case txtType:
		return s
	case blbType:
		return []byte(s)
	case tsType:
		ts, err := time.Parse(time.RFC3339, s)
		if err != nil {
			panic(err)
		}
		return ts
	case txtArr:
		var arr []string
		arr = append(arr, strings.Fields(s)...)
		return arr
	}
}

func typefor[T any]() reflect.Type { return reflect.TypeOf((*T)(nil)).Elem() }

var (
	ulidType = typefor[ulid.ULID]()
	txtType  = typefor[string]()
	blbType  = typefor[[]byte]()
	tsType   = typefor[time.Time]()
	txtArr   = typefor[[]string]()
)
