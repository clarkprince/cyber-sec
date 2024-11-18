package logstream

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"trout.software/kraken/webapp/cells/logstream/internal/iter"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

// This is until we have a proper control in place
var AllowedFolders []string

var AccessDenied = errors.New("access denied")

type Filestream struct {
	Name         string `form:"filename,required,placeholder=/var/log/auth.log"`
	Preprocessor string `form:"preprocessor,placeholder=gunzip"`
	err          error
}

func (f Filestream) Connect(_ *iam.Session) (iter.Driver, error) { return f, nil }
func (f Filestream) Glob(pattern string) ([]string, error)       { return filepath.Glob(pattern) }
func (f Filestream) ShardPattern() string                        { return f.Name }
func (f Filestream) Open(src string) (iter.SizedReaderAt, error) {
	src, err := checkAccess(src)
	if err != nil {
		return nil, err
	}

	fh, err := os.Open(src)
	if err != nil {
		return nil, err
	}

	var rdr iter.SizedReaderAt = (*LocalFile)(fh)
	if f.Preprocessor != "" {
		rdr, err = gord(f.Preprocessor).pipe(rdr)
		if err != nil {
			return nil, err
		}
	}
	return rdr, nil
}

type LocalFile os.File

func (f *LocalFile) ReadAt(p []byte, off int64) (int, error) { return (*os.File)(f).ReadAt(p, off) }
func (f *LocalFile) Size() (int64, error) {
	st, err := (*os.File)(f).Stat()
	if err != nil {
		return -1, err
	}
	return st.Size(), nil
}

var checkAccess = CheckAccess

func CheckAccess(src string) (string, error) {
	abs, err := filepath.Abs(src)
	if err != nil {
		return "", fmt.Errorf("invalid file path %s: %w", src, err)
	}
	allow := false
	for _, f := range AllowedFolders {
		if len(f) <= len(abs) && f == abs[:len(f)] {
			allow = true
		}
	}
	if !allow {
		return "", AccessDenied
	}
	return abs, nil
}

var _ driver.Selectable = &Filestream{}

func (d *Filestream) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, path shards.Shard, cs []piql.Pivot) driver.Iter {
	return iter.Filter(d, ssn, st, g, path, cs)
}

func (d *Filestream) Streams() []driver.Stream {
	return []driver.Stream{{Name: "Logs", Type: "stream:logstream:local-file"}}
}

func (f *Filestream) Init(r *http.Request) {
	f.Name = r.PostFormValue("filename")
	f.Preprocessor = r.PostFormValue("preprocessor")
}

func (d *Filestream) Test(ctx context.Context, ssn iam.Session) error {
	if d.Name == "" {
		return errors.New("no file found")
	}
	src, err := checkAccess(d.Name)
	if err != nil {
		return err
	}

	pattern, err := shards.CompileWithWildcards(src)
	if err != nil {
		return err
	}
	pf := pattern
	if strings.ContainsAny(pattern, `*?[`) {
		pf = pattern[:strings.IndexAny(pattern, `*?[`)]
		pf = filepath.Dir(pf)
	}
	_, err = os.Stat(pf)
	return err
}
