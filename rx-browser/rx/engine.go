package rx

import (
	"log/slog"
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/rand"
)

var noActionRandEnabled = features.HasFlag("randnoaction")

type Engine struct {
	Actions chan Action
	XAS     chan XAS

	buf  XAS
	free chan XAS

	cnt Counter

	logger     *slog.Logger
	genHandler *genLogHandler

	// access to all below is protected by inrenderpass Javascript lock

	// these remember the previous state
	et  etree
	gen int
	g0  *vctx

	Root   Widget
	Screen Coord
	// derived from jsWorld
	// @see rx-browser/main_js.go
	CallFrame
}

// New initializes a rendering engine, rooted at root.
// The second value is a start function, to execute when rendering the engine:
//
//	ngx, start := rx.New()
//	// finish initialization with ngx
//	start()
func New(root Widget) (*Engine, func()) {
	ng := &Engine{
		XAS:        make(chan XAS),
		free:       make(chan XAS),
		Actions:    make(chan Action), // protect the call frame until processed
		Root:       root,
		genHandler: newLogHandler(),
	}
	ng.logger = slog.New(ng.genHandler)

	go func() {
		for act := range ng.Actions {
			if xas := ng.turncrank(act); xas != nil {
				ng.XAS <- xas
				ng.buf = <-ng.free // wait for the Return of the Buffer
			}

			// Note about the order: the continuation must be called synchronously
			// so we can set correctly drag and drop data [dnd].
			// Still, we make sure that the continuation happens after the view is updated.
			// This is also happeninig even if no rendering happens (the NoAction context).
			//
			// [dnd] https://html.spec.whatwg.org/multipage/dnd.html#concept-dnd-rw
			if ng.Continuation != nil {
				ng.Continuation <- ng.CallFrame
			}

			ng.CallFrame = CallFrame{} // clear allow reacting to non-UI event
		}
	}()

	// empty action primes the loop

	return ng, func() { ng.Actions <- func(c Context) Context { return WithValue(c, RootKey, root) } }
}

func Mouse_(ctx Context) Coord         { return ctx.ng.Mouse }
func Screen_(ctx Context) Coord        { return ctx.ng.Screen }
func Point_(ctx Context) int           { return ctx.ng.Point }
func Entity_(ctx Context) Entity       { return ctx.ng.Entity }
func Actions_(ctx Context) chan Action { return ctx.ng.Actions }
func Modifers_(ctx Context) Modifiers  { return ctx.ng.Modifiers }
func Logger_(ctx Context) *slog.Logger { return ctx.ng.logger }

// Coordinate of any object in the viewport
//
// As per UI convention, X is left to right, and Y is top to bottom
type Coord struct{ X, Y int }
type Action func(Context) Context
type Widget interface{ Build(Context) *Node }
type Modifiers struct{ CTRL, SHIFT, ALT bool }

// WidgetFunc represents the simples form of a widget, without state, nor handlers.
type WidgetFunc func(Context) *Node

func (f WidgetFunc) Build(ctx Context) *Node { return f(ctx) }

// turncrank executes all the systems in turn, and returns a virtual machine for the Javascript code to execute.
// The render loop is not supposed to be executed solely based on a timing (e.g. every 60ms), but instead react to intents.
func (ng *Engine) turncrank(act Action) XAS {
	defer func() {
		if r := recover(); r != nil {
			ng.genHandler.Dump()
			panic(r)
		}
		ng.genHandler.Discard()
	}()

	ctx := act(Context{ng: ng, vx: ng.g0})
	if ctx == NoAction {
		if !randPick() {
			return nil
		}
		ng.logger.Debug("executing despite NoAction")
		ctx = Context{ng: ng, vx: ng.g0}
	}

	nd := ng.Root.Build(ctx)
	ng.buf = serialize(nd, &ng.et, &ng.cnt, ng.buf[:0]).AddInstr(OpTerm)

	ng.g0 = ctx.vx
	ng.et.ngen()
	ng.gen++
	ng.cnt = Counter(ng.gen & 1)
	FreePool()

	return ng.buf
}

func randPick() bool {
	if !noActionRandEnabled {
		return false
	}

	return rand.Uint32()&0xF == 0 // once in every 16 loop
}

// ReleaseXAS is used by the main routine to prevent too much allocations
func (ng *Engine) ReleaseXAS(buf XAS) { ng.free <- buf }

func (ng *Engine) ReactToIntent(cf CallFrame) {
	do := func(ctx Context) Context {
		if cf.Gen != ng.gen {
			return ctx
		}
		ng.CallFrame = cf

		var h intentHandler
		for _, nt := range ng.et.parents(cf.Entity) {
			if nt.hdl[cf.IntentType] != nil {
				h = nt.hdl
				break
			}
		}

		if h[cf.IntentType] == nil {
			return NoAction
		}
		return h[cf.IntentType](ctx)

	}

	ng.Actions <- Action(do)
}

type IntentType int

//go:generate stringer -type IntentType
//go:generate rxabi -type IntentType

const (
	NoIntent IntentType = iota
	Click
	DoubleClick
	DragStart
	DragOver
	DragEnd
	Drop
	EscPress
	Scroll
	Filter
	Change
	Blur
	ChangeView
	CellIDChange
	ShowDebugMenu
	Seppuku // must be last, used to size intentHandler
	// run "go generate ./..." after updating this list
)

type Entity = uint32

type Counter Entity

func (c *Counter) Inc() Entity { *c += 2; return Entity(*c) }

// TODO(rdo) animation in renderloop
// https://www.notion.so/wiggly-trout-software/Client-Architecture-128b4ef941b644a98f28d71904632aad#14429d96ccc44cc59b8826ef4649aa0a
