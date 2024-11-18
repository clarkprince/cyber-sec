package logstream

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"trout.software/kraken/webapp/cells/logstream/internal/iter"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

type Upload struct {
	Filename string
	Filesize int64
	Checksum string
	Notebook string

	err error
}

// default is 20MB
var MaxUploadSize = 20 * 1024 * 1024
var Domain string

type Directory string

func (f Directory) Glob(pattern string) ([]string, error) {
	return filepath.Glob(filepath.Join(string(f), pattern))
}
func (f Directory) Open(segment string) (iter.SizedReaderAt, error) {
	fh, err := os.Open(segment)
	return (*LocalFile)(fh), err
}

func (d *Upload) Init(r *http.Request) {
	d.Notebook = r.FormValue("notebook")
	// check if we are updating an exisiting datasource
	if r.FormValue("key") != "" {
		d.Filename = r.PostFormValue("filename")
		d.Filesize, _ = strconv.ParseInt(r.PostFormValue("filesize"), 10, 64)
		d.Checksum = r.PostFormValue("checksum")
		return
	}

	// if not we are creating a new one
	// use multi file reader
	r.ParseMultipartForm(int64(MaxUploadSize))
	file, meta, err := r.FormFile("file")
	if err != nil {
		d.err = err
		return
	}
	defer file.Close()

	if err := d.saveFile(file, meta); err != nil {
		d.err = err
	}
}

func (d *Upload) saveFile(file multipart.File, meta *multipart.FileHeader) error {
	if meta.Size > int64(MaxUploadSize) {
		return errors.New("file too large")
	}

	if _, err := os.Stat(dir()); os.IsNotExist(err) {
		err = os.MkdirAll(dir(), 0755)
		if err != nil {
			return fmt.Errorf("cannot create upload dir: %w", err)
		}
	}

	// prevent path escaping attacks (we don’t rely on the name for storage, but others
	// systems might – better safe for them, this is a cheap check)
	if !filepath.IsLocal(meta.Filename) {
		return errors.New("invalid file path")
	}

	// prevent uploading crap
	const peekContentType = 512
	buf := make([]byte, peekContentType)
	sz, err := io.ReadFull(file, buf)
	if err != nil && !errors.Is(err, io.ErrUnexpectedEOF) {
		// ErrUnexpectedEOF raised if file too small => but still OK
		return fmt.Errorf("cannot lookup file type: %w", err)
	}

	contentType := http.DetectContentType(buf[:sz])
	if !strings.Contains(contentType, "text/plain") {
		return errors.New("invalid file type")
	}

	up, err := os.CreateTemp(dir(), "upload_")
	if err != nil {
		return fmt.Errorf("cannot create temporary copy: %w", err)
	}

	h := sha256.New()
	if _, err := io.Copy(
		io.MultiWriter(h, up),
		io.MultiReader(bytes.NewReader(buf[:sz]), file),
	); err != nil {
		return fmt.Errorf("cannot upload file: %w", err)
	}

	d.Checksum = hex.EncodeToString(h.Sum(nil))
	d.Filename = meta.Filename
	d.Filesize = meta.Size

	// per man page for rename():
	//  Open file descriptors for oldpath are unaffected.
	os.Rename(up.Name(), filepath.Join(dir(), d.Checksum))
	return up.Close()
}

func (d *Upload) Connect(ssn *iam.Session) (iter.Driver, error) {
	return Directory(filepath.Join(dir(), d.Checksum)), nil
}

func (d *Upload) Test(ctx context.Context, ssn iam.Session) error {
	// check for errors during initialization
	if d.err != nil {
		ssn.SendNotification(d.err)
		return d.err
	}
	// check if file was successfully initialized
	if d.Filename == "" || d.Checksum == "" {
		ssn.SendNotification(errors.New("no file found"))
		return errors.New("no file found")
	}

	_, err := os.Stat(filepath.Join(dir(), d.Checksum))
	if err != nil {
		ssn.SendNotification(err)
	}
	return err
}

func DeleteUpload(d *Upload) error { return os.Remove(filepath.Join(dir(), d.Filename)) }

var anygram = mdt.MustParseGrammar(`root = any . any = _ .`)

func (d *Upload) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, _ shards.Shard, cs []piql.Pivot) driver.Iter {
	return iter.Filter(d, ssn, st, g, "", cs)
}

func (d *Upload) Streams() []driver.Stream {
	return []driver.Stream{{Name: "Logs", Type: "stream:logstream:blob-file"}}
}

var readenvonce sync.Once // protect below
var upload_dir string

func dir() string {
	readenvonce.Do(func() {
		path := filepath.Join("files", Domain)
		if os.Getenv("STATE_DIRECTORY") != "" {
			path = filepath.Join(os.Getenv("STATE_DIRECTORY"), path)
		}
		upload_dir = path
	})
	return upload_dir
}
