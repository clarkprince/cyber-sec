package iam

import (
	"context"
	"encoding/json"
	"expvar"
	"fmt"
	"net/http"
	"strings"
	"time"

	"trout.software/kraken/webapp/internal/ulid"
)

var (
	countDroppedNotifications = expvar.NewInt("dropped_notifications")
	countSentNotifications    = expvar.NewInt("sent_notifications")
)

// Notification is a server-sent event to inform the user about something in the system.
// It is often (but not only) used for errors.
type Notification struct {
	ID      ulid.ULID
	Err     bool
	Message string
	Actions []NextStep
}

// NextStep gives the user indication about what to do in response to a notification.
//
//	NextStep{Label: "Create it", URL: "/policy/create"}
type NextStep struct {
	Label string
	URL   string
}

// registers the notification
// the function never finishes as it is always listening for Notifications
func (ssn *Session) TransduceNotifications(ctx context.Context, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	f, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming not supported", http.StatusMethodNotAllowed)
		return
	}

	var buf strings.Builder
	for {
		buf.Reset()

		select {
		case ev := <-ssn.Notifier:
			if ctx.Err() != nil {
				return
			}
			json.NewEncoder(&buf).Encode(ev)
			fmt.Fprintf(w, "data: %s\n\n", buf.String())

			wait := make(chan struct{})
			go func() { f.Flush(); close(wait) }()
			select {
			case <-time.After(4 * time.Second):
				// client is gone, no need to stay here
				return
			case <-wait:
				// keep looping
			}
		case <-ctx.Done():
			return
		}

	}
}

// sends a notification back to the user via the channel
// the message should implement either the error, on the Stringer interface
func (ssn *Session) SendNotification(msg any, actions ...NextStep) {
	// get the first 2 actions
	// if there are more than 2, we will just ignore them
	// this is to prevent the UI from getting too cluttered
	// with too many buttons
	if len(actions) > 2 {
		actions = actions[:2]
	}

	var content string
	err, ok := msg.(error)
	if ok {
		content = err.Error()
	} else {
		switch v := msg.(type) {
		case string:
			content = v
		case interface{ String() string }:
			content = v.String()
		default:
			panic("unexpected type in notifications msg")
		}
	}

	// send the notification to the channel
	select {
	case ssn.Notifier <- &Notification{
		ID:      ulid.Make(),
		Err:     ok,
		Message: content,
		Actions: actions,
	}:
		countSentNotifications.Add(1)
	case <-time.After(100 * time.Millisecond):
		countDroppedNotifications.Add(1)
	}
}
