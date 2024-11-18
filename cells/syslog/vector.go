package syslog

import (
	"encoding/json"

	"trout.software/kraken/webapp/internal/vectordev"
)

type syslogsrv struct {
	name    string `json:"-"`
	Address string `json:"address,omitempty"`
	Mode    string `json:"mode"`
	Path    string `json:"path,omitempty"`
}

func (s syslogsrv) Name() string { return s.name }

func (sl syslogsrv) MarshalVector(cfg vectordev.CommonSourceConfig) ([]byte, error) {
	return json.Marshal(struct {
		syslogsrv
		vectordev.CommonSourceConfig
		Type string `json:"type"`
	}{sl, cfg, "syslog"})
}

type filter struct {
	name      string `json:"-"`
	Condition string `json:"condition"`
}

func (f filter) Name() string { return f.name }

func (f filter) MarshalVector(cfg vectordev.CommonTransformConfig) ([]byte, error) {
	return json.Marshal(struct {
		filter
		vectordev.CommonTransformConfig
		Type string `json:"type"`
	}{f, cfg, "filter"})
}

type unixsock struct {
	name string `json:"-"`
	Path string `json:"path"`
}

func (s unixsock) Name() string { return s.name }

func (s unixsock) MarshalVector(cfg vectordev.CommonSinkConfig) ([]byte, error) {
	cfg.Encoding.Codec = "text"
	return json.Marshal(struct {
		unixsock
		vectordev.CommonSinkConfig
		Type string `json:"type"`
		Mode string `json:"mode"`
	}{s, cfg, "socket", "unix"})
}
