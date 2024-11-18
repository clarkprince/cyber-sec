package main

import (
	"bufio"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/BurntSushi/toml"
	"trout.software/kraken/webapp/internal/mdt"
)

func spitDot(dt interface{ PrintDot(dst io.Writer) }, name string) {
	dot := name + ".dot"
	fh, err := os.CreateTemp("", dot)
	if err != nil {
		log.Fatal("cannot create output", err)
	}

	dt.PrintDot(fh)
	fh.Close()

	msg, err := exec.Command("dot", "-Tpng", "-o"+name+".png", fh.Name()).CombinedOutput()
	if err != nil {
		log.Fatalf("error running dot (%s): %s", err, msg)
	}
}

func main() {
	var (
		grammarsConfig string
		grammarName    string
		printDot       bool
	)

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Example usage:\n")
		fmt.Fprintf(os.Stderr, "\tgramcheck -f config/grammar.toml -m my-grammar my-logs.txt\n")
		fmt.Fprintf(os.Stderr, "Flags:\n")
		flag.PrintDefaults()
	}
	flag.StringVar(&grammarsConfig, "f", "", "configuration file containing the grammars")
	flag.StringVar(&grammarName, "n", "", "name of the grammar used")
	flag.BoolVar(&printDot, "dot", false, "print a detail of the grammar match engine")
	flag.Parse()

	var grams struct {
		Grammars []struct {
			Name string
			EBNF string
		}
	}

	_, err := toml.DecodeFile(grammarsConfig, &grams)
	if err != nil {
		log.Fatalf("cannot read grammar from %s: %s", grammarsConfig, err)
	}

	var gram mdt.Grammar
	for _, g := range grams.Grammars {
		if g.Name == grammarName {
			gg, err := mdt.ParseGrammar(g.EBNF)
			if err != nil {
				log.Fatalf("invalid grammar: %s\n---\n%s\n\n", err, g.EBNF)
			}
			gram = gg
			break
		}
	}
	if gram == nil {
		log.Fatalf("could not find grammar %s in %s", grammarName, grammarsConfig)
	}

	if printDot {
		spitDot(gram, grammarName)
	}

	// debug util, capture panics in failing asserts
	var line []byte
	defer func() {
		if r := recover(); r != nil {
			log.Printf("failure parsing %s", line)
			log.Println(r)
		}
	}()

	var buf strings.Builder
	if len(flag.Args()) == 0 {
		log.Printf("grammar is valid, no log file provided, done.")
	}
	for _, h := range flag.Args() {
		fh, err := os.Open(h)
		if err != nil {
			log.Fatalf("cannot open %s: %s", h, err)
		}
		sc := bufio.NewScanner(fh)
		for sc.Scan() {
			line = sc.Bytes()
			rc, ok := mdt.ReadLine(gram, line)
			if !ok {
				fmt.Printf("\x1b[38;2;253;192;134m%s\x1b[0m\n", sc.Text())
				continue
			}

			buf.Reset()
			wlk := rc.WalkRoot()
			for wlk.Next() {
				if wlk.IsSeparator() {
					fmt.Fprintf(&buf, "\x1b[38;2;190;174;212m%s\x1b[0m ", wlk.Value())
				} else {
					fmt.Fprintf(&buf, "\x1b[38;2;127;201;127m%s=%s\x1b[0m ", wlk.Name(), wlk.Value())

				}
			}
			fmt.Print(buf.String() + "\n")
		}

		if sc.Err() != nil {
			log.Fatalf("error reading %s: %s", h, sc.Err())
		}
	}
}
