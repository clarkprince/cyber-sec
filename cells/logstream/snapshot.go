package logstream

import (
	"context"
	"fmt"
	"net/http"

	"trout.software/kraken/webapp/cells/logstream/internal/iter"
	"trout.software/kraken/webapp/hub/driver"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/piql"
	"trout.software/kraken/webapp/internal/shards"
	"trout.software/kraken/webapp/internal/ulid"
)

type Snaphot struct {
	ID   ulid.ULID
	Cell msg.Cell
}

var _ driver.Selectable = &Snaphot{}

func (s *Snaphot) Glob(pattern string) ([]string, error) {
	return []string{fmt.Sprint("/snapshots/data", s.ID.String())}, nil
}

func (s *Snaphot) Connect(ssn *iam.Session) (iter.Driver, error) {
	// in progress
	// snapshot, err := storage.FindOne[Snaphot](context.Background(), ssn.UnlockedStorage.Executor, fmt.Sprint("/snapshots/data", s.ID.String()))
	// if err != nil {
	// 	return nil, err
	// }

	return nil, nil
}
func (s *Snaphot) Select(st driver.Stream, ssn *iam.Session, g mdt.Grammar, path shards.Shard, cs []piql.Pivot) driver.Iter {
	return iter.Filter(s, ssn, st, g, "", cs)
}

func (s *Snaphot) Streams() []driver.Stream {
	return []driver.Stream{{Name: "Logs", Type: "stream:logstream:local-db"}}
}

func (s *Snaphot) Init(r *http.Request) { httpform.Unmarshal(r, s) }

func (s *Snaphot) Test(ctx context.Context, ssn iam.Session) error {
	return nil
}
