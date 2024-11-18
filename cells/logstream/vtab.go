package logstream

import (
	"trout.software/kraken/webapp/cells/logstream/internal/iter"
	"trout.software/kraken/webapp/cells/logstream/internal/sftp"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/sqlite"
)

var ObsFilePool = iter.FilePoolVTable

// ObsSSHIdentities registers the virtual table at name to manipulate identities stored in kr.
func ObsSSHIdentities(name string, kr **storage.Keyring) func(sqlite.SQLITE3) {
	return sftp.IdentitiesTable(name, kr)
}
