package hub

import (
	"bytes"
	"crypto/sha256"
	"embed"
	"encoding/base64"
	"errors"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// staticFiles serves files from a set of local files.
// it properly understands and set compression (for now Brotli).
type staticFiles struct {
	cache map[string]cachedfile
}

// like a real one, but don’t re-open it
type cachedfile struct {
	file   []byte // nil if the file is not actually cached
	etag   string // only set if the fh is not null
	brotli bool   // set in prod for faster network access
	mtime  time.Time
	size   int64

	path string // set locally to access original file
}

func ServeStaticGlob(reload bool, patterns ...string) (http.Handler, error) {
	files := staticFiles{cache: make(map[string]cachedfile)}

	for _, p := range patterns {
		if err := files.ServeGlob(reload, p); err != nil {
			return nil, err
		}
	}

	return files, nil
}

// ServeGlob adds all files matching pattern to the files that will be served.
// If pattern starts by a directory, it is elided.
func (files staticFiles) ServeGlob(reload bool, pattern string) error {
	m, err := filepath.Glob(pattern)
	if err != nil {
		return fmt.Errorf("searching for pattern %s: %w", pattern, err)
	}

	for _, m := range m {
		fi, err := os.Stat(m)
		if err != nil {
			return fmt.Errorf("reading file info %s: %w", m, err)
		}
		if fi.IsDir() {
			continue
		}

		cf := cachedfile{mtime: fi.ModTime(), size: fi.Size()}

		if !reload {
			fh, err := os.Open(m)
			if err != nil {
				return fmt.Errorf("opening file %s: %w", m, err)
			}

			buf := new(bytes.Buffer)
			summer := sha256.New()

			if _, err := io.Copy(io.MultiWriter(buf, summer), fh); err != nil {
				return fmt.Errorf("reading file content%s: %s", m, err)
			}

			cf.etag = base64.StdEncoding.EncodeToString(summer.Sum(nil))
			cf.file = buf.Bytes()
			if filepath.Ext(m) == ".br" {
				cf.brotli = true
				m = m[:len(m)-len(".br")]
			}
		} else {
			cf.path = m
		}

		files.cache[filepath.Base(m)] = cf
	}

	return nil
}

func (files staticFiles) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	file, ok := files.cache[r.URL.Path]
	if !ok {
		http.Error(w, "no such file", http.StatusNotFound)
		return
	}

	accepts := strings.Split(r.Header.Get("Accept-Encoding"), ", ")
	best := "identity"
	for _, a := range accepts {
		// drop q=xxx
		i := strings.IndexRune(a, ';')
		if i != -1 {
			a = a[:i]
		}
		if a == "br" {
			best = "brotli"
		}
	}

	if best == "identity" && file.brotli {
		http.Error(w, "browser does not support brotli compression", http.StatusUnsupportedMediaType)
		return
	}

	if best == "brotli" && file.brotli {
		w.Header().Set("Content-Encoding", "br")
		w.Header().Set("Content-Length", strconv.FormatInt(file.size, 10))
	}

	if file.file == nil {
		http.ServeFile(w, r, file.path)
	} else {
		w.Header().Set("ETag", file.etag)
		http.ServeContent(w, r, r.URL.Path, file.mtime, bytes.NewReader(file.file))
	}

}

// ElideDir removes the first directory name from the path
func ElideDir(path string) string {
	for i := range path {
		if os.IsPathSeparator(path[i]) {
			return path[i+1:]
		}
	}
	return path
}

type TemplateLoader struct {
	first  *templatesource
	reload bool

	fs fs.FS
}

type templatesource struct {
	next *templatesource

	base string
	path string
	tpl  *template.Template
}

//go:embed templates
var HubTemplates embed.FS

func (l *TemplateLoader) get(name string) *template.Template {
	p := l.first
	for ; p != nil && short(p.tpl.Name()) != name; p = p.next {
	}
	if p == nil {
		return nil
	}

	if !l.reload {
		return p.tpl
	}

	files := []string{p.path}
	if p.base != "" {
		files = append(files, p.base)
	}

	tpl := template.New(filepath.Base(p.path)).Funcs(TemplateFuncs)
	return template.Must(tpl.ParseFS(l.fs, files...))
}

func (l *TemplateLoader) init(reload bool, dir fs.FS) {
	l.reload = reload
	l.fs = dir

	p := &l.first
	fs.WalkDir(dir, "templates", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() || filepath.Base(path) == "browse_base.html" {
			return nil
		}

		files := []string{path}
		basepath := filepath.Join(filepath.Dir(path), "browse_base.html")
		switch _, err := fs.Stat(dir, basepath); {
		default:
			return err
		case errors.Is(err, fs.ErrNotExist):
			basepath = ""
		case err == nil:
			files = append(files, basepath)
		}

		tpl := template.New(filepath.Base(path)).Funcs(TemplateFuncs)
		*p = &templatesource{
			tpl:  template.Must(tpl.ParseFS(dir, files...)),
			path: path, base: basepath,
		}
		p = &(*p).next
		return nil
	})
}

// LocalDirectory represents a file system rooted at dir
type LocalDirectory string

func (d LocalDirectory) Open(f string) (fs.File, error) { return os.Open(filepath.Join(string(d), f)) }

var _ fs.FS = LocalDirectory("")
