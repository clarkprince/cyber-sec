package hub

import (
	"os"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"
)

func TestWatcher(t *testing.T) {
	w, err := fsnotify.NewWatcher()
	if err != nil {
		t.Fatal(err)
	}

	file, err := os.Create("/tmp/watcher.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(file.Name())

	fileName := make(chan string)

	go watchForEvent(w, []string{file.Name()}, fileName)

	addFilesToWatcher([]string{file.Name()}, w)

	go func() {
		for i := 3; i > 0; i-- {
			time.Sleep(50 * time.Millisecond)
			file.Write([]byte("Hello"))
		}
	}()

	var counter int
loop:
	for {
		select {
		case <-fileName:
			counter++
		case <-time.After(500 * time.Millisecond):
			break loop
		}
	}

	if counter != 3 {
		t.Fatal("watcher haven't sent the 3 write events")
	}
}
