package hub

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestNotebookLifecycle(t *testing.T) {
	t.Skip("fixme!!")
	type step struct {
		in   Notebook
		act  string
		code int // 200 if not set
		want Notebook
		pre  func(*Notebook)
	}

	save := func(nb Notebook) step { return step{in: nb, act: "save", pre: func(n *Notebook) { n.Rev++ }} }
	create := func(nb Notebook) step { return step{in: nb, want: nb, act: "create"} }
	archive := func() step { return step{act: "archive"} }
	expect := func(nb Notebook) step { return step{want: nb, act: "read"} }

	var app App
	wireLocalDB(t, &app, CurrentSchemaVersion)

	john, err := FindOrCreateUser(context.Background(), app.db, "example.com", iam.Profile{Name: "John Doe"})
	if err != nil {
		log.Fatal(err)
	}

	// TODO: make that an "applyPivot" step?
	pivotfile := "pivot_1.csv"
	rq := newMultipartFormRequest("$.foo\nhello\nworld", pivotfile)
	response := NewCustomResponseWriter()
	app.ImportCSVPivot(context.Background(), &iam.Session{}, response, rq)
	pivotId, err := readPivotResponse(response)
	if err != nil {
		log.Fatal(err)
	}

	// each scenario perform a sequence of steps against the server
	// the result of each step is checked for code, and value
	// the resulting notebook is used as the base for the next stage
	scenario := []struct {
		name  string
		steps []step
	}{
		{name: "cradle to grave", steps: []step{
			create(Notebook{}),
			save(Notebook{Title: "hello notebook"}),
			expect(Notebook{Title: "hello notebook"}),
			archive(),
			expect(Notebook{Title: "hello notebook", Archived: true}),
		}},
		{name: "create sets ownership", steps: []step{
			create(Notebook{}),
			expect(Notebook{Owner: john}),
		}},
		{name: "cells get populated", steps: []step{
			create(Notebook{}),
			save(Notebook{Cells: []Manifest{{}}}),
			expect(Notebook{Cells: []Manifest{{ID: ulid.Make()}}}), // cmp ignore ID
		}},
		{name: "apply csv pivot", steps: []step{
			create(Notebook{}),
			save(Notebook{Cells: []Manifest{{}}}),
			expect(Notebook{Cells: []Manifest{{ID: ulid.Make()}}}), // cmp ignore ID
			save(Notebook{Cells: []Manifest{{Pivots: []msg.PivotApplication{
				{Pivot: pivotId},
			}}}}),
			expect(Notebook{Cells: []Manifest{{Pivots: []msg.PivotApplication{
				{Pivot: pivotId},
			}}}}),
		}},
	}

	checkpublic := cmpopts.IgnoreUnexported(Notebook{})
	ignoremutant := cmpopts.IgnoreFields(Notebook{}, "ID", "Rev")
	countcells := cmp.Transformer("countcell", func(cells []Manifest) int {
		count := 0
		for _, c := range cells {
			if !c.ID.IsZero() {
				count++
			}
		}
		return count
	})

	for _, sc := range scenario {
		t.Run(sc.name, func(t *testing.T) {
			ctx := context.Background()
			var nbin Notebook
			for i, step := range sc.steps {
				overwrite(&nbin, step.in)
				if step.pre != nil {
					step.pre(&nbin)
				}
				t.Log("sending notebook", nbin)

				var buf bytes.Buffer
				if err := json.NewEncoder(&buf).Encode(nbin); err != nil {
					t.Fatal("cannot encode json", err)
				}

				rq := httptest.NewRequest("POST", "/api/notebook/save?action="+step.act, &buf)
				rsp := httptest.NewRecorder()

				ctx, task := tasks.New(ctx, "notebook-lifecycle-test")
				app.NotebookAPI(ctx, iam.Session{User: john.ID}, rsp, rq)
				if testing.Verbose() {
					task.End()
				}
				if step.code != 0 && step.code != http.StatusOK {
					if rsp.Result().StatusCode != step.code {
						t.Errorf("invalid HTTP response at step %d: %s", i, rsp.Result().Status)
					}
					continue // no result expected on invalid return codes
				}

				if rsp.Result().StatusCode != http.StatusOK {
					t.Fatalf("invalid HTTP response at step %d: %s", i, rsp.Result().Status)
				}

				if step.act == "save" || step.act == "archive" {
					continue // no result change expected
				}

				var nbout Notebook
				if err := json.NewDecoder(rsp.Body).Decode(&nbout); err != nil {
					t.Fatalf("invalid notebook returned at step %d: %s", i, err)
				}

				if !cmp.Equal(nbout, step.want, checkpublic, ignoremutant, countcells) {
					t.Errorf("invalid notebook at step %d: %s", i, cmp.Diff(nbout, step.want, checkpublic, ignoremutant, countcells))
				}
				nbin = nbout
			}
		})
	}
}

