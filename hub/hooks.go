package hub

import (
	"encoding/json"
	"errors"
	"reflect"

	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

var hooksLogger = tasks.NewLogger("hooks")

type CheckCellFailEvent struct {
	PlaybookID ulid.ULID
	CellID     ulid.ULID
}

var (
	_hooks = make(map[string][]any) // func (T)

	checkCellFailHook = registerHook[CheckCellFailEvent]()
)

// AddToHook adds a function to be run when a specific event happen.
// The type of event taken as first argument of the function defines the exact hook.
func AddToHook(h any) {
	tn := reflect.TypeOf(h).In(0).Name()

	hs, ok := _hooks[tn]
	if !ok {
		panic("no hook for type: " + tn)
	} else {
		_hooks[tn] = append(hs, h)
	}
}

func registerHook[T any]() func(T) {
	name := namefor[T]()
	_hooks[name] = []any{}

	return func(t T) {
		hooksLogger.Debug("running hook",
			"hook", name,
			"event", t)
		// TODO(rdo) sampling of call stacks
		for _, h := range _hooks[name] {
			go h.(func(T))(t)
		}
	}
}

func namefor[T any]() string { return reflect.TypeOf((*T)(nil)).Elem().Name() }

var ObsRunHook = sqlite.RegisterFunc("obs_runhook", func(name string, value []byte) error {
	switch name {
	case namefor[CheckCellFailEvent]():
		var ev CheckCellFailEvent
		if err := json.Unmarshal(value, &ev); err != nil {
			return err
		}
		checkCellFailHook(ev)
	default:
		return errors.New("no such hook: " + name)
	}

	return nil
})
