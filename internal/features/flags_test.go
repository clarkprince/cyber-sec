package features_test

import (
	"fmt"

	"trout.software/kraken/webapp/internal/features"
)

// This implement things as discussed in ticket [myshinyfeature]
//
// [myshinyfeature]: https://thenotionlink
var HasMyNewShinyFeature = features.HasFlag("myShinyFeature")

// This shows how to use a guard statement to prevent new code from executing
func Example_guard() {
	if !HasMyNewShinyFeature {
		return
	}

	fmt.Println("now executing my shiny feature!")
}
