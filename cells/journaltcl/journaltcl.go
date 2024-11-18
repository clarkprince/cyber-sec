package journaltcl

import (
	"bufio"
	"context"
	"errors"
	"expvar"
	"io"
	"net/http"
	"os/exec"
	"strings"
	"time"

	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

var (
	countDroppedJournalctlExports = expvar.NewInt("dropped_journalctl_exports")
)

type JournalctlStream struct {
	Unit, Facility string
}

func buildQuery(cs []piql.Pivot) []string {
	//[TO DO]: this function returns the arguments to build the Command
	return []string{}
}

// [TO REVIEW] Not sure if we need the most external go func.
func (j JournalctlStream) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, _ shards.Shard, cs []piql.Pivot) driver.Iter {
	cerr := make(chan error)
	cr := make(chan *bufio.Reader)

	go func() {
		args := []string{"-o", "export", "-r", "-S", "-3hours", "--utc"}
		if len(j.Unit) > 0 {
			args = append(args, "-u")
			args = append(args, j.Unit)
		}
		if len(j.Facility) > 0 {
			args = append(args, "--facility")
			args = append(args, j.Facility)
		}

		if len(cs) > 0 {
			//We append more args to the args variable
			_ = buildQuery(cs)
		}

		pr, pw := io.Pipe()
		defer pw.Close()

		cmd := exec.Command("journalctl", args...)
		cmd.Stdout = pw

		go func() {
			defer pw.Close()
			err := cmd.Run()
			if err != nil {
				cerr <- err
			}
		}()

		//[TO DO] Is it an OK size?? 1000_000
		cr <- bufio.NewReaderSize(pr, 1000_000)
	}()

	select {
	case err := <-cerr:
		return driver.ErrWrap(err)
	case r := <-cr:
		results, err := processRead(r, g)
		if err != nil && err != io.EOF {
			return driver.ErrWrap(err)
		}
		return driver.IterateArray(results)
	case <-time.After(10 * time.Second):
		countDroppedJournalctlExports.Add(1)
		return driver.IterateArray([]mdt.Record{})
	}
}

func (j *JournalctlStream) Watch(ctx context.Context, g mdt.Grammar, iter chan driver.Iter) {
	cmdWatch := exec.CommandContext(ctx, "journalctl", []string{"-f"}...)
	reader, err := cmdWatch.StdoutPipe()
	if err != nil {
		iter <- driver.ErrWrap(err)
		return
	}
	r := bufio.NewReaderSize(reader, 1000_000)

	go func() {
		var gram = mdt.CompileGrammar(g)
		for {
			var output []mdt.Record
			line, pfx, err := r.ReadLine() // avoid alloc
			switch {
			case pfx:
				iter <- driver.ErrWrap(bufio.ErrBufferFull)
				return
			case err != nil:
				iter <- driver.ErrWrap(err)
				return
			case len(line) == 0:
				continue
			}
			// lines that do not match the grammar are still displayed to the user
			rc, _ := gram.ReadLine(line)
			output = append(output, rc)
			iter <- driver.IterateArray(output)
			continue
		}
	}()

	err = cmdWatch.Start()
	if err != nil {
		iter <- driver.ErrWrap(err)
		return
	}

	err = cmdWatch.Wait()
	if err != nil {
		iter <- driver.ErrWrap(err)
		return
	}
}

func processRead(r *bufio.Reader, g mdt.Grammar) ([]mdt.Record, error) {
	var output []mdt.Record
	var gram = mdt.CompileGrammar(g)
	for {
		line, pfx, err := r.ReadLine() // avoid alloc
		switch {
		case errors.Is(err, io.EOF):
			rc, _ := gram.ReadLine(line)
			output = append(output, rc)
			return output, io.EOF
		case pfx:
			return output, bufio.ErrBufferFull
		case err != nil:
			return output, err
		case len(line) == 0:
			continue
		}
		// lines that do not match the grammar are still displayed to the user
		rc, _ := gram.ReadLine(line)
		output = append(output, rc)
	}
}

func (j *JournalctlStream) Streams() []driver.Stream {
	return []driver.Stream{{Name: "Journaltcl Stream", Type: "streams_detection:journaltcl"}}
}

func (j *JournalctlStream) Init(r *http.Request) {
	j.Unit = r.FormValue("unit")
	j.Facility = r.FormValue("facility")
}

func (j *JournalctlStream) Test(ctx context.Context, ssn iam.Session) error {

	var s strings.Builder
	cmd := exec.Command("journalctl", []string{"-n", "1"}...)
	cmd.Stdout = &s

	if err := cmd.Run(); err != nil {
		return err
	}
	if len(s.String()) == 0 {
		return errors.New("fail to connect to journalctl")
	}
	return nil
}
