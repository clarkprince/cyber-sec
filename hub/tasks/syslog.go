package tasks

import (
	"bytes"
	"context"
	"encoding"
	"fmt"
	"io"
	"strconv"
	"sync"
	"time"
	"unicode/utf8"

	"log/slog"
)

// we generally assume that the Hub runs in a systemd-enabled environment
// in this case, the syslog standard message is not required, and instead, it is enough to prefix the message with the severity
//
// https://www.freedesktop.org/software/systemd/man/sd-daemon.html

const RFC3339Milli = "2006-01-02T15:04:05.999Z07:00"

func rfc5424(task *Task, b io.Writer) {
	dur := time.Since(task.start)

	prio := severityNotice
	if task.err != nil {
		prio = severityError
	}
	fmt.Fprintf(b, "<%d>[task@60446 duration=\"%s\" name=\"%s\"", prio, dur, task.name)

	for k, v := range task.tags {
		fmt.Fprintf(b, " %s=", k)
		if v, ok := v.(string); ok {
			fmt.Fprint(b, strconv.Quote(v))
			continue
		}
		if m, ok := v.(encoding.TextMarshaler); ok {
			val, err := m.MarshalText()
			if err != nil {
				panic(err)
			}
			fmt.Fprint(b, strconv.Quote(string(val)))
			continue
		}

		fmt.Fprintf(b, "\"%+v\"", v)
	}
	fmt.Fprint(b, "]")

	if task.err != nil {
		fmt.Fprintf(b, " %s", strconv.Quote(task.err.Error()))
	}
}

// NewLogger returns a log handler specific to the given message ID.
func NewLogger(msgid string) *slog.Logger {
	lvl := slog.LevelInfo
	if Verbose {
		lvl = slog.LevelDebug
	}
	if SysLogFormat {
		return slog.New(SyslogHandler{group: msgid + TroutPEN, level: lvl})
	} else {

		return slog.New(ConsoleHandler{group: msgid, level: lvl})
	}
}

type ConsoleHandler struct {
	level slog.Level

	attrs []slog.Attr
	group string
}

func (h ConsoleHandler) Enabled(_ context.Context, level slog.Level) bool { return level >= h.level }
func (h ConsoleHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return ConsoleHandler{
		level: h.level, group: h.group, attrs: append(h.attrs, attrs...),
	}
}
func (h ConsoleHandler) WithGroup(name string) slog.Handler {
	return ConsoleHandler{
		level: h.level, group: name, attrs: h.attrs,
	}
}

func (h ConsoleHandler) Handle(ctx context.Context, rc slog.Record) error {
	buf := logpool.Get().(*bytes.Buffer)
	buf.Reset()

	fmt.Fprintf(buf, "\x1b[38;2;28;144;153m%s\x1b[0m", time.Now().Format(time.TimeOnly))
	if h.group != "" {
		fmt.Fprintf(buf, " [\x1b[38;2;28;144;153m%s\x1b[0m]", h.group)
	}

	colored := true
	switch rc.Level {
	case slog.LevelDebug:
		colored = false
	case slog.LevelInfo, slog.LevelWarn:
		fmt.Fprint(buf, "\x1b[1m") // bold
	case slog.LevelError:
		fmt.Fprint(buf, "\x1b[1;31m") // red
	}

	attrs := h.attrs
	rc.Attrs(func(a slog.Attr) bool { attrs = append(attrs, a); return true })

	fmt.Fprintf(buf, " %s", rc.Message)
	printAttr(buf, attrs)
	fmt.Fprint(buf, "\n")

	if colored {
		fmt.Fprint(buf, "\x1b[0m")
	}

	_, err := io.Copy(out, buf)
	logpool.Put(buf)
	return err
}

type SyslogHandler struct {
	level slog.Level

	attrs []slog.Attr
	group string
}

