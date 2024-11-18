package main

//	Debugging based on prefix filtering
//	Similar to https://www.npmjs.com/package/debug
//
//	Set the "debug" value in localStorage with the wanted prefix
//	and refresh the page
// /!\ case-sensitive => it's "debug", not "DEBUG"
//
// @example "debug" = "datacell" shows all logs with namespace datacell
//
// Limitations:
// we don't support "*" notation yet or regexp, only basic prefixes

import (
	"fmt"
	"io"
	"log"
	"os"
)

func LogFacility(namespace string) *log.Logger {
	if os.Getenv("DEBUG") != namespace {
		return log.New(io.Discard, "", log.LstdFlags)
	}

	return log.New(os.Stdout, fmt.Sprintf("rx:[%s]: ", namespace), log.LUTC|log.Lshortfile)
}
