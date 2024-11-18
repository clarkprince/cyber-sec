package mdt

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
	"trout.software/kraken/webapp/internal/diff"
)

func TestWalkRoot_Apache(t *testing.T) {
	ll := ParseLORTH(`
			ip "84.55.41.57".
			" - - [".
			timestamp "15/Jun/2022:07:00:32 +0100".
			"] \"".
			url "POST /wordpress/wp-admin/admin-ajax.php HTTP/1.1".
			"\" ".
			rcode "200".
			" ".
			size "454".
			" \"".
			origin "http://www.example.com/wordpress/wp-admin/".
			"\"".;
	`)
	spitDot(t, ll, "test_walk_apache.png")

	matchcap(t, ll.first().WalkRoot(), []elem{
		{"$.ip", "84.55.41.57"},
		{"-", " - - ["},
		{"$.timestamp", "15/Jun/2022:07:00:32 +0100"},
		{"-", "] \""},
		{"$.url", "POST /wordpress/wp-admin/admin-ajax.php HTTP/1.1"},
		{"-", "\" "},
		{"$.rcode", "200"},
		{"-", " "},
		{"$.size", "454"},
		{"-", " \""},
		{"$.origin", "http://www.example.com/wordpress/wp-admin/"},
		{"-", "\""},
	})
}

func TestWalkRoot_SkipSeparators(t *testing.T) {
	ll := ParseLORTH(`
			ip "84.55.41.57".
			" - - [".
			timestamp "15/Jun/2022:07:00:32 +0100".
			"] \"".
			url "POST /wordpress/wp-admin/admin-ajax.php HTTP/1.1".
			"\" ".
			rcode "200".
			" ".
			size "454".
			" \"".
			origin "http://www.example.com/wordpress/wp-admin/".
			"\"".;
	`)
	spitDot(t, ll, "test_walk_apache.png")

	matchcap(t, ll.first().WalkRoot(SkipSeparator), []elem{
		{"$.ip", "84.55.41.57"},
		{"$.timestamp", "15/Jun/2022:07:00:32 +0100"},
		{"$.url", "POST /wordpress/wp-admin/admin-ajax.php HTTP/1.1"},
		{"$.rcode", "200"},
		{"$.size", "454"},
		{"$.origin", "http://www.example.com/wordpress/wp-admin/"},
	})
}

type elem struct {
	Name  string
	Value string
}

func matchcap(t *testing.T, wlk *RecordWalker, expect []elem) {
	t.Helper()

	for i := 0; i < len(expect); i++ {
		if !wlk.Next() {
			t.Error("Returning too early from walk")
		}

		if expect[i].Name != wlk.Name() || expect[i].Value != wlk.Value() {
			t.Errorf("walk step=%d: want name='%s' value='%s' got name='%s' value='%s'", i, expect[i].Name, expect[i].Value, wlk.Name(), wlk.Value())
		}
	}

	if wlk.Next() {
		t.Error("trailing data not found")
	}
}

func BenchmarkSerDe(b *testing.B) {
	fh, err := os.Open("testdata/bench/access.log")
	if err != nil {
		b.Fatal(err)
	}

	var apacheGrammar = mustparse(`
root = ip " - - [" timestamp "] \"" url "\" " rcode " " size " \"" origin "\"" .
ip = { '0' … '9' | '.' } .
timestamp = { ' ' … '\\' | '_' … '}' } .
url = verb " " path " " method .
verb = { 'A' … 'z' } .
path = { '#' … 'z' } .
method = { '#' … 'z' } .
rcode = { '0' … '9' } .
size = { '0' … '9' } .
origin = { '#' … '}' } .
`)

	var full_length int
	for i := 0; i < b.N; i++ {
		_, err := fh.Seek(0, 0)
		if err != nil {
			b.Fatal("cannot seek??", err)
		}

		sc := bufio.NewScanner(fh)
		for sc.Scan() {
			rc, ok := ReadLine(apacheGrammar, sc.Bytes())
			if !ok {
				b.Fatalf("cannot parse %s", sc.Text())
			}

			bin, err := rc.MarshalBinary()
			if err != nil {
				b.Fatal("marshal", err)
			}

			full_length += len(bin)

			var out Record
			if err := out.UnmarshalBinary(bin); err != nil {
				b.Fatal("unmarshal", err)
			}
		}

		if sc.Err() != nil {
			b.Fatal(sc.Err())
		}
	}

	b.ReportMetric(float64(full_length)/float64(b.N), "serialized_bytes/op")
}

func TestRecordBuilder(t *testing.T) {
	t.Run("add multiple fields", func(t *testing.T) {
		var b RecordBuilder
		b.Append("ip", "192.0.2.0")
		b.Append("domain", "prod")
		compareRecord(t, b.Build(), `
 ip "192.0.2.0" .
 domain "prod" .;	`)
	})

	t.Run("add then into", func(t *testing.T) {
		var b RecordBuilder
		b.Append("domain", "dev")
		b.intoLORTH(`ip "123" . ;`)
		compareRecord(t, b.Build(), `
 domain "dev" .
 ip "123" .;`)
	})

	t.Run("into then add", func(t *testing.T) {
		var b RecordBuilder
		b.intoLORTH(`ip "123" . ;`)
		b.Append("domain", "dev")
		compareRecord(t, b.Build(), `
 ip "123" .
 domain "dev" .;`)
	})

	t.Run("into empty", func(t *testing.T) {
		var b RecordBuilder
		b.Into(Record{capture: &capnd{name: "root"}})
		compareRecord(t, b.Build(), ``)
	})

	t.Run("sep then val", func(t *testing.T) {
		var b RecordBuilder
		b.AppendSeparator(" ")
		b.Append("key", "val")
		b.AppendSeparator(" ")
		compareRecord(t, b.Build(), `
 " " .
 key "val" .
 " " .;`)
	})
}

