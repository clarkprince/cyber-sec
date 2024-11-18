package hub

import (
	"context"
	"net/http"

	"trout.software/kraken/webapp/cells/logstream"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/tasks"
)

func TestSFTP(ssn iam.Session, ctx context.Context, w http.ResponseWriter, r *http.Request) {
	var s = &logstream.SFTP{}
	s.Init(r)

	if err := s.Test(ctx, ssn); err != nil {
		tasks.SecureErr(ctx, w, err, "unauthorized")
	}
	tasks.Annotate(ctx, "sftp-conn", "success")
}
