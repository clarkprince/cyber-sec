package hub

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"strings"
	"unicode/utf8"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
	"trout.software/kraken/webapp/internal/ulid"
)

var knownPivots = map[string]reflect.Type{
	csvpivotsig:  reflect.TypeOf(CSVPivot{}),
	piqlpivotsig: reflect.TypeOf(PiQLPivot("")),
}

type applicable interface {
	Apply(msg.PivotApplication, mdt.Grammar) (string, []any)
	ExpandTemplate(shardName string, patterns []string) ([]string, error)
}

type Pivot struct {
	msg.PivotDefinition
	Impl applicable `json:"value" cbor:"Impl"`
}

func NewPivotOfType(tp string) applicable {
	src, ok := knownPivots[tp]
	if !ok {
		return nil
	}
	return reflect.New(src).Interface().(applicable)
}

func (i Pivot) MarshalBinary() ([]byte, error) {
	type P Pivot
	return cbor.Marshal(P(i))
}

func (i *Pivot) UnmarshalBinary(dt []byte) error {
	type P struct {
		msg.PivotDefinition
		RawImpl cbor.RawMessage `cbor:"Impl"`
	}
	var p P
	if err := cbor.Unmarshal(dt, &p); err != nil {
		return fmt.Errorf("cannot read wrapper: %w", err)
	}

	i.ID = p.ID
	i.Name = p.Name
	i.Type = p.Type
	i.Impl = NewPivotOfType(i.Type)
	return cbor.Unmarshal(p.RawImpl, i.Impl)
}

const csvpivotsig = "pivot:hub:csvpivot"
const piqlpivotsig = "pivot:piql:piql"

type CSVPivot struct {
	Table string
	Cols  []string
}

func (table CSVPivot) ExpandTemplate(shardName string, patterns []string) ([]string, error) {
	return []string{}, nil
}

// Apply creates the following query:
//
//	join (select c from z) as z on z.c = y.b
//
// y.b come from the data source of the cell, z.c always from the pivot table
func (table CSVPivot) Apply(p msg.PivotApplication, _ mdt.Grammar) (string, []any) {
	if len(p.On) != 2 {
		return "", []any{}
	}
	coln := sanitize(p.On[1])
	exists := false
	for _, c := range table.Cols {
		if coln == c {
			exists = true
		}
	}
	if !exists {
		return "", []any{}
	}

	return fmt.Sprintf(`join "%s" on "%s"=lioli_path("main"."record", ?)`, table.Table, coln), []any{p.On[0]}
}

func (app *App) ImportCSVPivot(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	file, header, err := r.FormFile("file")
	if err != nil {
		tasks.SecureErr(ctx, w, err, "could not read csv file in form for key file")
		ssn.SendNotification("csv file to import not found")
		return
	}
	defer file.Close()

	var pivot Pivot

	const maxCSVSize = 5 * 1024 * 1024
	reader := csv.NewReader(io.LimitReader(file, maxCSVSize))
	var cols string
	var values []any
	for {
		record, err := reader.Read()
		if err != nil {
			if err == io.EOF {
				break
			}
			tasks.SecureErr(ctx, w, err, "when reading csv file")
			ssn.SendNotification("Could not read csv file")
			return
		}

		if pivot.ID.IsZero() {
			pivot, err = createCSVPivot(ctx, app.db, record, header.Filename)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "when creating pivot entity")
				ssn.SendNotification("Could not create the pivot entity")
				return
			}
			buf := make([]byte, len(record)*2-1)
			for i := 0; i < len(buf); i += 2 {
				buf[i] = '?'
				if i+1 < len(buf) {
					buf[i+1] = ','
				}
			}
			cols = string(buf)
			values = make([]any, len(record))
			continue
		}

		for i, a := range record {
			values[i] = a
		}
		err = app.db.Exec(ctx, fmt.Sprintf("insert into %s values (%s)", pivot.Impl.(CSVPivot).Table, cols), values...).Err()
		if err != nil {
			tasks.SecureErr(ctx, w, err, "when inserting values in pivot table")
			ssn.SendNotification("Could not import the pivot")
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(struct {
		ID    ulid.ULID `json:"pivot"`
		Rpath string    `json:"rightPath"`
	}{ID: pivot.ID, Rpath: pivot.Impl.(CSVPivot).Cols[0]}); err != nil {
		tasks.SecureErr(ctx, w, err, "error encoding pivot")
		ssn.SendNotification("Could not import the pivot")
		return
	}
}

// createCSVPivot stores a pivot entity and creates a table named pivot_ID where ID is the ULID that identifies the pivot itself,
// the table pivot_ID has as column names the first row record read from the csv file.
func createCSVPivot(ctx context.Context, db Executor, columns []string, csvFilename string) (Pivot, error) {
	pivot := Pivot{
		PivotDefinition: msg.PivotDefinition{
			ID:   ulid.Make(),
			Name: strings.TrimSuffix(csvFilename, ".csv"),
			Type: csvpivotsig,
		},
	}
	csvp := CSVPivot{Cols: columns, Table: "pivot_" + pivot.ID.String()}
	pivot.Impl = csvp

	if err := PutValue(ctx, db, fmt.Sprintf("/pivots/%s", pivot.ID), pivot); err != nil {
		return pivot, nil
	}

	err := db.Exec(ctx, fmt.Sprintf("create table %s (%s)", csvp.Table, buildTableSchema(columns))).Err()
	if err != nil {
		return pivot, nil
	}
	return pivot, nil
}

