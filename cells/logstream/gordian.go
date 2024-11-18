package logstream

import (
	"fmt"
	"io"
	"os"

	"github.com/TroutSoftware/x-tools/gordian"
	"trout.software/kraken/webapp/cells/logstream/internal/iter"
)

type gord string

func (g gord) pipe(src iter.SizedReaderAt) (iter.SizedReaderAt, error) {
	pl, err := gordian.Compile(string(g))
	if err != nil {
		return nil, fmt.Errorf("cannot compile preprocessor: %w", err)
	}

	sz, err := src.Size()
	if err != nil {
		return nil, fmt.Errorf("cannot read remote size: %w", err)
	}
	var in io.Reader
	in = io.NewSectionReader(src, 0, sz)

	// TODO(rdo) make temp files deletable on close
	out, err := os.CreateTemp("", "gord_")
	if err != nil {
		return nil, fmt.Errorf("cannot create file: %w", err)
	}

	for i := 0; i < len(pl); i++ {
		r, w := io.Pipe()
		go pl[i].Pipe(in, w)
		in = r
	}
	io.Copy(out, in)
	return (*LocalFile)(out), nil
}
