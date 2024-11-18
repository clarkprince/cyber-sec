package syslog

import (
	"os"
	"os/exec"
	"testing"
	"time"

	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
)

func TestConfigGen(t *testing.T) {
	t.Skip("in progress")
	cfg, err := genconfig([]Syslog{{}}, ListenAddr)
	if err != nil {
		t.Fatal(err)
	}

	dir := t.TempDir()
	os.WriteFile(dir+"/cfg", cfg, 0644)

	t.Log("generated", string(cfg))

	check := exec.Command("vector", "validate", "--config-json", dir+"/cfg")
	check.Stdout = os.Stderr
	check.Stderr = os.Stderr
	if err := check.Run(); err != nil {
		t.Fatal(err)
	}
}

var anygram = mdt.MustParseGrammar(`root = any . any = _ .`)

func TestPipeline(t *testing.T) {
	t.Skip("in progress")
	var log Syslog
	if err := StartSyslogHandler([]Syslog{log}); err != nil {
		t.Fatal(err)
	}
	time.Sleep(10 * time.Millisecond)

	it := log.Select(driver.Stream{}, &iam.Session{}, anygram, "", nil)

	sender := exec.Command("vector", "-c", "testdata/sender.toml")
	if err := sender.Start(); err != nil {
		t.Fatal("cannot start sender side", err)
	}

	donesend := make(chan error)
	go func() { donesend <- sender.Wait() }()

	count := 0
collectLoop:
	for {
		select {
		case err := <-donesend:
			if err != nil {
				t.Fatal("sender error", err)
			}
			break collectLoop
		default:
			if it.Next() {
				t.Log("message", it.Record())
				count++
			} else {
				break collectLoop
			}
		}
	}

	if it.Err() != nil {
		t.Fatal("error streaming the data", it.Err())
	}
	if count != 30 {
		t.Errorf("expected 30 messages, got %d", count)
	}

	// yeah :(
	os.Remove(log.sockname())
	_syslogHandler.runner.Stop()
}
