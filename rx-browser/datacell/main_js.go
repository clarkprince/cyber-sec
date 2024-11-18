package main

import (
	"encoding/json"
	"flag"
	"log"
	"log/slog"
	"os"
	"strconv"
	"syscall/js"

	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/rx-browser/rx"
)

// toGenericMap transform an array of bool into map[string]interface{}
// needed for js.ValueOf
func toGenericMapBool(m map[string]bool) map[string]interface{} {
	gen := make(map[string]interface{})
	for k, v := range m {
		gen[k] = v
	}
	return gen
}

func main() {
	// file name in logs makes debugging easier
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	if env := os.Getenv("LOGLEVEL"); env != "" {
		var l slog.Level
		if err := l.UnmarshalText([]byte(env)); err != nil {
			log.Fatal("Invalid log level: ", env)
		}
		rx.LogLevel.Set(l)
	}

	var m msg.Cell
	flag.Var(&m, "manifest", "metadata of the cell")
	flag.Parse()

	if m.DataSource.IsZero() || m.Notebook.IsZero() {
		log.Fatal("Data source and notebook must be provided")
	}

	upd := make(chan msg.Cell, 1) // don’t block on write

	cell := NewCell(m)
	ngx, start := rx.New(cell)
	cell.WireEngine(ngx, upd)

	go func() {
		for m := range upd {
			dt, _ := json.Marshal(m)
			js.Scope().Call("updateManifest", string(dt))
		}
	}()

	width, err := strconv.Atoi(os.Getenv("WIDTH"))
	if err != nil {
		log.Println("invalid width", os.Getenv("WIDTH"), err)
	}

	height, err := strconv.Atoi(os.Getenv("HEIGHT"))
	if err != nil {
		log.Println("invalid height", os.Getenv("HEIGHT"), err)
	}
	ngx.Screen = rx.Coord{X: width, Y: height}

	buildView := js.Scope().Get("buildView")
	uintArr := js.Global().Get("Uint8Array")

	js.Scope().Set("updateGo", js.FuncOf(func(this js.Value, args []js.Value) any {
		evt := args[0].Int()
		// terminate early
		if rx.IntentType(evt) == rx.Seppuku {
			close(ngx.XAS)
			return js.Null()
		}

		cf := rx.CallFrame{
			Entity:     uint32(args[1].Int()),
			IntentType: rx.IntentType(evt),
		}
		world := args[2]

		cf.Gen = world.Get("gen").Int()
		cf.Point = world.Get("point").Int()
		cf.Mouse = rx.Coord{X: world.Get("mouse").Index(0).Int(), Y: world.Get("mouse").Index(1).Int()}
		regs := world.Get("registers")
		for i := 0; i < 4; i++ {
			cf.Registers[i] = regs.Index(i)
		}
		cf.Modifiers = struct {
			CTRL  bool
			SHIFT bool
			ALT   bool
		}{
			CTRL:  world.Get("modifiers").Index(0).Bool(),
			SHIFT: world.Get("modifiers").Index(1).Bool(),
			ALT:   world.Get("modifiers").Index(2).Bool(),
		}

		if cont := world.Get("continuation"); !cont.IsUndefined() {
			cf.Continuation = make(chan rx.CallFrame)
			go ngx.ReactToIntent(cf)
			cf := <-cf.Continuation
			args := js.Global().Get("Array").New()
			args.Call("push", cf.Returns[0])
			args.Call("push", cf.Returns[1])
			args.Call("push", cf.Returns[2])
			args.Call("push", cf.Returns[3])
			cont.Invoke(args)
		} else {
			go ngx.ReactToIntent(cf)
		}
		return js.Null()
	}))

	js.Global().Set("goFlags", js.FuncOf(func(this js.Value, args []js.Value) any {
		return js.ValueOf(toGenericMapBool(features.Flags))
	}))

	start()
	for vm := range ngx.XAS {
		prog := uintArr.New(len(vm))
		js.CopyBytesToJS(prog, vm)
		ngx.ReleaseXAS(vm)
		buildView.Invoke(prog)
	}
}