func compareRecord(t *testing.T, rc Record, want string) bool {
	t.Helper()

	var buf bytes.Buffer
	for wlk := rc.WalkRoot(); wlk.Next(); {
		dumpLORTH(&buf, wlk, " ")
	}
	if buf.Len() > 1 {
		buf.Truncate(buf.Len() - 1) // unwrite last line return
		buf.WriteString(";")
	}
	want = strings.TrimSpace(want)
	got := strings.TrimSpace(buf.String())
	if got == want {
		return true
	}

	t.Errorf("want:\n%x\n\ngot instead:\n%x", want, got)
	return false
}

func (b *RecordBuilder) intoLORTH(prg string) {
	ll := ParseLORTH(prg)
	for wlk := ll.Match(AllRecords).IterAll(); wlk.Next(); {
		b.Into(wlk.Record())
	}
}

func TestFindPath(t *testing.T) {
	doc := ParseLORTH(`
	billingModeSummary {
      billingMode "PAY_PER_REQUEST" .
      " " .
      lastUpdateToPayPerRequestDateTime "2022-03-25T20:40:50.123Z" .
    }
    #keySchema {
        attributeName "path" .
      	", " .
        keyType "HASH" .
    }
    #keySchema {
        attributeName "OID" .
      	", " .
        keyType "RANGE" .
    };
	`).first()

	cases := [...]struct {
		path   string
		values []string
	}{
		{`$.billingModeSummary`, ary("PAY_PER_REQUEST 2022-03-25T20:40:50.123Z")},
		{`$.billingModeSummary.billingMode`, ary("PAY_PER_REQUEST")},
		{`$.#keySchema.attributeName`, ary("path", "OID")},
	}

	for _, c := range cases {
		if vs := doc.FindPath(c.path); !cmp.Equal(vs, c.values) {
			t.Errorf("FindPath(%s): %s", c.path, cmp.Diff(vs, c.values))
		}
	}
}

func ary[T any](v ...T) []T { return v }

func TestDeltaEncoding(t *testing.T) {
	cases := [...]struct {
		lo, hi int
		d      int
		want   []byte
	}{
		{3, 8, 0, []byte{0b0011_0101}},
		{5, 8, 4, []byte{0b0001_0011}},
		{9, 28, 4, []byte{0b1000_0101, 0b0001_0011}},
		{121, 233, 12, []byte{0xC0, 0x6d, 0, 0x70}},
	}

	for _, c := range cases {
		buf := encodeDelta(c.lo, c.hi, c.d, nil)
		if !cmp.Equal(buf, c.want) {
			t.Errorf("encodeDelta(%d, %d, %d): %s", c.lo, c.hi, c.d, cmp.Diff(buf, c.want))
		}
		t.Logf("got buf %x", buf)

		lo, hi, sz := decodeDelta(buf, c.d)
		if lo != c.lo || hi != c.hi || sz != len(buf) {
			t.Errorf("decodeDelta(%d, %d, %d): got %d, %d, %d", c.lo, c.hi, c.d, lo, hi, sz)
		}
	}
}

func TestNodeEncoding(t *testing.T) {
	cases := [...]struct {
		n  *capnd
		sz int
	}{
		{&capnd{name: "short", lo: 2, hi: 15}, 7},
		{&capnd{name: "amuchlongernamedesignedtogooversixtyfourcharacterssoIammakingthingsup", lo: 2, hi: 15}, 72},
	}

	opts := cmp.AllowUnexported(capnd{})

	for _, c := range cases {
		buf := encodeNode(c.n, 0, nil)
		t.Logf("encoded node %x", buf)

		back, sz := decodeNode(buf, 0)
		if !cmp.Equal(back, c.n, opts) || sz != c.sz {
			t.Errorf("node %s: size %d", cmp.Diff(back, c.n, opts), sz)
		}
	}
}

func TestRecordSerde(t *testing.T) {
	corpus, err := filepath.Glob("testdata/serde/*.lorth")
	if err != nil {
		t.Fatal(err)
	}

	for _, fn := range corpus {
		t.Run(fn, func(t *testing.T) {
			dt, err := os.ReadFile(fn)
			if err != nil {
				t.Fatal("cannot open", fn, err)
			}
			ll := ParseLORTH(string(dt))
			var nn LioLi
			idx := 0
			for wlk := ll.Match(AllRecords).IterAll(); wlk.Next(); {
				dt, err := wlk.Record().MarshalBinary()
				if err != nil {
					t.Fatal(err)
				}

				var back Record
				if err := back.UnmarshalBinary(dt); err != nil {
					t.Fatal(err)
				}

				spitDot(t, back, fmt.Sprintf("fn_%d.png", idx))
				idx++
				nn = append(nn, back)
			}

			if nn.DumpLORTH() != string(dt) {
				diff.Diff("x", dt, "y", []byte(nn.DumpLORTH()))
			}
		})
	}
}
