package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"time"

	"trout.software/kraken/webapp/internal/mdt"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

// BrowserAction is triggered in a datacell continuation callback
//
//go:generate rxabi -type BrowserAction
type BrowserAction string

const (
	TriggerDownload BrowserAction = "trigger-download"
)

func recordToLine(vp *ViewPort, cols []int, record mdt.Record) []string {
	line := make([]string, len(cols))
	for i, colidx := range cols {
		col := vp.fields.At(colidx)
		vals := record.FindPath(col.name)
		if len(vals) == 0 {
			panic(fmt.Sprintf("findPath returned an empty array for col %s", col.name))
		}
		line[i] = vals[0]
	}
	return line
}

func generateCSV(vp *ViewPort, ctx Context, buf io.WriteCloser) {
	csvw := csv.NewWriter(buf)

	// include only visible columns
	cols := vp.fields.Columns(false)
	headers := make([]string, len(cols))
	for i, colidx := range cols {
		headers[i] = vp.fields.At(colidx).name
	}
	csvw.Write(headers)

	// exports only currently visible lines
	for iter := vp.Iter(); iter.Next(); {
		record := iter.Record()
		line := recordToLine(vp, cols, record)
		err := csvw.Write(line)
		if err != nil {
			log.Printf("Error: could not write CSV line: %v", err)
		}
	}
	csvw.Flush()
	buf.Close()
}

func CSVExport(ctx Context) *Node {
	vp := _viewport(ctx)
	norecords := vp.records.Len() == 0 && vp.locked.Len() == 0
	nocols := len(vp.fields.Columns(false)) == 0
	return W(
		btn1().
			AddClasses("p-2 invisible group-hover:visible").
			AddBoolAttr("disabled", norecords || nocols).
			AddAttr("aria-label", "Export viewport as csv").
			AddChildren(exporticon("black")),
		OnIntent(Click, func(ctx Context) Context {
			S1(ctx, string(TriggerDownload))
			stamp := time.Now().Format(time.RFC3339)
			S2(ctx, "security-hub-export-"+stamp+".csv")
			r, buf := Pipe()
			go generateCSV(vp, ctx, buf)
			S3(ctx, r)
			// TODO: generate file, and trigger download
			// => might need a continuation function somewhere in datacell JS?
			// or we can craft a new action that triggers a file download in the engine
			return ctx
		}),
	).Build(ctx)
}