// buildTableSchema allows to create the table from untrusted data sources.
// this is done by only accepting a very small subset of characters, and dropping the others.
// if the resulting name is empty, we simply use a column number.
func buildTableSchema(names []string) string {
	var buf strings.Builder
	for i, n := range names {
		if i > 0 {
			buf.WriteString(", ")
		}

		n = sanitize(n)
		if len(n) == 0 {
			n = fmt.Sprintf("col_%d", i)
		}

		buf.WriteString("\"" + n + "\"")
	}
	return buf.String()
}

func sanitize(name string) string {
	j := -1
	for i, r := range name {
		if !isalnum(r) {
			j = i
			break
		}
	}
	// fast path: no alloc required
	if j == -1 {
		return name
	}
	out := make([]byte, len(name))
	copy(out, name[:j])
	for _, r := range name[j:] {
		if isalnum(r) {
			// safe since alnum only accepts ASCII (one-byte) runes
			out[j] = byte(r)
			j++
		}
	}
	return string(out[:j])
}

/*
// nibble bits for text values
// only works for ASCII range
package main

import "fmt"

func vrune(r int) uint16 {
	if r >= '0' && r <= '9' || r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r == '.' || r == '_' || r == '$' {
		return 1
	}
	return 0
}

func main() {
	for n := 0; n < 16; n++ {
		var bs uint16
		for i := 0; i < 16; i++ {
			bs |= vrune(i+n*16) << i
		}

		fmt.Printf("%0#16b, // %#x.\n", bs, n)
	}
}

*/

var alnums = [...]uint16{
	0b0000000000000000, // 0x0.
	0b0000000000000000, // 0x1.
	0b0100000000010000, // 0x2.
	0b0000001111111111, // 0x3.
	0b1111111111111110, // 0x4.
	0b1000011111111111, // 0x5.
	0b1111111111111110, // 0x6.
	0b0000011111111111, // 0x7.
	0b0000000000000000, // 0x8.
	0b0000000000000000, // 0x9.
	0b0000000000000000, // 0xa.
	0b0000000000000000, // 0xb.
	0b0000000000000000, // 0xc.
	0b0000000000000000, // 0xd.
	0b0000000000000000, // 0xe.
	0b0000000000000000, // 0xf.
}

// isalnum returns true if the character is in the ASCII char (lower + upper), number range, is dot (U+002E) or underscore (U+005F)
func isalnum(r rune) bool {
	if r >= utf8.RuneSelf {
		return false
	}

	return 1<<(r&0xf)&alnums[r>>4] != 0
}

type PiQLPivot string

func (q PiQLPivot) ExpandTemplate(shardName string, patterns []string) ([]string, error) {
	args, err := piql.ParseEqualArguments(string(q))
	if err != nil {
		return []string{}, err
	}
	if len(args) == 0 {
		return []string{}, nil
	}
	var executedPatterns []string
	for _, pattern := range patterns {
		p, err := shards.ReplaceShard(shardName, nil, shards.Pattern(pattern))
		if err != nil {
			return []string{}, err
		}
		for _, pp := range p {
			executedPatterns = append(executedPatterns, string(pp))
		}
	}
	return executedPatterns, nil
}

func (q PiQLPivot) Apply(p msg.PivotApplication, grm mdt.Grammar) (string, []any) {
	if len(p.On) != 1 {
		return "", []any{}
	}
	return ` join piql(main.record, ?, ?, ?)`, []any{string(q), p.On[0], grm.PrettyPrint("root")}
}

func (app *App) PivotAPI(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	action := r.URL.Query().Get("action")

	switch action {
	case "read":
		pvt := r.URL.Query().Get("pivot")
		id, err := ulid.ParseStrict(pvt)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "invalid pivot ID")
			return
		}
		tasks.Annotate(ctx, "pivot-id", id)

		p, err := FindOne[Pivot](ctx, app.db, "/pivots/"+id.String())
		if err != nil {
			tasks.SecureErr(ctx, w, err, "invalid pivot ID")
		}

		json.NewEncoder(w).Encode(p)
	case "edit-piql":
		_, q, err := piql.ParseSingle(r.PostFormValue("query"))
		if err != nil {
			// return underlying response, contains parsing info
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(err)
			return
		}
		tasks.Annotate(ctx, "query", q)

		id := ulid.Make()
		pvt := r.URL.Query().Get("pivot")
		if pvt != "" {
			var err error
			id, err = ulid.ParseStrict(pvt)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "invalid pivot")
				return
			}
		}
		tasks.Annotate(ctx, "pivot-id", id)

		pivot, err := FindOne[Pivot](ctx, app.db, "/pivots/"+id.String())
		switch {
		case errors.Is(err, storage.MissingEntry):
			pivot = Pivot{
				PivotDefinition: msg.PivotDefinition{
					ID:   id,
					Name: q,
					Type: piqlpivotsig,
				},
			}
		case err != nil:
			tasks.SecureErr(ctx, w, err, "cannot acces pivot record")
		}

		pivot.Name = q
		pivot.Impl = PiQLPivot(q)

		if err := PutValue(ctx, app.db, "/pivots/"+pivot.ID.String(), pivot); err != nil {
			tasks.SecureErr(ctx, w, err, "cannot persist pivot")
			return
		}

		json.NewEncoder(w).Encode(pivot)
	}
}
