// Web Server tuned for local development
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	"log/slog"

	"golang.org/x/crypto/acme/autocert"
	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/cells/watcher"
	"trout.software/kraken/webapp/hub"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/sqlite"
)

func init() {
	sqlite.Register(
		watcher.VTable, // TODO(rdo) probably not registered here
		// debug functions
		sqlite.RegisterFunc("sudo", hub.SessionFor),
		sqlite.RegisterFunc("rcfmt", hub.RecordFormat),
		hub.ObsSBOM,
		hub.ObsRunHook,
		features.ObsFeatures,
		sqlite.RegisterFunc("spitdot", logstream.SpitDot),
	)
}

const SysExitError = 71 // from sysexit.h

func main() {
	conf := flag.String("conf", "config/*.toml", "Configuration file to start from")
	lsnaddr := flag.String("listen", "localhost:5000", "Address to listen on")

	flag.Parse()
	app, err := hub.ServerFromFiles(*conf)
	if err != nil {
		log.Fatal("invalid configuration: ", err)
	}

	go func() {
		if err := app.DoSSH(); err != nil {
			log.Fatal(err)
		}
	}()

	srv := &http.Server{Handler: app,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second}

	if app.TLSCertificates.AutoCert {
		var dir string
		if os.Getenv("CACHE_DIRECTORY") != "" {
			dir = os.Getenv("CACHE_DIRECTORY")
		} else {
			dir = filepath.Join(os.Getenv("XDG_CACHE_HOME"), "golang-autocert")
		}

		m := autocert.Manager{
			Cache:      autocert.DirCache(dir),
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(app.Domain),
		}
		srv.TLSConfig = m.TLSConfig()
	}

	lst := ListenFds()
	if lst == nil {
		lst, err = net.Listen("tcp", *lsnaddr)
		if err != nil {
			slog.Error("cannot listen on "+*lsnaddr, "error", err)
			os.Exit(SysExitError)
		}
		// This log can be detected by VS code to autoforward port 500
		fmt.Printf("Server running on https://%s\n", *lsnaddr)
	}

	// listening to unix socket creates it. Catch interrupt to delete it (by closing it).
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() { <-c; srv.Shutdown(context.Background()) }()
	{

		var err error
		if app.TLSCertificates.NoTLS {
			err = srv.Serve(lst)
		} else {
			err = srv.ServeTLS(lst, app.TLSCertificates.CertFile, app.TLSCertificates.KeyFile)
		}

		lst.Close()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("cannot start server", "error", err)
			os.Exit(SysExitError)
		}

	}
	const success = 0
	os.Exit(success)
}

func ListenFds() net.Listener {
	const systemdsocket = 3

	pid, err := strconv.Atoi(os.Getenv("LISTEN_PID"))
	if err != nil || pid != os.Getpid() {
		return nil
	}
	nfds, err := strconv.Atoi(os.Getenv("LISTEN_FDS"))
	if err != nil || nfds == 0 {
		return nil
	}
	if nfds != 1 {
		return nil // don’t support multiple FDS
	}

	syscall.CloseOnExec(systemdsocket)
	lst, err := net.FileListener(os.NewFile(systemdsocket, "systemd_socket"))
	if err != nil {
		return nil
	}
	return lst
}
