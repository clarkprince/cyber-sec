package hub

import (
	"errors"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/sqlite"
)

func SessionFor(name string) (sqlite.PointerValue, error) {
	s, ok := iam.SessionFor(name)
	if !ok {
		return sqlite.PointerValue{}, errors.New("no such user")
	}

	return sqlite.AsPointer(&s), nil
}

func RecordFormat(dt []byte) string {
	var rc mdt.Record
	if err := rc.UnmarshalBinary(dt); err != nil {
		return ""
	}

	dt, _ = rc.MarshalText()
	return string(dt)
}
