package aws

import (
	"bytes"
	"encoding/json"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"trout.software/kraken/webapp/internal/diff"
	"trout.software/kraken/webapp/internal/txtar"
)

func TestConvertConfig(t *testing.T) {
	cases, err := filepath.Glob("testdata/config_*.txtar")
	if err != nil {
		t.Fatal(err)
	}

	for _, c := range cases {
		t.Run(c, func(t *testing.T) {
			x, err := txtar.ParseFile(c)
			if err != nil {
				t.Fatal(err)
			}

			got, _ := BuildRecordFromJSON(x.Get("config")).MarshalText()
			got = append(got, '\n') // txtar adds it
			if string(got) == x.Get("lioli") {
				return
			}
			t.Log(string(diff.Diff("want", []byte(x.Get("lioli")), "got", []byte(string(got)))))

			// always pretty-print json
			var out bytes.Buffer
			json.Indent(&out, []byte(x.Get("config")), "", "  ")

			res := txtar.Archive{
				Files: []txtar.File{
					{Name: "config", Data: out.Bytes()},
					{Name: "lioli", Data: []byte(got)},
				},
			}
			spitDot(t, BuildRecordFromJSON(x.Get("config")), c+".png")

			if err := os.WriteFile(swapext(c, ".result"), txtar.Format(&res), 0644); err != nil {
				t.Fatal(err)

			}
			t.Errorf("%s differs. Results added to the file %s.result", c, swapext(c, "result"))
		})
	}
}

// Run test in verbose mode to generate png files
func spitDot(t *testing.T, d Dottable, dst string) {
	if !testing.Verbose() {
		return
	}

	t.Helper()

	out, err := os.CreateTemp("", "pretty_*.dot")
	if err != nil {
		t.Fatal(err)
	}
	t.Log("using dot file", out.Name(), "to generate", dst)

	d.PrintDot(out)
	out.Close()

	msg, err := exec.Command("dot", "-Tpng", "-o"+dst, out.Name()).CombinedOutput()
	if err != nil {
		t.Fatalf("error running dot (%s): %s", err, msg)
	}
}

type Dottable interface {
	PrintDot(dst io.Writer)
}

func swapext(name, toext string) string {
	c := filepath.Ext(name)
	return name[:len(name)-len(c)] + toext
}
