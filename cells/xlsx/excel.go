package xlsx

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"go.starlark.net/starlark"
	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

type Excel struct {
	Name   string `form:"filename,required,placeholder=/var/logs.xlsx"`
	Reader string `form:"reader,required"`
}

var _ driver.Selectable = &Excel{}
var checkAccess = logstream.CheckAccess

func (e *Excel) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, path shards.Shard, cs []piql.Pivot) driver.Iter {
	if e.Reader != "" {
		prg, err := compileStarlarkScript(context.Background(), *ssn, e.Reader)
		if err != nil {
			return driver.ErrWrap(err)
		}
		load := func(thread *starlark.Thread, module string) (starlark.StringDict, error) {
			ssn := thread.Local(sessionKey).(*iam.Session)
			if ssn == nil {
				return nil, errors.New("no session")
			}
			script, err := storage.FindOne[Starlark](context.Background(), ssn.UnlockedStorage.Executor, fmt.Sprint("/starlark_userscript/libs/", module))
			if err != nil {
				return nil, err
			}
			wrkbk, err := workbook(e.Name)
			if err != nil {
				return nil, err
			}
			BuiltIns["workbook"] = wrkbk
			globals, err := starlark.ExecFile(thread, "", script, BuiltIns)
			if err != nil {
				return nil, err
			}
			return globals, nil
		}
		return Filter(ssn, prg, e.Name, load)
	}
	return driver.ErrWrap(errors.New("no reader selected"))
}

func compileStarlarkScript(ctx context.Context, ssn iam.Session, readerName string) (*starlark.Program, error) {
	s, err := storage.FindOne[Starlark](ctx, ssn.UnlockedStorage.Executor, fmt.Sprint("/starlark_userscript/scripts/", readerName))
	if err != nil {
		return nil, err
	}

	_, prg, err := starlark.SourceProgram("", s.Script, BuiltIns.Has)
	if err != nil {
		return nil, err
	}

	return prg, nil
}

func (e *Excel) Streams() []driver.Stream {
	return []driver.Stream{{Name: "Logs", Type: "stream:logstream:local-file-excel"}}
}

func (e *Excel) Init(r *http.Request) { httpform.Unmarshal(r, e) }

func (d *Excel) Test(ctx context.Context, ssn iam.Session) error {
	// check if excel file exists.
	if d.Name == "" {
		return errors.New("no file found")
	}
	src, err := checkAccess(d.Name)
	if err != nil {
		return err
	}
	if _, err := os.Stat(src); err != nil {
		return err
	}

	// check if the reader exists and can be compiled
	if d.Reader == "" {
		return errors.New("no reader found")
	}
	if _, err := compileStarlarkScript(ctx, ssn, d.Reader); err != nil {
		return err
	}
	return nil
}

func (e *Excel) DefineForm(ssn *iam.Session) []httpform.Field {
	base := httpform.GenerateDefinition(e)
	scripts := make([]Starlark, 100)
	scripts, err := storage.ListPath[Starlark](context.Background(), ssn.UnlockedStorage.Executor, "/starlark_userscript/scripts/", scripts)
	if err != nil {
		return base
	}
	opts := make([]httpform.SelectOption, len(scripts))
	for i, s := range scripts {
		opts[i] = httpform.SelectOption{Value: s.Name, Label: strings.Trim(s.Name, ".star")}
	}
	for i, v := range base {
		if v.Name == "reader" {
			base[i].Type = "select"
			base[i].SelectOptions = opts
		}
	}

	return base
}
