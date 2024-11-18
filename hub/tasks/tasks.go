// Package tasks implements a simple tracing framework for Security Hub
//
// The system differentiate between two core principles: (1) contextual information (e.g. user ID, …) and (2) events in a timeline. They are both constructed during the lifetime of the request, and output at the edge following a [canonical log line format]. Furthermore, following the Go standard library trace package, we differentiate between tasks (long process, possibly spanning multiple go-routines) and regions (short processes, in the same routine).
//
// Some well-known keys in the events timeline are used to generate nicer, more meaningful information:
//   - tasks names are always attached as the `task` key
//   - errors are attached to the `err` key,
//   - human-readable information are attached to the `msg` key
//   - regions get automatically converted to timings, and annotation are set.
//
// When in development, keys are automatically printed to render well on a terminal line: messages are set in the center of the console, and errors are highlighted in red.
//
// TODO(rdo) whatch progress of https://pkg.go.dev/log/slog for possible interactions
//
// [canonical log line format]: https://brandur.org/canonical-log-lines
package tasks

import (
	"bytes"
	"context"
	"encoding"
	"errors"
	"fmt"
	"io"
	"os"
	"runtime/trace"
	"sort"
	"strconv"
	"sync"
	"time"

	"golang.org/x/term"
)

// Verbose is a global switch that, when set to true, will case all tasks to be printed to the output (not just errors).
// Only change this value during server init, otherwise true mayhem will be unleashed upon thou.
var Verbose = os.Getenv("LOGLEVEL") == "debug"

var SysLogFormat bool

func init() {
	// default to using syslog if not in terminal mode
	SysLogFormat = !term.IsTerminal(int(os.Stdout.Fd()))

	AuditLogger = NewLogger("audit")
}

type tskey struct{}

// New creates a task instance named name, and return it alongside with a context.
// Tasks are not nested, that is, if the context contains a task, there will not be relations between them; but values from the parent task will be propagated.
//
// If runtime tracing is enabled, a runtime task is also created, and carried in the context. Refer to [trace.Task] for more information.
func New(ctx context.Context, name string) (context.Context, *Task) {
	tsk := taskPool.Get().(*Task)
	tsk.trip = false
	tsk.name = name
	tsk.start = time.Now()

	if trace.IsEnabled() {
		ctx, tsk.rt = trace.NewTask(ctx, name)
	}

	p, ok := ctx.Value(tskey{}).(*Task)
	if ok {
		p.mtx.Lock()
		tsk.tags = make(map[string]any, len(p.tags))
		for k, v := range p.tags {
			tsk.tags[k] = v
		}
		p.mtx.Unlock()
	}

	return context.WithValue(ctx, tskey{}, tsk), tsk
}

type Task struct {
	name string
	mtx  sync.Mutex

	tags map[string]any
	err  error

	start time.Time

	rt *trace.Task

	trip bool // used to detect violation in API use
	// TODO(rdo) use stack trace to help debugging too?
	term func()
}

var taskPool = sync.Pool{New: func() any { return &Task{term: func() {}, tags: make(map[string]any)} }}

func return_task(t *Task) {
	clear(t.tags)
	t.trip = true
	t.err = nil
	t.rt = nil
	taskPool.Put(t)
}

func (tsk *Task) SetName(name string) {
	tsk.mtx.Lock()
	tsk.name = name
	tsk.mtx.Unlock()
}

var out io.Writer = os.Stdout // allow override in tests

// End marks the task as terminated, and outputs the log line if required.
// The task must not be used after this call.
func (t *Task) End() {
	defer return_task(t)

	b := builders.Get().(*bytes.Buffer)
	defer return_builder(b)

	t.mtx.Lock()
	if t.rt != nil {
		t.rt.End()
	}

	if SysLogFormat {
		rfc5424(t, b)
	} else {
		text(t, b)
	}

	t.mtx.Unlock()
	fmt.Fprintln(out, b.String())
}

