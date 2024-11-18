package shards

import (
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

// [TO DO] Clean code and tests
func BenchmarkPrimeNumbers(b *testing.B) {
	for i := 0; i < b.N; i++ {
		executeTemplate()
	}
}
func executeTemplate() {
	paths, err := ReplaceShard("domain", []string{"dev", "prod"}, "x/<domain>/y/<region>")
	if err != nil {
		panic(err)
	}
	var executedPaths []Pattern
	for _, path := range paths {
		//los nuevos paths sustituyen a los antiguos
		finalPaths, err := ReplaceShard("region", []string{"ch", "eu", "africa"}, path)
		if err != nil {
			panic(err)
		}
		executedPaths = append(executedPaths, finalPaths...)
	}
}
func TestExecute2(t *testing.T) {
	paths, err := ReplaceShard("domain", []string{"dev", "prod"}, "x/<domain>/y/<region>")
	if err != nil {
		t.Error(err)
	}
	var executedPaths []Pattern
	for _, path := range paths {
		//los nuevos paths sustituyen a los antiguos
		finalPaths, err := ReplaceShard("region", []string{"ch", "eu", "africa"}, path)
		if err != nil {
			t.Error(err)
		}
		executedPaths = append(executedPaths, finalPaths...)
	}
	t.Log(executedPaths)
}

func TestParsePattern(t *testing.T) {
	checkError := func(msgError string) func(e error) bool {
		return func(e error) bool {
			if msgError == "" {
				return e == nil
			}
			if e == nil {
				return false
			}
			return strings.Contains(e.Error(), msgError)
		}
	}

	var cases = []struct {
		pattern  string
		name     string
		value    string
		compiled string

		checker func(e error) bool
	}{
		{
			pattern: "eu/<d_om]ain>/*",
			checker: checkError("invalid segment name"),
		},
		{
			pattern: "eu/<domain>/*",
			checker: checkError(""),
		},
		{
			pattern: "eu/<dom]ain>/*",
			checker: checkError("invalid segment name"),
		},
		{
			pattern: "apache*<domain>/<monthsss*",
			checker: checkError("invalid glob symbol before <"),
		},
		{
			pattern: "apache<domain>?/<monthsss*",
			checker: checkError("invalid glob symbol after >"),
		},
		{
			pattern: "apache/<domain>/<monthsss*",
			checker: checkError("didn't found the closing element >"),
		},
		{
			pattern: "apache/>ss/<month>/*",
			checker: checkError("didn't find a < before >"),
		},
		{
			pattern: "apache/<domain>/<month/*",
			checker: checkError("didn't found the closing element >"),
		},
		{
			pattern: "apache/<>/<month>/*",
			checker: checkError("empty segment <>"),
		},
	}

	for _, c := range cases {
		_, perr := Parse(c.pattern)
		err := perr.GetError()
		if !c.checker(err) {
			t.Fatalf("expected error for pattern %v got %v", c.pattern, err)
		}
	}
}

func TestMatch(t *testing.T) {
	var cases = []struct {
		pattern string
		name    string
		shards  map[string]string
	}{
		{
			"internal/*/testdata/<domain>/*",
			"internal/vtable/testdata/dev/access.log",
			map[string]string{"domain": "dev"},
		},
		{
			"internal/vtable/testdata/<domain>/*",
			"internal/vtable/testdata/dev/access.log",
			map[string]string{"domain": "dev"},
		},
		{
			"<datetime>/<machine>/ATLAS_101*",
			"2021-08-15 14:30:45.0000001 -0500 CDT m=+0.000066626/machineZZ/ATLAS_101access.log",
			map[string]string{"datetime": "2021-08-15 14:30:45.0000001 -0500 CDT m=+0.000066626", "machine": "machineZZ"},
		},
		{
			"<datetime>/<machine>/audit/audit.log*",
			"2023_04_11_pm/prrfawd1bsvrfsv/audit/audit.log",
			map[string]string{"datetime": "2023_04_11_pm", "machine": "prrfawd1bsvrfsv"},
		},
		{"apache<domain>xxx<month>a1",
			"apacheproductionxxxfeba1",
			map[string]string{"domain": "production", "month": "feb"},
		},
		{"xxx<domain>yyy",
			"xxxproduction/yyy",
			map[string]string{"domain": "production/"},
		},
		{"apache<domain>xxx<month>a1",
			"apacheproductionxxxAPRILa1",
			map[string]string{"domain": "production", "month": "APRIL"},
		},
		{"*/<domain>/vtable/testdata/dev/ac*",
			"xxx/internal/vtable/testdata/dev/access.log",
			map[string]string{"domain": "internal"},
		},
		{"*/<domain>/*/<folder>/de?/*",
			"xxx/internal/vtable/testdata/dev/access.log",
			map[string]string{"domain": "internal", "folder": "testdata"},
		},
		{"example_logs/term_<shard>",
			"example_logs/term_aa",
			map[string]string{"shard": "aa"}},
		{"example_logs/<shard>_term",
			"example_logs/aa_term",
			map[string]string{"shard": "aa"}},
		{"example_logs/term_<shard>_term",
			"example_logs/term_aa_term",
			map[string]string{"shard": "aa"}},
		{"example_logs/term_<shard>_<spin>",
			"example_logs/term_aa_bb",
			map[string]string{"shard": "aa", "spin": "bb"}},
	}

	for _, c := range cases {
		shards, match, err := Match(c.pattern, c.name)
		if !match || !cmp.Equal(shards, c.shards) {
			t.Errorf("Match(%q, %q): match=%t shards=%v err=%s", c.pattern, c.name, match, shards, err)
		}
	}
}
