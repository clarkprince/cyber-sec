//go:build linux

package mdt

import (
	"errors"

	"trout.software/kraken/webapp/internal/sqlite"
)

func record_object(args ...string) ([]byte, error) {
	if len(args)%2 != 0 {
		return nil, errors.New("record_object wants 2n arguments")
	}

	var rc RecordBuilder
	for i := 0; i < len(args); i += 2 {
		rc.Append(args[i], args[i+1])
	}

	return rc.Build().MarshalBinary()
}

var RecordObject = sqlite.RegisterFunc("rc_object", record_object)
