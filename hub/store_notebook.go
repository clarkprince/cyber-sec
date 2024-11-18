package hub

import (
	"bufio"
	"bytes"
	"compress/flate"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"time"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

type CompressedBytes []byte

func (dt CompressedBytes) MarshalBinary() ([]byte, error) {
	buf := sqlite.GetBuffer()
	defer sqlite.ReturnBuffer(buf)

	w, _ := flate.NewWriter(buf, flate.DefaultCompression)
	io.Copy(w, bytes.NewReader(dt))
	w.Close()

	out := make([]byte, buf.Len())
	copy(out, buf.Bytes())

	return out, nil
}

func (dt *CompressedBytes) UnmarshalBinary(o []byte) error {
	buf := sqlite.GetBuffer()
	defer sqlite.ReturnBuffer(buf)

	r := flate.NewReader(bytes.NewReader(o))
	io.Copy(buf, r)

	*dt = make([]byte, buf.Len())
	copy(*dt, buf.Bytes())
	return nil
}

// no compression at that stage
func (dt CompressedBytes) MarshalJSON() ([]byte, error) {
	if len(dt) == 0 {
		return []byte("null"), nil
	}

	return json.Marshal(json.RawMessage(dt))
}
func (cb *CompressedBytes) UnmarshalJSON(dt []byte) error {
	var buf json.RawMessage
	if err := json.Unmarshal(dt, &buf); err != nil {
		return err
	}
	*cb = CompressedBytes(buf)
	return nil
}

func (cb *CompressedBytes) FillForm(dt []string) error {
	if len(dt) > 1 {
		return errors.New("doo many records")
	}
	*cb = CompressedBytes(dt[0])
	return nil
}

var ConflictingVersions = errors.New("version conflict")

func StoreNotebook(ctx context.Context, ctn Executor, nb Notebook) error {
	const op = "storing notebook: %w"

	ctx, err := ctn.Savepoint(ctx)
	if err != nil {
		return fmt.Errorf(op, err)
	}
	defer ctn.Rollback(ctx)

	PutValue(ctx, ctn, "/notebooks/"+nb.ID.String(), nb)

	SaveSearch(ctx, ctn, nb.ID)

	return ctn.Release(ctx)
}

func ListCells(ctx context.Context, ctn Executor, notebook ulid.ULID) ([]Manifest, error) {
	nb, err := FindOne[Notebook](ctx, ctn, "/notebooks/"+notebook.String())
	if err != nil {
		return nil, err
	}
	return nb.Cells, nil
}

func StoreEditor(ctx context.Context, ctn Executor, notebook ulid.ULID, content string) error {
	const maxRetry = 5

	err := _storeEditor(ctx, ctn, notebook, content)
	i := 0
	for errors.Is(err, sqlite.BusyTransaction) && i < maxRetry {
		// exponential backoff
		time.Sleep(time.Duration(1<<i)*80*time.Millisecond + time.Duration(rand.Intn(1000))*time.Microsecond)
		err = _storeEditor(ctx, ctn, notebook, content)
		i++
	}
	return err
}

func _storeEditor(ctx context.Context, ctn Executor, notebook ulid.ULID, content string) error {
	const op = "storing editor content: %w"

	ctx, err := ctn.Savepoint(ctx)
	if err != nil {
		return fmt.Errorf(op, err)
	}
	defer ctn.Rollback(ctx)

	nb, err := FindOne[Notebook](ctx, ctn, "/notebooks/"+notebook.String())
	if err != nil {
		return fmt.Errorf(op, err)
	}

	// the (maybe bulky) records for text content is stored in the same global tree, but using the natural sort order to create dynamic partitions (cf G.Graefe, 2003).
	// basically, /notebook/<ulid> is always less than /notebook/data, since max char for ULID is Z (U+005a) < d (U+0064).
	// so the hope is that the metadata pages are always stored together, and allow for iteration without touching the variable-sized, larger ones.
	// see also https://www.sqlite.org/fasterthanfs.html as to why we don’t bother with direct disk storage.
	PutValue(ctx, ctn, "/notebooks/data/"+notebook.String(), CompressedBytes(content))

	// TODO(rdo) double-check if that is required
	StoreNotebook(ctx, ctn, nb)

	SaveSearch(ctx, ctn, nb.ID)

	return ctn.Release(ctx)
}

func FindCell(ctx context.Context, ctn Executor, cell Manifest) (Manifest, error) {
	nb, err := FindOne[Notebook](ctx, ctn, "/notebooks/"+cell.Notebook.String())
	if err != nil {
		return cell, err
	}
	for _, c := range nb.Cells {
		if c.ID == cell.ID {
			return c, nil
		}
	}
	return cell, errors.New("cell not found")
}

func StoreCell(ctx context.Context, ctn Executor, notebook ulid.ULID, cell Manifest, user ulid.ULID, data io.ReadSeeker) error {
	const maxRetry = 5

	err := _storeCell(ctx, ctn, notebook, cell, user, data)
	i := 0
	for errors.Is(err, sqlite.BusyTransaction) && i < maxRetry {
		// exponential backoff
		time.Sleep(time.Duration(1<<i)*80*time.Millisecond + time.Duration(rand.Intn(1000))*time.Microsecond)
		err = _storeCell(ctx, ctn, notebook, cell, user, data)
		i++
	}
	return err
}

func _storeCell(ctx context.Context, ctn Executor, notebook ulid.ULID, cell Manifest, user ulid.ULID, data io.ReadSeeker) error {
	const op = "storing cell content: %w"

	ctx, err := ctn.Savepoint(ctx)
	if err != nil {
		return fmt.Errorf(op, err)
	}
	defer ctn.Rollback(ctx)

	if cell.Author.IsZero() {
		user, err := FindOne[iam.User](ctx, ctn, "/users/"+user.String())
		if err != nil {
			return err
		}
		cell.Author = user
	}
	if cell.Created.IsZero() {
		cell.Created = time.Now()
	}
	cell.Timestamp = time.Now()

	nb, err := FindOne[Notebook](ctx, ctn, "/notebooks/"+notebook.String())
	if err != nil {
		return fmt.Errorf(op, err)
	}
	j := -1
	for i, c := range nb.Cells {
		if c.ID == cell.ID {
			j = i
		}
	}
	if j == -1 {
		return errors.New("invalid notebook")
	}
	nb.Cells[j] = cell
	if err := StoreNotebook(ctx, ctn, nb); err != nil {
		return fmt.Errorf(op, err)
	}

	if data != nil {
		var buf = sqlite.GetBuffer()
		defer sqlite.ReturnBuffer(buf)
		data.Seek(0, io.SeekStart)
		io.Copy(buf, data)

		manifest := SerializeManifest(cell)

		if err := ctn.Exec(ctx, "insert into nbar (pkey, manifest, sz, data) values (?, ?, ?, ?) on conflict do update set manifest = excluded.manifest, sz=excluded.sz, data=excluded.data",
			cell.ID.String(), manifest, buf.Len(), buf.Bytes()).Err(); err != nil {
			return fmt.Errorf("action=%q cell=%s err=%w", "insert_nbar", cell.ID, err)
		}
	}

	return ctn.Release(ctx)
}

type SnapshotWriter struct {
	writer   io.Writer
	buffer   *bufio.Writer
	byteSize int
}

func NewBufferedWriter(writer io.Writer) *SnapshotWriter {
	return &SnapshotWriter{
		writer:   writer,
		buffer:   bufio.NewWriter(writer),
		byteSize: 0,
	}
}

func (sw *SnapshotWriter) Write(p []byte) (n int, err error) {
	n, err = sw.buffer.Write(p)
	sw.byteSize += n

	// if the buffer size exceeds the threshold, flush it to the file.
	if sw.byteSize >= 4096 {
		err = sw.Flush()
	}

	return n, err
}

func (sw *SnapshotWriter) Flush() error {
	if sw.byteSize > 0 {
		err := sw.buffer.Flush()
		sw.byteSize = 0
		return err
	}
	return nil
}

func storeSnapshotData(ctx context.Context, ctn Executor, ssn *iam.Session, notebook ulid.ULID, cell ulid.ULID, data []byte) error {
	const maxRetry = 5

	err := _storeSnapshotData(ctx, ctn, ssn, notebook, cell, data)
	i := 0
	for errors.Is(err, sqlite.BusyTransaction) && i < maxRetry {
		// exponential backoff
		time.Sleep(time.Duration(1<<i)*80*time.Millisecond + time.Duration(rand.Intn(1000))*time.Microsecond)
		err = _storeSnapshotData(ctx, ctn, ssn, notebook, cell, data)
		i++
	}
	return err
}

func _storeSnapshotData(ctx context.Context, ctn Executor, ssn *iam.Session, snapshot ulid.ULID, cell ulid.ULID, data []byte) error {
	PutValue(ctx, ctn, "/snapshots/data/"+snapshot.String(), CompressedBytes(data))
	return nil
}

type Snaphot struct {
	ID   ulid.ULID
	Cell msg.Cell
}

func (s Snaphot) MarshalBinary() ([]byte, error) {
	type W Snaphot
	return cbor.Marshal(W(s))
}

func (s *Snaphot) UnmarshalBinary(dt []byte) error {
	type W Snaphot
	var w W
	if err := cbor.Unmarshal(dt, &w); err != nil {
		return err
	}
	*s = Snaphot(w)
	return nil
}
