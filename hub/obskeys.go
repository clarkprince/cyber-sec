//go:build ignore

package hub

import (
	"context"
	"encoding/base64"
	"errors"
	"hash/maphash"
	"log"

	"golang.org/x/crypto/ssh"
	"trout.software/kraken/webapp/internal/sqlite"
)

var VTSSHKeystable = sqlite.RegisterTable("obs_sshkeys", vtSSHKeys{})

//go:generate constrainer vtSSHKeys
type vtSSHKeys struct {
	signature   string `vtab:"signature,filtered"` // keyring library
	name        string `vtab:"name,required"`      // from the keyring library
	fingerprint string `vtab:"fingerprint"`        // sha256 fingerprint of the key
	doc         string `vtab:"doc,filtered"`       // documentation on usage
	expired     bool   `vtab:"expired"`            // whether key is presented on UI

	app *App `vtab:"-"`
}

func isED25519Key(sig, name string) bool {
	if len(sig) == 0 && name == SecretNameSFTP {
		return true
	}
	if sig == SftpPrivatekey && name == SecretNameSFTP {
		return true
	}
	if sig == AdminPrivatekey && name == SecretNameAdmin1 {
		return true
	}
	return false
}

func (v vtSSHKeys) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[vtSSHKeys] {
	var pubKey string

	name := v.Getname(cs)
	signature, _ := v.Getsignature(cs)

	switch {
	case isED25519Key(signature, name):
		lpriv, err := ReadSecret[*sshED25519Key](context.Background(), v.app.keyring, signature, ED25519KEY)
		if err != nil {
			return sqlite.FromError[vtSSHKeys](err)
		}
		pk := lpriv.getPublicKey()
		pubKey = string(pk.(sshED25519Key))
	}
	return sqlite.FromOne[vtSSHKeys](vtSSHKeys{
		signature:   SftpPrivatekey,
		name:        name,
		fingerprint: pubKey,
		doc:         "",
	})
}

// as per `ssh-keygen`
const (
	RSAKEY     = "rsa"
	ECDSAKEY   = "ecdsa"
	ED25519KEY = "ed25519"
)

/*
Deleting from the table is equivalent to setting the expiration to true. No key is ever deleted.
Keys that are expired are not presented in the UI when setting up new connections (but they can be displayed for existing sources, with a warning).
There is no way to un-expire a key (prevent abuse, say to re-enable a key that has been compromised).

name is something like ssh_ or sftp_ (mirar esas constantes que hay en admin.go)
signature “ed25519” (default), “rsa”, ”ecdsa”
*/
var fpseed = maphash.MakeSeed()

func (r vtSSHKeys) Hash64() int64 { return int64(maphash.String(fpseed, r.fingerprint)) }

func (m vtSSHKeys) Update(_ context.Context, idx int64, row vtSSHKeys) error {
	var pub ssh.PublicKey
	var err error
	switch {
	case row.app == nil:
		return errors.New("non valid keyring persistent layer")
	case row.expired && len(row.fingerprint) > 0:
		//look for the key by the name and update the value if it exists, it is set expired to true
		//if it doesn't exists it returns an error
		//find it and check if it is already expired, si extá expired=false, actualizo el valor
		//Use ReadSecret
	case len(row.fingerprint) > 0:
		return errors.New("can not insert a finger print")
	case row.name != SftpPrivatekey && row.name != AdminPrivatekey:
		return errors.New("can not insert other than an sftp or ssh key")
	case row.name == ED25519KEY || row.name == "":
		pub, err = GenerateNewSSHKey[*sshED25519Key](ED25519KEY, SftpPrivatekey, *row.app)
		if err != nil {
			return err
		}
	case row.name == RSAKEY:
		pub, err = GenerateNewSSHKey[*rsaKey](RSAKEY, SftpPrivatekey, *row.app)
		if err != nil {
			return err
		}
	}
	log.Print(pub.Type() + " " + base64.StdEncoding.EncodeToString(pub.Marshal()))

	//It is invalid to insert a fingerprint, or an expired value into the table.
	//ssh.FingerprintSHA256

	return nil
}
