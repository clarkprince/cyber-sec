package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/BurntSushi/toml"
	"github.com/coreos/go-oidc/v3/oidc"
	"go.starlark.net/repl"
	"go.starlark.net/resolve"
	"go.starlark.net/starlark"
	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/cells/xlsx"
	"trout.software/kraken/webapp/internal/mdt"
)

func main() {
	resolve.AllowGlobalReassign = true
	resolve.AllowSet = true
	resolve.AllowRecursion = true

	fname := flag.String("f", "", "Execute script from file")
	config := flag.String("conf", "", "Use an extra configuration file")
	flag.Parse()

	thread := &starlark.Thread{Steps: 10}
	res := make(chan mdt.Record)
	thread.SetLocal(xlsx.SQLiteIterKey, res)

	if *config != "" {
		loadcfg(*config, thread)
	}

	go func() {
		for rc := range res {
			dt, _ := rc.MarshalText()
			os.Stdout.Write(dt)
			fmt.Print("\n")
		}
	}()

	if *fname == "" {
		thread.Name = "REPL"
		repl.REPL(thread, xlsx.BuiltIns)
		return
	}

	thread.Name = *fname
	_, err := starlark.ExecFile(thread, *fname, nil, xlsx.BuiltIns)
	if err != nil {
		ee := new(starlark.EvalError)
		if !errors.As(err, &ee) {
			log.Fatal(err)
		}

		log.Println("error:", ee.Msg)
		log.Println("callstack:", ee.CallStack.String())
	}
	close(res)
}

func loadcfg(file string, thread *starlark.Thread) {
	ctx := context.Background()

	var conf struct {
		OAuth2 struct {
			oauth2.Config
			Provider string
		}
	}
	_, err := toml.DecodeFile(file, &conf)
	if err != nil {
		log.Fatal("invalid configuration file", err)
	}

	if conf.OAuth2.Provider != "" {
		provider, err := oidc.NewProvider(context.TODO(), conf.OAuth2.Provider)
		if err != nil {
			log.Fatalf("invalid OAuth provider %s: %s", conf.OAuth2.Provider, err)
		}
		conf.OAuth2.Endpoint = provider.Endpoint()
	}

	addr, err := url.Parse(conf.OAuth2.RedirectURL)
	if err != nil {
		log.Fatal("invalid redirect URL", conf.OAuth2.RedirectURL, err)
	}

	spin := make(chan struct{})

	mx := http.NewServeMux()
	srv := http.Server{
		Addr:    addr.Host,
		Handler: mx,
	}

	mx.HandleFunc(addr.Path, func(w http.ResponseWriter, r *http.Request) {
		code := r.FormValue("code")
		tok, err := conf.OAuth2.Exchange(ctx, code)
		if err != nil {
			log.Fatal(err)
		}

		thread.SetLocal(xlsx.OAuthClientKey, conf.OAuth2.Client(ctx, tok))
		close(spin)
	})

	go srv.ListenAndServe()

	// Redirect user to consent page to ask for permission
	// for the scopes specified above.
	url := conf.OAuth2.AuthCodeURL("state", oauth2.AccessTypeOffline)
	fmt.Printf("Visit the URL for the auth dialog: %v\n", url)

	<-spin
	srv.Close()
}
