package tasks

import (
	"context"
	"net/http"
)

// SecureErr returns the message msg to the caller, but logs err internally with all the details stored in ctx.
func SecureErr(ctx context.Context, w http.ResponseWriter, err error, msg string) {
	Annotate(ctx, "", err)
	http.Error(w, msg, http.StatusBadRequest)
}

// FromRequest creates a new task, and populate it with well-known tags from the request headers.
func FromRequest(r *http.Request) (context.Context, *Task) {
	// select the first path component
	start := r.URL.Path
	if len(start) > 0 && start[0] == '/' {
		start = start[1:]
	}
	for i, r := range start {
		if r == '/' {
			start = start[:i]
			break
		}
	}
	ctx, tsk := New(r.Context(), "hub:"+r.URL.Path)
	if r.Method != "GET" {
		tsk.tags["method"] = r.Method
	}
	return ctx, tsk
}
