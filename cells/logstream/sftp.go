package logstream

import (
	"context"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"path"
	"path/filepath"
	"strings"
	"sync/atomic"

	"golang.org/x/crypto/ssh"
	"golang.org/x/sync/errgroup"

	"trout.software/kraken/webapp/cells/logstream/internal/iter"
	"trout.software/kraken/webapp/cells/logstream/internal/sftp"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

var (
	countNotAMatch            atomic.Int64
	countGoRoutines           atomic.Int64
	countNotClosedDirectories atomic.Int64
	countPoppedElements       atomic.Int64
	countServedSegments       atomic.Int64
	countFilesToBeCollected   atomic.Int64
	countFilesAccessDenied    atomic.Int64
)

type SFTP struct {
	Path            string `form:"path,required,placeholder=/var/log/auth.log"`
	UserAndHostName string `form:"userhost,required,placeholder=ubuntu@172.27.231.201:22"`
	// PubKey as displayed in key.pub file
	PubKey       PublicKey `form:"publickey,required,placeholder=ssh-ed25519 BAAAC3NzbC1lZDI1NTE5AAAAINSorySBcl7boa5YTAO9dHcw2ADcrOXovSkua/Uh2emn root@server"`
	Identity     string    `form:"identity,required"`
	Preprocessor string    `form:"preprocessor,placeholder=gunzip"`

	err error
}

// Fingerprint returns the SHA256 encoding of the public key
func (s *SFTP) Fingerprint() string {
	pk, _, _, _, err := ssh.ParseAuthorizedKey(s.PubKey)
	if err != nil {
		return "invalid pub key: " + err.Error()
	}

	return ssh.FingerprintSHA256(pk)
}

type PublicKey []byte

func (p PublicKey) String() string { return string(p) }
func (p *PublicKey) FillForm(input []string) error {
	switch len(input) {
	default:
		return fmt.Errorf("invalid input length (want 0 or 1): %d", len(input))
	case 0:
		return nil
	case 1:
		*p = PublicKey(input[0])
		return nil
	}
}

func (s *SFTP) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, shard shards.Shard, cs []piql.Pivot) driver.Iter {
	return iter.Filter(s, ssn, st, g, shard, cs)
}

func (s *SFTP) Streams() []driver.Stream {
	return []driver.Stream{{Name: fmt.Sprintf("%s:%s", s.UserAndHostName, s.Path), Type: "stream:sftp:sftp"}}
}

func (s *SFTP) Init(r *http.Request) { s.err = httpform.Unmarshal(r, s) }

// Test checks that there can be stablished a sftp connection with the remote server.
// It checks that the directory path before any magic char or the exact file name exists by doing a SSH_FXP_LSTAT msg request
func (s *SFTP) Test(ctx context.Context, ssn iam.Session) error {
	ctx, task := tasks.New(ctx, "cell:sftp_test")
	defer task.End()

	if s.err != nil {
		return s.err
	}

	c, err := s.client(ctx, &ssn)
	if err != nil {
		return err
	}
	defer c.Close()

	scPath := s.Path

	if strings.ContainsAny(scPath, magicChars) {
		scPath = scPath[:strings.IndexAny(scPath, magicChars)]
		if !strings.HasSuffix(scPath, "/") {
			//The final element is a non full name (i.e. sc.Path="/var/ee*read.log")
			scPath = filepath.Dir(scPath)
		}
	}

	if err := c.WritePacket(sftp.FxpLStatMsg{Path: scPath, ID: rand.Uint32()}); err != nil {
		return sftpErr{Err: err, MsgType: 7, Operation: "Test-Lstat-write-packet", Path: scPath}
	}
	pkt, err := c.ReadPacket()
	if err != nil {
		return sftpErr{Err: err, MsgType: 7, Operation: "Test-Lstat-read-packet", Path: scPath}
	}
	switch msg := pkt.(type) {
	case *sftp.FxpStatusRsp:
		return errors.New(msg.Msg)
	case *sftp.FxpAttrsRsp:
		return nil
	default:
		return getUnexpectedMsgTypeErr(msg, "Test-Lstat", scPath, 7)
	}
}

