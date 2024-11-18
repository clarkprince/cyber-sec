package hub

import (
	"bufio"
	"bytes"
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"log/slog"

	"filippo.io/age"
	"github.com/BurntSushi/toml"
	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/hub/devices"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/forwarder"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

func ServerFromFiles(pattern string) (*App, error) {
	var app App
	if err := DecodeConfigFiles(&app, pattern); err != nil {
		return nil, err
	}
	app.wire()
	go app.RunSchedule()
	return &app, nil
}

// decodes any set of TOML files into a struct.
func DecodeConfigFiles[T any](v *T, pattern string) error {
	files, err := filepath.Glob(pattern)
	if err != nil {
		return err
	}

	const local_suffix = ".local.toml"
	var locals []string
	for i := 0; i < len(files); {
		if strings.HasSuffix(files[i], local_suffix) {
			locals = append(locals, files[i])
			copy(files[i:], files[i+1:])
		} else {
			i++
		}
	}

	for _, f := range files {
		for _, l := range locals {
			if strings.TrimSuffix(f, ".toml") == strings.TrimSuffix(l, local_suffix) {
				f = l
				break
			}
		}

		_, err := toml.DecodeFile(f, &v)
		if err != nil {
			return err
		}
	}

	return nil
}

type App struct {
	TLSCertificates struct {
		AutoCert bool `toml:"autocert"`
		NoTLS    bool `toml:"notls"`

		CertFile string `toml:"certificate_file"`
		KeyFile  string `toml:"certificate_key_file"`
	} `toml:"tls"`

	OAuth2 struct {
		Provider string
		verifier *oidc.IDTokenVerifier
		oauth2.Config
		Platform    string
		DomainAlias string `toml:"domain_alias"`
	}

	LDAP struct {
		ServerURL       string        `toml:"server_url"`
		BindUserPattern string        `toml:"bind_pattern"`
		MaxAge          time.Duration `toml:"max_age"`
	} `toml:"ldap"`

	htPasswdUsers map[string][]byte `toml:"-"`
	HTPasswdFile  string            `toml:"htpasswd"`

	RemoveCookieHostPrefix bool `toml:"remove_cookie_host_prefix"`

	authkey []byte

	templ TemplateLoader

	Domain string

	// DEPRECATED: grammars should be made available through the front-end
	Grammars []struct {
		Name string
		EBNF string
	}
	// DEPRECATED: time layouts should be made available per-data sources
	SupplementaryTimeLayouts []string `toml:"extra_time_layouts"`

	// DEPRECATED: should be part of a better spec for agent monitor
	Schedules []devices.Schedule `toml:"monitor_query"`

	AllowedFolders []string `toml:"allowed_folders"`
	MaxUploadSize  int      `toml:"max_upload_size"`

	ReloadAssets bool `toml:"reload_assets"`
	assets       http.Handler

	Admin struct {
		ListenAddress  string   `toml:"listen_address"`
		AuthorizedKeys []string `toml:"authorized_keys"`
	} `toml:"admin"`

	SMTPAlerter struct {
		UserName string `toml:"username"`
		Password string `toml:"password"`
		Server   string `toml:"server_address"`

		From    string   `toml:"from"`
		To      []string `toml:"to"`
		Message string   `toml:"message"`
	} `toml:"smtp_alert"`

	db      *sqlite.Connections
	keyring *storage.Keyring
	policy  *iam.Policy `toml:"-"`
}

func (app *App) DB() storage.Executor      { return app.db }
func (app *App) Keyring() *storage.Keyring { return app.keyring }

func (app *App) wire() {
	app.authkey = make([]byte, 64)
	if _, err := rand.Read(app.authkey); err != nil {
		panic(err)
	}

	if err := app.configureTLS(); err != nil {
		log.Fatal(err)
	}

	switch {
	case app.OAuth2.Provider != "":
		app.OAuthInit()
	case app.LDAP.ServerURL != "":
		if app.LDAP.MaxAge == 0 {
			app.LDAP.MaxAge = 120 * time.Minute
		}
	case app.HTPasswdFile != "":
		if err := app.ReadHTPasswdFile(); err != nil {
			log.Fatal(err)
		}
		// not super clean, but probably don’t want to overthink the security here: use OAuth if you want control.
		app.LDAP.MaxAge = 120 * time.Minute
	}

	if app.RemoveCookieHostPrefix {
		iam.CookieName = iam.CookieName[len("__Host-"):]
	}

	if app.Domain == "" {
		var err error
		app.Domain, err = os.Hostname()
		slog.Warn("no application domain set. Will default to hostname, but this mean things will break if the hostname changes. Please update your configuration if this is not desired.", "hostname", app.Domain)
		if err != nil {
			slog.Error("no domain set, and cannot find local hostname", "error", err)
			os.Exit(1)
		}
	}

	app.DBInit()

	{
		// reload templates, and assets
		var fs fs.FS = HubTemplates
		if app.ReloadAssets {
			fs = LocalDirectory("hub")
		}
		app.templ.init(app.ReloadAssets, fs)

		static, err := ServeStaticGlob(app.ReloadAssets, "rx-browser/rxnb.wasm*", "rx-browser/main.css*", "rx-browser/components.js*", "rx-browser/static/*")
		if err != nil {
			log.Fatal(err)
		}
		app.assets = http.StripPrefix("/assets/", static)
	}

	dmn, err := FindDomain(context.Background(), app.db, app.Domain)
	switch {
	case errors.Is(err, storage.MissingEntry):
		dmn.ID = ulid.Make()
		dmn.Name = app.Domain
		dmn.Alias = app.OAuth2.DomainAlias
		if err := PutValue(context.Background(), app.db, "/domain", dmn); err != nil {
			log.Fatal(err)
		}
	case err != nil:
		log.Fatal("finding domain ", app.Domain, err)
	}

	app.KeyringInit(dmn.ID, standardPKeyLocation)

	host, err := app.GenerateNewAdminHostKey(SecretNameAdmin1)
	if err != nil {
		log.Fatal(err)
	}
	slog.Info("Add this to `.known_hosts` to connect to SSH: " + host)

	for _, g := range app.Grammars {
		err := app.CreateOrUpdateGrammar(context.Background(), driver.Grammar{Name: g.Name, EBNF: g.EBNF})
		if err != nil {
			log.Fatal(err)
		}
	}
	devices.Schedules = app.Schedules

	policy, err := iam.ParsePolicy(iam.DefaultPolicy, true)
	if err != nil {
		log.Fatal("Invalid Trout Software policy. This is a software bug.", err)
	}
	app.policy = policy

	logstream.AllowedFolders = make([]string, len(app.AllowedFolders))
	for i, f := range app.AllowedFolders {
		var wd string
		if filepath.IsAbs(f) {
			logstream.AllowedFolders[i] = f
		} else {
			if wd == "" {
				wd, err = os.Getwd()
				if err != nil {
					log.Fatal("cannot get current working directory", err)
				}
			}
			logstream.AllowedFolders[i] = filepath.Join(wd, f)
		}
	}
	logstream.Domain = app.Domain
	if app.MaxUploadSize > 0 {
		logstream.MaxUploadSize = app.MaxUploadSize * 1024 * 1024
	}
	piql.Layouts = append(piql.Layouts, app.SupplementaryTimeLayouts...)

	if err := devices.DialSyslog(); err != nil {
		log.Fatal("cannot listen to syslog: ", err)
	}

	app.SetupSTMPAlert()
}

func (app *App) OAuthInit() {
	provider, err := oidc.NewProvider(context.TODO(), app.OAuth2.Provider)
	if err != nil {
		log.Fatalf("invalid OAuth provider %s: %s", app.OAuth2.Provider, err)
	}
	app.OAuth2.Endpoint = provider.Endpoint()
	app.OAuth2.verifier = provider.Verifier(&oidc.Config{ClientID: app.OAuth2.ClientID})
}

// short returns the short name of path.
// This is similar to calling path.Base, and removing the extension.
func short(fpath string) string {
	fpath = path.Base(fpath)
	for i := len(fpath) - 1; i >= 0 && fpath[i] != '/'; i-- {
		if fpath[i] == '.' {
			return fpath[:i]
		}
	}
	return fpath
}

func (app *App) DBInit() {
	var err error
	path := "kraken-" + app.Domain
	if os.Getenv("STATE_DIRECTORY") != "" {
		path = filepath.Join(os.Getenv("STATE_DIRECTORY"), path)
	}
	app.db, err = sqlite.OpenPool(path,
		sqlite.RegisterTable("policies", vtPolicies{app: app},
			sqlite.OverloadFunc("sneakpeek", sneakpeek),
		),
		sqlite.RegisterTable("users", vtUsers{app: app}),
		sqlite.RegisterTable("datasources", vtDataSources{app: app}),
		sqlite.RegisterTable("playbooks", vtPlaybooks{app: app}),
		sqlite.RegisterTable("grammars", vtGrammar{app: app}),
		sqlite.RegisterTable("schedules", vtSchedules{app: app},
			sqlite.OverloadFunc("trend", trend),
			sqlite.OverloadFunc("lastrunstatus", lastRunStatus),
		),
		logstream.ObsSSHIdentities("ssh_identities", &app.keyring),
		storage.DropLastElement,
		storage.ObsSecrets("obs_secrets", &app.keyring),
		iam.VTable,
		forwarder.ObsSinks("beta_sinks", app.DB),

		// TODO check carefully what is actually needed
		mdt.RecordObject,
		mdt.LioLiPath,
		logstream.ObsFilePool,
		sqlite.RegisterFunc("extract_ebnf", ReadGrammar),
		StreamsIn,
		sqlite.RegisterFunc("pb_filter", PlaybookFilter),
		VTabUser,
		VTabDSInPlaybook,
		VTabPivotsInPlaybook,
		VTabUsersInPlaybook,
		sqlite.RegisterFunc("extract_datasource_json", ExtractDatasourceToJson),
		sqlite.RegisterFunc("extract_pivot_json", ExtractPivotToJson),
		sqlite.RegisterFunc("extract_user_json", ExtractUserToJson),
	)
	if err != nil {
		log.Fatalf("cannot open database %s: %s", path, err)
	}

	if err := app.EnsureSQLiteSchema(CurrentSchemaVersion); err != nil {
		log.Fatal(err)
	}
}

func (app *App) configureTLS() error {
	switch {
	case app.TLSCertificates.NoTLS:
		// pass through
	case app.TLSCertificates.AutoCert:
		// prevent invalid config with both set
		app.TLSCertificates.CertFile = ""
		app.TLSCertificates.KeyFile = ""
	case app.TLSCertificates.CertFile == "", app.TLSCertificates.KeyFile == "":
		return fmt.Errorf("missing certificate or file from configuration")
	}
	return nil
}

// not very interesting feature, but used as a way to track what is happening
var migratesinglepkey = !features.HasFlag("donotport-existing-pkey")

func (app *App) KeyringInit(domain ulid.ULID,
	locator func(string) string,
) {
	path := locator(app.Domain)
	dt, err := os.ReadFile(path)
	var id *age.X25519Identity
	switch {
	case errors.Is(err, os.ErrNotExist):
		if migratesinglepkey {
			oldpath := ".pkey"
			if os.Getenv("STATE_DIRECTORY") != "" {
				oldpath = filepath.Join(os.Getenv("STATE_DIRECTORY"), oldpath)
			}
			dt, err = os.ReadFile(oldpath)
			if err == nil {
				if err := os.Rename(oldpath, path); err != nil {
					log.Fatal("cannot migrate secret key", err)
				}
				id, err = age.ParseX25519Identity(string(dt))
				if err != nil {
					log.Fatal("invalid identity", err)
				}
				break
			}
		}

		log.Println("generating new identity!")
		id, err = age.GenerateX25519Identity()
		if err != nil {
			panic("random generator is busted" + err.Error())
		}

		if err := os.WriteFile(path, []byte(id.String()), 0644); err != nil {
			log.Fatal("cannot persist encryption key", err)
		}
	case err == nil:
		id, err = age.ParseX25519Identity(string(dt))
		if err != nil {
			log.Fatal("invalid identity", err)
		}
	default:
		log.Fatal("error reading identity", err)
	}

	app.keyring, err = storage.OpenKeyring(context.Background(), app.db, storage.StaticIdentifier{id}, domain)
	if err != nil {
		log.Fatal("opening keyring ", err)
	}
}

func standardPKeyLocation(domain string) string {
	path := ".pkey-" + domain
	if os.Getenv("STATE_DIRECTORY") != "" {
		path = filepath.Join(os.Getenv("STATE_DIRECTORY"), path)
	}
	return path
}

func (app *App) ReadHTPasswdFile() error {
	fh, err := os.Open(app.HTPasswdFile)
	if err != nil {
		return fmt.Errorf("cannot read user password file: %w", err)
	}
	defer fh.Close()

	app.htPasswdUsers = make(map[string][]byte)

	sc := bufio.NewScanner(fh)
	for sc.Scan() {
		ht, err := parsehtentry(sc.Text())
		if err != nil {
			return fmt.Errorf("reading entry %s: %w", sc.Text(), err)
		}

		app.htPasswdUsers[ht.User] = []byte(ht.Pass)
	}

	return nil
}

type htentry struct {
	User  string
	Realm string
	Pass  string
}

func parsehtentry(from string) (htentry, error) {
	var h htentry
	var i int
	if i = strings.IndexRune(from, ':'); i == -1 {
		return htentry{}, errors.New("no user name")
	}
	h.User = from[:i]
	i++
	from = from[i:]
	if i = strings.IndexRune(from, '$'); i == -1 {
		return htentry{}, errors.New("unterminated line")
	}
	h.Realm = from[:i]
	h.Pass = from[i:]
	return h, nil
}

func (app *App) SetupSTMPAlert() error {
	if app.SMTPAlerter.Server == "" {
		return nil
	}

	host, port, err := net.SplitHostPort(app.SMTPAlerter.Server)
	if err != nil {
		return fmt.Errorf("host %s not a valid address: %w", app.SMTPAlerter.Server, err)
	}
	if port == "" {
		port = ":25"
	}

	tpl, err := template.New("smtp_alert").Parse(app.SMTPAlerter.Message)
	if err != nil {
		return fmt.Errorf("invalid message template: %w", err)
	}

	// choosing not to support cram-md5 ahead of time, since this is less secure than SSL
	var auth smtp.Auth
	switch {
	case app.SMTPAlerter.UserName == "" && app.SMTPAlerter.Password == "":
		slog.Info("no SMTP user name or password provided, asume no authentication")
		auth = nil
	default:
		auth = smtp.PlainAuth("", app.SMTPAlerter.UserName, app.SMTPAlerter.Password, host)
	}

	AddToHook(func(evt CheckCellFailEvent) {
		var buf bytes.Buffer

		if err := tpl.Execute(&buf, evt); err != nil {
			hooksLogger.Error("cannot create email message: " + err.Error())
			return
		}

		hooksLogger.Debug("sending email notification",
			"to", app.SMTPAlerter.To,
			"from", app.SMTPAlerter.From,
			"addr", host,
		)

		err := smtp.SendMail(
			host+":"+port,
			auth,
			app.SMTPAlerter.From,
			app.SMTPAlerter.To,
			buf.Bytes(),
		)
		if err != nil {
			hooksLogger.Warn("could not send alert message: " + err.Error())
		}
	})
	return nil
}
