package piql

import (
	"bytes"
	"context"
	"fmt"

	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
	"unsafe"

	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/txtar"
)

var (
	_ instr = AcceptAll{}
	_ instr = Equal{}
	_ instr = &Match{}
	_ instr = TimeSpan{}

	_ winstr = &Limit{}
	_ winstr = &FirstThen{}
	_ winstr = &opCapture{}
	_ winstr = &opCont{}
	_ winstr = &opGroup{}
)

func TestEvaluator(t *testing.T) {
	// we also accept Apache / Unix formats as standard for testing: LioLi does not (yet) carry metadata
	Layouts = append(Layouts,
		"02/Jan/2006:15:04:05 -0700",
		"2006 Jan _2 15:04:05",
	)

	// add new files to ./testdata/grammar/*.golden to create a new test
	fs, err := filepath.Glob("./testdata/piql/*.golden")
	if err != nil {
		t.Fatal(err)
	}
	if len(fs) == 0 {
		t.Skip("no golden files in folder")
	}
	for _, path := range fs {
		t.Run(filepath.Base(path), func(t *testing.T) {
			archive, err := txtar.ParseFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if zloc := strings.Index(string(archive.Comment), "timezero"); zloc != -1 {
				timeNow = func() time.Time {
					timezero := string(archive.Comment[zloc+len("timezero"):])
					t, err := time.Parse(time.RFC3339, strings.TrimSpace(timezero))
					if err != nil {
						panic(err)
					}
					return t
				}
				defer func() { timeNow = time.Now }()
			}
			pp := archive.GetLines("pivotpath")
			pivots := readPivots(t, pp)
			logs := mdt.ParseLORTH(archive.Get("log"))
			want := archive.Get("filtered")

			var ev Evaluator
			it := ev.MatchRules(pivots)
			go ev.Run(context.Background(), logs.Match(mdt.AllRecords).IterAll(), make(mdt.Grammar))

			var buf bytes.Buffer
			for it.Next() {
				dt, _ := it.Record().MarshalText()
				buf.Write(dt)
				buf.WriteString("\n")
			}
			if it.Err() != nil {
				t.Fatal(err)
			}

			if buf.String() == want {
				return // only error if different
			}

			r := path[:len(path)-len("golden")] + "eval_result"
			x := &txtar.Archive{
				Comment: archive.Comment,
				Files: []txtar.File{
					{Name: "pivotpath", Data: []byte(strings.Join(pp, "\n"))},
					{Name: "log", Data: []byte(archive.Get("log"))},
					{Name: "filtered", Data: buf.Bytes()},
				},
			}
			os.WriteFile(r, txtar.Format(x), os.ModePerm)
			t.Errorf("Error reading %s. Results in %s", path, r)
		})
	}
}

// Read pivots and their application
// Note the original list will be modified with the pretty-printed version – so it can be used in output.
// TODO(rdo) use proper pivot parsing there
func readPivots(t interface {
	Helper()
	Fatal(...any)
}, lines []string) []Pivot {
	t.Helper()

	pivots := make([]Pivot, len(lines))
	for i, pp := range lines {
		pivot, pretty, err := ParseSingle(pp)
		if err != nil {
			t.Fatal(fmt.Sprintf("invalid pivot %s: %s", pp, err))
		}

		lines[i] = fmt.Sprint(pretty, " [", pivot.On, "]")
		pivots[i] = pivot
	}
	return pivots
}

func TestStructAligment(t *testing.T) {
	const mostCommonCacheLineSizeInModernCPU = 64
	if unsafe.Sizeof(table{})%mostCommonCacheLineSizeInModernCPU != 0 {
		t.Errorf("table size %d not aligned to cache lines (value size %d)", unsafe.Sizeof(table{}), unsafe.Sizeof(ivalue{}))
	}
}
