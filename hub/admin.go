package hub

import (
	"bufio"
	"bytes"
	"context"
	"crypto"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"strings"
	"time"

	"golang.org/x/crypto/ssh"
	"golang.org/x/crypto/ssh/knownhosts"
	"golang.org/x/term"
	"trout.software/kraken/webapp/cells/syslog"
	"trout.software/kraken/webapp/cells/xlsx"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/bech32"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/metrics"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/txtar"
)

var sshLogger = tasks.NewLogger("admin_interface")

func (app App) DoSSH() error {
	if app.Admin.ListenAddress == "" || len(app.Admin.AuthorizedKeys) == 0 {
		sshLogger.Warn("missing listen_address or authorized_keys in admin config. The interface will not be available")
		return nil
	}

	var self ssh.Signer
	var err error
	priv, err := storage.ReadSecret[adminkey](context.Background(), app.keyring, storage.AdminPrivatekey, "admin1")
	if err != nil {
		return fmt.Errorf("cannot read admin secret key: %w", err)
	}

	self, err = ssh.NewSignerFromKey(ed25519.PrivateKey(priv))
	if err != nil {
		panic(err)
	}

	adminkeys := make(map[string]bool)
	for _, akey := range app.Admin.AuthorizedKeys {
		k, _, _, _, err := ssh.ParseAuthorizedKey([]byte(akey))
		if err != nil {
			return fmt.Errorf("parsing key %s: %w", akey, err)
		}
		adminkeys[ssh.FingerprintSHA256(k)] = true
	}

	config := &ssh.ServerConfig{
		PublicKeyCallback: func(c ssh.ConnMetadata, pubKey ssh.PublicKey) (*ssh.Permissions, error) {
			if !adminkeys[ssh.FingerprintSHA256(pubKey)] {
				return nil, fmt.Errorf("invalid admin key")
			}

			tasks.AuditLogger.Info("admin logged in to SSH", "key", ssh.FingerprintSHA256(pubKey))
			return &ssh.Permissions{}, nil
		},
		ServerVersion: "SSH-2.0-HubByTroutSoftware",
	}

	config.AddHostKey(self)

	lst, err := net.Listen("tcp", app.Admin.ListenAddress)
	if err != nil {
		return fmt.Errorf("cannot listen to address %s: %w", app.Admin.ListenAddress, err)
	}

	conns := make(chan net.Conn)
	for i := 0; i < 5; i++ {
		go app.ServeSSHConn(conns, config)
	}

	for {
		cn, err := lst.Accept()
		if err != nil {
			sshLogger.Error("cannot accept admin connection", "error", err)
			continue
		}
		conns <- cn
	}
}

func (app App) ServeSSHConn(conns chan net.Conn, config *ssh.ServerConfig) {
	for cn := range conns {

		_, chans, reqs, err := ssh.NewServerConn(cn, config)
		if err != nil {
			sshLogger.Error("cannot upgrade connection", "error", err)
			continue
		}

		go ssh.DiscardRequests(reqs)

	sessionsLoop:
		for channel := range chans {
			if channel.ChannelType() != "session" {
				channel.Reject(ssh.UnknownChannelType, "unknown channel type")
				continue
			}

			ch, requests, err := channel.Accept()
			if err != nil {
				sshLogger.Error("could not accept channel: %w", err)
			}

			// initialize the shell
			sess := &rsess{channel: ch}
		termInit:
			for req := range requests {
				switch req.Type {
				default:
					req.Reply(false, nil)
					ch.Close()
					continue sessionsLoop
				case "shell":
					sess.rdr = bufio.NewReader(ch)
					req.Reply(true, nil)
					break termInit
				case "exec":
					var msg struct {
						Command string
					}
					err := ssh.Unmarshal(req.Payload, &msg)
					if err != nil {
						sshLogger.Error("invalid command: " + err.Error())
						continue
					}
					sess.cmd = bufio.NewReader(strings.NewReader(msg.Command))
					req.Reply(true, nil)
					break termInit
				case "env":
					// ignore them
				case "pty-req":
					// RFC 4254 Section 6.2.
					var msg struct {
						Term     string
						Columns  uint32
						Rows     uint32
						Width    uint32
						Height   uint32
						Modelist string
					}
					err := ssh.Unmarshal(req.Payload, &msg)
					if err != nil {
						sshLogger.Error("invalid PTY", "err", err)
						continue
					}
					if msg.Columns != 0 {
						msg.Width = msg.Columns * 8
					}
					if msg.Rows != 0 {
						msg.Height = msg.Rows * 8
					}

					sess.pty = term.NewTerminal(ch, "\033[31m»\033[0m ")
					sess.pty.SetSize(int(msg.Width), int(msg.Height))
					req.Reply(true, nil)
				}
			}

			// serve further requests prevent blockage
			termchanges := make(chan func(*term.Terminal), 1)
			go func(in <-chan *ssh.Request) {
				for req := range in {
					switch req.Type {
					default:
						req.Reply(false, nil)
					case "window-change":
						// RFC 4254 Section 6.7.
						var msg struct {
							Columns uint32
							Rows    uint32
							Width   uint32
							Height  uint32
						}

						err := ssh.Unmarshal(req.Payload, &msg)
						if err != nil {
							sshLogger.Error("invalid PTY", "err", err)
							continue
						}
						if msg.Columns != 0 {
							msg.Width = msg.Columns * 8
						}
						if msg.Rows != 0 {
							msg.Height = msg.Rows * 8
						}

						sshLogger.Debug("changing term size", "width", msg.Width, "height", msg.Height)

						termchanges <- func(sess *term.Terminal) { sess.SetSize(int(msg.Width), int(msg.Height)) }
						req.Reply(false, nil)
					}
				}
			}(requests)

			if err := loopREPL(app.db, app.Admin.AuthorizedKeys, sess, termchanges); err != nil && !errors.Is(err, io.EOF) {
				sshLogger.Error("error running loop", "err", err)
			}
			ch.Close()
		}
	}
}

