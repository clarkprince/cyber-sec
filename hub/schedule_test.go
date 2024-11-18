package hub

import (
	"testing"
	"time"

	"github.com/fxamacker/cbor/v2"
	"github.com/google/go-cmp/cmp"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestCanReadNBScheduleV1(t *testing.T) {

	type V1 struct {
		Author      iam.User
		Description string
		Key         string
		NotebookID  ulid.ULID
		Runs        []time.Time
		Results     []Result
		Status      int

		Lease time.Time
	}
	v1 := V1{
		Author: iam.User{ID: ulid.MustParse("01H9JCQ4ZXF15HTTHP5G1V9JE0")},
		Key:    "01H9JCQH15HTRP46X4S14X28A1",
		Runs:   []time.Time{time.Unix(1693911494, 0)},
	}

	dt, err := cbor.Marshal(v1)
	if err != nil {
		t.Fatal(err)
	}

	t.Log(cbor.Diagnose(dt))

	var out NotebookSchedule
	if err := out.UnmarshalBinary(dt); err != nil {
		t.Fatal(err)
	}

	want := NotebookSchedule{
		Author: iam.User{ID: ulid.MustParse("01H9JCQ4ZXF15HTTHP5G1V9JE0")},
		Key:    ulid.MustParse("01H9JCQH15HTRP46X4S14X28A1"),
		Runs:   Repetitions{Occurences: []time.Time{time.Unix(1693911494, 0)}},
	}

	if !cmp.Equal(want, out) {
		t.Error(cmp.Diff(want, out))
	}
}
