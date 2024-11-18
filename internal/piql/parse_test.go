package piql

import (
	"regexp"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"trout.software/kraken/webapp/internal/diff"
)

func TestParser(t *testing.T) {

	cases := []struct {
		expr string
		want instr
	}{
		{`|> 2 weeks ago at 13:14`, TimeSpan{
			start: tspec(th("13:14:00"), tshiftc(-14)),
		}},
		{`|>< yesterday at 21H and 3 hours ago`, TimeSpan{
			start: tspec(th("21:00:00"), tshiftc(-1)),
			end:   tspec(tshiftd(-3 * time.Hour)),
		}},
		{`|< 2 days ago`, TimeSpan{
			end: tspec(tshiftc(-2), th("09:00:00")),
		}},
		{`before 2 days ago`, TimeSpan{
			end: tspec(tshiftc(-2), th("09:00:00")),
		}},
		{`after last wednesday`, TimeSpan{
			start: tspec(tlast(time.Wednesday), th("09:00:00")),
		}},
		{`between yesterday and today`, TimeSpan{
			start: tspec(tshiftc(-1), th("09:00:00")),
			end:   tspec(th("09:00:00")),
		}},
		{`|>< last tuesday at 13H and today at 18:40`, TimeSpan{
			start: tspec(tlast(time.Tuesday), th("13:00:00")),
			end:   tspec(th("18:40:00")),
		}},
		{`|< yesterday at 15:40`, TimeSpan{
			end: tspec(tshiftc(-1), th("15:40:00")),
		}},
		{`|> today`, TimeSpan{
			start: tspec(th("09:00:00")),
		}},

		{`!= "apache"`, Not{Equal{"apache"}}},
		{`|= "apache", "nginx", "lighttpd"`, Equal{"apache", "nginx", "lighttpd"}},

		{`|~ "a(b*)b"`, (*Match)(regexp.MustCompile("a(b*)b"))},
	}

	cmpopts := cmp.Options{
		cmp.AllowUnexported(Not{}, Match{}),
		cmp.Comparer(func(x, y Match) bool { return x.String() == y.String() }),
		cmp.Comparer(func(x, y TimeSpan) bool {
			if x.start.After(y.start) {
				x.start, y.start = y.start, x.start
			}

			if x.end.After(y.end) {
				x.end, y.end = y.end, x.end
			}

			return x.start.Add(1*time.Second).After(y.start) &&
				x.end.Add(1*time.Second).After(y.end)
		})}

	for _, c := range cases {
		t.Run(c.expr, func(t *testing.T) {
			pvt, q, err := ParseSingle(c.expr)
			if err != nil {
				t.Fatalf("parsing %s: %s", c.expr, err)
			}

			if q != c.expr || !cmp.Equal(pvt.Exp, c.want, cmpopts...) {
				t.Error(diff.Diff("want", []byte(c.expr), "got", []byte(q)))
				t.Error(cmp.Diff(pvt.Exp, c.want, cmpopts...))
			}
		})
	}
}

func TestFormat(t *testing.T) {
	Layouts = append(Layouts, "Jan 2, 2006 at 03:04:05pm (MST)")
	cases := []struct {
		in, out string
	}{
		// space cleaning
		{`|=     "value1"`, `|= "value1"`},
		{`!= "value1"   `, `!= "value1"`},
		// ISO format time stamp
		{`before "Feb 1, 2022 at 12:59:04pm (PST)"`, `before "2022-02-01T12:59:04Z"`},
	}

	for _, c := range cases {
		_, q, err := ParseSingle(c.in)
		if err != nil {
			t.Fatal(err)
		}
		if q != c.out {
			t.Errorf("invalid format(%s): want %s, got %s", c.in, c.out, q)
		}
	}
}

// micro-DSL to express time
type topt func(t time.Time) time.Time

func th(spec string) topt {
	return func(t time.Time) time.Time {
		// parse a time specification, shifted by off days
		hour, err := time.Parse(time.TimeOnly, spec)
		if err != nil {
			panic(err)
		}

		return time.Date(t.Year(), t.Month(), t.Day(), hour.Hour(), hour.Minute(), hour.Second(), 0, t.Location())
	}
}

func tshiftc(days int) topt        { return func(t time.Time) time.Time { return t.AddDate(0, 0, days) } }
func tshiftd(d time.Duration) topt { return func(t time.Time) time.Time { return t.Add(d) } }
func tlast(day time.Weekday) topt {
	return func(t time.Time) time.Time {
		for t.Weekday() != day {
			t = t.AddDate(0, 0, -1)
		}
		return t
	}
}

func tspec(o ...topt) time.Time {
	t := time.Now()
	for _, o := range o {
		t = o(t)
	}
	return t
}