type rsess struct {
	channel ssh.Channel

	// pty is set upon a PTY request (§6.2) (both for shell and exec)
	pty *term.Terminal
	// rdr is set when starting a shell (§6.5), and no PTY has been allocated
	rdr *bufio.Reader
	// cmd is set when executing a command (§6.5), whether or not PTY is alloc
	cmd *bufio.Reader
}

func (s *rsess) ReadLine() (line string, err error) {
	switch {
	case s.cmd != nil:
		return s.cmd.ReadString('\n')
	case s.pty != nil:
		return s.pty.ReadLine()
	default:
		return s.rdr.ReadString('\n')
	}
}

func (s *rsess) Write(dt []byte) (n int, err error) {
	if s.pty != nil {
		return s.pty.Write(dt)
	}

	return s.channel.Write(dt)
}

func (s *rsess) Read(dt []byte) (n int, err error) {
	return s.channel.Read(dt)
}

func (s *rsess) Error(args ...any) { fmt.Fprintln(s.channel, args...) }

func loopREPL(pool *sqlite.Connections, adminKeys []string, ss *rsess, termchanges <-chan func(*term.Terminal)) error {
	var (
		QueryPlanMode = false
		BytecodeMode  = false
	)

	var buf bytes.Buffer
	for {
		select {
		case f := <-termchanges:
			f(ss.pty)
		default:
		}

		buf.Reset()
		for !sqlite.IsComplete(buf.String()) {
			line, err := ss.ReadLine()
			if line == "" && err != nil {
				return fmt.Errorf("error reading line: %w", err)
			}
			if strings.HasPrefix(line, ".") {
				cmd, args, _ := strings.Cut(line, " ")
				switch cmd {
				default:
					ss.Error("unknown command: " + line)
				case ".eqp":
					QueryPlanMode = !QueryPlanMode
				case ".bytecode":
					BytecodeMode = !BytecodeMode
				case ".backup":
					_, dest, ok := strings.Cut(line, " ")
					var err error
					if !ok {
						err = doStreamingBackup(pool, ss)
					} else {
						err = sqlite.BackupDB(pool, dest)
					}
					if err != nil {
						ss.Error("error performing backup: ", err)
					}
				case ".profile":
					if err := metrics.WriteProfile(args, ss); err != nil {
						ss.Error("cannot create profile:", err)
					}
				case ".cpu":
					if err := metrics.WriteCPUProfile(args, ss); err != nil {
						ss.Error("cannot create CPU profile:", err)
					}
				case ".trace":
					if err := metrics.WriteTrace(args, ss); err != nil {
						ss.Error("cannot create trace:", err)
					}
				case ".startsyslog":
					var sc []syslog.Syslog
					if err := json.Unmarshal([]byte(args), &sc); err != nil {
						ss.Error("invalid syslog configuration", err)
					}

					if err := syslog.StartSyslogHandler(sc); err != nil {
						ss.Error("cannot start syslog", err)
					}
				case ".uploadscript":
					// if !ReadExcel {
					// 	ss.Error("feature not enabled")
					// 	break
					// }

					// base64 encoded data has multiple lines
					var buf strings.Builder
					buf.WriteString(args)
					for {
						line, err := ss.ReadLine()
						if err == nil || errors.Is(err, io.EOF) {
							buf.WriteString(strings.TrimSpace(line))
							if err == nil {
								continue
							}
						}
						break
					}
					data, err := base64.StdEncoding.DecodeString(buf.String())
					if err != nil {
						ss.Error("cannot decode base64 data:", err)
						continue
					}
					if err := xlsx.UploadScripts(pool, data, "<in progress>"); err != nil {
						ss.Error("cannot upload script:", err)
						continue
					}
					fmt.Fprintln(ss.channel, "Script uploaded suuccessfully")
				}
				buf.Reset()
				continue
			}

			buf.WriteString(line + " ")
		}

		query := strings.TrimSpace(buf.String())
		buf.Reset()

		var x txtar.Archive

		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
		defer cancel()
		st := pool.Exec(ctx, query)

		if st.IsExplain() {
			x.AppendFile("results", []byte(st.ExplainQueryPlan()))
			buf.Reset()
			io.Copy(ss, bytes.NewReader(txtar.Format(&x)))
			continue
		}

		if QueryPlanMode && !st.IsExplain() {
			x.AppendFile("query plan", []byte(st.ExplainQueryPlan()))
		}

		if BytecodeMode {
			x.AppendFile("bytecode", []byte(st.Bytecode()))
		}

		if ss.pty != nil {
			buf.WriteString("\033[1m")
			for i := 0; i < st.NumColumn(); i++ {
				buf.WriteString(st.ColumnName(i) + "\t")
			}
			buf.WriteString("\033[0m\n")
		}

		var out sqlite.MultiString
		for st.Next() {
			st.Scan(&out)
			for i, v := range out {
				if i > 0 {
					buf.WriteRune('\t')
				}

				buf.WriteString(v)
			}

			buf.WriteRune('\n')
		}

		if st.Err() != nil {
			ss.Error("error executing query: ", st.Err())
			continue
		}

		x.AppendFile("results", buf.Bytes())
		buf.Reset()

		io.Copy(ss, bytes.NewReader(txtar.Format(&x)))
	}
}

