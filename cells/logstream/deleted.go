package logstream

import (
	"context"
	"errors"
	"net/http"

	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
)

type Deleted struct{}

func (d *Deleted) Streams() []driver.Stream {
	return []driver.Stream{{Name: "Logs", Type: "stream:logstream:deleted"}}
}

func (f *Deleted) Init(r *http.Request)                            {}
func (d *Deleted) Test(ctx context.Context, ssn iam.Session) error { return nil }

var DataSourceDeleted = errors.New("Datasource not found. Datasource may have been deleted.")

func (d *Deleted) Select(_ driver.Stream, _ *iam.Session, _ mdt.Grammar, _ shards.Shard, _ []piql.Pivot) driver.Iter {
	return driver.ErrWrap(DataSourceDeleted)
}
