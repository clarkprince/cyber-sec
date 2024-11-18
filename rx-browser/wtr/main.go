package main

import (
	"encoding/json"
	"errors"
	_ "expvar"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/fxamacker/cbor/v2"
	"go.starlark.net/resolve"
	"go.starlark.net/starlark"
	"log/slog"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/ulid"
)

var indextm = template.Must(template.ParseFiles("wtr/index.html"))
var tplf = template.Must(template.ParseGlob("wtr/templates/*.html"))

// displays a specific web component based on its registered name
var componenttm = template.Must(template.
	// filepath must match this name
	New("component.html").
	Funcs(template.FuncMap{
		"join": func(vs []string) string {
			if len(vs) == 1 {
				return vs[0]
			}
			return strings.Join(vs, ",")
		},
		"escape": EscapeString,
		// will dismiss multiple instances of the same attribute
		// handle empty attributes properly (for boolean attributes)
		"attribute": func(name string, attrs []string) string {
			if len(attrs) == 0 || len(attrs[0]) == 0 {
				return name
			}
			return name + "=" + attrs[0]
		},
	}).
	ParseFiles("wtr/component.html"))

func SpitDot(rc *mdt.Record, name string) {
	out, err := os.CreateTemp("", name+".dot")
	if err != nil {
		log.Fatal("creating temp file", err)
	}

	rc.PrintDot(out)
	if err := out.Close(); err != nil {
		log.Fatal("closing file", err)
	}

	err = exec.Command("dot", "-Tpng", "-o"+name, out.Name()).Run()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			log.Fatal("command failed with ", string(ee.Stderr), ee.ProcessState)
		}
		log.Fatal("command failed", err)
	}
}

func init() {
	// set flags not in the spec
	resolve.AllowGlobalReassign = true
	resolve.AllowSet = true
	resolve.AllowRecursion = true
}

func main() {
	listenAddress := flag.String("listen", ":8000", "port to listen on")
	flag.Parse()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		datasets := make(map[string]string)
		filepath.WalkDir("wtr/datasets", func(path string, _ fs.DirEntry, err error) error {
			if filepath.Ext(path) == ".star" || filepath.Ext(path) == ".lorth" {
				filename := filepath.Base(path)
				split := strings.Split(filename, "_")
				maybeULID := split[0]
				u, err := ulid.Parse(maybeULID)
				if err != nil {
					log.Fatalf("invalid starlark name: use convention <ulid>_<friendlyname>.star")
				}
				datasets[path] = u.String()
			}
			return err
		})

		indextm.Execute(w, datasets)
	})
	http.HandleFunc("/components/", func(w http.ResponseWriter, r *http.Request) {
		_, cn := path.Split(r.URL.Path)
		err := componenttm.Execute(w, struct {
			Name string
			Args url.Values
		}{Name: cn, Args: r.URL.Query()})
		if err != nil {
			log.Printf("%v", err)
		}
	})

	http.HandleFunc("/templates/", func(w http.ResponseWriter, r *http.Request) {
		_, cn := path.Split(r.URL.Path)
		if err := r.ParseForm(); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := tplf.ExecuteTemplate(w, cn, r.PostForm); err != nil {
			log.Fatal("cannot execute template", err)
		}
	})

	http.HandleFunc("/api/notebook/editor", EditorAPI)

	// prevent 404 errors in console logs
	http.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "wtr/favicon.ico") })

	http.HandleFunc("/api/notebook", NotebookApi)

	http.HandleFunc("/api/notebook/data", func(w http.ResponseWriter, r *http.Request) {
		var m msg.Cell
		if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// convert the ulid back to a known dataset filename
		f, err := filepath.Glob("wtr/datasets/" + m.DataSource.String() + "_*")
		if err != nil || len(f) != 1 {
			msg := "no match"
			if err != nil {
				msg = err.Error()
			}
			http.Error(w, msg, http.StatusBadRequest)
			return
		}

		var ll mdt.LioLi
		switch filepath.Ext(f[0]) {
		case ".star":
			// keeping expectations in line with standard server, use the same function name
			// but we don’t need to – this is to test the FE, not starlark :D
			var t starlark.Thread
			t.SetLocal(LioLiKey, mdt.LioLi{})
			builtins := starlark.StringDict{"record": starlark.NewBuiltin("record", record)}
			if _, err := starlark.ExecFile(&t, f[0], nil, builtins); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			ll = t.Local(LioLiKey).(mdt.LioLi)
		case ".lorth":
			dt, err := os.ReadFile(f[0])
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			ll = mdt.ParseLORTH(string(dt))
		default:
			http.Error(w, "invalid file extension", http.StatusBadRequest)
			return
		}

		grammar, err := m.ParseGrammar()
		if err != nil && !errors.Is(err, msg.NoPatternNorGrammar) {
			http.Error(w, "invalid pattern or grammar "+err.Error(), http.StatusBadRequest)
			return
		}

		pmx.Lock()
		defer pmx.Unlock()
		var ng piql.Evaluator
		pivots := make(piql.Pivots, len(m.Pivots))
		j := 0
		for _, v := range m.Pivots {
			if len(v.On) == 0 {
				continue
			}
			p, err := piql.NewPivot(Pivots[v.Pivot], v.On[0])
			if err != nil {
				http.Error(w, fmt.Sprintf("parsing pivot id=%s, value=%s: err=%s", v.Pivot, Pivots[v.Pivot], err), http.StatusBadRequest)
				return
			}
			pivots[j] = p
			j++
		}
		iter := ng.MatchRules(pivots[:j])
		go ng.Run(r.Context(), ll.Match(mdt.AllRecords).IterAll(), grammar)

		enc := cbor.NewEncoder(w)
		enc.StartIndefiniteArray()
		for iter.Next() {
			enc.Encode(iter.Record())
		}
		enc.EndIndefinite()

		if iter.Err() != nil {
			slog.Error("error reading records",
				"error", err)
		}
	})

	http.HandleFunc("/api/pivot", PivotAPI)

	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("."))))

	flags := strings.Split(os.Getenv("FLAGS"), ",")
	http.HandleFunc("/info", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("X-Feature-Flags", strings.Join(flags, ","))
		w.Header().Add("Cache-Control", "no-cache")
	})
	http.HandleFunc("/toggle-flag", func(w http.ResponseWriter, r *http.Request) {
		name := r.FormValue("name")
		for i, v := range flags {
			if v == name {
				copy(flags[:i], flags[:i+1])
				flags = flags[:len(flags)-1]
				return
			}
		}
		flags = append(flags, name)
	})

	if os.Getenv("DEVROOT") == "" {
		log.Fatal("❌ Environment variable DEVROOT is not set.\nThis result in non-reproducible builds, I prefer to bail out.")
	}

	cert := filepath.Join(os.Getenv("DEVROOT"), "devcerts/localhost.pem")
	key := filepath.Join(os.Getenv("DEVROOT"), "devcerts/localhost-key.pem")
	if _, err := os.Stat(cert); err != nil {
		log.Fatal("missing certificate, cannot start server. Certificate must be in: ", cert)
	}

	log.Print("Server will run on ", *listenAddress)
	log.Fatal(http.ListenAndServeTLS(*listenAddress, cert, key, http.DefaultServeMux))
}
