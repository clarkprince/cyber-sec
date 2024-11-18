package main

import (
	"log"
	"net/http"
)

func EditorAPI(w http.ResponseWriter, r *http.Request) {
	defaultEditorDocument := `{ "type": "doc", "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "foo"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "bar"
        }
      ]
    }
  ]
			}`

	w.Header().Set("Content-Type", "application/json")
	params := r.URL.Query()
	action := params.Get("action")
	if action == "save" {
		w.WriteHeader(200)
		return
	}
	if action != "read" {
		log.Printf("unsupported editor action, got %s", params.Get("action"))
		w.WriteHeader(400)
	}
	nb := ""
	switch params.Get("notebook") {
	case "empty":
		nb = ""
	case "jsonerror":
		nb = "invalid json"
	case "servererror":
		w.WriteHeader(500)
		return
	default:
		nb = defaultEditorDocument
	}
	if len(nb) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.Write([]byte(nb))
}
