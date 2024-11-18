package dot

import (
	"errors"
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"

	"trout.software/kraken/webapp/internal/rand"
)

type Dottable interface {
	PrintDot(io.Writer)
}

func Spit(t *testing.T, d Dottable, dst string) {
	if !testing.Verbose() {
		return
	}
	t.Helper()

	pf, sf, found := strings.Cut(dst, "*")
	if found {
		dst = pf + rand.Name() + sf
	}
	for found {
		_, err := os.Stat(dst)
		if errors.Is(err, os.ErrNotExist) {
			break
		}
		if err != nil {
			t.Fatalf("cannot create file %s: %s", dst, err)
		}

		dst = pf + rand.Name() + sf
	}

	out, err := os.Create(t.TempDir() + "/pretty.dot")
	if err != nil {
		t.Fatal(err)
	}
	t.Log("using dot file", out.Name(), "to generate", dst)

	d.PrintDot(out)
	out.Close()

	msg, err := exec.Command("dot", "-Tpng", "-o"+dst, out.Name()).CombinedOutput()
	if err != nil {
		dt, _ := os.ReadFile(out.Name())
		t.Errorf("error running dot (%s): %s", err, msg)
		t.Errorf("file content:\n%s\n\n", dt)
	}
}
