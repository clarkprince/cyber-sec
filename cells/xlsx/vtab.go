//go:build cgo && linux

package xlsx

import (
	"context"
	"errors"
	"sort"

	"go.starlark.net/starlark"

	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/mdt"
)

type Record struct {
	builder *mdt.RecordBuilder
}

var recordMethods = map[string]*starlark.Builtin{
	"append": starlark.NewBuiltin("append", record_append),
	"send":   starlark.NewBuiltin("send", record_send),
}

func (rc *Record) Type() string { return "trout.software/record" }

func (rc *Record) String() string {
	dt, _ := rc.builder.Build().MarshalText()
	return string(dt)
}

func (rc *Record) Truth() starlark.Bool { return starlark.Bool(rc.builder.Len() > 0) }

func (rc *Record) Freeze() {}

func (b *Record) Hash() (uint32, error) {
	return 0, errors.New("unhashable type: trout.software/record")
}

func record(_ *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	return &Record{builder: new(mdt.RecordBuilder)}, nil
}

func (b *Record) Attr(name string) (starlark.Value, error) {
	return builtinAttr(b, name, recordMethods)
}
func (b *Record) AttrNames() []string { return builtinAttrNames(recordMethods) }

func builtinAttr(recv starlark.Value, name string, methods map[string]*starlark.Builtin) (starlark.Value, error) {
	b := methods[name]
	if b == nil {
		return nil, nil // no such method
	}
	return b.BindReceiver(recv), nil
}

func builtinAttrNames(methods map[string]*starlark.Builtin) []string {
	names := make([]string, 0, len(methods))
	for name := range methods {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

func record_append(_ *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	var key string
	var value starlark.Value
	if err := starlark.UnpackPositionalArgs(b.Name(), args, kwargs, 2, &key, &value); err != nil {
		return nil, err
	}
	if len(key) == 0 {
		return starlark.None, errors.New("empty key in record builder")
	}
	recv := b.Receiver().(*Record)

	switch value := value.(type) {
	case starlark.String:
		recv.builder.Append(key, string(value))
	case starlark.NoneType:
		// skip
	default:
		return starlark.None, errors.New("invalid value of type " + value.Type())
	}

	return starlark.None, nil
}

func record_send(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	if args.Len() != 0 || len(kwargs) != 0 {
		return starlark.None, errors.New("usage: send()")
	}

	recv := b.Receiver().(*Record)
	thread.Local(SQLiteIterKey).(chan mdt.Record) <- recv.builder.Build()
	return starlark.None, nil
}

const (
	SQLiteIterKey  = "t.sftw/xlsx-iterkey"
	OAuthClientKey = "t.sftw/xlsx-oauthkey"
	sessionKey     = "t.sftw/xlsx-session"
)

func Filter(ssn *iam.Session, prg *starlark.Program, f string, load func(thread *starlark.Thread, module string) (starlark.StringDict, error)) driver.Iter {
	res := make(chan mdt.Record)
	errc := make(chan error)
	thread := &starlark.Thread{Name: "fname", Load: load}
	thread.SetLocal(SQLiteIterKey, res)
	thread.SetLocal(sessionKey, ssn)
	wrkbk, err := workbook(f)
	if err != nil {
		errc <- err
		return &xlsxIterator{in: res, errc: errc}
	}

	go func() {
		BuiltIns["workbook"] = wrkbk
		_, err := prg.Init(thread, BuiltIns)
		if err == nil {
			close(res)
			return
		}

		if evalErr, ok := err.(*starlark.EvalError); ok {
			tasks.Annotate(context.TODO(), "err", evalErr.Backtrace())
		}

		errc <- err
	}()

	return &xlsxIterator{in: res, errc: errc}
}

type xlsxIterator struct {
	in   chan mdt.Record
	errc chan error
	err  error
	last mdt.Record
}

func (i *xlsxIterator) Next() bool {
	select {
	case rc, more := <-i.in:
		if !more {
			return false
		}
		i.last = rc
		return true
	case err := <-i.errc:
		i.err = err
		return false
	}
}
func (i *xlsxIterator) Err() error         { return i.err }
func (i *xlsxIterator) Record() mdt.Record { return i.last }
