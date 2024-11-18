package logstream

import (
	"log"
	"os"
	"os/exec"

	"trout.software/kraken/webapp/internal/mdt"
)

func SpitDot(rc *mdt.Record, name string) {
	out, err := os.CreateTemp("", name+".dot")
	if err != nil {
		log.Fatal("creating temp file", err)
	}

	rc.PrintDot(out)
	if err := out.Close(); err != nil {
		log.Fatal("closing file", err)
	}

	err = exec.Command("dot", "-Tpng", "-o"+name, out.Name()).Run()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			log.Fatal("command failed with ", string(ee.Stderr), ee.ProcessState)
		}
		log.Fatal("command failed", err)
	}
}