// DefineForm populates the drop-down from registered SSH identities (through the ssh_identities table).
func (s *SFTP) DefineForm(ssn *iam.Session) []httpform.Field {
	base := httpform.GenerateDefinition(s)

	ids, err := storage.ListSecrets[sftp.Identity](context.Background(), ssn.UnlockedStorage.Keyring, storage.SFTPIdentity)
	if err != nil {
		iter.Logger.Warn("cannot list SSH identities: " + err.Error())
		return base
	}
	if len(ids) == 0 {
		id, err := sftp.GenerateSSHIdentity("ed25519", "default", "Automatically generated")
		if err != nil {
			iter.Logger.Warn("cannot generate SSH identities: " + err.Error())
			return base
		}
		err = storage.StoreSecret(context.Background(), ssn.UnlockedStorage.Keyring, storage.SFTPIdentity, "default", id)
		if err != nil {
			iter.Logger.Warn("cannot persist new SSH identity: " + err.Error())
			return base
		}
		ids = []sftp.Identity{id}
	}
	opts := make([]httpform.SelectOption, len(ids))
	for i, id := range ids {
		opts[i] = httpform.SelectOption{Label: id.Name, Value: id.Name}
	}

	for i, v := range base {
		if v.Name == "identity" {
			base[i].Type = "select"
			base[i].SelectOptions = opts
		}
	}

	return base
}

func (s SFTP) client(ctx context.Context, ssn *iam.Session) (*sftp.Client, error) {
	serverPubKey, _, _, _, err := ssh.ParseAuthorizedKey(s.PubKey)
	if err != nil {
		return nil, fmt.Errorf("parsing public key: %w", err)
	}
	usr, hn, ok := strings.Cut(s.UserAndHostName, "@")
	if !ok {
		return nil, fmt.Errorf("invalid user@hostname")
	}

	id, err := storage.ReadSecret[sftp.Identity](ctx, ssn.UnlockedStorage.Keyring, storage.SFTPIdentity, s.Identity)
	if err != nil {
		return nil, fmt.Errorf("cannot find selected identity %s: %w", s.Identity, err)
	}

	key, err := ssh.NewSignerFromKey(id.Key)
	if err != nil {
		return nil, fmt.Errorf("invalid identity %s: %w", s.Identity, err)
	}

	config := &ssh.ClientConfig{
		User:              usr,
		Auth:              []ssh.AuthMethod{ssh.PublicKeys(key)},
		HostKeyAlgorithms: []string{ssh.KeyAlgoED25519},
		HostKeyCallback:   ssh.FixedHostKey(serverPubKey),
	}

	client, err := ssh.Dial("tcp", hn, config)
	if err != nil {
		return nil, err
	}

	sshSession, err := client.NewSession()
	if err != nil {
		return nil, fmt.Errorf("when starting a ssh client session %w", err)
	}

	return sftp.NewSFTPClient(sshSession, client)
}

type SFTPConn struct {
	Con                *sftp.Client
	Path, Preprocessor string
}

func (s *SFTP) Connect(ssn *iam.Session) (iter.Driver, error) {
	c, err := s.client(context.Background(), ssn)
	if err != nil {
		return nil, err
	}

	go c.Serve()

	return SFTPConn{Con: c, Path: s.Path, Preprocessor: s.Preprocessor}, nil
}

const (
	//bitmasks defined for the `pflags' field
	SSH_FXF_READ = 0x00000001
)

type File struct {
	Name   string
	Handle string
	Conn   *sftp.Client
}

const maxReadLength = 256*1024 - 1024 // see OpenBSD sftp-common.h

func (f *File) Size() (int64, error) {
	const operation = "size"
	_, task := tasks.New(context.Background(), "cell:sftp_size")
	defer task.End()

	msg, err := f.Conn.SendRequest(sftp.FxpLStatMsg{Path: f.Name, ID: f.Conn.NewRequestID()})
	if err != nil {
		return 0, sftpErr{Err: err, Operation: operation, Path: f.Name, MsgType: 7}
	}
	switch res := msg.(type) {
	case *sftp.FxpStatusRsp:
		return 0, sftpErr{Err: errors.New(res.Msg), Operation: operation, Path: f.Name, MsgType: 7}
	case *sftp.FxpAttrsRsp:
		return int64(res.FileAttributes.GetSize()), nil
	default:
		return 0, getUnexpectedMsgTypeErr(res, operation, f.Name, 7)
	}
}

func (f *File) Close() error {
	return SFTPConn{Con: f.Conn, Path: f.Name}.close(f.Handle, f.Name)
}

