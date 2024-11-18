package hub

import (
	"fmt"
	"log"
	"os"

	"github.com/fsnotify/fsnotify"
	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/internal/multierr"
)

type WEntity struct {
	ID        string
	StreamID  string
	Offset    int64
	Notebooks []string
	IsRunning bool
}

func (w *WEntity) MarshalBinary() ([]byte, error) {
	type W WEntity
	return cbor.Marshal((*W)(w))
}
func (w *WEntity) UnmarshalBinary(data []byte) error {
	type W WEntity
	return cbor.Unmarshal(data, (*W)(w))
}

func addFilesToWatcher(files []string, w *fsnotify.Watcher) error {
	var errors multierr.E
	if len(files) < 1 {
		return append(errors, fmt.Errorf("must specify at least one file to watch"))
	}

	for _, file := range files {
		st, err := os.Lstat(file)
		if err != nil {
			errors = append(errors, err)
			continue
		}
		if st.IsDir() {
			errors = append(errors, err)
			continue
		}

		err = w.Add(file)
		if err != nil {
			errors = append(errors, err)
			continue
		}
	}
	return nil
}

func watchForEvent(w *fsnotify.Watcher, files []string, watched chan string) {
	for {
		select {
		case err, ok := <-w.Errors:
			if !ok { // Channel was closed (i.e. Watcher.Close() was called).
				return
			}
			log.Print(err)

		case e, ok := <-w.Events:
			if !ok { // Channel was closed (i.e. Watcher.Close() was called).
				return
			}

			var found bool
			for _, f := range files {
				if f == e.Name {
					found = true
				}
			}

			if !found || !e.Has(fsnotify.Write) {
				continue
			}
			watched <- e.Name
		}
	}
}
