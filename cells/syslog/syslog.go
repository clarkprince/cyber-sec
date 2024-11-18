// Package syslog provides a data source back-end to read data from syslog engines.
//
// This is implemented, behind the scene, by a true syslog engine (namely vector.dev), and forwarded via local socket.
package syslog

import (
	"context"
	"fmt"
	"hash/fnv"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
	"trout.software/kraken/webapp/internal/sqlite/stability"
	"trout.software/kraken/webapp/internal/vectordev"
)

var _logger = tasks.NewLogger("syslog")

type Syslog struct {
	_ stability.SerializedValue

	Facility string `form:"facility,type=multiselect"`
	Severity string `form:"severity,type=select"`
	AppName  string `form:"appname"`
	MsgID    string `form:"msgid"`

	err error
}

func (s Syslog) sockname() string {
	hash := fnv.New64a()
	hash.Write([]byte(s.Facility))

	hash.Write([]byte(s.AppName))
	hash.Write([]byte(s.MsgID))
	return strconv.FormatUint(hash.Sum64(), 36)
}

var _syslogHandler = struct {
	runner  process
	buffers map[string]*buffer
}{
	&subprocess{}, make(map[string]*buffer),
}

const maxBufferMsg = 30_000 // enough data to work against LioLi, and limit to ~ 3MB / source.

// ListenAddr configures the address and interface the syslog endpoint will be listening on.
var ListenAddr = "0.0.0.0:514"

// StartSyslogHandler starts a syslog listener against the given sources.
// Messages are captured and buffered even without user connection.
// If the server is already started, only new connections are added.
func StartSyslogHandler(sources []Syslog) error {
	for _, s := range sources {
		if _syslogHandler.buffers[s.sockname()] != nil {
			continue
		}

		buf := newbuffer(maxBufferMsg)
		go listenSocket(s.sockname(), buf)
		_syslogHandler.buffers[s.sockname()] = buf
	}

	ser, err := genconfig(sources, ListenAddr)
	if err != nil {
		return err
	}

	if err := _syslogHandler.runner.Reload(ser); err != nil {
		return fmt.Errorf("cannot reload syslog listener: %w", err)
	}

	return nil
}

func genconfig(sources []Syslog, addr string) ([]byte, error) {
	var t vectordev.Topology
	t.AddSource(syslogsrv{
		name:    "syslog_global",
		Mode:    "udp",
		Address: addr,
	}, vectordev.CommonSourceConfig{})

	for _, s := range sources {
		name := s.sockname()
		var b vectordev.CondBuilder
		b.AddMultiExpr("msgid", s.MsgID)
		b.AddMultiExpr("appname", s.AppName)
		b.AddMultiExpr("severity", s.Severity)
		b.AddMultiExpr("facility", s.Facility)
		if cond := b.Condition(); cond != "" {
			t.AddTransform(filter{name: "filter_" + name,
				Condition: b.Condition()},
				vectordev.CommonTransformConfig{
					Inputs: []string{"syslog_global"},
				})
			t.AddSink(unixsock{name: "socket_" + name,
				Path: filepath.Join(os.Getenv("RUNTIME_DIRECTORY"), name),
			}, vectordev.CommonSinkConfig{
				Inputs: []string{"filter_" + name},
			})
		} else {
			t.AddSink(unixsock{name: "socket_" + name,
				Path: filepath.Join(os.Getenv("RUNTIME_DIRECTORY"), name),
			}, vectordev.CommonSinkConfig{
				Inputs: []string{"syslog_global"},
			})
		}

	}
	return vectordev.Marshal(t, vectordev.GlobalOptions{
		DataDir: filepath.Join(os.Getenv("STATE_DIRECTORY"), "vector"),
	})
}

var _ driver.HTTPDefiner = &Syslog{}

// order matters
var severities = []httpform.SelectOption{
	{Label: "emerg", Value: "emerg"},
	{Label: "alert", Value: "alert"},
	{Label: "crit", Value: "crit"},
	{Label: "err", Value: "err"},
	{Label: "warning", Value: "warning"},
	{Label: "notice", Value: "notice"},
	{Label: "info", Value: "info"},
	{Label: "debug", Value: "debug"},
}

var facilites = []httpform.SelectOption{
	{Label: "kern", Value: "1"},
	{Label: "user", Value: "2"},
	{Label: "mail", Value: "3"},
	{Label: "daemon", Value: "4"},
	{Label: "auth", Value: "5"},
	{Label: "syslog", Value: "6"},
	{Label: "lpr", Value: "7"},
	{Label: "news", Value: "8"},
	{Label: "uucp", Value: "9"},
	{Label: "cron", Value: "10"},
	{Label: "authpriv", Value: "11"},
	{Label: "ftp", Value: "12"},
	{Label: "local0", Value: "13"},
	{Label: "local1", Value: "14"},
	{Label: "local2", Value: "15"},
	{Label: "local3", Value: "16"},
	{Label: "local4", Value: "17"},
	{Label: "local5", Value: "18"},
	{Label: "local6", Value: "19"},
	{Label: "local7", Value: "20"},
}

func (s *Syslog) DefineForm(ssn *iam.Session) []httpform.Field {
	base := httpform.GenerateDefinition(s)
	for i, v := range base {
		switch v.Name {
		case "facility":
			base[i].SelectOptions = facilites
		case "severity":
			base[i].SelectOptions = severities
		}
	}
	return base
}

func (s *Syslog) Init(r *http.Request) { s.err = httpform.Unmarshal(r, s) }

func (s *Syslog) Test(ctx context.Context, ssn iam.Session) error {
	// connect to Vector through API
	// do a quick health check against the transform / sink
	if st := _syslogHandler.runner.Status(); st == statusok {
		return nil
	} else {
		return fmt.Errorf("invalid status %d", st)
	}
}

func (s *Syslog) Select(_ driver.Stream, _ *iam.Session, g mdt.Grammar, _ shards.Shard, _ []piql.Pivot) driver.Iter {
	// connect to socket based on s conditions
	parser := mdt.CompileGrammar(g)

	buf := _syslogHandler.buffers[s.sockname()]
	if buf == nil {
		return driver.ErrWrap(fmt.Errorf("no buffer for socket %s! This is a programmer error", s.sockname()))
	}
	return &bufIter{it: buf.iter(), parser: parser}
}

type bufIter struct {
	it     *iter
	parser *mdt.Instr
}

func (i *bufIter) Next() bool { return i.it.next() }
func (i *bufIter) Record() mdt.Record {
	v, _ := i.parser.ReadLine([]byte(i.it.value()))
	return v
}
func (i *bufIter) Err() error { return nil }
