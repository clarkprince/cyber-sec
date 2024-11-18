package httpform_test

import (
	"encoding/json"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/hub"
	"trout.software/kraken/webapp/internal/httpform"
)

func TestReadFormValues(t *testing.T) {
	cases := []struct {
		form string
		val  any
	}{
		{`--frontier
Content-Disposition: form-data; name="title"

My Long Title
--frontier--`,
			struct {
				Title string `form:"title"`
			}{Title: "My Long Title"}},

		{`--frontier
Content-Disposition: form-data; name="content"

{"object": 1}
--frontier--`,
			struct {
				Content json.RawMessage `form:"content"`
			}{Content: json.RawMessage(`{"object": 1}`)}},
		{`--frontier
Content-Disposition: form-data; name="content"

{"object": 1}
--frontier--`,
			struct {
				Content hub.CompressedBytes `form:"content"`
			}{Content: hub.CompressedBytes(`{"object": 1}`)}},
		{`
--frontier
Content-Disposition: form-data; name="schedule"

R31/2007-03-01/P10W
--frontier--
`, struct {
			Schedule hub.Repetitions `form:"schedule"`
		}{Schedule: hub.Repetitions{Specification: "R31/2007-03-01/P10W"}}},
		{`
--frontier
Content-Disposition: form-data; name="path"

/root/pp/*
--frontier
Content-Disposition: form-data; name="userhost"

root@10.67.21.164:22
--frontier
Content-Disposition: form-data; name="publickey"

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKvMFoaIiXRpeJ7jjF0sSNaxp1KsWl5rcS4Xtz4j6lCN root@sftpserver
--frontier--
`, logstream.SFTP{
			Path:            "/root/pp/*",
			PubKey:          logstream.PublicKey("ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKvMFoaIiXRpeJ7jjF0sSNaxp1KsWl5rcS4Xtz4j6lCN root@sftpserver"),
			UserAndHostName: "root@10.67.21.164:22",
		},
		},
	}

	opts := []cmp.Option{
		cmpopts.IgnoreFields(hub.Repetitions{}, "Occurences"),
		cmpopts.IgnoreUnexported(logstream.SFTP{}),
	}

	for _, c := range cases {
		r := httptest.NewRequest("POST", "/", strings.NewReader(c.form))
		r.Header.Set("Content-Type", "multipart/form-data; boundary=frontier")

		// the got / v dance is required to get a pointer for unmarshall, then compare against base value
		got := reflect.New(reflect.TypeOf(c.val)).Interface()
		if err := httpform.Unmarshal(r, got); err != nil {
			t.Fatal("unmarshaling", c.form, err)
		}

		v := reflect.ValueOf(got).Elem().Interface()
		if !cmp.Equal(c.val, v, opts...) {
			t.Error(cmp.Diff(c.val, v, opts...))
		}
	}
}
