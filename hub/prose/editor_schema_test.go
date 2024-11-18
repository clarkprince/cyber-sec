package prose_test

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/google/go-cmp/cmp"
	"trout.software/kraken/webapp/hub"
	"trout.software/kraken/webapp/hub/prose"
	"trout.software/kraken/webapp/internal/diff"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestFindNotebooks(t *testing.T) {
	ser := `{"type":"paragraph","content":[{"type":"text","text":"Secure Jupyter "},{"type":"pill","attrs":{"data-entity-json":"{\"Rev\":3,\"ID\":\"01H7SREN5TA2JYECASC8N50G52\",\"Title\":\"Securing Zupiter!!\",\"Cells\":[{\"ID\":\"01H7SREQS8QDP8HHFRCJ66WPN0\",\"Author\":{\"ID\":\"01H7K3PCA4E2HC76NXGKNZ1SPH\",\"Domain\":\"01H7K3P1MMTX332SYYZ4VXFMK3\",\"Name\":\"Romain Doumenc\",\"ExternalID\":\"romain@trout.software\",\"Picture\":\"https://lh3.googleusercontent.com/a/AAcHTtfzbD4WMk7-GO8Ph1A29tSWWjlieHXUhowd1fSRug3U1A=s96-c\",\"Labels\":null},\"Created\":\"2023-08-14T11:11:51+01:00\",\"Timestamp\":\"2023-08-14T14:21:59+01:00\",\"Tags\":null,\"DataSource\":\"01H7NP7X7AXT8S0BZR7HC9ECGD\",\"Notebook\":\"01H7SREN5TA2JYECASC8N50G52\",\"Pivots\":[{\"Pivot\":\"01H7SRFCY19A9SYK7JAQ0CX2W5\",\"Join\":0,\"on\":[\"$.level\"]},{\"Pivot\":\"01H7SSFQHGA62KA550R4Z7KRYG\",\"Join\":0,\"on\":[\"$.msg\"]},{\"Pivot\":\"01H7SSG4VRKPAMDJWKWRK029YM\",\"Join\":0,\"on\":[\"$.date\"]},{\"Pivot\":\"01H7SSGDPE6J8TBKNF64WS8VM6\",\"Join\":0,\"on\":[\"$.app\"]}],\"Viewport\":{\"Pins\":null,\"Fields\":[],\"Search\":\"\"},\"Title\":\"Logs\",\"CheckCell\":false,\"Keyword\":\"\",\"Pattern\":\"<_>: [<level> <date:2006-01-02 15:04:05.000> <date> <app>] <msg>\",\"Grammar\":\"root = _ \\\": [\\\" level \\\" \\\" date \\\" \\\" app \\\"] \\\" msg .\\nlevel = _ .\\ndate:\\\"2006-01-02 15:04:05.000\\\" = _ \\\" \\\" _ .\\napp = _ .\\nmsg = _ .\\n\",\"ForceReload\":true}],\"Owner\":{\"ID\":\"01H7K3PCA4E2HC76NXGKNZ1SPH\",\"Domain\":\"01H7K3P1MMTX332SYYZ4VXFMK3\",\"Name\":\"Romain Doumenc\",\"ExternalID\":\"romain@trout.software\",\"Picture\":\"https://lh3.googleusercontent.com/a/AAcHTtfzbD4WMk7-GO8Ph1A29tSWWjlieHXUhowd1fSRug3U1A=s96-c\",\"Labels\":null},\"Created\":\"2023-08-14T11:11:19+01:00\",\"LastEdit\":\"2023-08-14T14:10:56+01:00\",\"Origin\":\"00000000000000000000000000\"}","data-type":"playbook"}},{"type":"text","text":" "}]}`
	var ed prose.Editor
	if err := json.Unmarshal([]byte(ser), &ed); err != nil {
		t.Fatal(err)
	}

	var found []ulid.ULID

	iter := prose.Pills[hub.Notebook](&ed, prose.PillPlaybook)
	for iter.Next() {
		found = append(found, iter.Value().ID)
	}
	if iter.Err() != nil {
		t.Fatal(iter.Err())
	}

	want := []ulid.ULID{ulid.MustParse("01H7SREN5TA2JYECASC8N50G52")}
	if !cmp.Equal(found, want) {
		t.Error(cmp.Diff(found, want), found)
	}
}

func TestReadSerializedJSON(t *testing.T) {
	ms, err := filepath.Glob("testdata/serde/*.json")
	if err != nil {
		t.Fatal(err)
	}

	for _, m := range ms {
		t.Run(m, func(t *testing.T) {
			in, err := os.ReadFile(m)
			if err != nil {
				t.Fatal(err)
			}

			var ed prose.Editor
			if err := json.Unmarshal(in, &ed); err != nil {
				t.Fatal("cannot read json", err)
			}

			out, err := json.Marshal(ed)
			if err != nil {
				t.Fatalf("cannot serialize %v: %s", ed, err)
			}

			if !bytes.Equal(in, out) {
				os.WriteFile(m+".diff", diff.Diff("in", in, "out", out), 0644)
				t.Error("invalid output. Results in", m+".diff")
			}
		})

	}
}
