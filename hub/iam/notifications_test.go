package iam

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"trout.software/kraken/webapp/internal/ulid"
)

func TestNotifications(t *testing.T) {
	domain := ulid.Make()
	ssn := Session{Domain: domain, Notifier: make(chan *Notification)}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/notifications":
			ssn.TransduceNotifications(context.TODO(), w)
		}
	}))

	// send notification in background
	// could use t.par=allel() but we are not running
	// tests in this function
	go func() {
		ssn.SendNotification("Hello World",
			NextStep{Label: "OK", URL: srv.URL + "/login"},
		)
	}()

	t.Run("notifications", func(t *testing.T) {
		req, err := http.NewRequest("GET", srv.URL+"/notifications", nil)
		if err != nil {
			t.Fatalf("error creating request: %v", err)
		}

		// these headers will be set by the browser
		// using text/event-stream is the same as using EventSource API for SSE
		req.Header.Set("Cache-Control", "no-cache")
		req.Header.Set("Accept", "text/event-stream")
		req.Header.Set("Connection", "keep-alive")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			t.Fatalf("error sending request: %v", err)
		}

		for {
			// the size of the buffer is preditacle
			// so we can use a fixed size buffer
			src := make([]byte, 143)
			_, err := resp.Body.Read(src)
			if err != nil {
				t.Errorf("error reading response: %v", err)
			}

			// if the response is empty
			// we loop keep reading
			if len(src) == 0 {
				continue
			}

			// unmashall the response
			var got Notification
			//remove data: and \n\n
			if err := json.Unmarshal(src[6:len(src)-2], &got); err != nil {
				t.Fatalf("error unmarshalling response: %v", err)
			}

			// compare the response
			want := Notification{
				Message: "Hello World",
				Actions: []NextStep{
					{Label: "OK", URL: srv.URL + "/login"},
				},
			}

			if !cmp.Equal(got, want, cmpopts.IgnoreFields(Notification{}, "ID")) {
				t.Errorf("reading back response: got %s", cmp.Diff(got, want))
			}
			break
		}

	})
}
