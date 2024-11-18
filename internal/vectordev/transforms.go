package vectordev

import "encoding/json"

type Filter struct {
	Name      string `json:"-"`
	Condition string `json:"condition"`
}

func (f Filter) MarshalVector(cfg CommonTransformConfig) ([]byte, error) {
	return json.Marshal(struct {
		Filter
		CommonTransformConfig
		Type string `json:"type"`
	}{f, cfg, "filter"})
}
