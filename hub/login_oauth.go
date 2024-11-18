package hub

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/ulid"
)

func (app *App) RedirectLoginPage(w http.ResponseWriter, r *http.Request) {
	switch {
	default:
		http.Redirect(w, r, fmt.Sprintf("/login?origin=%s", url.QueryEscape(r.URL.String())), http.StatusSeeOther)
	case app.LDAP.ServerURL != "":
		http.Redirect(w, r, fmt.Sprintf("/loginldap?origin=%s", url.QueryEscape(r.URL.String())), http.StatusSeeOther)
	case app.HTPasswdFile != "":
		http.Redirect(w, r, fmt.Sprintf("/loginhtpass?origin=%s", url.QueryEscape(r.URL.String())), http.StatusSeeOther)
	}
}

func (app *App) Login(w http.ResponseWriter, r *http.Request) {
	_, task := tasks.FromRequest(r)
	defer task.End()

	// HMAC state to prevent CSRF
	origin := r.FormValue("origin")
	mac := hmac.New(sha256.New, app.authkey)
	state := make([]byte, len(origin), len(origin)+sha256.Size)
	copy(state, origin)
	mac.Write(state)
	state = mac.Sum(state)
	opts := []oauth2.AuthCodeOption{oauth2.AccessTypeOffline}
	if r.FormValue("refresh") == "true" {
		opts = append(opts, oauth2.ApprovalForce)
	}

	// request offline access, used in back-end authentication
	dst := app.OAuth2.AuthCodeURL(base64.URLEncoding.EncodeToString(state), opts...)
	http.Redirect(w, r, dst, http.StatusFound)
}

func (app *App) OAuthCallback(w http.ResponseWriter, r *http.Request) {
	ctx, task := tasks.FromRequest(r)
	defer task.End()

	// step 1. check the state against what was created during login
	state, err := base64.URLEncoding.DecodeString(r.FormValue("state"))
	if err != nil || len(state) < sha256.Size {
		if err == nil {
			err = errors.New("invalid oauth state")
		}
		tasks.SecureErr(ctx, w, err, "invalid OAuth state")
		return
	}

	mac := hmac.New(sha256.New, app.authkey)
	origin, csum := state[:len(state)-sha256.Size], state[len(state)-sha256.Size:]

	mac.Write(origin)
	if !hmac.Equal(mac.Sum(nil), csum) {
		tasks.SecureErr(ctx, w, err, "invalid OAuth state")
		return
	}

	// step 2. exchange code for auth token
	tok, err := app.OAuth2.Exchange(ctx, r.FormValue("code"))
	{
		re := new(oauth2.RetrieveError) // capture bad response
		switch {
		case errors.As(err, &re) && re.Response.StatusCode == http.StatusBadRequest:
			tpl := app.templ.get("force_login")
			if tpl == nil {
				http.Error(w, "broken link", http.StatusNotFound)
				return
			}
			if err := tpl.Execute(w, struct {
				ErrorDescription string
			}{r.FormValue("error_description")}); err != nil {
				tasks.SecureErr(ctx, w, err, "cannot execute template")
			}
			return
		case err != nil:
			tasks.SecureErr(ctx, w, err, "invalid OAuth token")
			return
		}
	}

	// step 3. get user details
	idjwt, ok := tok.Extra("id_token").(string)
	if !ok {
		tasks.SecureErr(ctx, w, err, "invalid OAuth token")
		return
	}

	idtk, err := app.OAuth2.verifier.Verify(ctx, idjwt)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid OAuth token")
		return
	}

	usr, err := app.UserFromClaims(ctx, idtk)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "unknown user or domain")
		return
	}

	if tok.RefreshToken == "" {
		rt, err := GetRefreshToken(ctx, app.keyring, usr.ID)
		if err != nil || rt == "" {
			tasks.Annotate(ctx, "", err)
			tasks.Annotate(ctx, "refresh-token", "force-refresh")
			http.Redirect(w, r, fmt.Sprintf("/login?origin=%s&refresh=true", url.QueryEscape(string(origin))), http.StatusFound)
			return
		}
		tasks.Annotate(ctx, "refresh-token", "from-db")
		tok.RefreshToken = string(rt)
	} else {
		tasks.Annotate(ctx, "refresh-token", "from-jwt")
		if err := PutRefreshToken(ctx, app.keyring, usr.ID, RefreshToken(tok.RefreshToken)); err != nil {
			tasks.SecureErr(ctx, w, err, "could not persist refresh token")
			return
		}
	}

	http.SetCookie(w, app.NewSession(usr,
		VerifiedSource{verif: app.OAuth2.verifier, src: app.OAuth2.Config.TokenSource(context.Background(), tok)}))

	tasks.Annotate(ctx, "redirect", string(origin))
	http.Redirect(w, r, string(origin), http.StatusFound)
}

