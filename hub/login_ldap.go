package hub

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"text/template"
	"time"

	"github.com/go-ldap/ldap/v3"
	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
)

var ldapQueryTemplate *template.Template
var ldapQueryTemplateInit sync.Once

var ldapMinVersion = tls.VersionTLS12

func init() {
	// for compatibility with old systems, we accept those
	// this is through environment variables, not configuration:
	// we should really migrate to secure versions

	if os.Getenv("LDAP_ACCEPT_TLS10") == "1" {
		ldapMinVersion = tls.VersionTLS10
	}
	if os.Getenv("LDAP_ACCEPT_SSL3") == "1" {
		ldapMinVersion = tls.VersionSSL30
	}
}

func (app *App) LoginWithLDAP(w http.ResponseWriter, r *http.Request) {
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

	p, err := app.profileFromLDAP(ctx, w, r)
	if err != nil {
		http.Redirect(w, r, fmt.Sprintf("/loginldap?origin=%s&error=%s", url.QueryEscape(string(origin)), url.QueryEscape(err.Error())), http.StatusFound)
		return
	}

	user, err := FindOrCreateUser(ctx, app.db, app.Domain, p)
	if err != nil {
		tasks.SecureErr(ctx, w, err, "invalid user record in LDAP: contact your system administrator")
		return
	}

	http.SetCookie(w, app.NewSession(user, expireTokenSource{exp: time.Now().Add(app.LDAP.MaxAge)}))

	tasks.Annotate(ctx, "redirect", string(origin))
	http.Redirect(w, r, string(origin), http.StatusFound)
}

func (app *App) profileFromLDAP(ctx context.Context, w http.ResponseWriter, r *http.Request) (iam.Profile, error) {

	// 2. Lazy compile user DN template
	ldapQueryTemplateInit.Do(func() {
		tpl, err := template.New("ldap").Parse(app.LDAP.BindUserPattern)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "invalid bind pattern, no access will ever match")
		}
		ldapQueryTemplate = tpl
	})
	//	lock-protected by Do
	if ldapQueryTemplate == nil {
		return iam.Profile{}, errors.New("invalid configuration")
	}

	// perform auth
	ctn, err := ldap.DialURL(app.LDAP.ServerURL)
	if err != nil {
		return iam.Profile{}, fmt.Errorf("cannot contact LDAP server: %w", err)
	}

	name := r.FormValue("name")
	pass := r.FormValue("password")

	var userdn strings.Builder
	if err := ldapQueryTemplate.Execute(&userdn, struct{ UserName string }{ldap.EscapeFilter(name)}); err != nil {
		return iam.Profile{}, fmt.Errorf("invalid LDAP query %s: %w", userdn.String(), err)
	}

	if err := ctn.Bind(userdn.String(), pass); err != nil {
		return iam.Profile{}, fmt.Errorf("connection denied for %s: %w", userdn.String(), err)
	}

	// lookup by DN: base object + empty query
	userq := ldap.NewSearchRequest(
		userdn.String(),
		ldap.ScopeBaseObject, ldap.NeverDerefAliases, 0, 0, false,
		"(&)",
		[]string{"displayName", "mail"}, // A list attributes to retrieve
		nil,
	)

	sr, err := ctn.Search(userq)
	if err != nil {
		return iam.Profile{}, errors.New("invalid LDAP user record")
	}

	p := iam.Profile{
		Name:       ldap.EscapeFilter(name),
		ExternalID: ldap.EscapeFilter(userdn.String()),
	}
	for _, entry := range sr.Entries {
		switch {
		case entry.GetAttributeValue("displayName") != "":
			p.Name = entry.GetAttributeValue("displayName")
		}
	}

	return p, nil
}

type expireTokenSource struct{ exp time.Time }

func (s expireTokenSource) Token() (*oauth2.Token, error) { return &oauth2.Token{Expiry: s.exp}, nil }

func ldapDialURL(addr string) (*ldap.Conn, error) {
	lurl, err := url.Parse(addr)
	if err != nil {
		return nil, ldap.NewError(ldap.ErrorNetwork, err)
	}

	host, port, err := net.SplitHostPort(lurl.Host)
	if err != nil {
		// we assume that error is due to missing port
		host = lurl.Host
		port = ""
	}

	switch lurl.Scheme {
	case "ldapi":
		if lurl.Path == "" || lurl.Path == "/" {
			lurl.Path = "/var/run/slapd/ldapi"
		}
		return ldap.Dial("unix", lurl.Path)
	case "ldap":
		if port == "" {
			port = ldap.DefaultLdapPort
		}
		return ldap.Dial("tcp", net.JoinHostPort(host, port))
	case "ldaps":
		if port == "" {
			port = ldap.DefaultLdapsPort
		}

		tlsConf := &tls.Config{
			ServerName: host,
			MinVersion: uint16(ldapMinVersion),
		}
		return ldap.DialTLS("tcp", net.JoinHostPort(host, port), tlsConf)
	}

	return nil, ldap.NewError(ldap.ErrorNetwork, fmt.Errorf("Unknown scheme '%s'", lurl.Scheme))
}
