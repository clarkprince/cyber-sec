package hub

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"slices"
	"time"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

func FindDomain(ctx context.Context, ctn Executor, domain string) (iam.Domain, error) {
	ds, err := FindOne[iam.Domain](ctx, ctn, "/domain")
	if err != nil {
		return iam.Domain{}, err
	}
	if ds.Name != domain && ds.Alias != domain {
		return iam.Domain{}, storage.MissingEntry
	}
	return ds, nil
}

// FindOrCreateAnonymousUser performs a strict match between a User in DB with the .
// when this match does not ocurrs an anonymous user is created and returned.
func FindOrCreateAnonymousUser(ctx context.Context, ctn Executor, domain string, userprf iam.Profile, user ulid.ULID) (iam.User, error) {
	dmn, err := FindDomain(ctx, ctn, domain)
	if err != nil {
		return iam.User{}, err
	}

	usr, err := FindOne(ctx, ctn, "/users", func(u iam.User) bool { return u.ID == user })
	switch {
	case errors.Is(err, storage.MissingEntry):
		suffix := ulid.Make()
		name := fmt.Sprintf("anonymous-%s-(%s)", suffix, userprf.Name)
		usr = iam.User{
			ID:     user,
			Domain: dmn.ID,
			Profile: msg.Profile{
				Name:       name,
				ExternalID: userprf.ExternalID,
				Picture:    userprf.Picture,
			},
		}
		if err := PutValue(ctx, ctn, fmt.Sprint("/users/", usr.ID), usr); err != nil {
			return usr, fmt.Errorf("creating new user: %w", err)
		}
	case err != nil:
		return iam.User{}, fmt.Errorf("cannot find user: %w", err)
	}

	return usr, nil
}

func FindOrCreateUser(ctx context.Context, ctn Executor, domain string, prf iam.Profile) (iam.User, error) {
	dmn, err := FindDomain(ctx, ctn, domain)
	if err != nil {
		return iam.User{}, err
	}

	usr, err := FindOne(ctx, ctn, "/users", func(u iam.User) bool { return u.ExternalID == prf.ExternalID })
	switch {
	case errors.Is(err, storage.MissingEntry):
		usr = iam.User{
			ID:      ulid.Make(),
			Domain:  dmn.ID,
			Profile: prf,
		}
		if err := PutValue(ctx, ctn, fmt.Sprint("/users/", usr.ID), usr); err != nil {
			return iam.User{}, fmt.Errorf("creating new user: %w", err)
		}
	case err != nil:
		return iam.User{}, fmt.Errorf("cannot find user: %w", err)
	}
	return usr, nil
}

type vtUsers struct {
	ID         string `vtab:"user,hidden"`
	Name       string `vtab:"name"`
	ExternalID string `vtab:"external_id"`
	Picture    string `vtab:"picture"`
	Labels     string `vtab:"labels"` // json array
	PKey       int64  `vtab:"pkey,hidden"`

	app *App `vtab:"-"`
}

var (
	_ sqlite.Updater[vtUsers] = vtUsers{}
)

func (vt vtUsers) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[vtUsers] {
	us := make([]iam.User, 300)
	us, err := ListPath(context.Background(), vt.app.db, "/users", us, func(u iam.User) bool { return u.HasLeft.IsZero() })
	if err != nil {
		return sqlite.FromError[vtUsers](err)
	}

	rv := make([]vtUsers, len(us))
	for i, v := range us {
		lbls, err := json.Marshal(append(v.Labels, iam.UserLabel))
		if err != nil {
			return sqlite.FromError[vtUsers](err)
		}

		rv[i] = vtUsers{
			ID:         v.ID.String(),
			Name:       v.Name,
			ExternalID: v.ExternalID,
			Picture:    v.Picture,
			Labels:     string(lbls),
			PKey:       v.ID.Prefix(),
		}
	}

	return sqlite.FromArray(rv)
}

func (vt vtUsers) Hash64() int64 { return vt.PKey }

func (vt vtUsers) Update(ctx context.Context, index int64, value vtUsers) error {
	ctx, trace := tasks.New(ctx, "vtusers:update")
	tasks.Annotate(ctx, "index", index)
	defer trace.End()

	inserts := index == -1
	delete := !inserts && value.ID == ""

	var usr iam.User
	if inserts {
		if value.Name == "" {
			return errors.New("cannot insert a user without a name")
		}
		if value.ExternalID == "" {
			return errors.New("cannot create a user without a external identifier (e.g. email)")
		}
		usr.ID = ulid.Make()
	} else {
		ours, err := FindOne[iam.User](ctx, vt.app.db, fmt.Sprint("/users/", ulid.MarshalPrefix(index)))
		switch {
		case errors.Is(err, storage.DuplicateEntry):
			return errors.New("cannot delete entry from the console: use the user interface")
		case err != nil:
			return err
		}
		usr = ours
	}
	if delete {
		usr.HasLeft = time.Now()
	} else {
		usr.Profile = iam.Profile{
			Name:       value.Name,
			ExternalID: value.ExternalID,
			Picture:    value.Picture,
		}
	}
	var labels []iam.Label
	if len(value.Labels) > 0 {
		if err := json.Unmarshal([]byte(value.Labels), &labels); err != nil {
			return fmt.Errorf("invalid list of labels: %w", err)
		}

		usr.Labels = slices.DeleteFunc(labels, func(l iam.Label) bool { return l == iam.UserLabel })
	}

	var action string
	switch {
	case inserts:
		action = "create"
	case delete:
		action = "delete"
	default:
		action = "update"
	}
	msg := fmt.Sprintf("%s user via admin interface", action)
	tasks.AuditLogger.Info(msg, "external_id", usr.ExternalID, "labels", usr.Labels)

	return PutValue(ctx, vt.app.db, fmt.Sprint("/users/", usr.ID), usr)
}
