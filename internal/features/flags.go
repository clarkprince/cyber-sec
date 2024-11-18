// Package features enable consistent access to tooling for continuous integration and delivery.
package features

import (
	"os"
	"strings"
	"sync"
)

var Flags = make(map[string]bool)
var FlagsHeaders string
var flagInit sync.Once

// HasFlag checks if a feature flag is enabled by environment
// Flags can be comma separated
//
//   - In browser, flags can be set via "FLAGS" localStorage value
//     A page refresh is needed when a flag is changed.
//   - Server-side, values are read from the "FLAGS" environment variable
//
// The function is available in template under the name "hasflag", used as such:
//
//	{{ if hasflag "TestUI" }}
//	   <h1>Testing the UI!!</h1>
//	{{ end }}
func HasFlag(name string) bool {
	if strings.ContainsRune(name, ',') {
		panic("do not use a feature flag with a comma")
	}

	flagInit.Do(func() {
		// os.Setenv("FLAGS", "adjust-cell")
		os.Setenv("FLAGS", "snapshot-and-enforce,adjust-cell")
		envflags := strings.Split(os.Getenv("FLAGS"), ",")
		for _, flag := range envflags {
			Flags[flag] = true
		}
		FlagsHeaders = strings.Join(envflags, ",")
	})

	return Flags[name]
}

// Enable makes sure a given flag is set, and returns a function to set it back to original value.
// Useful in tests, when conditionnaly enabling a code path
// Example: defer Enable("myfeature")()
// TODO: doesn't seem to work in test
func Enable(name string) func() {
	orig := HasFlag(name)
	Flags[name] = true
	return func() { Flags[name] = orig }
}
