package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"reflect"

	"trout.software/kraken/webapp/hub"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/internal/multierr"
	"trout.software/kraken/webapp/internal/sqlite"
)

var typesAtKey = map[string]reflect.Type{
	"/notebooks":   reflect.TypeOf(hub.Notebook{}),
	"/datasources": reflect.TypeOf(hub.DataSource{}),
	"/nbschedules": reflect.TypeOf(hub.NotebookSchedule{}),
	"/grammars":    reflect.TypeOf(driver.Grammar{}),
	"/pivots":      reflect.TypeOf(hub.Pivot{}),
}

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stdout, `
		-pkey=/entityPath
			display the JSON formated entities for the specified Path
		-pkey=/entityPath/ULID
			display the JSON formated entity matching the primary key
			`)
	}
	pkey := flag.String("pkey", "", "Select the values to be scanned from the entities table")
	dbname := flag.String("db", "kraken-trout.software", "Path to the database file")
	flag.Parse()

	typ, ok := typesAtKey[*pkey]
	if !ok {
		log.Fatal("Do not know how to read entries at, ", *pkey)
	}
	z := reflect.New(typ).Interface()

	db, err := sqlite.Open(*dbname)
	if err != nil {
		log.Fatalf("cannot open database %s: %s", "kraken-trout.software", err)
	}

	var errs multierr.E

	rows := db.Exec(context.TODO(), "select value from entities where pkey = ? or pkey like ?", *pkey, *pkey+"%")
	for rows.Next() {
		rows.Scan(z)
		jsonValue, err := json.Marshal(z)
		if err != nil {
			errs = append(errs, err)
			continue
		}
		fmt.Printf("%s\n", jsonValue)

	}

	if len(errs) > 0 {
		fmt.Println(err)
	}
	if rows.Err() != nil {
		log.Fatalf("cannot parse data %s: %s", "kraken-trout.software", rows.Err())
	}
}
