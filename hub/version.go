package hub

import (
	"runtime/debug"

	"trout.software/kraken/webapp/internal/sqlite"
)

var ObsSBOM = sqlite.RegisterTable("obs_sbom", buildInfo{})

// linker-attributed
var Version = "(devel)"

type buildInfo struct {
	Path    string `vtab:"path"`
	Version string `vtab:"version"`
	Sum     string `vtab:"sha256sum"`
}

func (_ buildInfo) Filter(_ int, _ sqlite.Constraints) sqlite.Iter[buildInfo] {
	bi, ok := debug.ReadBuildInfo()
	if !ok {
		return sqlite.None[buildInfo]()
	}

	res := make([]buildInfo, len(bi.Deps)+1)
	res[0] = buildInfo{Path: "trout.software/securityhub", Version: Version, Sum: bi.Main.Sum}
	for i, m := range bi.Deps {
		res[i+1] = buildInfo{Path: m.Path, Version: m.Version, Sum: m.Sum}
	}

	return sqlite.FromArray(res)
}
