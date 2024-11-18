package devices

import (
	"github.com/fxamacker/cbor/v2"
)

/*
{
  "action": "added",
  "columns": {
    "name": "osqueryd",
    "path": "/opt/osquery/bin/osqueryd",
    "pid": "97830"
  },
  "name": "processes",
  "hostname": "hostname.local",
  "calendarTime": "Tue Sep 30 17:37:30 2014",
  "unixTime": "1412123850",
  "epoch": "314159265",
  "counter": "1",
  "numerics": false
}
*/

type LogMessage struct {
	MachineID string `cbor:"1"`

	Name     string            `cbor:"19" json:"name"`
	HostName string            `cbor:"20" json:"hostIdentifier"`
	UnixTime int64             `cbor:"21" json:"unixTime"`
	Action   string            `cbor:"22" json:"action"`
	Columns  map[string]string `cbor:"23" json:"columns"`
}

var CBOREncMode cbor.EncMode

func init() {
	var err error
	CBOREncMode, err = cbor.CTAP2EncOptions().EncMode()
	if err != nil {
		panic(err)
	}
}
