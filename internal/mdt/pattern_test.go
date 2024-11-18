package mdt

import (
	"regexp"
	"testing"

	"trout.software/kraken/webapp/internal/diff"
)

func TestCompilePatterns(t *testing.T) {
	cases := []struct {
		pattern string
		grammar string
	}{
		{"<foo> <helloworld> <hello_world>", `root = foo " " helloworld " " hello_world .
foo = _ .
helloworld = _ .
hello_world = _ .
`},
		{"<foo> < <bar>", `root = foo " < " bar .
foo = _ .
bar = _ .
`},
		{"<foo> > <bar>", `root = foo " > " bar .
foo = _ .
bar = _ .
`},
		{"<foo> < <bar> >", `root = foo " < " bar " >" .
foo = _ .
bar = _ .
`},
		{"<foo> <_> <bar> >", `root = foo " " _ " " bar " >" .
foo = _ .
bar = _ .
`},
		{"<foo> <foo> <bar> >", `root = foo " " bar " >" .
foo = _ " " _ .
bar = _ .
`},
		{"<foo> <foo> <foo> <bar> >", `root = foo " " bar " >" .
foo = _ " " _ " " _ .
bar = _ .
`},
		{"<foo:2012-01-02> <foo> <bar> >", `root = foo " " bar " >" .
foo:"2012-01-02" = _ " " _ .
bar = _ .
`}, {"<foo:2012-01-02:04:06> <foo> <bar> >", `root = foo " " bar " >" .
foo:"2012-01-02:04:06" = _ " " _ .
bar = _ .
`},
	}

	for _, c := range cases {
		grm, err := CompilePattern(c.pattern)
		if err != nil {
			t.Fatalf("invalid pattern in test %s: %s", c.pattern, err)
		}
		if grm.PrettyPrint("root") != c.grammar {
			t.Errorf("compiling pattern %s: %s", c.pattern, diff.Diff("want", []byte(c.grammar), "got", []byte(grm.PrettyPrint("root"))))
		}
	}
}

func TestParseInvalidPatterns(t *testing.T) {
	cases := []struct {
		pattern string
		msg     string
	}{
		{"<start><_><end>", "empty separator"},
		{"<start><end>", "empty separator"},
		{"<_><_>", "empty separator"},
	}

	for _, c := range cases {
		_, err := CompilePattern(c.pattern)
		if err == nil {
			t.Fatal("no error returned parsing ", c.pattern)
		}

		if m, _ := regexp.MatchString(c.msg, err.Error()); !m {
			t.Fatal("invalid error returned", err)
		}
	}
}
