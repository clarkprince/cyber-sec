package hub

import (
	"testing"
	"testing/quick"
	"time"

	"github.com/google/go-cmp/cmp"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/ulid"
)

func mustParseTime(fmt string) time.Time {
	t, err := time.Parse(time.RFC3339, fmt)
	if err != nil {
		panic("invalid fmt " + fmt + " " + err.Error())
	}
	return t
}

func TestNotebookManifestParser(t *testing.T) {
	t.Skip("In progress")
	cases := []struct {
		mfst string
		want Notebook
	}{
		{
			`id "01GPNVGM0ZMVKS39VZA4H3CS1C"
title "[123]Stolen data from US clients"
lastedit "2012-04-04T15:08:05Z"
created "2006-01-02T15:04:05Z"
cell "logs" "01GPNY5D5RYK5EX8JHXKT9ER06"
`,
			Notebook{
				ID:       ulid.MustParse("01GPNVGM0ZMVKS39VZA4H3CS1C"),
				Title:    "[123]Stolen data from US clients",
				Created:  mustParseTime("2006-01-02T15:04:05Z"),
				LastEdit: mustParseTime("2012-04-04T15:08:05Z"),
				Cells:    []Manifest{{Title: "logs", ID: ulid.MustParse("01GPNY5D5RYK5EX8JHXKT9ER06")}}},
		},
		{
			`id "01H8CA7NPQQPB3MF753T5W99SW"
title "[123]Stolen data from US clients" 
lastedit "2012-04-04T15:08:05Z"
created "2006-01-02T15:04:05Z"
cell "01GPNY5D5RYK5EX8JHXKT9ER06" "logs"
`,
			Notebook{
				ID:       ulid.MustParse("01H8CA7NPQQPB3MF753T5W99SW"),
				Title:    "[123]Stolen data from US clients",
				Created:  mustParseTime("2006-01-02T15:04:05Z"),
				LastEdit: mustParseTime("2012-04-04T15:08:05Z"),
				Cells:    []Manifest{{Title: "logs", ID: ulid.MustParse("01GPNY5D5RYK5EX8JHXKT9ER06")}}},
		},
		{
			`id "01H8CA8FHBEZTP8NR79BW1YFSM"
title "[123]Stolen data from US clients"
lastedit "2012-04-04T15:08:05Z"
created "2006-01-02T15:04:05Z"
cell "01GPNY5D5RYK5EX8JHXKT9ER06" "logs"
`,
			Notebook{
				ID:       ulid.MustParse("01H8CA8FHBEZTP8NR79BW1YFSM"),
				Title:    "[123]Stolen data from US clients",
				Created:  mustParseTime("2006-01-02T15:04:05Z"),
				LastEdit: mustParseTime("2012-04-04T15:08:05Z"),
				Cells:    []Manifest{{Title: "logs", ID: ulid.MustParse("01GPNY5D5RYK5EX8JHXKT9ER06")}}},
		},
		{
			`id "01H8CA750F8P8FMT1Y8AWBGEQ1"
title "[123]Stolen data from US clients" 
lastedit "2012-04-04T15:08:05Z"
created "2006-01-02T15:04:05Z"
cell "01GPNY5D5RYK5EX8JHXKT9ER06" "logs" 
cell "01GQ4ZGQ0F3TVKA1XC9ZQNED8K" "apache"
`,
			Notebook{
				ID:       ulid.MustParse("01H8CA750F8P8FMT1Y8AWBGEQ1"),
				Title:    "[123]Stolen data from US clients",
				Created:  mustParseTime("2006-01-02T15:04:05Z"),
				LastEdit: mustParseTime("2012-04-04T15:08:05Z"),
				Cells: []Manifest{
					{Title: "logs", ID: ulid.MustParse("01GPNY5D5RYK5EX8JHXKT9ER06")},
					{Title: "apache", ID: ulid.MustParse("01GQ4ZGQ0F3TVKA1XC9ZQNED8K")},
				}},
		},
	}

	for _, c := range cases {
		var got Notebook
		err := DeserializeManifest(c.mfst, &got)
		if err != nil {
			t.Fatal(err)
		}
		//We can not co
		if !cmp.Equal(got.Owner, c.want.Owner) {
			t.Error(cmp.Diff(got, c.want))
		}
		if !cmp.Equal(got.Title, c.want.Title) {
			t.Error(cmp.Diff(got, c.want))
		}
		if !cmp.Equal(got.Created, c.want.Created) {
			t.Error(cmp.Diff(got, c.want))
		}
		if !cmp.Equal(got.LastEdit, c.want.LastEdit) {
			t.Error(cmp.Diff(got, c.want))
		}
		if !cmp.Equal(got.Tag, c.want.Tag) {
			t.Error(cmp.Diff(got, c.want))
		}
		if !cmp.Equal(got.Cells, c.want.Cells) {
			t.Error(cmp.Diff(got, c.want))
		}
	}
}