func (h SyslogHandler) Enabled(_ context.Context, level slog.Level) bool { return level >= h.level }
func (h SyslogHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return SyslogHandler{
		level: h.level, group: h.group, attrs: append(h.attrs, attrs...),
	}
}
func (h SyslogHandler) WithGroup(name string) slog.Handler {
	return SyslogHandler{
		level: h.level, group: name, attrs: h.attrs,
	}
}

var logpool = sync.Pool{New: func() any { return new(bytes.Buffer) }}

// TroutPEN is our Private Entreprise Number. Groups must be qualified with it as a suffix.
const TroutPEN = "@60446"

const (
	severityError   = 3
	severityWarning = 4
	severityNotice  = 5
	severityDebug   = 7
)

func (h SyslogHandler) Handle(ctx context.Context, rc slog.Record) error {
	var severity int
	switch {
	case rc.Level <= slog.LevelDebug:
		severity = severityDebug
	case rc.Level <= slog.LevelInfo:
		severity = severityNotice
	case rc.Level <= slog.LevelWarn:
		severity = severityWarning
	default:
		severity = severityError
	}

	buf := logpool.Get().(*bytes.Buffer)
	buf.Reset()

	fmt.Fprintf(buf, "<%d>", severity)

	var name string
	if h.group != "" {
		name = h.group
	} else {
		name = "msg@60446"
	}

	attrs := h.attrs
	rc.Attrs(func(a slog.Attr) bool { attrs = append(attrs, a); return true })

	fmt.Fprintf(buf, "[%s", name)
	printAttr(buf, attrs)
	fmt.Fprintf(buf, "] %s\n", rc.Message)

	_, err := io.Copy(out, buf)
	logpool.Put(buf)
	return err
}

func printAttr(buf *bytes.Buffer, attrs []slog.Attr) {
	// sort groups at end, make sure we can properly nest
	for i, j := 0, len(attrs)-1; i <= j; i++ {
		if attrs[i].Value.Kind() == slog.KindGroup {
			attrs[i], attrs[j] = attrs[j], attrs[i]
			j--
		}
	}

	for _, attr := range attrs {
		fmt.Fprintf(buf, " %s=", attr.Key)
		v := attr.Value
		for v.Kind() == slog.KindLogValuer {
			v = v.LogValuer().LogValue()
		}

		switch v.Kind() {
		case slog.KindAny:
			fmt.Fprintf(buf, "\"%+v\"", attr.Value.Any())
		case slog.KindBool:
			fmt.Fprintf(buf, "\"%t\"", attr.Value.Bool())
		case slog.KindDuration:
		case slog.KindFloat64:
			fmt.Fprintf(buf, "\"%f\"", attr.Value.Float64())
		case slog.KindInt64:
			fmt.Fprintf(buf, "\"%d\"", attr.Value.Int64())
		case slog.KindString:
			fmt.Fprintf(buf, "\"%s\"", stringescape(attr.Value.String()))
		case slog.KindTime:
			fmt.Fprintf(buf, "\"%s\"", attr.Value.Time().Format(RFC3339Milli))
		case slog.KindUint64:
			fmt.Fprintf(buf, "\"%d\"", attr.Value.Uint64())
		case slog.KindGroup:
			fmt.Fprintf(buf, "][%s ", attr.Key)
			printAttr(buf, attr.Value.Group())
		}
	}

}

var eschars = [utf8.RuneSelf]bool{'"': true, '\'': true, ']': true}

func needsescape(s string) bool {
	for _, r := range s {
		if r < utf8.RuneSelf && eschars[r] {
			return true
		}
	}
	return false
}

func stringescape(s string) string {
	var j int
	for i, v := range s {
		if v < utf8.RuneSelf && eschars[v] {
			break
		}
		j = i
	}

	if j == len(s) {
		return s
	}

	buf := make([]byte, j)
	copy(buf, s[:j])
	for _, v := range s[j:] {
		if v < utf8.RuneSelf && eschars[v] {
			buf = append(buf, '\'')
			buf = utf8.AppendRune(buf, v)
		} else {
			buf = utf8.AppendRune(buf, v)
		}
	}

	return string(buf)
}
