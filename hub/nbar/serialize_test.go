package nbar

import (
	"bytes"
	"log"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"trout.software/kraken/webapp/internal/diff"
	"trout.software/kraken/webapp/internal/ulid"
)

var createdT, _ = time.Parse(time.RFC3339, "2023-01-02T15:04:05Z")

func TestEncode(t *testing.T) {
	cases := []struct {
		in  any
		out string
	}{
		{Framework{}, `nbar/policy
`},
		{Framework{
			ID:      ulid.MustParse("09H8ESV5ZS731RYTG9D266CP7M"),
			Audit:   true,
			Title:   "my policy",
			Content: []byte("hello this is my content"),
		}, `nbar/policy
title "my policy"
audit true
`},
		{Playbook{}, `nbar/playbook
`},
		{Playbook{
			ID:      ulid.MustParse("05H8ESV5ZS731RYTG9D266CP7M"),
			Title:   "my title",
			Created: createdT,
			Cell:    []Cell{{ID: ulid.MustParse("02H8ESV5ZS731RYTG9D266CP7M")}, {ID: ulid.MustParse("03H8ESV5ZS731RYTG9D266CP7M")}},
			Owner: User{
				ID:   ulid.MustParse("01H8ESV5ZS731RYTG9D266CP7M"),
				Name: "John Doe",
			},
		}, `nbar/playbook
title "my title"
cell 02H8ESV5ZS731RYTG9D266CP7M
cell 03H8ESV5ZS731RYTG9D266CP7M
owner 01H8ESV5ZS731RYTG9D266CP7M
created 2023-01-02T15:04:05Z
`},

		{Cell{
			Pivot: []Application{
				{Pivot: Pivot{Exp: "|= \"john\"", ID: ulid.MustParse("01H8GR3JPVHWT0S58HXWWZM8E6")}, On: "$.name"},
				{Pivot: Pivot{Exp: "|= \"10\"", ID: ulid.MustParse("01H8GR3V4J1A9CBKYAS8ZFZK68")}, On: "$.age"},
			},
		},
			`nbar/cell
pivot 01H8GR3JPVHWT0S58HXWWZM8E6 "$.name"
pivot 01H8GR3V4J1A9CBKYAS8ZFZK68 "$.age"
`},
	}

	for _, c := range cases {
		dst := new(bytes.Buffer)
		ToMfst(reflect.ValueOf(c.in), dst)

		if dst.String() != c.out {
			t.Error(string(diff.Diff("want", []byte(c.out), "got", dst.Bytes())))
		}
	}
}

func TestUnmarshal(t *testing.T) {

	var typesAtKey = map[string]reflect.Type{
		"nbar/playbook":   reflect.TypeOf(Playbook{}),
		"nbar/user":       reflect.TypeOf(User{}),
		"nbar/cell":       reflect.TypeOf(Cell{}),
		"nbar/pivot":      reflect.TypeOf(Pivot{}),
		"nbar/datasource": reflect.TypeOf(DataSource{}),
		"nbar/policy":     reflect.TypeOf(Framework{}),
	}
	createdT, _ := time.Parse(time.RFC3339, "2023-01-02T15:04:05Z")

	cases := []struct {
		manifest string
		out      any
	}{
		{manifest: `nbar/policy
title "my policy"
audit true
`,
			out: &Framework{Title: "my policy", Audit: true}},
		{manifest: `nbar/cell
pivot 01H8GR3JPVHWT0S58HXWWZM8E6 "$.name"
pivot 01H8GR3V4J1A9CBKYAS8ZFZK68 "$.age"
`,
			out: &Cell{
				Pivot: []Application{
					{Pivot: Pivot{ID: ulid.MustParse("01H8GR3JPVHWT0S58HXWWZM8E6")}, On: "$.name"},
					{Pivot: Pivot{ID: ulid.MustParse("01H8GR3V4J1A9CBKYAS8ZFZK68")}, On: "$.age"},
				},
			},
		},
		{manifest: `nbar/playbook
		`,
			out: &Playbook{}},
		{manifest: `nbar/playbook
		title "my title"
		cell 02H8ESV5ZS731RYTG9D266CP7M
		cell 03H8ESV5ZS731RYTG9D266CP7M
		owner 01H8ESV5ZS731RYTG9D266CP7M
		created 2023-01-02T15:04:05Z
		`,
			out: &Playbook{
				Title:   "my title",
				Created: createdT,
				Cell:    []Cell{{ID: ulid.MustParse("02H8ESV5ZS731RYTG9D266CP7M")}, {ID: ulid.MustParse("03H8ESV5ZS731RYTG9D266CP7M")}},
				Owner: User{
					ID: ulid.MustParse("01H8ESV5ZS731RYTG9D266CP7M"),
				},
			}}}

	for _, c := range cases {
		size := min(len(c.manifest), 30)
		var cardType = string(c.manifest[strings.Index(string(c.manifest[0:size]), "nbar/"):strings.Index(string(c.manifest[0:size]), "\n")])

		typ, ok := typesAtKey[cardType]
		if !ok {
			log.Fatal("Do not know how to read entries at, ", "")
		}
		out := reflect.New(typ).Interface()

		if err := Unmarshal([]byte(c.manifest), out); err != nil {
			t.Fatal(err)
		}
		if !cmp.Equal(out, c.out) {
			t.Fatal(cmp.Diff(out, c.out))
		}
	}
}
