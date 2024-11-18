package hub

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/iso8601"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

// TemplateFuncs are functions made availables to the template rendering engine.
// There are two kinds of functions:
//   - pure functions, returning a combination of their arguments
//   - functions using a RenderContext to display user information
var TemplateFuncs = template.FuncMap{
	"trimprefix": strings.TrimPrefix,
	"list":       func(args ...any) []any { return args },
	"random":     func(args ...any) any { return args[rand.Intn(len(args))] },
	"json": func(v any) (string, error) {
		dt, err := json.Marshal(v)
		return string(dt), err
	},
	"query": func(ctx RenderContext, query string, args ...any) ([]sqlite.ColStrings, error) {
		// ctx can retrieve session labels for secure filtering
		st := ctx.Conn.Exec(context.Background(), query, args...)
		var rv []sqlite.ColStrings
		for st.Next() {
			cs := make(sqlite.ColStrings)
			st.Scan(cs)
			rv = append(rv, cs)
		}
		return rv, st.Err()
	},
	"first": func(ins []sqlite.ColStrings) (sqlite.ColStrings, error) {
		if len(ins) != 1 {
			return nil, fmt.Errorf("invalid number of records: %d", len(ins))
		}
		return ins[0], nil
	},
	// HTTP URL query parameter
	"_get":  func(ctx RenderContext, param string) string { return ctx.URL.Query().Get(param) },
	"today": func() string { return time.Now().Format(time.DateOnly) },
	"formfor": func(ctx RenderContext, v any) []httpform.Field {
		if v, ok := v.(driver.HTTPDefiner); ok {
			return v.DefineForm(ctx.Session)
		}
		return httpform.GenerateDefinition(v)
	},
	"newsourceoftype": NewSourceOfType,
	"capitalize": func(s string) string {
		if len(s) == 0 {
			return ""
		}
		r, sz := utf8.DecodeRuneInString(s)
		if !unicode.IsLower(r) {
			return s
		}
		out := make([]byte, len(s))
		utf8.EncodeRune(out, unicode.ToUpper(r))
		copy(out[sz:], s[sz:])
		return string(out)
	},
	"hasflag": features.HasFlag,
	"stringvalue": func(s *string) string {
		return *s
	},
	"sub":  func(i int, j int) int { return i - j },
	"add":  func(i int, j int) int { return i + j },
	"mult": func(i int, j int) int { return i * j },
	"durheight": func(max float64, min float64, dur time.Duration, maxh int, minh int) int {
		durFloat := float64(dur) / float64(time.Microsecond)
		height := int(float64(maxh) * durFloat / max)
		if height < minh {
			height = minh
		}
		return height
	},
	"hasfilestreams": func() bool { return len(logstream.AllowedFolders) > 0 },
	"tsfmt": func(full string) (string, error) {
		t, err := time.Parse(time.RFC3339, full)
		if err != nil {
			return "", err
		}
		return t.Format(time.Stamp), nil
	},
	"messagefor": MessageFor,
	// TODO(rdo) need to use marshaled value instead
	"unescape":      func(v string) template.JS { return template.JS(v) },
	"unescape_html": func(v string) template.HTML { return template.HTML(v) },
	// TODO those need to move to ad-hoc queries
	"user": func(ctx context.Context) (any, error) {
		rc, ok := GetRenderContext(ctx)
		if !ok {
			return nil, errors.New("no render context")
		}
		buf := make([]iam.User, 1)
		buf, err := ListPath(ctx, rc.Conn, fmt.Sprintf("/users/%s", rc.Session.User), buf)
		if err != nil {
			return nil, err
		}
		return buf[0], nil
	},
	"cells": func(ctx context.Context) ([]Manifest, error) {
		rc, ok := GetRenderContext(ctx)
		if !ok {
			return nil, errors.New("no render context")
		}
		return ListCells(ctx, rc.Conn, rc.Notebook.ID)
	},
	"grammars": func(ctx context.Context) (any, error) {
		rc, ok := GetRenderContext(ctx)
		if !ok {
			return nil, errors.New("no render context")
		}

		const maxGrammars = 30
		g := make([]driver.Grammar, maxGrammars)
		g, err := ListPath(ctx, rc.Conn, "/grammars", g)
		return g, err
	},
	"datasources": func(ctx context.Context, filter []interface{}) (any, error) {
		rc, ok := GetRenderContext(ctx)
		if !ok {
			return nil, errors.New("no render context")
		}

		const maxSourcesInWebList = 30
		src := make([]DataSource, maxSourcesInWebList)
		src, err := ListPath(ctx, rc.Conn, "/datasources", src,
			func(d DataSource) bool {
				flag := d.Type == fmt.Sprintf("%v", filter[0])
				for _, val := range filter {
					flag = flag || d.Type == fmt.Sprintf("%v", val)
				}
				return flag
			})
		// src, err := ListPath(ctx, rc.Conn, "/datasources", src)
		return src, err
	},

	"nbschedules": func(ctx context.Context) (any, error) {
		rc, ok := GetRenderContext(ctx)
		if !ok {
			return nil, errors.New("no render context")
		}
		type nbschedule struct {
			Description string
			NotebookID  ulid.ULID
			NextRun     string
			Results     []Result
			MaxDuration float64
			MinDuration float64
		}

		jobs := make([]NotebookSchedule, 50)
		jobs, err := ListPath(ctx, rc.Conn, "/nbschedules", jobs)
		if err != nil {
			return []nbschedule{}, err
		}

		var schedules []nbschedule
		for _, job := range jobs {
			d, _ := iso8601.GetDescription(job.Runs.Specification)
			var last15Results []Result
			if len(job.Results) <= 15 {
				last15Results = job.Results
			} else {
				last15Results = job.Results[len(job.Results)-16:]
			}

			var max, min float64
			if len(last15Results) > 0 {
				max = float64(0)
				min = float64(last15Results[0].Duration) / float64(time.Microsecond)
				for _, res := range last15Results {
					ns := float64(res.Duration) / float64(time.Microsecond)
					if ns > max {
						max = ns
					}
					if ns < min {
						min = ns
					}
				}
			}

			schedule := nbschedule{
				Description: d,
				NotebookID:  job.NotebookID,
				NextRun:     findNextRun(job),
				Results:     last15Results,
				MaxDuration: max,
				MinDuration: min,
			}
			schedules = append(schedules, schedule)
		}
		return schedules, err
	},
	"users": func(ctx context.Context) (any, error) {
		rc, ok := GetRenderContext(ctx)
		if !ok {
			return nil, errors.New("no render context")
		}
		// limiting the user list to 50 for now
		// will increase when necessary
		buf := make([]iam.User, 50)
		buf, err := ListPath(ctx, rc.Conn, "/users", buf)
		if err != nil {
			return nil, err
		}
		return buf, nil
	},
	"notebooks": func(ctx context.Context) (any, error) {
		rc, ok := GetRenderContext(ctx)
		if !ok {
			return nil, errors.New("no render context")
		}
		const maxNotebookList = 100
		n, err := ListPath(ctx, rc.Conn, "/notebooks", make([]Notebook, maxNotebookList),
			func(n Notebook) bool {
				return !n.Archived
			})
		return Notebooks(n), err
	},
}