func (f *File) ReadAt(b []byte, off int64) (n int, err error) {
	const operation = "ReadAt"
	if off < 0 {
		return 0, fmt.Errorf("negative offset for file path %s", f.Name)
	}

	req := sftp.FxpReadMsg{
		Handle: f.Handle,
	}

	for len(b) > 0 {
		req.ID = f.Conn.NewRequestID()
		req.Offset = uint64(off) + uint64(n)
		req.Length = uint32(min(uint64(len(b)), maxReadLength))
		var msg any
		msg, err = f.Conn.SendRequest(req)
		if err != nil {
			err = sftpErr{Err: err, Operation: operation, Path: f.Name, MsgType: 5}
			return
		}
		switch res := msg.(type) {
		case *sftp.FxpStatusRsp:
			if res.Status == uint32(1) {
				//SSH_FX_EOF= uint32(1): EOF is encountered before reading any data.
				//For normal disk files, it is guaranteed that this will read the specified number of bytes, or up to end of file.
				err = io.EOF
				return
			}
			err = sftpErr{Err: errors.New(res.Msg), Operation: operation, Path: f.Name, MsgType: 5}
			return
		case *sftp.FxpDataRsp:
			n += copy(b, res.Data)
			b = b[len(res.Data):]
		default:
			err = getUnexpectedMsgTypeErr(res, operation, f.Name, 5)
			return
		}
	}
	return
}

func (sc SFTPConn) Open(name string) (iter.SizedReaderAt, error) {
	ctx, task := tasks.New(context.Background(), "cell:sftp_open")
	defer task.End()

	tasks.Annotate(ctx, "filename", name)

	const operation = "Open"

	a := &sftp.Attributes{}
	req := sftp.FxpOpen{
		ID:       sc.Con.NewRequestID(),
		FileName: name,
		PFlags:   uint32(SSH_FXF_READ),
		Attrs:    a.Bytes()}

	msg, err := sc.Con.SendRequest(req)
	if err != nil {
		return nil, sftpErr{Err: err, Operation: operation, Path: name, MsgType: 3}
	}
	switch res := msg.(type) {
	case *sftp.FxpStatusRsp:
		return nil, sftpErr{Err: errors.New(res.Msg), Operation: operation, Path: name, MsgType: 3}
	case *sftp.FxpHandleRsp:
		var rdr iter.SizedReaderAt = &File{Name: name, Handle: res.Handle, Conn: sc.Con}
		if sc.Preprocessor != "" {
			rdr, err = gord(sc.Preprocessor).pipe(rdr)
			if err != nil {
				return nil, err
			}
		}
		return rdr, nil
	default:
		return nil, getUnexpectedMsgTypeErr(res, operation, name, 3)
	}
}

func (sc SFTPConn) close(handle, path string) error {
	const operation = "Close handle"
	msg, err := sc.Con.SendRequest(sftp.FxpClose{ID: sc.Con.NewRequestID(), Handle: handle})
	if err != nil {
		return sftpErr{Err: err, Operation: operation, Path: path, MsgType: 4}
	}
	switch res := msg.(type) {
	case *sftp.FxpStatusRsp:
		if res.Status != sftp.SSH_FX_OK {
			return sftpErr{Err: errors.New(res.Msg), Operation: operation, Path: path, MsgType: 4}
		}
	default:
		return getUnexpectedMsgTypeErr(res, operation, path, 11)
	}
	countNotClosedDirectories.Add(-1)
	return nil
}

func isDir(mode uint32) bool {
	// FileMode represents a file’s mode and permission bits.
	// The bits are defined according to POSIX standards,
	const ModeDir uint32 = 0x4000
	const ModeType uint32 = 0xF000 // S_IFMT
	return (mode & ModeType) == ModeDir
}

func (sc SFTPConn) Glob(pat string) ([]string, error) {
	ctx, task := tasks.New(context.Background(), "cell:sftp_glob")
	defer task.End()

	tasks.Annotate(ctx, "config-pattern", sc.Path)
	tasks.Annotate(ctx, "query-pattern", pat)

	var scPath = sc.Path

	if strings.ContainsAny(scPath, magicChars) {
		scPath = scPath[:strings.IndexAny(scPath, magicChars)]
		if !strings.HasSuffix(scPath, "/") {
			//The final element is a non full name (i.e. sc.Path="/var/ee*read.log")
			scPath = filepath.Dir(scPath)
		}
	}
	return WalkDir(scPath, sc)
}

const magicChars = `*?[`

