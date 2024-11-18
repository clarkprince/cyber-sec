package main

import (
	"errors"
	"sort"

	"go.starlark.net/starlark"
	"trout.software/kraken/webapp/internal/mdt"
)

type Record struct {
	builder *mdt.RecordBuilder
	ll      []mdt.Record
}

func record(_ *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	return &Record{builder: new(mdt.RecordBuilder)}, nil
}

var recordMethods = map[string]*starlark.Builtin{
	"append": starlark.NewBuiltin("append", record_append),
	"extend": starlark.NewBuiltin("extend", record_extend),
	"send":   starlark.NewBuiltin("send", record_send),
}

func (_ *Record) Type() string { return "trout.software/record" }
func (rc *Record) String() string {
	dt, _ := rc.builder.Build().MarshalText()
	return string(dt)
}
func (rc *Record) Truth() starlark.Bool { return starlark.Bool(rc.builder.Len() > 0) }

func (rc *Record) Freeze() {
	// TODO(rdo) could we have parallelism here?
	// this is currently blocked by extend which modifies the initial Record
}

func (b *Record) Hash() (uint32, error) {
	return 0, errors.New("unhashable type: trout.software/record")
}

func (b *Record) Attr(name string) (starlark.Value, error) {
	return builtinAttr(b, name, recordMethods)
}
func (b *Record) AttrNames() []string { return builtinAttrNames(recordMethods) }

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

func record_extend(_ *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	var other *Record
	if err := starlark.UnpackPositionalArgs(b.Name(), args, kwargs, 2, &other); err != nil {
		return nil, err
	}
	recv := b.Receiver().(*Record)
	recv.builder.Into(other.builder.Build())

	return starlark.None, nil
}

const LioLiKey = "wtr/lioli"

func record_send(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	if args.Len() != 0 || len(kwargs) != 0 {
		return starlark.None, errors.New("usage: send()")
	}

	recv := b.Receiver().(*Record)
	ll := thread.Local(LioLiKey).(mdt.LioLi)
	ll = append(ll, recv.builder.Build())
	thread.SetLocal(LioLiKey, ll)
	return starlark.None, nil
}

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
