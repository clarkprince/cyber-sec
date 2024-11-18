package sqlite

import (
	"context"
	"errors"
	"fmt"
	"runtime"
	"runtime/pprof"
	"runtime/trace"
	"sync"

	"trout.software/kraken/webapp/internal/rand"
)

const MemoryPath = "file::memory:?mode=memory"

var connectionsProfiles = pprof.NewProfile("t.sftw/sqlite/connections")

type Connections struct {
	free *Conn      // free list
	mx   sync.Mutex // protects all above

	wait sync.Cond
}

type ckey struct{}
type spkey struct{}

type savepoint struct {
	name     string
	top      bool
	released bool
	task     *trace.Task
}

// OpenPool ceates a new connection pool
func OpenPool(name string, exts ...func(SQLITE3)) (*Connections, error) {
	// There is a limit to how many concurrent writes we can issue in SQLite at the same time,
	// even in WAL mode (single writer). Increasing the number too much would still result in busy contention.
	// This takes the same approach as Python's [ThreadPoolExecutor].
	//
	// [ThreadPoolExecutor]: https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.ThreadPoolExecutor
	w := runtime.NumCPU() + 4
	if w > 32 {
		w = 32
	}
	if name == ":memory:" {
		return nil, errors.New(`":memory:" does not work with pools, use MemoryPath`)
	}

	var pool Connections
	pool.wait = sync.Cond{L: &pool.mx}

	ptr := &pool.free
	for w := w; w > 0; w-- {
		conn, err := Open(name, exts...)
		if err != nil {
			return nil, err
		}
		if w == 1 {
			var mode string
			err = conn.Exec(context.Background(), "PRAGMA journal_mode=WAL").ScanOne(&mode)
			if err != nil || mode != "wal" {
				return nil, fmt.Errorf("cannot set WAL mode (mode=%s): %w", mode, err)
			}
		}
		*ptr = conn
		ptr = &conn.next
	}

	return &pool, nil
}

// Savepoint creates a new [savepoint] in transaction (think about begin).
// If the connection does not exist, it is taken from the pool.
//
// [savepoint]: https://sqlite.org/lang_savepoint.html
func (p *Connections) Savepoint(ctx context.Context) (context.Context, error) {
	ctn, ok := ctx.Value(ckey{}).(*Conn)
	top := false
	if !ok {
		ctn = p.take()
		top = true
	}

	spn := rand.Name()
	err := ctn.Exec(ctx, "SAVEPOINT "+spn).Err()
	if err != nil {
		return ctx, err
	}
	sp := &savepoint{name: spn, top: top}
	ctx = context.WithValue(ctx, ckey{}, ctn)
	ctx = context.WithValue(ctx, spkey{}, sp)
	ctx, sp.task = trace.NewTask(ctx, "db:sqlite-tx")
	return ctx, nil
}

func (p *Connections) take() *Conn {
	p.mx.Lock()
	for p.free == nil {
		p.wait.Wait()
	}

	ctn := p.free
	p.free = ctn.next
	p.mx.Unlock()
	connectionsProfiles.Add(ctn, 2)
	return ctn
}

func (p *Connections) Release(ctx context.Context) error {
	ctn := ctx.Value(ckey{}).(*Conn)
	sp := ctx.Value(spkey{}).(*savepoint)
	if sp.released {
		panic("savepoint released twice")
	}

	err := ctn.Exec(ctx, "RELEASE "+sp.name).Err()
	if sp.top {
		p.put(ctn)
	}
	sp.released = true
	sp.task.End()
	return err
}

func (p *Connections) put(ctn *Conn) {
	connectionsProfiles.Remove(ctn)
	p.mx.Lock()
	ctn.next = p.free
	p.free = ctn
	p.wait.Signal()
	p.mx.Unlock()
}

// Rollback rolls back all changes to the current changepoint.
// The rollback will not happen if the savepoint is already released; it is safe to call this from a defer.
func (p *Connections) Rollback(ctx context.Context) error {
	ctn := ctx.Value(ckey{}).(*Conn)
	sp := ctx.Value(spkey{}).(*savepoint)
	if sp.released {
		return nil
	}

	err := ctn.Exec(ctx, "ROLLBACK TO "+sp.name).Err()
	if sp.top {
		p.put(ctn)
	}
	sp.task.End()
	return err
}

func (p *Connections) Exec(ctx context.Context, cmd string, args ...any) *Rows {
	ctn, ok := ctx.Value(ckey{}).(*Conn)
	free := false
	if !ok {
		ctn = p.take()
		free = true
	}
	rows := ctn.Exec(ctx, cmd, args...)
	if free {
		rows.final = func() { p.put(ctn) }
	}

	return rows
}
