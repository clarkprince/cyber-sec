package hub

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"gopkg.in/square/go-jose.v2"
	"gopkg.in/square/go-jose.v2/jwt"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/sqlite"
)

func TestOAuth(t *testing.T) {
	os.Setenv("STATE_DIRECTORY", t.TempDir())
	defer os.Setenv("STATE_DIRECTORY", "")

	// Required for ListPath
	sqlite.Register(storage.DropLastElement)

	// create local server to test google auth
	t.Run("google auth - end to end", func(t *testing.T) {
		var app App
		wireLocalDB(t, &app, CurrentSchemaVersion)
		kraken := httptest.NewServer(&app)

		authsrv, verif := spinupLocalOAuth(t, "Google", kraken.URL, "clientGoogleTestOAuth")
		app.OAuth2.Provider = authsrv.URL
		app.OAuth2.Platform = "Google"
		app.Domain = "example.com"
		app.TLSCertificates.NoTLS = true
		app.wire()
		// overwrite the verifier with our well-known server for testing
		app.OAuth2.verifier = verif

		runAuthClient(t, kraken)
		// close the server instead of deferring because we have to create an azure instance
		authsrv.Close()
		kraken.Close()
	})

	// create local server to test azure auth
	t.Run("azure ad auth - end to end", func(t *testing.T) {
		var app App
		wireLocalDB(t, &app, CurrentSchemaVersion)
		kraken := httptest.NewServer(&app)

		authsrv, verif := spinupLocalOAuth(t, "AzureAD", kraken.URL, "clientAzureTestOAuth")
		app.OAuth2.Provider = authsrv.URL
		app.OAuth2.Platform = "AzureAD"
		app.Domain = "example.com"
		app.TLSCertificates.NoTLS = true
		app.wire()
		// overwrite the verifier with our well-known server for testing
		app.OAuth2.verifier = verif

		runAuthClient(t, kraken)
		// close the server instead of deferring because we have to create an azure instance
		authsrv.Close()
		kraken.Close()
	})

}

type cookiejar []*http.Cookie

func (j *cookiejar) SetCookies(_ *url.URL, cookies []*http.Cookie) { *j = append(*j, cookies...) }
func (j *cookiejar) Cookies(_ *url.URL) []*http.Cookie             { return *j }

func runAuthClient(t *testing.T, kraken *httptest.Server) {
	var jar cookiejar
	c := http.Client{Transport: kraken.Client().Transport, Jar: &jar}
	rsp, err := c.Get(kraken.URL + "/")
	if err != nil {
		t.Fatal("error contacting server", err)
	}
	defer rsp.Body.Close()
	if rsp.StatusCode != http.StatusOK {
		t.Errorf("invalid status code: want 200, got %s", rsp.Status)
	}
}

func spinupLocalOAuth(t *testing.T,
	platform string, // AzureAD, Google
	service string, // URL of the kraken App
	client string, // random ID
) (*httptest.Server, *oidc.IDTokenVerifier) {
	// generates a key to sign token
	pkey, err := rsa.GenerateKey(rand.Reader, 1024)
	if err != nil {
		t.Fatal(err)
	}

	mux := http.NewServeMux()
	server := httptest.NewServer(mux)
	t.Log("OAuth local instance at", server.URL)

	// well-known messages of the protocol
	type OpenIDConfiguration struct {
		Issuer                string `json:"issuer"`
		AuthorizationEndpoint string `json:"authorization_endpoint"`
		TokenEndpoint         string `json:"token_endpoint"`
	}

	mux.HandleFunc("/.well-known/openid-configuration", func(res http.ResponseWriter, req *http.Request) {
		// creates well known JSON to replicate an OAuth
		// data is important as it is used to retrieve authorization and token endpoints
		res.Header().Set("Content-Type", "application/json")
		json.NewEncoder(res).Encode(OpenIDConfiguration{
			Issuer:                server.URL,
			AuthorizationEndpoint: server.URL + "/oauth/v2/auth",
			TokenEndpoint:         server.URL + "/token",
		})
	})

	mux.HandleFunc("/oauth/v2/auth", func(w http.ResponseWriter, r *http.Request) {
		redirectURL := service + "/authorize?"
		redirectURL += "&state=" + r.FormValue("state")
		// "code" is generated from OAuth provider and will be re-sent to generate the token
		// dummy "code" is used for testing, will not be validated
		redirectURL += "&code=0AdQt8qg2-LPNaPe4y8f7bx4v70PQUrwX3Qs92QKoJ8krocSBdQHNGZ7c6sYbnkweqDOVcg"
		redirectURL += "&scope=email"
		redirectURL += "&profile=" + server.URL + "/profile-info"

		t.Log("redirect to ", redirectURL)
		// redirects to the auth server to where we retrieve the token
		http.Redirect(w, r, redirectURL, http.StatusFound)
	})

	mux.HandleFunc("/token", func(res http.ResponseWriter, req *http.Request) {
		// signs a token using RS256
		// public and private keys need to be setup otherwise signature verification will fail
		sig, err := jose.NewSigner(jose.SigningKey{Algorithm: jose.RS256, Key: pkey}, (&jose.SignerOptions{}).WithType("JWT"))
		if err != nil {
			t.Fatal(err)
		}

		var token string
		// structure of claims used to store user info
		if platform == "Google" {
			googleclaims := struct {
				Name    string `json:"name"`
				Email   string `json:"email"`
				Picture string `json:"picture"`
				Domain  string `json:"hd"`
				jwt.Claims
			}{
				Name:    "John Doe",
				Email:   "test@example.com",
				Domain:  "example.com",
				Picture: server.URL + "/profile/image",
				Claims: jwt.Claims{
					Issuer:   server.URL,
					Expiry:   jwt.NewNumericDate(time.Now().Add(time.Hour * 1)),
					Audience: []string{client},
				},
			}
			token, err = jwt.Signed(sig).Claims(googleclaims).CompactSerialize()
		} else if platform == "AzureAD" {
			azureclaims := struct {
				PreferredUsername string `json:"preferred_username"`
				Name              string `json:"name"`
				TenantId          string `json:"tid"`
				jwt.Claims
			}{
				PreferredUsername: "test@example.com",
				Name:              "John Doe",
				TenantId:          "example.com",
				Claims: jwt.Claims{
					Issuer:   server.URL,
					Expiry:   jwt.NewNumericDate(time.Now().Add(time.Hour * 1)),
					Audience: []string{client},
				},
			}
			token, err = jwt.Signed(sig).Claims(azureclaims).CompactSerialize()
		}

		if err != nil {
			t.Fatal("signing token", err)
		}

		// generates JSON with token info and the signed jwt token
		res.Header().Set("Content-Type", "application/json")
		json.NewEncoder(res).Encode(struct {
			AccessToken  string `json:"access_token"`
			TokenType    string `json:"token_type"`
			RefreshToken string `json:"refresh_token"`
			ExpiresIn    int32  `json:"expires_in"`
			IdToken      string `json:"id_token"`
		}{
			AccessToken:  "3955edd0-27ba-11ed-a261-0242ac120002",
			TokenType:    "Bearer",
			RefreshToken: "94901bb6-bddb-4b14-a460-ceeea624b30b",
			ExpiresIn:    7866,
			IdToken:      token,
		})
	})

	verif := oidc.NewVerifier(
		server.URL,
		&oidc.StaticKeySet{PublicKeys: []crypto.PublicKey{pkey.Public()}},
		&oidc.Config{
			ClientID:             client,
			SupportedSigningAlgs: []string{"RS256"},
		},
	)

	return server, verif
}
