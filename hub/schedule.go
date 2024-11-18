package hub

import (
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/sqlite"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/internal/httpform"
	"trout.software/kraken/webapp/internal/iso8601"
	"trout.software/kraken/webapp/internal/sqlite/stability"
	"trout.software/kraken/webapp/internal/ulid"
)

type NotebookSchedule struct {
	_ stability.SerializedValue

	Author     iam.User
	Key        ulid.ULID   `cbor:"v2/key"`
	NotebookID ulid.ULID   `form:"notebook"`
	Runs       Repetitions `form:"schedule" cbor:"v2/runs"`
	Results    []Result
	Status     int `form:"status"`

	Lease time.Time
}

const (
	Running = iota
	Finished
	Canceled
	Archived
)

type Repetitions struct {
	Specification string
	Occurences    []time.Time
}

var _ httpform.FormFiller = &Repetitions{}

func (r *Repetitions) FillForm(values []string) error {
	if len(values) != 1 {
		return fmt.Errorf("invalid number of values (%d)", len(values))
	}

	runs, err := iso8601.ParseRepetition(values[0])
	if err != nil {
		return err
	}

	r.Occurences = runs
	r.Specification = values[0]
	return nil
}

func (app App) ScheduleNotebook(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	if err := ssn.CheckAccess(iam.PermScheduleStop, iam.ResourceLabel); err != nil {
		tasks.AuditLogger.Info("access denied: creating playbook", "user", ssn.UserName)
		http.Error(w, "access denied", http.StatusForbidden)
		return
	}

	action := r.PostFormValue("action")
	// action := r.FormValue("action")

	//TODO remove if statement when feature flag is no longer needed
	if action == "" {
		sch := NotebookSchedule{Key: ulid.Make()}
		if err := httpform.Unmarshal(r, &sch); err != nil {
			tasks.SecureErr(ctx, w, err, "invalid submission")
			return
		}

		user, err := FindOrCreateUser(ctx, app.db, app.Domain, iam.Profile{Name: ssn.UserName, ExternalID: ssn.UserName})
		if err != nil {
			tasks.SecureErr(ctx, w, err, "invalid author")
			return
		}
		sch.Author = user

		err = PutValue(ctx, app.db, fmt.Sprint("/nbschedules/", sch.Key), sch)

		var res struct{ Result, Message string }
		if err != nil {
			res.Result = "error"
			res.Message = "cannot add schedule"
			tasks.Annotate(ctx, "", err)
		} else {
			res.Result = "ok"
		}
		json.NewEncoder(w).Encode(res)
	} else {
		switch action {
		case "add":
			sch := NotebookSchedule{Key: ulid.Make()}
			if err := httpform.Unmarshal(r, &sch); err != nil {
				tasks.SecureErr(ctx, w, err, "invalid submission")
				return
			}

			user, err := FindOrCreateUser(ctx, app.db, app.Domain, iam.Profile{Name: ssn.UserName, ExternalID: ssn.UserName})
			if err != nil {
				tasks.SecureErr(ctx, w, err, "invalid author")
				return
			}
			sch.Author = user

			err = PutValue(ctx, app.db, fmt.Sprint("/nbschedules/", sch.Key), sch)

			var res struct{ Result, Message string }
			if err != nil {
				res.Result = "error"
				res.Message = "cannot add schedule"
				tasks.Annotate(ctx, "", err)
			} else {
				res.Result = "ok"
			}
			json.NewEncoder(w).Encode(res)
		case "stop", "start":
			switch action {
			case "stop":
				if err := ssn.CheckAccess(iam.PermScheduleStop, iam.ResourceLabel); err != nil {
					tasks.AuditLogger.Info("access denied: stopping schedule", "user", ssn.UserName)
					http.Error(w, "access denied", http.StatusForbidden)
					return
				}
			case "start":
				if err := ssn.CheckAccess(iam.PermScheduleStart, iam.ResourceLabel); err != nil {
					tasks.AuditLogger.Info("access denied: restarting schedule", "user", ssn.UserName)
					http.Error(w, "access denied", http.StatusForbidden)
					return
				}
			}

			id, err := ulid.ParseStrict(r.PostFormValue("notebook"))
			if err != nil {
				tasks.SecureErr(ctx, w, err, "invalid notebook ID")
				return
			}
			sch, err := FindOne[NotebookSchedule](ctx, app.db, fmt.Sprint("/nbschedules/", id))
			if err != nil {
				tasks.SecureErr(ctx, w, err, "invalid notebook ID")
			}

			switch action {
			case "stop":
				sch.Status = Canceled
			case "start":
				sch.Status = Running
			}

			err = PutValue(ctx, app.db, fmt.Sprint("/nbschedules/", sch.Key), sch)
			if err != nil {
				tasks.SecureErr(ctx, w, err, "cannot update schedule")
			}
			http.Redirect(w, r, "/schedules", http.StatusSeeOther)
		case "remove":
			if err := ssn.CheckAccess(iam.PermScheduleRemove, iam.ResourceLabel); err != nil {
				tasks.AuditLogger.Info("access denied: archiving schedule", "user", ssn.UserName)
				http.Error(w, "access denied", http.StatusForbidden)
				return
			}

			id, err := ulid.ParseStrict(r.PostFormValue("notebook"))
			if err != nil {
				tasks.SecureErr(ctx, w, err, "invalid notebook ID")
				return
			}
			sch, err := FindOne[NotebookSchedule](ctx, app.db, fmt.Sprint("/nbschedules/", id))
			if err != nil {
				tasks.SecureErr(ctx, w, err, "invalid notebook ID")
			}

			sch.Status = Archived

			err = PutValue(ctx, app.db, fmt.Sprint("/nbschedules/", sch.Key), sch)

			var res struct{ Result, Message string }
			if err != nil {
				res.Result = "error"
				res.Message = "cannot remove schedule"
				tasks.Annotate(ctx, "", err)
			} else {
				res.Result = "ok"
			}
			json.NewEncoder(w).Encode(res)
		}
	}
}