type index struct {
	current int
	prev    int
}

// match reports whether the directory name matches the shell pattern.
//
// since pattern can be longer than the directory (i.e. pattern="readme/*/hello/l*.txt"  dir="readme/otro")
// the method calls path.Match with both slices of pattern and dir indexed from zero to their own next directory separator "/".
//
//	match("readme/*/hello/l*.txt", "readme/otro") = true as path.Match("readme/*", "readme/otro") returns true
//	match("readme/*/hello/l*.txt", "readme/otro/") = false as  path.Match("readme/*/hello", "readme/otro/") returns false
func match(pattern, dir string) (bool, error) {
	if !strings.ContainsAny(pattern, "/") {
		return path.Match(pattern, dir)
	}
	var idir, ipattern index
	for idir.prev <= len(dir) {
		ipattern.current = strings.IndexAny(pattern[ipattern.prev:], "/")
		idir.current = strings.IndexAny(dir[idir.prev:], "/")
		if idir.current == -1 {
			idir.current = len(dir)
		} else {
			idir.current += idir.prev
		}
		if ipattern.current == -1 {
			ipattern.current = len(pattern)
			if strings.ContainsAny(dir[idir.prev:], "/") {
				//(i.e. pattern="/readme/*" dir="/readme/file/z")
				return false, nil
			}
		} else {
			ipattern.current += ipattern.prev
		}
		switch ok, err := path.Match(pattern[0:ipattern.current], dir[0:idir.current]); {
		case err != nil:
			return false, err
		case !ok:
			return ok, nil
		case idir.current == len(dir):
			return ok, nil
		default: //asi
			ipattern.prev = ipattern.current + 1
			idir.prev = idir.current + 1
			continue
		}
	}
	return true, nil
}

func (sc *SFTPConn) Download(segment, dest string) error {
	return nil
}

type sftpErr struct {
	Err error
	//Message is optional and represents the client message sent to the server when the error ocurred.
	MsgType         int
	Operation, Path string
}

func getUnexpectedMsgTypeErr(msg any, operation, path string, msgType int) sftpErr {
	msgErr := fmt.Sprintf("unexpected message type %T returned from server", msg)
	return sftpErr{Err: errors.New(msgErr), Operation: operation, Path: path, MsgType: msgType}
}

func (e sftpErr) Error() string {
	return fmt.Sprintf("sftp server error: %s (operation=%s path=%s request=%v)", e.Err, e.Operation, e.Path, e.MsgType)
}

