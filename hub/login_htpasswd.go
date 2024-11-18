package hub

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
)

func (app *App) LoginWithHTPasswd(w http.ResponseWriter, r *http.Request) {
	ctx, task := tasks.FromRequest(r)
	defer task.End()

	if r.Method == "GET" {
		origin := r.FormValue("origin")
		mac := hmac.New(sha256.New, app.authkey)
		state := make([]byte, len(origin), len(origin)+sha256.Size)
		copy(state, origin)
		mac.Write(state)
		state = mac.Sum(state)

		err := r.FormValue("error") // can be set by POST to self
		app.templ.get("login_ldap").Execute(w, struct{ Origin, Error string }{base64.URLEncoding.EncodeToString(state), err})
		return
	}
	// quickly reject invalid submissions
	csrf, err := base64.URLEncoding.DecodeString(r.FormValue("origin"))
	if err != nil || len(csrf) < sha256.Size {
		if err == nil {
			err = errors.New("invalid submission state")
		}
		tasks.SecureErr(ctx, w, err, "invalid submission state")
		return
	}

	mac := hmac.New(sha256.New, app.authkey)
	origin, csum := csrf[:len(csrf)-sha256.Size], csrf[len(csrf)-sha256.Size:]

	mac.Write(origin)
	if !hmac.Equal(mac.Sum(nil), csum) {
		tasks.SecureErr(ctx, w, errors.New("invalid submission state"), "invalid submission state")
		return
	}

	name := r.FormValue("name")
	pass := r.FormValue("password")

	hpass := app.htPasswdUsers[name]
	if err := bcrypt.CompareHashAndPassword(hpass, []byte(pass)); err != nil {
		tasks.SecureErr(ctx, w, errors.New("invalid user or password"), "invalid user or password")
		return
	}

	user, err := FindOrCreateUser(ctx, app.db, app.Domain, iam.Profile{Name: name, ExternalID: name})
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid user record in LDAP: contact your system administrator")
		return
	}

	http.SetCookie(w, app.NewSession(user, expireTokenSource{exp: time.Now().Add(app.LDAP.MaxAge)}))

	tasks.Annotate(ctx, "redirect", string(origin))
	http.Redirect(w, r, string(origin), http.StatusFound)
}
