//go:build cgo

package iam

import (
	"trout.software/kraken/webapp/internal/sqlite"
)

var VTable = sqlite.RegisterTable("sessions", vtSessions{})

type vtSessions struct {
	User   string `vtab:"user"`
	Expire string `vtab:"expire"`
	Token  string `vtab:"token"`
}

func (_ vtSessions) Filter(_ int, _ sqlite.Constraints) sqlite.Iter[vtSessions] {
	sessionmutex.RLock()
	defer sessionmutex.RUnlock()

	ss := make([]vtSessions, 0, len(sessioncache))
	for _, s := range sessioncache {
		tk, err := s.TokenSource.Token()
		if err != nil {
			ss = append(ss, vtSessions{
				User:   s.UserName,
				Expire: "<error>",
				Token:  err.Error(),
			})
			continue
		}
		var ts string
		if len(tk.AccessToken) > 8 {
			ts = tk.AccessToken[:8]
		} else {
			ts = "xxx"
		}

		ss = append(ss, vtSessions{
			User:   s.UserName,
			Expire: tk.Expiry.String(),
			Token:  ts,
		})
	}

	return sqlite.FromArray(ss)
}