type Result struct {
	NotebookID ulid.ULID
	Duration   time.Duration
	Status     int
}

const (
	NotRun = iota
	Success
	Failure
	Timeout
	Skipped
)

// NextRun returns the time at which the next run is scheduled.
// A zero time is returned if no runs are left
// The logic takes into account the possibility for past failures or server shutdown:
//
//  1. if a run exists in the next hour, it is always preferred
//  2. if a run is in the past, but was not executed, it will be chosen
//  3. unless the next iteration of the same schedule is scheduled within the next 12 hours.
func (s NotebookSchedule) NextRun(now time.Time) time.Time {
	if len(s.Runs.Occurences) == len(s.Results) {
		return time.Time{}
	}

	runs := s.Runs.Occurences[len(s.Results):]

	tomorrow := now.Add(12 * time.Hour)
	nexthour := now.Add(1 * time.Hour)

	i := len(runs) - 1
	for ; i > 0; i-- {
		if runs[i].Before(tomorrow) {
			break
		}
	}

	if runs[i].Before(nexthour) {
		return runs[i]
	}

	return time.Time{}
}

func (s NotebookSchedule) MarshalBinary() ([]byte, error) {
	type NS NotebookSchedule
	return cbor.Marshal(NS(s))
}

func (s *NotebookSchedule) UnmarshalBinary(dt []byte) error {
	type NS struct {
		NotebookSchedule

		KeyV1  string      `cbor:"Key"`
		RunsV1 []time.Time `cbor:"Runs"`
	}
	var ns NS
	if err := cbor.Unmarshal(dt, &ns); err != nil {
		return err
	}

	if ns.KeyV1 != "" {
		var err error
		ns.Key, err = ulid.Parse(ns.KeyV1)
		if err != nil {
			return err
		}
	}

	if len(ns.RunsV1) > 0 {
		ns.Runs.Occurences = ns.RunsV1
	}

	*s = ns.NotebookSchedule
	return nil
}

type vtSchedules struct {
	Key         string          `vtab:"id,hidden"`
	NotebookID  string          `vtab:"notebook"`
	Results     json.RawMessage `vtab:"results"`
	Status      int             `vtab:"status"`
	Description string          `vtab:"description"`
	NextRun     string          `vtab:"next"`

	app *App `vtab:"-"`
}

func (t vtSchedules) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[vtSchedules] {
	var rmax = 50
	buf := make([]NotebookSchedule, rmax)
	buf, err := ListPath(context.Background(), t.app.db, "/nbschedules", buf)
	if err != nil {
		return sqlite.FromError[vtSchedules](err)
	}

	rv := make([]vtSchedules, len(buf))
	for i, v := range buf {
		d, _ := iso8601.GetDescription(v.Runs.Specification)

		var last15Results []Result
		if len(v.Results) <= 15 {
			last15Results = v.Results
		} else {
			last15Results = v.Results[len(v.Results)-16:]
		}

		rv[i] = vtSchedules{
			Key:         v.Key.String(),
			NotebookID:  v.NotebookID.String(),
			Description: d,
			NextRun:     findNextRun(v),
		}
		if v.Status == Running {
			//precaution of older records without Status field
			if len(v.Runs.Occurences) == len(v.Results) {
				rv[i].Status = Finished
			} else {
				rv[i].Status = Running
			}
		} else {
			rv[i].Status = v.Status
		}
		rv[i].Results, err = json.Marshal(last15Results)
		if err != nil {
			sqlite.FromError[vtSchedules](err)
		}
	}

	return sqlite.FromArray(rv)
}