func FuzzNotebookParser(f *testing.F) {
	f.Skip("to fix")
	f.Add(`title "[123]Stolen data from US clients" 
lastedit "2012-04-04T15:08:05Z"
created "2006-01-02T15:04:05Z"
tag "client" "vodafone"
origin "01GPKAHN5D2BK9GPQPRDPTHG20"
tag "env" "prod"
tag "env" "dev"
cell  "01GPNY5D5RYK5EX8JHXKT9ER06" "logs"
cell "01GQ4ZGQ0F3TVKA1XC9ZQNED8K" "apache"
`)

	f.Fuzz(func(t *testing.T, a string) {
		var b Notebook
		DeserializeManifest(a, &b)
	})
}

func TestSpitNotebookManifest(t *testing.T) {
	t.Skip("In progress")
	cases := []struct {
		mfst Notebook
		want string
	}{
		{
			Notebook{
				Owner: iam.User{
					ID:      ulid.MustParse("01GPNVGM0ZMVKS39VZA4H3CS1C"),
					Profile: iam.Profile{Name: "mrsecurityanalyst@cybersecurity.com"},
				},
				Title:    "[123]Stolen data from US clients",
				Created:  mustParseTime("2006-01-02T15:04:05Z"),
				LastEdit: mustParseTime("2012-04-04T15:08:05Z"),
				Origin:   ulid.MustParse("01GPKAHN5D2BK9GPQPRDPTHG20"),
				Tag:      []Tag{{Key: "client", Value: "vodafone"}},
				Cells:    []Manifest{{Keyword: "logs", ID: ulid.MustParse("01GPNY5D5RYK5EX8JHXKT9ER06")}},
			},
			`owner "01GPNVGM0ZMVKS39VZA4H3CS1C" "mrsecurityanalyst@cybersecurity.com" created "2006-01-02T15:04:05Z" tag "client" "vodafone" lastedit "2012-04-04T15:08:05Z" title "[123]Stolen data from US clients" cell "logs" "01GPNY5D5RYK5EX8JHXKT9ER06" origin "01GPKAHN5D2BK9GPQPRDPTHG20" `,
		},
		{
			Notebook{
				Owner: iam.User{
					ID:      ulid.MustParse("01GPNVGM0ZMVKS39VZA4H3CS1C"),
					Profile: iam.Profile{Name: "mrsecurityanalyst@cybersecurity.com"},
				},
				Title:    "[123]Stolen data from US clients",
				Created:  mustParseTime("2006-01-02T15:04:05Z"),
				LastEdit: mustParseTime("2012-04-04T15:08:05Z"),
				Tag:      []Tag{{Key: "client", Value: "vodafone"}, {Key: "env", Value: "prod"}, {Key: "env", Value: "dev"}},
				Cells: []Manifest{
					{Keyword: "logs", ID: ulid.MustParse("01GPNY5D5RYK5EX8JHXKT9ER06")},
					{Keyword: "apache", ID: ulid.MustParse("01GQ4ZGQ0F3TVKA1XC9ZQNED8K")},
				}},
			`owner "01GPNVGM0ZMVKS39VZA4H3CS1C" "mrsecurityanalyst@cybersecurity.com" created "2006-01-02T15:04:05Z" tag "client" "vodafone" tag "env" "prod" tag "env" "dev" lastedit "2012-04-04T15:08:05Z" title "[123]Stolen data from US clients" cell "logs" "01GPNY5D5RYK5EX8JHXKT9ER06" cell "apache" "01GQ4ZGQ0F3TVKA1XC9ZQNED8K" `,
		},
	}

	for _, c := range cases {
		got := SerializeManifest(c.mfst)
		if !cmp.Equal(got, c.want) {
			t.Errorf("got %v  \n want %v", got, c.want)
		}
	}
}

