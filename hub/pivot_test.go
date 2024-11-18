package hub

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestSanitize(t *testing.T) {
	cases := []struct {
		in, out string
	}{
		{"bucket_arn", "bucket_arn"},
		{"ip", "ip"},
		{"Robert'); DROP TABLE Students; --", "RobertDROPTABLEStudents"},
	}

	for _, c := range cases {
		if sanitize(c.in) != c.out {
			t.Errorf("sanitize(%s): want=%s got =%s", c.in, c.out, sanitize(c.out))
		}
	}
}

func TestProcessCSV(t *testing.T) {
	var app App
	wireLocalDB(t, &app, CurrentSchemaVersion)

	type processedPivot struct {
		ID    ulid.ULID `json:"pivot"`
		Rpath string    `json:"rightPath"`
	}

	t.Run("NoProcessingDueToErrFieldCount", func(t *testing.T) {
		rq := newMultipartFormRequest(`error
		KO,extra value not expected`, "pivot_1.csv")
		response := NewCustomResponseWriter()
		app.ImportCSVPivot(context.Background(), &iam.Session{}, response, rq)

		if response.statusCode != http.StatusBadRequest {
			t.Error("expected ErrFieldCount error")
		}
	})
	t.Run("CSVMustBeProcessed", func(t *testing.T) {
		rq := newMultipartFormRequest(`error
		KO
		LALA`, "pivot_1.csv")
		response := NewCustomResponseWriter()
		app.ImportCSVPivot(context.Background(), &iam.Session{}, response, rq)

		buf := bytes.NewBuffer(response.body)
		var rr processedPivot
		if err := json.NewDecoder(buf).Decode(&rr); err != nil {
			t.Fatal(err)
		}
		if rr.ID.IsZero() {
			t.Errorf("should have created a pivot")
		}
	})
}

func newMultipartFormRequest(content, filename string) *http.Request {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		panic(err)
	}
	io.Copy(part, strings.NewReader(content))
	writer.Close()

	r := httptest.NewRequest("POST", "/xx", &body)
	r.Header.Add("Content-Type", writer.FormDataContentType())
	return r
}

// custom implementation of  http.ResponseWriter
type CustomResponseWriter struct {
	body       []byte
	statusCode int
	header     http.Header
}

func NewCustomResponseWriter() *CustomResponseWriter {
	return &CustomResponseWriter{
		header: http.Header{},
	}
}

func (w *CustomResponseWriter) Header() http.Header {
	return w.header
}

func (w *CustomResponseWriter) Write(b []byte) (int, error) {
	w.body = b
	// implement it as per your requirement
	return 0, nil
}

func (w *CustomResponseWriter) WriteHeader(statusCode int) {
	w.statusCode = statusCode
}

func BenchmarkImportPivot(b *testing.B) {
	var app App
	wireLocalDB(&testing.T{}, &app, CurrentSchemaVersion)

	b.Run("huge file", func(b *testing.B) {
		buffer := bytes.NewBuffer(make([]byte, 0, 5_000_000))
		buffer.WriteString(`n,a`)
		buffer.WriteString("\n")

		for i := 0; i < 6_000_000; i++ {
			buffer.WriteString(`p,b`)
			buffer.WriteString("\n")
		}

		rq := newMultipartFormRequest(buffer.String(), "pivot_1.csv")
		for i := 0; i < b.N; i++ {
			ctx, err := app.db.Savepoint(context.Background())
			if err != nil {
				b.Fatal(err)
			}

			w := httptest.NewRecorder()
			app.ImportCSVPivot(ctx, &iam.Session{}, w, rq)
			if w.Code != http.StatusOK {
				b.Fatal("invalid response code", w.Code)
			}

			if err := app.db.Release(ctx); err != nil {
				b.Fatal(err)
			}
		}
	})

	b.Run("small file", func(b *testing.B) {
		rq := newMultipartFormRequest(`error
	KO
	LALA`, "pivot_1.csv")
		for i := 0; i < b.N; i++ {
			ctx, err := app.db.Savepoint(context.Background())
			if err != nil {
				b.Fatal(err)
			}

			w := httptest.NewRecorder()
			app.ImportCSVPivot(ctx, &iam.Session{}, w, rq)
			if w.Code != http.StatusOK {
				b.Fatal("invalid response code", w.Code)
			}

			if err := app.db.Release(ctx); err != nil {
				b.Fatal(err)
			}
		}
	})
}
