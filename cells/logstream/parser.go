package logstream

import (
	"trout.software/kraken/webapp/internal/mdt"
)

var ParseGrammar = mdt.ParseGrammar

type Grammar = struct{ G mdt.Grammar }
