package hub

import (
	"context"
	"encoding/json"
	"io"
	"net/http"

	"trout.software/kraken/webapp/hub/iam"
)

func (app *App) EchoNotification(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	var n struct {
		Msg     string
		Actions []iam.NextStep
	}

	const MaxNotifSize = 5_000
	if err := json.NewDecoder(io.LimitReader(r.Body, MaxNotifSize)).Decode(&n); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ssn.SendNotification(n.Msg, n.Actions...)
	ssn.TransduceNotifications(ctx, w)
}
