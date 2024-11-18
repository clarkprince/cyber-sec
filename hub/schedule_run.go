package hub

import (
	"context"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"os"
	"time"

	"github.com/fxamacker/cbor/v2"
	"golang.org/x/oauth2"
	"golang.org/x/sync/errgroup"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/multierr"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

var StopSchedule = features.HasFlag("StopSchedule")
var scheduleLogger = tasks.NewLogger("monitor")

func (app *App) RunSchedule() {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()
	for {
		var r = runner{app: app, startSession: getSession}
		r.runAllJobs()
		<-ticker.C
	}
}

type runner struct {
	app          *App
	startSession func(context.Context, *storage.Keyring, iam.User, oauth2.Config) (iam.Session, error)
}

func getSession(ctx context.Context, keyring *storage.Keyring, user iam.User, oauth2Config oauth2.Config) (iam.Session, error) {
	// start a new session
	tok, err := GetRefreshToken(ctx, keyring, user.ID)
	if err != nil {
		return iam.Session{}, err
	}
	ssn := iam.Session{
		User:        user.ID,
		Domain:      user.Domain,
		UserName:    user.ExternalID,
		TokenSource: oauth2Config.TokenSource(context.Background(), tok.Token())}
	return ssn, nil
}

func (r runner) runAllJobs() {
	ctx, task := tasks.New(context.Background(), "sch:run-cron-jobs")
	defer task.End()

	jobs, err := listNextJobs(ctx, r.app.db)
	if err != nil {
		tasks.Annotate(ctx, "", err)
		return
	}

	tasks.Annotate(ctx, "total-jobs", len(jobs))

	var eg errgroup.Group
	var errors multierr.E
	eg.SetLimit(10)
	for _, job := range jobs {
		job := job
		job.Lease = time.Now().Add(time.Hour)
		if err := PutValue(ctx, r.app.db, fmt.Sprint("/nbschedules/", job.Key), job); err != nil {
			scheduleLogger.Error("cannot lease job: "+err.Error(), "job", job.Key)
			continue
		}
		eg.Go(func() error { return r.runJob(ctx, job) })
	}
	if err := eg.Wait(); err != nil {
		errors = append(errors, err)
	}
	tasks.Annotate(ctx, "", errors.ErrNil())
}

func listNextJobs(ctx context.Context, db Executor) ([]NotebookSchedule, error) {
	runssoon := func(s NotebookSchedule) bool { return !s.NextRun(time.Now()).IsZero() }
	isfree := func(s NotebookSchedule) bool { return s.Lease.IsZero() || time.Now().After(s.Lease) }

	var notarchived func(s NotebookSchedule) bool
	if StopSchedule {
		notarchived = func(s NotebookSchedule) bool { return s.Status != Archived }
	}

	const maxScheduledJobsInList = 50
	jobs := make([]NotebookSchedule, maxScheduledJobsInList)
	if StopSchedule {
		return ListPath(ctx, db, "/nbschedules", jobs, runssoon, isfree, notarchived)
	} else {
		return ListPath(ctx, db, "/nbschedules", jobs, runssoon, isfree)
	}
}

func (r runner) runJob(ctx context.Context, job NotebookSchedule) error {
	if StopSchedule {
		var errs multierr.E
		if job.Status == Running {
			ctx, cancel := context.WithTimeout(ctx, 30*time.Minute)
			defer cancel()

			//start a new session
			ssn, err := r.startSession(ctx, r.app.keyring, job.Author, r.app.OAuth2.Config)
			if err != nil {
				return fmt.Errorf("starting session: %w", err)
			}

			result := Result{NotebookID: ulid.Make()}

			original, err := FindOne[Notebook](ctx, r.app.db, "/notebooks/"+job.NotebookID.String())
			if err != nil {
				return fmt.Errorf("finding check playbook: %w", err)
			}

			content, err := FindOne[CompressedBytes](ctx, r.app.db, "/notebooks/data/"+job.NotebookID.String())
			if err != nil && !errors.Is(err, storage.MissingEntry) {
				return fmt.Errorf("reading notebook text content: %w", err)
			}

			nb := Notebook{
				ID:      result.NotebookID,
				Created: time.Now(),
				Owner:   job.Author,
				Cells:   make([]Manifest, len(original.Cells))}
			if len(original.Title) == 0 {
				nb.Title = fmt.Sprintf("%s - %s", original.ID.String(), time.Now().Format(time.RFC3339))
			} else {
				nb.Title = fmt.Sprintf("%s - %s", original.Title, time.Now().Format(time.RFC3339))
			}

			result.Status = Timeout
			start := time.Now()

			for i, cell := range original.Cells {
				cell.ID = ulid.Make()
				cell.Notebook = result.NotebookID

				file, e := os.CreateTemp("", job.Key.String())
				if e != nil {
					result.Status = NotRun
					scheduleLogger.Error("cannot create file for results storage: "+e.Error(),
						"playbook", nb.ID,
						"cell", cell.ID)
					continue
				}

				iter, e := startQuery(ctx, &cell, r.app.db, &ssn)
				if e != nil {
					errs = append(errs, e)
					result.Status = NotRun
					continue
				}

				enc := cbor.NewEncoder(file)
				enc.StartIndefiniteArray()
				var length int
				for iter.Next() {
					length++
					enc.Encode(iter.Record())
				}
				enc.EndIndefinite()

				switch {
				case iam.IsOAuthError(iter.Err()):
					tasks.Annotate(ctx, "error-type", "oauth")
					result.Status = NotRun
					errs = append(errs, iter.Err())
					continue
				case iter.Err() != nil:
					tasks.Annotate(ctx, "error-type", "other")
					result.Status = NotRun
					errs = append(errs, iter.Err())
					continue
				}

				if length > 0 {
					//The system is not compliant
					result.Status = Failure
					checkCellFailHook(CheckCellFailEvent{PlaybookID: nb.ID, CellID: cell.ID})
				}
				cell.Created = time.Now()
				cell.Timestamp = cell.Created
				cell.Author.ID = job.Author.ID
				cell.Author.Name = job.Author.Profile.Name

				if e := putCell(ctx, r.app.db, cell, file); e != nil {
					scheduleLogger.Error("cannot store results of cell: "+e.Error(),
						"playbook", nb.ID,
						"cell", cell.ID)
					continue
				}
				nb.Cells[i] = cell

				if e := file.Close(); e != nil {
					scheduleLogger.Error("cannot close temporary file: "+e.Error(),
						"playbook", nb.ID,
						"cell", cell.ID)
					continue
				}
				if e := os.Remove(file.Name()); e != nil {
					scheduleLogger.Error("cannot delete temporary file: "+e.Error(),
						"playbook", nb.ID,
						"cell", cell.ID)
					continue
				}
			}

			if e := StoreNotebook(ctx, r.app.db, nb); e != nil {
				return e
			}
			if e := StoreEditor(ctx, r.app.db, nb.ID, string(content)); e != nil {
				return e
			}

			result.Duration = time.Since(start)

			if result.Status == Timeout {
				result.Status = Success
			}

			job.Results = append(job.Results, result)

			if len(job.Results) == len(job.Runs.Occurences) {
				job.Status = Finished
			}
		} else {
			result := Result{Status: Skipped}
			job.Results = append(job.Results, result)
		}

		job.Lease = time.Time{}
		if e := PutValue(ctx, r.app.db, fmt.Sprint("/nbschedules/", job.Key), job); e != nil {
			return e
		}

		return errs.ErrNil()
	} else {
		ctx, cancel := context.WithTimeout(ctx, 30*time.Minute)
		defer cancel()

		//start a new session
		ssn, err := r.startSession(ctx, r.app.keyring, job.Author, r.app.OAuth2.Config)
		if err != nil {
			return fmt.Errorf("starting session: %w", err)
		}

		result := Result{NotebookID: ulid.Make()}

		original, err := FindOne[Notebook](ctx, r.app.db, "/notebooks/"+job.NotebookID.String())
		if err != nil {
			return fmt.Errorf("finding check playbook: %w", err)
		}

		content, err := FindOne[CompressedBytes](ctx, r.app.db, "/notebooks/data/"+job.NotebookID.String())
		if err != nil && !errors.Is(err, storage.MissingEntry) {
			return fmt.Errorf("reading notebook text content: %w", err)
		}

		nb := Notebook{
			ID:      result.NotebookID,
			Created: time.Now(),
			Owner:   job.Author,
			Cells:   make([]Manifest, len(original.Cells))}
		if len(original.Title) == 0 {
			nb.Title = fmt.Sprintf("%s - %s", original.ID.String(), time.Now().Format(time.RFC3339))
		} else {
			nb.Title = fmt.Sprintf("%s - %s", original.Title, time.Now().Format(time.RFC3339))
		}

		result.Status = Timeout
		start := time.Now()

		var errs multierr.E
		for i, cell := range original.Cells {
			cell.ID = ulid.Make()
			cell.Notebook = result.NotebookID

			file, e := os.CreateTemp("", job.Key.String())
			if e != nil {
				result.Status = NotRun
				scheduleLogger.Error("cannot create file for results storage: "+e.Error(),
					"playbook", nb.ID,
					"cell", cell.ID)
				continue
			}

			iter, e := startQuery(ctx, &cell, r.app.db, &ssn)
			if e != nil {
				errs = append(errs, e)
				result.Status = NotRun
				continue
			}

			enc := cbor.NewEncoder(file)
			enc.StartIndefiniteArray()
			var length int
			for iter.Next() {
				length++
				enc.Encode(iter.Record())
			}
			enc.EndIndefinite()

			switch {
			case iam.IsOAuthError(iter.Err()):
				tasks.Annotate(ctx, "error-type", "oauth")
				result.Status = NotRun
				errs = append(errs, iter.Err())
				continue
			case iter.Err() != nil:
				tasks.Annotate(ctx, "error-type", "other")
				result.Status = NotRun
				errs = append(errs, iter.Err())
				continue
			}

			if length > 0 {
				//The system is not compliant
				result.Status = Failure
				checkCellFailHook(CheckCellFailEvent{PlaybookID: nb.ID, CellID: cell.ID})
			}
			cell.Created = time.Now()
			cell.Timestamp = cell.Created
			cell.Author.ID = job.Author.ID
			cell.Author.Name = job.Author.Profile.Name

			if e := putCell(ctx, r.app.db, cell, file); e != nil {
				scheduleLogger.Error("cannot store results of cell: "+e.Error(),
					"playbook", nb.ID,
					"cell", cell.ID)
				continue
			}
			nb.Cells[i] = cell

			if e := file.Close(); e != nil {
				scheduleLogger.Error("cannot close temporary file: "+e.Error(),
					"playbook", nb.ID,
					"cell", cell.ID)
				continue
			}
			if e := os.Remove(file.Name()); e != nil {
				scheduleLogger.Error("cannot delete temporary file: "+e.Error(),
					"playbook", nb.ID,
					"cell", cell.ID)
				continue
			}
		}

		if e := StoreNotebook(ctx, r.app.db, nb); e != nil {
			return e
		}
		if e := StoreEditor(ctx, r.app.db, nb.ID, string(content)); e != nil {
			return e
		}

		result.Duration = time.Since(start)

		if result.Status == Timeout {
			result.Status = Success
		}

		job.Results = append(job.Results, result)
		job.Lease = time.Time{}
		if e := PutValue(ctx, r.app.db, fmt.Sprint("/nbschedules/", job.Key), job); e != nil {
			return e
		}

		return errs.ErrNil()
	}
}

// TODO(prince) could we get that migrated to nbar storage directly?
func putCell(ctx context.Context, ctn Executor, cell Manifest, data io.ReadSeeker) error {
	const maxRetry = 5

	err := _putCell(ctx, ctn, cell, data)
	i := 0
	for errors.Is(err, sqlite.BusyTransaction) && i < maxRetry {
		// exponential backoff
		time.Sleep(time.Duration(1<<i)*80*time.Millisecond + time.Duration(rand.Intn(1000))*time.Microsecond)
		err = _putCell(ctx, ctn, cell, data)
		i++
	}
	return err
}

func _putCell(ctx context.Context, ctn Executor, cell Manifest, data io.ReadSeeker) error {
	const op = "storing cell content: %w"

	ctx, err := ctn.Savepoint(ctx)
	if err != nil {
		return fmt.Errorf(op, err)
	}
	defer ctn.Rollback(ctx)

	var buf = sqlite.GetBuffer()
	defer sqlite.ReturnBuffer(buf)
	data.Seek(0, io.SeekStart)
	io.Copy(buf, data)

	manifest := SerializeManifest(cell)

	if err := ctn.Exec(ctx, "insert into nbar (pkey, manifest, sz, data) values (?, ?, ?, ?) on conflict do update set manifest = excluded.manifest, sz=excluded.sz, data=excluded.data",
		cell.ID.String(), manifest, buf.Len(), buf.Bytes()).Err(); err != nil {
		return fmt.Errorf("action=%q cell=%s err=%w", "inset_nbar", cell.ID, err)
	}

	return ctn.Release(ctx)
}
