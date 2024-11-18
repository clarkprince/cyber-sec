package hub

import (
	"net/http"

	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
)

func (app *App) NewSession(user iam.User, tokensource oauth2.TokenSource) *http.Cookie {
	ssn := &iam.Session{
		User:        user.ID,
		Domain:      user.Domain,
		UserName:    user.ExternalID,
		Policy:      app.policy,
		Labels:      append(user.Labels, iam.UserLabel),
		TokenSource: tokensource,
		Notifier:    make(chan *iam.Notification, 10),
		UnlockedStorage: struct {
			storage.Executor
			*storage.Keyring
		}{app.db, app.keyring},
	}

	sid := iam.AddSession(*ssn)
	return &http.Cookie{
		Name:     iam.CookieName,
		Value:    sid,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // allow links
	}
}
