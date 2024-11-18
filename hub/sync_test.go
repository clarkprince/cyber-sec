package hub

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestExport(t *testing.T) {
	t.Skip("WIP")
	idExp := ulid.Make()

	a, err := createDBForTest("tempDBForTestExport", idExp)
	if err != nil {
		t.Fatal(err)
	}

	expectedFramew, err := genAndStoreFramework(a, idExp)
	if err != nil {
		t.Fatal(err)
	}

	filename, err := a.ExportForSynch(context.Background(), expectedFramew.ID)
	if err != nil {
		t.Fatal(err)
	}

	stat, err := os.Stat(filename)
	if err != nil {
		t.Fatal(err)
	}
	if stat.Size() == 0 {
		t.Fatal("File should have some notebook data in it")
	}
	// Clean scenario
	if err := deleteDBFile(idExp, "tempDBForTestExport"); err != nil {
		t.Fatal(err)
	}

	//a new DB is created for importing data
	idImp := ulid.Make()
	a, err = createDBForTest("tempDBForTestImport", idImp)
	if err != nil {
		t.Fatal(err)
	}
	if err := a.ImportForSynch(context.Background(), filename); err != nil {
		t.Fatal(err)
	}
	if err := checkImportedFramework(a.db, expectedFramew, t); err != nil {
		t.Fatal(err)
	}
	// Clean scenario
	if err := deleteDBFile(idImp, "tempDBForTestImport"); err != nil {
		t.Fatal(err)
	}
	err = os.RemoveAll(filename)
	if err != nil {
		t.Fatal(err)
	}
}

func checkImportedFramework(db *sqlite.Connections, want Framework, t *testing.T) error {
	// Check that framework exists//check that notebook exists//check for cells within notebook
	got, err := FindOne[Framework](context.Background(), db, fmt.Sprint("/frameworks/", want.ID.String()))
	if err != nil {
		return err
	}
	ignoremutant := cmpopts.IgnoreFields(Framework{}, "Content")
	// Time will be compared in the same format
	cmpTimeRFC := cmp.Transformer("formatTime", func(t time.Time) string {
		return t.Format(time.RFC3339)
	})
	if !cmp.Equal(want, got, ignoremutant, cmpTimeRFC) {
		return errors.New(cmp.Diff(want, got, ignoremutant, cmpTimeRFC))
	}
	return nil
}

func deleteDBFile(id ulid.ULID, name string) error {
	// Clean scenario
	err := os.RemoveAll("tempDBForTestImport" + id.String())
	if err != nil {
		return err
	}
	err = os.RemoveAll("tempDBForTestImport" + id.String() + "-shm")
	if err != nil {
		return err
	}
	err = os.RemoveAll("tempDBForTestImport" + id.String() + "-wal")
	if err != nil {
		return err
	}
	return nil
}

func createDBForTest(name string, id ulid.ULID) (*App, error) {
	db, err := sqlite.OpenPool(name+id.String(), storage.DropLastElement)
	if err != nil {
		return nil, err
	}
	if err := db.Exec(context.Background(), "create table entities (pkey text primary key, value blob) without rowid;").Err(); err != nil {
		return nil, err
	}
	if err := PutValue(context.Background(), db, "/domain", iam.Domain{ID: ulid.Make(), Name: "test", Alias: "test"}); err != nil {
		log.Fatal(err)
	}
	return &App{db: db, Domain: "test"}, nil
}

func genAndStoreFramework(a *App, id ulid.ULID) (Framework, error) {
	var pid = ulid.Make()
	var pivot = Pivot{
		PivotDefinition: msg.PivotDefinition{ID: pid, Type: piqlpivotsig},
		Impl:            PiQLPivot("= 4"),
	}

	err := PutValue(context.Background(), a.db, "/pivots/"+pivot.ID.String(), pivot)
	if err != nil {
		return Framework{}, err
	}
	owner := ulid.Make()
	nb := msg.Playbook{
		ID:       id,
		Owner:    msg.User{ID: owner, Profile: iam.Profile{Name: "nb owner", ExternalID: "nb external ID"}},
		Title:    "mytitle",
		Created:  time.Now(),
		LastEdit: time.Now(),
		Cells: []msg.Cell{{
			ID:         ulid.Make(),
			Author:     msg.User{ID: ulid.Make(), Profile: iam.Profile{Name: "cell owner", ExternalID: "cell external ID"}},
			Created:    time.Now(),
			Timestamp:  time.Now(),
			DataSource: ulid.Make(),
			Notebook:   id,
			Pivots:     []msg.PivotApplication{{Pivot: pid, On: []string{"notebook"}}},
			Title:      "my cell"}},
	}
	if err := PutValue(context.Background(), a.db, "/notebooks/"+nb.ID.String(), nb); err != nil {
		return Framework{}, err
	}

	//This editor information for the framework does not pretend to be accurate
	// but for the Notebook ID: "01H7SREN5TA2JYECASC8N50G52" which is the only information used in the export/import process.
	ed := `{"type":"paragraph","content":[{"type":"text","text":"Secure Jupyter "},{"type":"pill","attrs":{"data-entity-json":"{\"Rev\":3,\"ID\":\"` + id.String() + `\",\"Title\":\"Securing Zupiter!!\",\"Cells\":null,\"Created\":\"2023-08-14T11:11:19+01:00\",\"LastEdit\":\"2023-08-14T14:10:56+01:00\",\"Origin\":\"00000000000000000000000000\"}","data-type":"playbook"}},{"type":"text","text":" "}]}`

	expectedFramew := Framework{
		ID:       ulid.Make(),
		UPN:      "t.sftw/iso26001:12:2023010101",
		Title:    "my policy",
		Owner:    owner,
		LastEdit: time.Now(),
		DueDate:  time.Time{},
		Audit:    true,
		Link:     ulid.Make(),
		Content:  []byte(ed),
	}
	if err := PutValue(context.Background(), a.db, "/frameworks/"+expectedFramew.ID.String(), expectedFramew); err != nil {
		return Framework{}, err
	}
	return expectedFramew, nil
}