// NextRun returns the time at which the next run is scheduled.
// The logic takes into account the possibility for past failures or server shutdown:
//
//  1. if a run exists in the next hour, it is always preferred to be run by the scheduler today.
//  2. if a run is in the past, but was not executed, it will be chosen to be run by the scheduler today.
//  3. the rest of executions will follow its expected time.
func findNextRun(s NotebookSchedule) string {
	if StopSchedule {
		switch s.Status {
		case Running:
			//precaution of older records without Status field
			if len(s.Runs.Occurences) == len(s.Results) {
				return "Finished"
			}

			runs := s.Runs.Occurences[len(s.Results):]
			tomorrow := time.Now().Add(12 * time.Hour)

			i := len(runs) - 1
			for ; i > 0; i-- {
				if runs[i].Before(tomorrow) {
					return time.Now().Format(time.DateOnly)
				}
			}
			return runs[0].Format(time.DateOnly)
		case Finished:
			return "Finished"
		case Canceled:
			return "Canceled"
		case Archived:
			return "Archived"
		}
	} else {
		if len(s.Runs.Occurences) == len(s.Results) {
			return "Finished"
		}

		runs := s.Runs.Occurences[len(s.Results):]

		tomorrow := time.Now().Add(12 * time.Hour)

		i := len(runs) - 1
		for ; i > 0; i-- {
			if runs[i].Before(tomorrow) {
				return time.Now().Format(time.DateOnly)
			}
		}
		return runs[0].Format(time.DateOnly)
	}
	//TODO remove next return when feature flag is no longer needed
	return ""
}

func trend(results string) (string, error) {
	if len(results) == 0 {
		return "", nil
	}

	var res []Result
	if err := json.Unmarshal([]byte(results), &res); err != nil {
		return "", err
	}

	linkTemplate := ``
	durations := make([]float64, len(res))
	for i, r := range res {
		durations[i] = float64(r.Duration) / float64(time.Microsecond)
	}
	var durationMax float64
	if len(durations) == 0 {
		durationMax = 0
	} else {
		durationMax = slices.Max(durations)
	}

	for i, el := range res {
		var cssClass, caption string
		switch el.Status {
		default:
			cssClass = "fill-neutral-600"
			caption = "Not run"
		case Success:
			cssClass = "fill-green-600"
			caption = "Success"
		case Failure:
			cssClass = "fill-red-600"
			caption = "Failure"
		case Timeout:
			cssClass = "fill-black"
			caption = "Timeout"
		case Skipped:
			cssClass = "fill-neutral-500"
			caption = "Skipped"
		}

		durationFloat := float64(el.Duration) / float64(time.Microsecond)
		var height int
		if durationMax > 0 {
			height = int(float64(40) * durationFloat / durationMax)
			if height < 10 {
				height = 10
			}
		} else {
			height = 0
		}
		x := strconv.Itoa(i*14 + 10)
		y := strconv.Itoa(50 - height)

		linkTemplate += `<a href="/notebook/` + el.NotebookID.String() + `" target="_blank">
							<title>` + caption + `, duration: ` + el.Duration.String() + `</title>` + `
							<rect class="` + cssClass + `" width="10" height="` + strconv.Itoa(height) + `" x="` + x + `" y="` + y + `"/>
						</a>`
	}

	var buf strings.Builder
	svgTemplate := template.Must(template.New("trend_template").Parse(`
		<svg width="230" height="50" viewBox="0 0 230 50">
			<rect class="fill-neutral-100 dark:fill-neutral-700" width="230" height="50" />` +
		linkTemplate +
		`</svg>`))
	svgTemplate.Execute(&buf, struct{ Results []Result }{res})

	return buf.String(), nil
}

func lastRunStatus(results string) (string, error) {
	if len(results) == 0 {
		return "", nil
	}

	var res []Result
	if err := json.Unmarshal([]byte(results), &res); err != nil {
		return "", err
	}

	if len(res) == 0 {
		return "", nil
	}
	return strconv.Itoa(res[len(res)-1].Status), nil
}

func isTodayRun(results string) (string, error) {
	if len(results) == 0 {
		return "", nil
	}

	var res []Result
	if err := json.Unmarshal([]byte(results), &res); err != nil {
		return "", err
	}

	if len(res) == 0 {
		return "", nil
	}
	return strconv.Itoa(res[len(res)-1].Status), nil
}