func TestReadBack(t *testing.T) {
	t.Skip("TODO(rdo)")
	rb := func(x Notebook) bool {
		s := SerializeManifest(x)

		var y Notebook
		err := DeserializeManifest(s, &y)
		if err != nil {
			t.Fatal(err)
		}

		return cmp.Equal(x, y)
	}
	if err := quick.Check(rb, nil); err != nil {
		t.Fatal(err)
	}
}

func TestCellManifestDeserializer(t *testing.T) {
	mfst := `id "01GQJ2RAM06YS10BAEG5GWSHAV"
created "2006-01-02T15:04:05Z"
timestamp "2012-04-04T15:08:05Z"
datasource "01H8C6YDMMMTP1XEE784RFA3SF"
notebook "01H8C6X96CW9GBNH26T4FEDMFA"
title "Logs from the last 24 hours"
`

	want := Manifest{
		ID:         ulid.MustParse("01GQJ2RAM06YS10BAEG5GWSHAV"),
		Created:    mustParseTime("2006-01-02T15:04:05Z"),
		Timestamp:  mustParseTime("2012-04-04T15:08:05Z"),
		DataSource: ulid.MustParse("01H8C6YDMMMTP1XEE784RFA3SF"),
		Notebook:   ulid.MustParse("01H8C6X96CW9GBNH26T4FEDMFA"),
		Title:      "Logs from the last 24 hours",
	}
	var got Manifest
	err := DeserializeManifest(mfst, &got)
	if err != nil {
		t.Fatal(err)
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v want %v", got, want)
	}
}

func FuzzCellParser(f *testing.F) {
	f.Add(`id "01GQJ2RAM06YS10BAEG5GWSHAV"
created "2006-01-02T15:04:05Z"
timestamp "2012-04-04T15:08:05Z"
datasource "01H8C6YDMMMTP1XEE784RFA3SF"
notebook "01H8C6X96CW9GBNH26T4FEDMFA"
title "Logs from the last 24 hours"
`)

	f.Fuzz(func(t *testing.T, a string) {
		var b Manifest
		DeserializeManifest(a, &b)
	})
}

func TestSerializeCellManifest(t *testing.T) {
	mfst := Manifest{
		ID:         ulid.MustParse("01GQJ2RAM06YS10BAEG5GWSHAV"),
		Created:    mustParseTime("2006-01-02T15:04:05Z"),
		Timestamp:  mustParseTime("2012-04-04T15:08:05Z"),
		DataSource: ulid.MustParse("01H8C6YDMMMTP1XEE784RFA3SF"),
		Notebook:   ulid.MustParse("01H8C6X96CW9GBNH26T4FEDMFA"),
		Title:      "Logs from the last 24 hours",
	}

	want := `id "01GQJ2RAM06YS10BAEG5GWSHAV"
created "2006-01-02T15:04:05Z"
timestamp "2012-04-04T15:08:05Z"
datasource "01H8C6YDMMMTP1XEE784RFA3SF"
notebook "01H8C6X96CW9GBNH26T4FEDMFA"
title "Logs from the last 24 hours"
`
	got := SerializeManifest(mfst)
	if !cmp.Equal(got, want) {
		t.Errorf("got %v  \n want %v", got, want)
	}
}
