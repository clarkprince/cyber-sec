package P

import (
	"errors"
	"math/rand"
	"time"

	"trout.software/kraken/webapp/internal/sqlite"
)

var F func(args ...any) error

func Weave(args ...any) error {
	const maxRetry = 5

	err := F(args...)
	i := 0
	for errors.Is(err, sqlite.BusyTransaction) && i < maxRetry {
		// exponential backoff
		time.Sleep(time.Duration(1<<i)*80*time.Millisecond + time.Duration(rand.Intn(1000))*time.Microsecond)
		err = F(args...)
		i++
	}
	return err
}
