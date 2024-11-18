package main

import (
	"encoding/json"
	"net/http"

	"trout.software/kraken/webapp/hub"
	"trout.software/kraken/webapp/internal/ulid"
)

type partialNotebook = struct {
	Resolved bool
	Urgent   bool
}

func getNotebook(nb partialNotebook) hub.Notebook {
	notebook := hub.Notebook{
		ID:       ulid.MustParse("01GNMNVY822CTQ9Q6SEM9F05H2"),
		Title:    "data-theft",
		Urgent:   nb.Urgent,
		Resolved: nb.Resolved,
	}
	return notebook

}

// Allow to pass explicit id like "urgent-notebook", "default-notebook"...
// instead of ULID
type fakeId = struct {
	ID string
}

type jsonErr = struct {
	Err string
}

func NotebookApi(w http.ResponseWriter, r *http.Request) {
	nbs := map[string]hub.Notebook{
		"default":         getNotebook(partialNotebook{}),
		"urgent":          getNotebook(partialNotebook{Urgent: true}),
		"resolved":        getNotebook(partialNotebook{Resolved: true}),
		"urgent-resolved": getNotebook(partialNotebook{Urgent: true, Resolved: true}),
	}
	action := r.URL.Query().Get("action")
	switch action {
	case "read":
		var id fakeId
		if err := json.NewDecoder(r.Body).Decode(&id); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(err)
			return
		}
		nb, ok := nbs[id.ID]
		if !ok {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(jsonErr{"id " + id.ID + " is invalid"})
			return
		}
		json.NewEncoder(w).Encode(nb)
	}
}