var builders = sync.Pool{New: func() any { return new(bytes.Buffer) }}

func return_builder(b *bytes.Buffer) {
	b.Reset()
	builders.Put(b)
}

// text formats the canonical log line for pretty-printing in a terminal.
// this is to help developers read and understand logs during development.
func text(task *Task, b io.Writer) {
	fmt.Fprintf(b, "\x1b[38;2;28;144;153m%s %s\x1b[0m", task.start.Format(time.TimeOnly), task.name)

	// sorting is for consistent output
	keys := make([]string, 0, len(task.tags))
	for k := range task.tags {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Fprintf(b, " %s=", k)
		v := task.tags[k]
		if v, ok := v.(string); ok {
			if needsescape(v) {
				v = strconv.Quote(v)
			}
			fmt.Fprint(b, v)
			continue
		}
		if m, ok := task.tags[k].(encoding.TextMarshaler); ok {
			val, err := m.MarshalText()
			if err != nil {
				panic(err)
			}
			sv := string(val)
			if needsescape(sv) {
				sv = strconv.Quote(sv)
			}

			fmt.Fprint(b, sv)
			continue
		}
		fmt.Fprintf(b, "%+v", task.tags[k])
	}
	switch dur := time.Since(task.start); {
	case dur < 1*time.Millisecond:
		// nothing
	case dur < 50*time.Millisecond:
		fmt.Fprintf(b, " duration=\x1b[38;2;254;100;226m%s\x1b[0m", dur)
	case dur < 100*time.Millisecond:
		fmt.Fprintf(b, " duration=\x1b[38;2;251;180;185m%s\x1b[0m", dur)
	case dur < 200*time.Millisecond:
		fmt.Fprintf(b, " duration=\x1b[38;2;247;104;161m%s\x1b[0m", dur)
	case dur < 400*time.Millisecond:
		fmt.Fprintf(b, " duration=\x1b[38;2;197;27;138m%s\x1b[0m", dur)
	default:
		fmt.Fprintf(b, " duration=\x1b[38;2;122;1;119m%s\x1b[0m", dur)
	}

	if task.err != nil {
		fmt.Fprintf(b, " \x1b[1;31m\"%s\"\x1b[0m", fixedstring(task.err.Error(), 1024))
	}
}

// Annotate adds a top-level annotation to the task, mapping key to value.
// Annotation key should follow the [Prometheus] naming convention, both when the key is a metric name or a label.
// Annotations are always displayed alongside to the task, at the top-level.
// If a tag already exists for key, it is overwriten.
// If there is no task in context, this is a no-op.
// If the value is an error, the task is marked as having failed.
// If runtime tracing is enabled, and the value is representable, it will be added to the runtime trace.
//
// [Prometheus]: https://prometheus.io/docs/practices/naming/
func Annotate(ctx context.Context, key string, value any) {
	if value == nil {
		return
	}

	tsk, ok := ctx.Value(tskey{}).(*Task)
	if !ok {
		return
	}
	tsk.mtx.Lock()
	defer tsk.mtx.Unlock()

	if tsk.trip {
		panic(apiUseViolation)
	}

	if err, iserr := value.(error); iserr && err != nil {
		tsk.err = err
		return
	}

	if tsk.rt != nil {
		switch value := value.(type) {
		case string:
			trace.Log(ctx, key, value)
		case interface{ String() string }:
			trace.Log(ctx, key, value.String())
		}
	}

	tsk.tags[key] = value
}

var apiUseViolation = errors.New("API use violation: Annotate called after End")

// return the string as a fixed-size
func fixedstring(msg string, sz int) string {
	buf := make([]byte, sz)
	if len(msg) >= sz {
		const elipsis = "(…)"
		copy(buf, msg[:sz-len(elipsis)])
		copy(buf[sz-len(elipsis):], []byte(elipsis))
	} else {
		copy(buf, msg)
	}
	return string(buf)
}