// VerifiedSource wraps an TokenSource by also checking that the JWT is valid.
// Every token returned by the source has a valid `id_token` field.
type VerifiedSource struct {
	verif *oidc.IDTokenVerifier
	src   oauth2.TokenSource
}

func (vs VerifiedSource) Token() (*oauth2.Token, error) {
	tk, err := vs.src.Token()
	if err != nil {
		return nil, err
	}

	idjwt, ok := tk.Extra("id_token").(string)
	if !ok {
		return nil, fmt.Errorf("no JWT ID token")
	}

	if _, err := vs.verif.Verify(context.Background(), idjwt); err != nil {
		return nil, err
	}

	return tk, nil
}

func (app *App) UserFromClaims(ctx context.Context, idtk *oidc.IDToken) (iam.User, error) {
	var err error
	var cs Claims
	if app.OAuth2.Platform == "AzureAD" {
		err = getAzureADClaims(idtk, &cs)
	} else if app.OAuth2.Platform == "Google" {
		err = getGoogleClaims(idtk, &cs)
	}
	if err != nil {
		return iam.User{}, err
	}
	tasks.Annotate(ctx, "domain-name", cs.Domain)
	return FindOrCreateUser(ctx, app.db, cs.Domain, iam.Profile{ExternalID: cs.EMail, Name: cs.Name, Picture: cs.Picture})

}

type Claims struct {
	EMail   string
	Domain  string
	Picture string
	Name    string
}

func getAzureADClaims(idtk *oidc.IDToken, cs *Claims) error {
	// For AzureAD we call additional APIs to get the tenant's domain and the user's picture
	var azureclaims struct {
		PreferredUsername string `json:"preferred_username"`
		Name              string `json:"name"`
		TenantId          string `json:"tid"`
	}
	err := idtk.Claims(&azureclaims)
	if err != nil {
		return err
	}
	cs.EMail = azureclaims.PreferredUsername
	cs.Name = azureclaims.Name
	cs.Domain = azureclaims.TenantId
	cs.Picture = ""
	return nil
}

func getGoogleClaims(idtk *oidc.IDToken, cs *Claims) error {
	var googleclaims struct {
		EMail   string `json:"email"`
		Domain  string `json:"hd"`
		Picture string `json:"picture"`
		Name    string `json:"name"`
	}
	err := idtk.Claims(&googleclaims)
	if err != nil {
		return err
	}
	cs.EMail = googleclaims.EMail
	cs.Name = googleclaims.Name
	cs.Domain = googleclaims.Domain
	cs.Picture = googleclaims.Picture
	return nil
}

// GetRefreshToken returns the refresh token stored in the keyring.
// See [oauth2] for reference.
//
// If the token has expired, ErrTokenExpired is returned.
// Note that a token that has not (yet) being marked as expired on our side might have on the service.
// If we don’t have a refresh token, a nil error and an empty token is returned.
//
// [oauth2] https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
func GetRefreshToken(ctx context.Context, k *storage.Keyring, user ulid.ULID) (RefreshToken, error) {
	tk, err := storage.ReadSecret[dbToken](ctx, k, refreshtokensec, user.String())
	if err != nil {
		return "", err
	}

	now := time.Now()
	if tk.Expire.After(now) {
		return "", iam.ErrTokenExpired
	}

	return tk.Token, nil
}

const refreshtokensec = "secret:oauth:refresh-token"

func PutRefreshToken(ctx context.Context, k *storage.Keyring, user ulid.ULID, tk RefreshToken) error {
	return storage.StoreSecret(ctx, k, refreshtokensec, user.String(), dbToken{Token: tk})
}

// internal type used for serialization
type dbToken struct {
	_ struct{} `cbor:",toarray"`

	Token  RefreshToken
	Expire time.Time
}

// Refresh tokens for OAuth
// https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
type RefreshToken string

func (t RefreshToken) Token() *oauth2.Token { return &oauth2.Token{RefreshToken: string(t)} }

// String only returns the 8 last characters of a token.
func (tk RefreshToken) String() string {
	if len(tk) < 8 {
		return "(refresh token)"
	}
	return "(refresh token)xxx-" + string(tk[len(tk)-8:])
}