func doStreamingBackup(db *sqlite.Connections, d io.Writer) error {
	fh, err := os.CreateTemp("", "streaming_")
	if err != nil {
		return fmt.Errorf("cannot create temporary file: %w", err)
	}

	if err := sqlite.BackupDB(db, fh.Name()); err != nil {
		fh.Close()
		os.Remove(fh.Name())
		return fmt.Errorf("error running backup: %w", err)
	}

	if _, err := io.Copy(d, fh); err != nil {
		fh.Close()
		os.Remove(fh.Name())
		return fmt.Errorf("error running backup: %w", err)
	}

	if err := fh.Close(); err != nil {
		os.Remove(fh.Name())
		return fmt.Errorf("error running backup: %w", err)
	}

	if err := os.Remove(fh.Name()); err != nil {
		return fmt.Errorf("error running backup: %w", err)
	}

	return nil
}

var SFTPConn = !features.HasFlag("sftp-connector")
var ReadExcel = features.HasFlag("read_excel")

const (
	SecretNameAdmin1 = "admin1"
)

// GenerateNewAdminHostKey creates a new public/private key pair, and stores it in the keyring.
//
// It retursn the `.known_host` line that must be added to prevent TOFU.
func (app App) GenerateNewAdminHostKey(name string) (string, error) {
	var pub crypto.PublicKey

	lpriv, err := storage.ReadSecret[adminkey](context.Background(), app.keyring, storage.AdminPrivatekey, name)
	if err != nil {
		return "", fmt.Errorf("access keyring when genrating new admin host key for %s : %w", name, err)
	}
	if len(lpriv) == 0 {
		tasks.AuditLogger.Info("generating new SSH admin identity")
		var priv ed25519.PrivateKey
		pub, priv, err = ed25519.GenerateKey(rand.Reader)
		if err != nil {
			panic(err)
		}

		if err := storage.StoreSecret(context.Background(), app.keyring, storage.AdminPrivatekey, name, adminkey(priv)); err != nil {
			return "", fmt.Errorf("cannot store identity in keyring: %w", err)
		}
	} else {
		pub = ed25519.PrivateKey(lpriv).Public().(ed25519.PublicKey)
	}

	sp, err := ssh.NewPublicKey(pub)
	if err != nil {
		panic(err)
	}

	return knownhosts.Line([]string{knownhosts.Normalize(app.Admin.ListenAddress)}, sp), nil
}

type adminkey []byte

func (k adminkey) MarshalBinary() ([]byte, error) {
	v, err := bech32.Encode("ADMIN-SSH-KEY-", k)
	return []byte(v), err
}

func (k *adminkey) UnmarshalBinary(dt []byte) error {
	hrp, data, err := bech32.Decode(string(dt))
	if err != nil {
		return err
	}
	if hrp != "ADMIN-SSH-KEY-" {
		return errors.New("invalid admin SSH key")
	}

	*k = data
	return nil
}
