package vectordev

import "encoding/json"

// Syslog is a global source listener
type Syslog struct {
	Name    string `json:"-"`
	Address string `json:"address,omitempty"`
	Mode    string `json:"mode"`
	Path    string `json:"path,omitempty"`
}

func (sl Syslog) MarshalVector(cfg CommonSourceConfig) ([]byte, error) {
	return json.Marshal(struct {
		Syslog
		CommonSourceConfig
		Type string `json:"type"`
	}{sl, cfg, "syslog"})
}