// Message represents a user-visible piece of information, such as the representation of error codes.
// No provision is made about plural forms (see [Go blog] for further information).
//
// [Go blog]: https://go.dev/blog/matchlang
type Message struct {
	Language string // BCP 47 tag

	ShortForm string
	LongForm  string
}

var knownMessages = map[string]Message{
	"s3log":             {ShortForm: "Remote File"},
	"awsassets":         {ShortForm: "Cloud Asset"},
	"starlark":          {ShortForm: ""},
	"upload":            {ShortForm: "Direct Upload"},
	"filestream":        {ShortForm: "Local File"},
	"journalctl":        {ShortForm: "Journald Unit"},
	"ds:logstream:sftp": {ShortForm: "Remote File"},
	"excel":             {ShortForm: "Local Excel File"},
}

func MessageFor(str, lang string) Message {
	return knownMessages[str]
}

type Notebooks []Notebook

func (nb Notebooks) filter(preds ...func(Notebook) bool) Notebooks {
	out := make(Notebooks, len(nb))
	j := 0
topLoop:
	for _, v := range nb {
		for _, p := range preds {
			if p(v) {
				out[j] = v
				j++
				continue topLoop
			}
		}
	}

	return out[:j]
}

func (nb Notebooks) count(preds ...func(Notebook) bool) int {
	macthes := 0
topLoop:
	for _, n := range nb {
		for _, p := range preds {
			if p(n) {
				macthes++
				continue topLoop
			}
		}
	}
	return macthes
}

func (nb Notebooks) Investigation() int {
	return nb.count(func(n Notebook) bool { return !n.Resolved })
}

func (nb Notebooks) LastWeek() int {
	return nb.count(func(n Notebook) bool { return !n.Resolved && n.LastEdit.After(time.Now().AddDate(0, 0, -7)) })
}

func (nb Notebooks) Urgent() int {
	return nb.count(func(n Notebook) bool { return !n.Resolved && n.Urgent })
}

func (nb Notebooks) Resolved() int {
	return nb.count(func(n Notebook) bool { return n.Resolved && n.Created.Before(time.Now().AddDate(0, 0, 15)) })
}

func (nb Notebooks) Active() Notebooks {
	return nb.filter(func(n Notebook) bool { return !n.Resolved })
}

// resolved notebooks older than 2 weeks are not displayed on home page
func (nb Notebooks) ResolvedNotebooks() Notebooks {
	return nb.filter(func(n Notebook) bool {
		return n.Resolved && !n.Archived && n.Created.Before(time.Now().AddDate(0, 0, 15))
	})
}

// RenderContext is the structure passed to all templates to render a given page.
// It can be used in lieu of the standard library context to interact with third-party libraries.
//
// There can only be a single render context in a value chain, and it will be returned by GetRenderContext
type RenderContext struct {
	context.Context // behave like a context, so can be used in annotating in template funcs

	Session  *iam.Session
	Notebook Notebook
	URL      *url.URL

	Conn Executor
}

func (ctx RenderContext) Value(key any) any {
	if _, ok := key.(rckey); ok {
		return ctx
	}
	return ctx.Context.Value(key)
}

type rckey struct{}

func GetRenderContext(ctx context.Context) (RenderContext, bool) {
	rc, ok := ctx.Value(rckey{}).(RenderContext)
	return rc, ok
}

func (app *App) DisplayTemplate(ctx context.Context, ssn *iam.Session, wtr http.ResponseWriter, req *http.Request) {
	tname := path.Base(req.URL.Path)
	// insert, as a courtesy, a default link
	if tname == "/" {
		http.Redirect(wtr, req, "/home", http.StatusPermanentRedirect)
		return
	}

	tpl := app.templ.get(tname)
	if tpl == nil {
		http.Error(wtr, "broken link", http.StatusNotFound)
		return
	}

	// use a buffer to catch errors in our (small) templates.
	// this means we can properly return a bad HTTP response if something goes sideway.
	var buf bytes.Buffer
	if err := tpl.ExecuteTemplate(&buf, "browse_base.html", RenderContext{ctx, ssn, Notebook{}, req.URL, app.db}); err != nil {
		tasks.SecureErr(ctx, wtr, err, "cannot execute template")
		return
	}
	io.Copy(wtr, &buf)
}
