package piql_test

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"runtime/trace"
	"testing"

	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
	"trout.software/kraken/webapp/internal/ulid"
)

func readPivots(t interface {
	Helper()
	Fatal(...any)
}, lines []string) []piql.Pivot {
	t.Helper()

	pivots := make([]piql.Pivot, len(lines))
	for i, pp := range lines {
		pivot, pretty, err := piql.ParseSingle(pp)
		if err != nil {
			t.Fatal(fmt.Sprintf("invalid pivot %s: %s", pp, err))
		}

		lines[i] = fmt.Sprint(pretty, " [", pivot.On, "]")
		pivots[i] = pivot
	}
	return pivots
}

func BenchmarkEvaluatorLargeAccess(b *testing.B) {
	pivots := readPivots(b, []string{
		"|= \"meln1ks\" [$.user]",
	})

	demologs, err := filepath.Abs("../../demo_logs/")
	if err != nil {
		b.Fatal("cannot resolve demo log folder", err)
	}
	logstream.AllowedFolders = []string{demologs}

	files := []string{
		filepath.Join(demologs, "/generated_large_access.log"),
	}
	f := logstream.Filestream{Name: files[0]}
	if err := f.Test(context.Background(), iam.Session{}); err != nil {
		b.Fatal("cannot open file at ", files[0], err)
	}
	grm, err := mdt.CompilePattern(`<ip> - <user> [<date>] "<path>" <rcode> <size>`)
	if err != nil {
		b.Fatal("invalid grammar", err)
	}

	fi, err := os.Stat(files[0])
	if err != nil {
		b.Fatal("cannot get file info", err)
	}

	ctx, tr := trace.NewTask(context.Background(), "benchmark")
	defer tr.End()

	in := f.Select(driver.Stream{ID: ulid.Make()}, nil, grm, shards.Shard(files[0]), pivots)
	for i := 0; i < b.N; i++ {
		var ev piql.Evaluator
		it := ev.MatchRules(pivots)
		var match int
		go ev.Run(ctx, in, make(mdt.Grammar))
		for it.Next() {
			match++
		}
		if it.Err() != nil {
			b.Fatal(it.Err())
		}
		if match == 0 {
			b.Fatal("benchmark did not measure anything")
		}

	}

	b.ReportMetric(float64(fi.Size())/b.Elapsed().Seconds(), "b/s")
}
