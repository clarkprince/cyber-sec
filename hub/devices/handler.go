// For now, it is mostly used as a playground against the remote capabilities:
// https://osquery.readthedocs.io/en/stable/deployment/remote/
package devices

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/trace"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/fxamacker/cbor/v2"
)

type remoteConfigResponse struct {
	Schedules map[string]Schedule `json:"schedule"`
}

type Schedule struct {
	Name     string `json:"-" toml:"name"`
	Query    string `json:"query" toml:"query"`
	Interval int    `json:"interval" toml:"interval"`
}

var Schedules []Schedule

func PushConfig(w http.ResponseWriter, r *http.Request) {
	_, tsk := trace.NewTask(r.Context(), "hub:osfwd:push-config")
	defer tsk.End()

	minconf := remoteConfigResponse{Schedules: make(map[string]Schedule, len(Schedules))}
	for _, v := range Schedules {
		minconf.Schedules[v.Name] = v
	}

	json.NewEncoder(w).Encode(minconf)
}

func ForwardLog(w http.ResponseWriter, r *http.Request) {
	ctx, tsk := trace.NewTask(r.Context(), "hub:osfwd:forward-log")
	defer tsk.End()

	if !syslog.listening {
		slog.Error("Device log received, but syslog not listening. Message discarded.")
		return
	}

	var msg LogMessage
	if err := cbor.NewDecoder(r.Body).Decode(&msg); err != nil {
		slog.Error(fmt.Sprintf("cannot read request: %s", err))
		return
	}

	timestamp := time.Now().Format(time.RFC3339) // TODO from request

	_region_wait := trace.StartRegion(ctx, "hub:osfwd:wait-socket")
	ctn := <-syslog.unixout
	_region_wait.End()

	var pretty strings.Builder
	for col, val := range msg.Columns {
		if needsQuoting(val) {
			val = strconv.Quote(val)
		}
		fmt.Fprintf(&pretty, "%s=%s ", col, val)
	}

	_region_write := trace.StartRegion(ctx, "hub:osfwd:write-socket")
	_, err := fmt.Fprintf(ctn, "<%d>1 %s %s devices-monitor %s LOG [devicelog@60446 machineid=\"%s\" queryname=\"%s\" hostidentifier=\"%s\" unixtime=\"%d\"] %s\n",
		sysInfo|sysLOCAL2, timestamp, Hostname, PID, msg.MachineID, msg.Name, msg.HostName, msg.UnixTime, pretty.String())
	if err != nil {
		slog.Error(fmt.Sprintf("cannot write message: %s", err))
		return
	}
	_region_write.End()

	syslog.unixout <- ctn
}

func needsQuoting(s string) bool {
	if len(s) == 0 {
		return true
	}
	for i := 0; i < len(s); {
		b := s[i]
		if b < utf8.RuneSelf {
			if 1<<(b&0xf)&safeset[b>>4] == 0 {
				return true
			}
			i++
			continue
		}
		r, size := utf8.DecodeRuneInString(s[i:])
		if r == utf8.RuneError || unicode.IsSpace(r) || !unicode.IsPrint(r) {
			return true
		}
		i += size
	}
	return false
}

// all except control characters, space, equal or quote
var safeset = [...]uint16{
	0b0000000000000000, // 0x0.
	0b1000000000000000, // 0x1.
	0b1111111111111010, // 0x2.
	0b1101111111111111, // 0x3.
	0b1111111111111111, // 0x4.
	0b1111111111111111, // 0x5.
	0b1111111111111111, // 0x6.
	0b1111111111111111, // 0x7.
	0b1111111111111111, // 0x8.
	0b1111111111111111, // 0x9.
	0b1111111111111111, // 0xa.
	0b1111111111111111, // 0xb.
	0b1111111111111111, // 0xc.
	0b1111111111111111, // 0xd.
	0b1111111111111111, // 0xe.
	0b1111111111111111, // 0xf.
}

// structured info in log forwarding:
//  machine ID
//  query name

type Node struct {
	Key string
}

var Handler = http.NewServeMux()

func init() {
	Handler.HandleFunc("/fleet/config", PushConfig)
	Handler.HandleFunc("/fleet/log", ForwardLog)
}
