package tasks

import (
	"context"
	"regexp"
	"strings"
	"testing"

	"log/slog"
)

var rfcRegexp = regexp.MustCompile(`\[[\w@]+( \w+=".+")*\]`)

func TestSyslogFormat(t *testing.T) {
	var buf strings.Builder
	out = &buf
	SysLogFormat = true

	ctx, tk := New(context.Background(), "task1")
	Annotate(ctx, "key1", 10)
	Annotate(ctx, "key2", "val")

	tk.End()

	t.Log(buf.String())

	// do not parse the whole line (a bit of a pain)
	// instead fast-track to using a quick regexp
	if !rfcRegexp.MatchString(buf.String()) {
		t.Error("log line does not match regexp; one of them is wrong")
	}
}

func TestSyslogHandler(t *testing.T) {
	var buf strings.Builder
	out = &buf

	var s SyslogHandler
	lg := slog.New(s)
	lg.Debug("one message")
	lg.Info("another message", "value", 123)

	var llg = lg.WithGroup("adminssh" + TroutPEN)
	llg.Info("user logged in", "action", "log-in")

	t.Log(buf.String())

}
