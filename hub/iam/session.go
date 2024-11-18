package iam

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/ulid"
)

var _logger = tasks.NewLogger("sessions")

// global variable, good enough for now
var sessioncache = make(map[[8]byte]Session)
var sessionmutex sync.RWMutex

func AddSession(s Session) string {
	tasks.AuditLogger.Info("user logged in",
		"username", s.UserName)

	var sid [8]byte
	rand.Read(sid[:])

	csrftoken := make([]byte, 16)
	rand.Read(csrftoken[:])

	sessionmutex.Lock()
	sessioncache[sid] = s
	sessionmutex.Unlock()

	return base64.URLEncoding.EncodeToString(sid[:])
}

func FindSession(cookie string) (Session, bool) {
	bc, err := base64.URLEncoding.DecodeString(cookie)
	if err != nil {
		return Session{}, false
	}

	var sk [8]byte
	copy(sk[:], bc)
	sessionmutex.RLock()
	s, found := sessioncache[sk]
	sessionmutex.RUnlock()
	return s, found
}

// SessionFor returns the session for a give username.
// This is mostly intended for debugging — it has a O(n) performance.
func SessionFor(username string) (Session, bool) {
	sessionmutex.RLock()
	defer sessionmutex.RUnlock()

	for _, s := range sessioncache {
		if s.UserName == username {
			return s, true
		}
	}

	return Session{}, false
}

type Session struct {
	User   ulid.ULID
	Domain ulid.ULID

	UserName string // required for OAuth
	oauth2.TokenSource
	Oauth2Clients map[string]oauth2.TokenSource

	Notifier chan *Notification

	Labels []msg.Label
	Policy *Policy

	UnlockedStorage struct {
		storage.Executor
		*storage.Keyring
	}
}

var wiggleRoom = 5 * time.Minute // This is from AWS limit

var CookieName = "__Host-t.sftw.kraken"

func ReadSession(r *http.Request) (Session, error) {
	ck, err := r.Cookie(CookieName)
	if err != nil {
		// re-raise so the caller can compare against ErrNoCookie
		return Session{}, fmt.Errorf("cannot read cookie %s: %w", "t.sftw/kraken", err)
	}

	session, found := FindSession(ck.Value)
	if !found {
		return Session{}, fmt.Errorf("unknown session %s: %w", ck.Value, http.ErrNoCookie)
	}

	tk, err := session.TokenSource.Token()
	switch {
	case IsOauthMarker(err):
		err = ErrTokenExpired
		_logger.Debug("refresh token expired")
		return Session{}, fmt.Errorf("cannot get an OAuth token from session: %w", err)
	case err != nil:
		_logger.Debug(fmt.Sprint("cannot renew authentication token: ", err))
		return Session{}, fmt.Errorf("cannot get an OAuth token from session: %w", err)
	}

	if !tk.Expiry.IsZero() && time.Until(tk.Expiry) < wiggleRoom {
		_logger.Warn("authentication token expires very soon, yet was not renewed.\nThis is often linked to a configuration issue in the OAuth provider.\nPlease contact your system administrator",
			"expiry", time.Until(tk.Expiry).String())
		return Session{}, fmt.Errorf("token expired, and no new token could be obtained: %w", ErrTokenExpired)
	}

	return session, nil
}

// ErrTokenExpired is returned if the token we have stored is known to have expired
var ErrTokenExpired = errors.New("token expired")

// Wrap the underlying type with Is handler
type oauthRetrieveError oauth2.RetrieveError

func (err *oauthRetrieveError) Error() string { return (*oauth2.RetrieveError)(err).Error() }
func (*oauthRetrieveError) Is(err error) bool { _, ok := err.(*oauth2.RetrieveError); return ok }
func (err *oauthRetrieveError) Unwrap() error { return (*oauth2.RetrieveError)(err) }
func IsOauthMarker(err error) bool {
	return errors.Is(oauthMarker, err)
}

var oauthMarker = new(oauthRetrieveError)

type AuthorizationError struct {
	URL string
}

func NewAuthorizationError(url string) error {
	return AuthorizationError{URL: url}
}

func (a AuthorizationError) Error() string {
	return fmt.Sprintf("Token expired. Redirect to %s", a.URL)
}

func IsAuthError(err error) bool {
	if _, ok := err.(AuthorizationError); ok {
		return true
	}
	return false
}

var OAuthRedirectForConnectors = features.HasFlag("redirect")