func WalkDir(dir string, sc SFTPConn) ([]string, error) {
	var results []string

	pop := make(chan string)
	pull := make(chan []string)
	go func() {
		var nextup []string
		var l string
		inflight := 1
		pop <- dir

		for {
			for inflight > 0 && len(nextup) == 0 && len(l) == 0 {
				nextup = append(nextup, <-pull...)
				inflight--
			}
			if inflight == 0 && len(nextup) == 0 && len(l) == 0 {
				break
			}
			if len(l) == 0 {
				//only when l has been popped it can be set to the next item value
				nextup, l = nextup[:len(nextup)-1], nextup[len(nextup)-1]
			}
			select {
			case pop <- l:
				inflight++
				l = ""
			case next := <-pull:
				inflight--
				nextup = append(nextup, next...)
			}
		}
		close(pop)
		close(pull)
	}()

	collect := make(chan string)
	done := make(chan struct{})
	go func() {
		for r := range collect {
			results = append(results, r)
		}
		close(done)
	}()

	g := new(errgroup.Group)
	g.SetLimit(16) // assumes remote host with 4 cores, and 4 extra threads

	for v := range pop {
		v := v
		countPoppedElements.Add(1)
		g.Go(func() error {
			countGoRoutines.Add(1)
			isdir, match, err := sc.lStat(v)
			if !match || err != nil {
				countNotAMatch.Add(1)
				pull <- []string{}
				return err
			}

			if isdir {
				files, err := sc.scanDir(v)
				switch {
				default:
					pull <- files
				case err != nil:
					pull <- []string{}
					return err
				}
			} else {
				countFilesToBeCollected.Add(1)
				collect <- v
				pull <- []string{}
			}
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}
	close(collect)
	<-done

	return results, nil
}

// LStat method executes a SSH_FXP_LSTAT msg request.
// It returns whether if the path is a directory and whether if the path (being a directory or a file) matches the data source configuration path.
func (sc SFTPConn) lStat(scPath string) (isDirectory, matchPath bool, err error) {
	const operation = "LStat"
	ID := sc.Con.NewRequestID()
	pkt, err := sc.Con.SendRequest(sftp.FxpLStatMsg{Path: scPath, ID: ID})
	if err != nil {
		err = sftpErr{Err: err, Operation: operation, Path: scPath, MsgType: 7}
		return
	}
	switch msg := pkt.(type) {
	case *sftp.FxpStatusRsp:
		err = sftpErr{Err: errors.New(msg.Msg), Operation: operation, Path: scPath, MsgType: 7}
	case *sftp.FxpAttrsRsp:
		isDirectory = isDir(uint32(msg.FileAttributes.GetMode()))
		if isDirectory {
			matchPath, err = match(sc.Path, scPath)
		} else {
			matchPath, err = path.Match(sc.Path, scPath)
		}
		if !matchPath {
			countNotAMatch.Add(1)
		}
	default:
		err = getUnexpectedMsgTypeErr(msg, operation, scPath, 7)
	}
	return
}

// scanDir returns all files in dir.
// An empty directory returns nil, nil.
func (sc SFTPConn) scanDir(dir string) ([]string, error) {
	const operation = "scan directory"
	ID := sc.Con.NewRequestID()
	msg, err := sc.Con.SendRequest(sftp.FxpOpenDirMsg{ID: ID, Path: dir})
	if err != nil {
		return nil, sftpErr{Err: err, Operation: operation, Path: dir, MsgType: 11}
	}
	var handle string
	switch res := msg.(type) {
	case *sftp.FxpStatusRsp:
		if res.Status == 0x3 {
			if strings.ContainsAny(sc.Path, magicChars) {
				countFilesAccessDenied.Add(1)
				//SSH_FX_PERMISSION_DENIED is ignored when the datasource configure path is not a filename exact path
				return []string{}, nil
			}
			return nil, sftpErr{Err: errors.New(res.Msg), Operation: operation, Path: dir, MsgType: 11}
		}
	case *sftp.FxpHandleRsp:
		countNotClosedDirectories.Add(1)
		handle = res.Handle
	default:
		return nil, getUnexpectedMsgTypeErr(msg, operation, dir, 11)
	}

	scan := func(handle string) ([]string, error) {
		var segments = []string{}
		var errMsg string
		for {
			ID = sc.Con.NewRequestID()
			msg, err = sc.Con.SendRequest(sftp.FxpReadDir{ID: ID, Handle: handle})
			if err != nil {
				return nil, sftpErr{Err: err, Operation: operation, Path: dir, MsgType: 12}
			}
			switch res := msg.(type) {
			case *sftp.FxpStatusRsp:
				if res.Status == uint32(1) {
					//SSH_FX_EOF= uint32(1): there are no more directory entries to return.
					return segments, nil
				}
				return nil, sftpErr{Err: errors.New(errMsg), Operation: operation, Path: dir, MsgType: 12}
			case *sftp.FxpNameRsp:
				for i := 0; i < int(res.Count); i++ {
					name := res.Data[i].FileName
					switch {
					case name == "." || name == "..":
						//as per documentation  sftp Servers SHOULD interpret a path name component ".." as referring to the parent directory, and "." as referring to the current directory
						continue
					case isDir(uint32(res.Data[i].Attrs.GetMode())):
						if !strings.HasSuffix(dir, "/") {
							name = dir + "/" + name
						} else {
							name = dir + name
						}
						ok, err := match(sc.Path, name)
						if err != nil {
							return []string{}, err
						}
						if !ok {
							countNotAMatch.Add(1)
							continue
						}
						segments = append(segments, name)
					default:
						if !strings.HasSuffix(dir, "/") {
							name = dir + "/" + name
						} else {
							name = dir + name
						}
						match, err := path.Match(sc.Path, name)
						if err != nil {
							return nil, err
						}
						if !match {
							countNotAMatch.Add(1)
							continue
						}
						segments = append(segments, name)
					}
				}
				return segments, nil
			default:
				return nil, getUnexpectedMsgTypeErr(msg, operation, dir, 12)
			}
		}
	}

	s, err := scan(handle)
	if err != nil {
		return nil, err
	}

	if err := sc.close(handle, dir); err != nil {
		return nil, err
	}
	countServedSegments.Add(int64(len(s)))
	return s, nil
}
