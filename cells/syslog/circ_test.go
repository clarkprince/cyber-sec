package syslog

import (
	"math/rand"
	"sync"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
)

func TestCircularBuffer(t *testing.T) {
	t.Parallel()

	b := newbuffer(3)
	wg := new(sync.WaitGroup)

	const numreaders = 5
	wg.Add(numreaders)
	res := make([][]string, numreaders)

	lorem := []string{
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
		"sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ",
		"nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit",
		"in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur ",
		"sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
	}

	for i := 0; i < numreaders; i++ {
		i := i
		go func() {
			it := b.iter()
			for j := 0; j < len(lorem) && it.next(); j++ {
				res[i] = append(res[i], it.value())
				time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
			}
			wg.Done()
		}()
	}

	for _, l := range lorem {
		b.append(l)
		time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
	}
	time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
	wg.Wait()
	time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
	b.close()

	for i := 0; i < numreaders; i++ {
		if !cmp.Equal(res[i], lorem) {
			t.Errorf("in reader %d: %s", i, cmp.Diff(res[i], lorem))
		}
	}
}
