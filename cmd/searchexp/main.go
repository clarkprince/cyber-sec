package main

import (
	"context"
	"flag"
	"log"
	"net/http"

	"trout.software/kraken/webapp/hub"
	"trout.software/kraken/webapp/hub/iam"
)

type App struct {
	*hub.App
}

func main() {
	log.Println("Starting server")
	app := hub.App{}

	conf := flag.String("conf", "searchexp/config/*.toml", "Configuration file to start from")
	err := hub.DecodeConfigFiles(&app, *conf)
	if err != nil {
		log.Fatal(err)
	}

	app.DBInit()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		app.SearchHandler(context.Background(), &iam.Session{}, w, r)
	})

	if err := http.ListenAndServe(":8180", nil); err != nil {
		log.Fatal("cannot start server: ", err)
	}

}
