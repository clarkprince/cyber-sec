package hub

import (
	"errors"
	"expvar"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"runtime"
	"strings"

	"trout.software/kraken/webapp/hub/devices"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/features"
)

var loginsReached = expvar.NewInt("logins_reached")

func (app *App) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// get over Go’s (discutable) choice to recover from panics
	defer func() {
		err := recover()
		if err != nil {
			buf := make([]byte, 1<<20)
			n := runtime.Stack(buf, true)
			fmt.Fprintf(os.Stderr, "panic: %v\n\n%s", err, buf[:n])
			os.Exit(1)
		}
	}()

	switch r.URL.Path {
	case "/login":
		loginsReached.Add(1)
		app.Login(w, r)
		return
	case "/authorize":
		app.OAuthCallback(w, r)
		return
	case "/loginldap":
		app.LoginWithLDAP(w, r)
		return
	case "/loginhtpass":
		app.LoginWithHTPasswd(w, r)
		return
	}

	switch {
	case strings.HasPrefix(r.URL.Path, "/assets"):
		app.assets.ServeHTTP(w, r)
		return
	case strings.HasPrefix(r.URL.Path, "/fleet"):
		devices.Handler.ServeHTTP(w, r)
		return
	}

	ctx, task := tasks.FromRequest(r)
	r = r.WithContext(ctx) // for staticFiles
	defer task.End()

	ssn, err := iam.ReadSession(r)
	switch {
	case errors.Is(err, http.ErrNoCookie):
		tasks.Annotate(ctx, "redirect", "no-cookie")
		app.RedirectLoginPage(w, r)
		return
	case errors.Is(err, iam.ErrTokenExpired):
		tasks.Annotate(ctx, "", err)
		http.Redirect(w, r, fmt.Sprintf("/login?origin=%s&refresh=true", url.QueryEscape(r.URL.String())), http.StatusSeeOther)
		return
	case err != nil:
		tasks.SecureErr(ctx, w, err, "unauthorized")
		return
	}
	tasks.Annotate(ctx, "user-id", ssn.User)

	// not using database connections
	switch r.URL.Path {
	case "/notifications":
		ssn.TransduceNotifications(ctx, w)
		return
	case "/sftp/test":
		if SFTPConn {
			tasks.Annotate(ctx, "sftp", "start")
			TestSFTP(ssn, ctx, w, r)
			return
		}
		return
	case "/notifications/echo":
		app.EchoNotification(ctx, &ssn, w, r)
		return
	case "/api/notebook/data":
		app.ServeCellData(ctx, &ssn, w, r)
		return
	case "/info":
		w.Header().Add("X-Feature-Flags", features.FlagsHeaders)
		w.Header().Add("Cache-Control", "max-age=604800")
		return
	case "/api/notebook/snapshot":
		app.SnapshotAPI(ctx, &ssn, w, r)
		return
	}

	ctx, err = app.db.Savepoint(ctx)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "database issue")
		return
	}
	defer app.db.Rollback(ctx)

	switch {
	default:
		app.DisplayTemplate(ctx, &ssn, w, r)
	case strings.HasPrefix(r.URL.Path, "/notebook"):
		app.OpenNotebook(ctx, &ssn, w, r)
	case r.URL.Path == "/api/notebook":
		app.NotebookAPI(ctx, ssn, w, r)
	case r.URL.Path == "/api/notebook/editor":
		app.EditorAPI(ctx, &ssn, w, r)
		//TODO(rdo) normalize pivot API
	case r.URL.Path == "/importcsv":
		app.ImportCSVPivot(ctx, &ssn, w, r)
	case r.URL.Path == "/api/pivot":
		app.PivotAPI(ctx, &ssn, w, r)
	case strings.HasPrefix(r.URL.Path, "/datasources/list"): // TODO API
		app.ListDataSources(ctx, ssn, w, r)
	case strings.HasPrefix(r.URL.Path, "/api/datasource"):
		app.DataSourceAPI(ctx, ssn, w, r)
	case strings.HasPrefix(r.URL.Path, "/search"):
		app.SearchHandler(ctx, &ssn, w, r)
	case strings.HasPrefix(r.URL.Path, "/schedule/add"):
		app.ScheduleNotebook(ctx, &ssn, w, r)
	case r.URL.Path == "/schedule":
		app.ScheduleNotebook(ctx, &ssn, w, r)
	case r.URL.Path == "/policy", r.URL.Path == "/audit":
		// plural form directly from template
		app.FrameworkAPI(ctx, &ssn, w, r)
	case r.URL.Path == "/api/nbar":
		app.NBarAPI(ctx, &ssn, w, r)
	}

	if err := app.db.Release(ctx); err != nil {
		tasks.SecureErr(ctx, w, err, "database issue")
	}
}
