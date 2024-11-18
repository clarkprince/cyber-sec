package watcher

import (
	"trout.software/kraken/webapp/cells/watcher/internal/vtable"
	"trout.software/kraken/webapp/internal/sqlite"
)

var VTable = sqlite.RegisterTable("watchers", vtable.Row{})