func readPivotResponse(response *CustomResponseWriter) (ulid.ULID, error) {
	type processedPivot struct {
		ID    ulid.ULID `json:"pivot"`
		Rpath string    `json:"rightPath"`
	}
	buf := bytes.NewBuffer(response.body)
	var rr processedPivot
	if err := json.NewDecoder(buf).Decode(&rr); err != nil {
		return ulid.ULID{}, err
	}
	if rr.ID.IsZero() {
		return ulid.ULID{}, errors.New("should have created pivot")
	}
	return rr.ID, nil
}

// overwrite sets in v1 fields that are not zero in v2
func overwrite(a1, a2 any) {
	v1 := reflect.ValueOf(a1).Elem()
	v2 := reflect.ValueOf(a2)

	if !v1.CanAddr() || v1.Kind() != reflect.Struct {
		panic("first argument must be an adressable (pointer) struct type")
	}
	if v1.Type() != v2.Type() {
		panic("overwrite values of different types")
	}

	var loop func(a, b reflect.Value)
	loop = func(a, b reflect.Value) {
		t := b.Type()
		for i := 0; i < t.NumField(); i++ {
			if !t.Field(i).IsExported() {
				continue
			}

			if t.Field(i).Type.Kind() == reflect.Struct {
				loop(a.Field(i), b.Field(i))
				continue
			}

			if !b.Field(i).IsZero() {
				a.Field(i).Set(b.Field(i))
			}
		}
	}

	loop(v1, v2)
}

func TestOverwrite(t *testing.T) {
	type T1 struct{ Name string }
	cases := []struct {
		v1, v2, want T1
	}{
		{T1{}, T1{Name: "john"}, T1{Name: "john"}},
		{T1{Name: "john"}, T1{}, T1{Name: "john"}},
		{T1{Name: "jane"}, T1{Name: "john"}, T1{Name: "john"}},
	}

	for _, c := range cases {
		orig := c.v1
		overwrite(&c.v1, c.v2)
		if !cmp.Equal(c.v1, c.want) {
			t.Errorf("overwrite(%v, %v): want %v, got %v", orig, c.v2, c.v1, c.want)
		}
	}
}

func TestSignature(t *testing.T) {
	cases := [...]struct {
		label         string
		local, remote Manifest
		same          bool
	}{
		{"empty", Manifest{}, Manifest{}, true},
		{"pivot applied",
			Manifest{
				Pivots: []msg.PivotApplication{
					{Pivot: ulid.MustParse("01H31J735S2D7Q9B0H634MM5M0"), On: []string{""}},
				},
			},
			Manifest{
				Pivots: []msg.PivotApplication{
					{Pivot: ulid.MustParse("01H31J735S2D7Q9B0H634MM5M0"), On: []string{"$.ip"}},
				},
			}, false},
	}

	for _, c := range cases {
		t.Run(c.label, func(t *testing.T) {
			got := cellSignature(c.local) == cellSignature(c.remote)
			if got != c.same {
				t.Errorf("comparing %s: want %t, got %t", cmp.Diff(c.local, c.remote), c.same, got)
			}
		})
	}

}
