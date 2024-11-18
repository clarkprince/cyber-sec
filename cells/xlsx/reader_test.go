package xlsx

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"go.starlark.net/resolve"
	"go.starlark.net/starlark"
	"trout.software/kraken/webapp/hub/iam"
)

const testdataDir = "testdata"

func TestWorkbook(t *testing.T) {
	if _, err := os.Stat(testdataDir); os.IsNotExist(err) {
		t.Fatalf("testdata directory not found")
	}

	resolve.AllowGlobalReassign = true
	resolve.AllowSet = true
	resolve.AllowRecursion = true

	runTest := func(t *testing.T, path string, script string, out string) {
		t.Helper()

		_, prg, err := starlark.SourceProgram("", script, BuiltIns.Has)
		if err != nil {
			t.Fatal(err)
		}

		load := func(thread *starlark.Thread, module string) (starlark.StringDict, error) {
			script, err := os.ReadFile(filepath.Join(testdataDir, "libs", module))
			if err != nil {
				return nil, err
			}
			wrkbk, err := workbook(path)
			if err != nil {
				return nil, err
			}
			BuiltIns["wb"] = wrkbk
			globals, err := starlark.ExecFile(thread, "", script, BuiltIns)
			if err != nil {
				return nil, err
			}
			return globals, nil
		}

		iter := Filter(&iam.Session{}, prg, path, load)
		var got []byte
		for iter.Next() {
			if iter.Err() != nil {
				t.Errorf("Error iterating over records: %v", iter.Err())
				return
			}
			rc, err := iter.Record().MarshalText()
			if err != nil {
				t.Errorf("Error marshalling record: %v", err)
				return
			}
			rc = append(rc, '\n')
			got = append(got, rc...)
		}

		want, err := os.ReadFile(out)
		if err != nil {
			t.Fatal(err)
		}

		if string(got) != string(want) {
			t.Errorf("Output differs. Got:\n%s\nWant:\n%s", got, want)
		}
	}

	// walk through the testdata directory and execute tests for .star files
	err := filepath.Walk(testdataDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			t.Errorf("Error accessing %s: %v", path, err)
			return err
		}
		if info.IsDir() {
			return nil // skip directories
		}

		if strings.Contains(path, "/libs/") {
			return nil // skip lib files
		}

		if path != "testdata/lib_test/lib_test.star" {
			return nil
		}

		// check if the file has a .star extension
		if filepath.Ext(path) == ".star" {
			t.Run(filepath.Base(path), func(t *testing.T) {
				// read the script content
				script, err := os.ReadFile(path)
				if err != nil {
					t.Errorf("Error reading script %s: %v", path, err)
					return
				}

				// determine the corresponding input and expected output file paths
				base := strings.TrimSuffix(path, filepath.Ext(path))
				in := base + ".xlsx"
				out := base + ".lioli"
				runTest(t, in, string(script), out)
			})
		}
		return nil
	})

	if err != nil {
		t.Fatalf("Error walking through %s: %v", testdataDir, err)
	}
}
