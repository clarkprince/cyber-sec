package netwatch

import (
	"fmt"
	"net/netip"
	"reflect"
)

// routes are functions of higher-level concerns (profiles, ACL)
const (
	StaticIP int = iota
	DHCPClient
	DHCPRelay
)

// SetAddress attaches the given address to the interface.
func SetAddress(pfx netip.Prefix, iface string) {

}

// BuildCommand compares the two data structures want and got.
// For any field in want that (1) is the zero value of its type,
// (2) has a different value than the same field in got, and
// (3) is marked with a struct tag cmd:"arg"
// then the tuple (arg, value) is added to the command returned from the function.
//
// BuildCommand does not require want and got to be of the same type, as long as,
// for all fields in want that can be compared, a field with the same name and type exists in got.
//
// BUG(rdo) check if we need a machine for the comparison
// BUG(rdo) vet tool to ensure only valid uses
func BuildCommand(want, got any) []string {
	wt, gt := reflect.TypeOf(want), reflect.TypeOf(got)
	if wt.Kind() == reflect.Pointer {
		wt = wt.Elem()
	}
	if gt.Kind() == reflect.Pointer {
		gt = gt.Elem()
	}

	if wt.Kind() != reflect.Struct || gt.Kind() != reflect.Struct {
		panic("BuildCommand can only be called with two structures (or pointer to structures)!")
	}

	var args []string
	wv, gv := reflect.ValueOf(want), reflect.ValueOf(got)
	for i := 0; i < wv.NumField(); i++ {
		wf := wv.Field(i)
		if wf.IsZero() {
			continue
		}
		name, ok := wt.Field(i).Tag.Lookup("cmd")
		if !ok {
			continue
		}

		if !wf.Equal(gv.FieldByName(wt.Field(i).Name)) {
			args = append(args, name, fmt.Sprint(wf.Interface()))
		}
	}
	return args
}
