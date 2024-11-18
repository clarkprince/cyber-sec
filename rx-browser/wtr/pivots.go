package main

import (
	"encoding/json"
	"expvar"
	"net/http"
	"sync"

	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/ulid"
)

var Pivots = make(map[ulid.ULID]string)
var pmx sync.Mutex

var obsPivots = expvar.NewMap("stored_pivots")

func PivotAPI(w http.ResponseWriter, r *http.Request) {
	action := r.URL.Query().Get("action")
	id := ulid.Make()
	if p := r.URL.Query().Get("pivot"); p != "" {
		id = ulid.MustParse(p)
	}

	type Pivot struct {
		msg.PivotDefinition
		Value string `json:"value"`
	}

	pmx.Lock()
	var q string
	switch action {
	case "read":
		q = Pivots[id]
	case "edit-piql":
		var err error
		_, q, err = piql.ParseSingle(r.PostFormValue("query"))
		if err != nil {
			// return underlying response, contains parsing info
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(err)
			pmx.Unlock()
			return
		}

		Pivots[id] = q
	}
	pmx.Unlock()
	obsPivots.Set(id.String(), S(q))

	json.NewEncoder(w).Encode(Pivot{
		PivotDefinition: msg.PivotDefinition{
			ID:   id,
			Name: q,
			Type: "pivot:piql:piql",
		},
		Value: q,
	})
}

type S string

func (s S) String() string { dt, _ := json.Marshal(s); return string(dt) }
