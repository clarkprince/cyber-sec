package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/fxamacker/cbor/v2"
	"log/slog"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/mdt"
	"trout.software/kraken/webapp/internal/ulid"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

type LoadState byte

const (
	Init LoadState = iota
	WaitingForData
	Ready
)

type Cell struct {
	msg.Cell
	trans chan func(*msg.Cell)

	load LoadState
	rack PivotRack

	debugMenu bool
}

// TODO(rdo) get the manifest in context, and pass it on as single source of truth
// NewCell creates a new cell object, connected to data source ds.
func NewCell(m msg.Cell) *Cell {
	c := &Cell{
		Cell:  m,
		rack:  NewRack(m),
		trans: make(chan func(*msg.Cell)),
		load:  WaitingForData,
	}

	return c
}

// WireEngine makes sure the cell can react to server-side events
func (c *Cell) WireEngine(ng *Engine, upd chan msg.Cell) {
	go watchForManifest(c.Cell, c.trans, upd, ng.Actions)
	go watchForPivots(ng.Actions, c.rack.updates)
	c.trans <- func(m *msg.Cell) {
		m.DataSource = c.DataSource
		m.Notebook = c.Notebook
		m.ID = c.ID
		m.ForceReload = true
	}
}

func (cell *Cell) Build(ctx Context) *Node {
	if err := Value(ctx, ErrorKey); err != nil {
		log.Printf("Unexpected error when rendering cell: %s", err)
		return RefreshWidget(ctx, cell.trans).Build(ctx)
	}

	if cell.load == WaitingForData {
		// TODO probably want to keep the existing data visible while we load
		return W(Get(`<p aria-busy="true" class="h-full animate-pulse py-1 px-10 flex flex-col justify-evenly">
				<div class="h-5 my-1 bg-zinc-200 rounded"></div>
				<div class="h-5 my-1 bg-zinc-200 rounded"></div>
				<div class="h-5 my-1 bg-zinc-200 rounded"></div>
				<div class="h-5 my-1 bg-zinc-200 rounded"></div></p>`),
			OnIntent(CellIDChange, func(ctx Context) Context {
				param := R1(ctx)
				id, err := ulid.Parse(param)
				if err != nil {
					return ctx
				}
				cell.trans <- func(m *msg.Cell) { m.ID = id }
				return ctx
			})).Build(ctx)
	}

	// empty cell
	if _viewport(ctx).lioli.Empty() {
		return Get(`<div class="p-5 text-zinc-700 dark:text-gray-200">`).AddChildren(
			cell.rack.Build(ctx),
			Get(`<p class="text-md py-8 text-lg italic">No data to display</p>`),
		)
	}

	filter := FilterWidget(ctx)
	csvbtn := CSVExport(ctx)

	debug := Nothing()
	if _cell(ctx).debugMenu {
		debug = debugmenu()
	}

	controls := Get(`<div class="flex flex-row items-center group gap-1" data-testid="cell-controls">`).
		AddChildren(
			cell.rack.Build(ctx),
			csvbtn,
			PatternEditorButton(ctx),
			filter.Build(ctx),
			debug,
		)

	patternEditor := Nothing()
	if _patternEditorVisible(ctx) {
		patternEditor = PatternEditor(ctx)
	}

	tview := _tableview(ctx).Build(ctx).
		OnIntent(Click, selectFromPoint).
		OnIntent(DoubleClick, applyPivotFromPoint).
		OnIntent(DragOver, selectDropzone).
		OnIntent(Drop, applyPivot).
		OnIntent(Scroll, func(ctx Context) Context {
			step, err := strconv.Atoi(R1(ctx))
			if err != nil {
				panic("invalid interface implementation: " + err.Error())
			}
			return shiftView(ctx, step)
		}).
		OnIntent(DragStart, func(ctx Context) Context {
			q, err := json.Marshal("|= " + strconv.Quote(_viewport(ctx).lioli.ValueOf(_selection(ctx)[0])))
			sel := _selection(ctx)
			if len(sel) > 1 {
				p := make([]string, len(sel))
				for i, s := range sel {
					p[i] = strconv.Quote(_viewport(ctx).lioli.ValueOf(s))
					_rows(ctx).Keep(s, Entity_(ctx))
				}
				q, err = json.Marshal("|= " + strings.Join(p, ","))
			} else {
				_rows(ctx).Keep(_selection(ctx)[0], Entity_(ctx))
			}
			if err != nil {
				log.Fatal("invalid selection", err)
			}
			dt, err := json.Marshal(Pivot{
				PivotDefinition: msg.PivotDefinition{Type: "pivot:piql:piql"},
				Value:           q,
			})
			if err != nil {
				log.Fatal("invalid pivot", err)
			}
			S1(ctx, string(dt))
			S2(ctx, _viewport(ctx).lioli.PathOf(_selection(ctx)[0]))
			return NoAction
		}).
		OnIntent(DragEnd, func(ctx Context) Context {
			_rows(ctx).Release()
			return NoAction
		})

	// TODO(rdo) handle focus lost
	return Get(`<div class="p-5 relative" role="grid">`).
		AddChildren(
			controls,
			patternEditor,
			// ProgressBar(ctx),
			Get(`<div class="overflow-hidden py-2 text-sm dark:text-gray-200">`).AddChildren(tview),
			titleEditor(ctx),
		).OnIntent(ShowDebugMenu, func(ctx Context) Context {
		log.Println("show debug menu")
		_cell(ctx).debugMenu = true
		return ctx
	})
}

func _cell(ctx Context) *Cell { return Value(ctx, RootKey).(Widget).(*Cell) }

// TODO(rdo) per-component instead? or specific component?
func withErr(err error) func(Context) Context {
	return func(ctx Context) Context {
		if err == nil {
			return ctx
		}
		return WithValue(ctx, ErrorKey, err)
	}
}

// When a new transform is applied to the manifest,
// notify the backend
// and if necessary update the lioli
// TODO(rdo) passing a pointer is gross, use channels properly instead
func watchForManifest(mfst msg.Cell, trans chan func(*msg.Cell),
	upd chan msg.Cell, pw chan Action) {
	// help with forgetful devs
	defer func() {
		panic("returned (or panicked) from manifest transform. Did you use 'return' instead of 'continue'?")
	}()

	for tr := range trans {
		mfst.ForceReload = false // prevent spurious reloads

		tr(&mfst)

		var buf bytes.Buffer
		if err := json.NewEncoder(&buf).Encode(mfst); err != nil {
			slog.Error("cannot serialize manifest", "error", err)
			continue
		}

		// TODO: there might be a race condition here, _cell(ctx) is not defined
		// yet it is defined when we put the cell back in "Ready" state
		// => this means each component has to put the cell into "WaitingForData" mode, see "pivots.go"
		//pw <- func (ctx Context) Context { _cell(ctx).load = WaitingForData; return ctx }
		rsp, err := http.Post("/api/notebook/data", "application/json", &buf)
		if err != nil {
			slog.Error("cannot contact server", "err", err)
			pw <- withErr(err)
			continue // no refresh expected, manual action it is
		}
		var lioli mdt.LioLi
		switch rsp.StatusCode {
		case http.StatusOK:
			err = cbor.NewDecoder(rsp.Body).Decode(&lioli)
			rsp.Body.Close()
			if err != nil {
				slog.Error("cannot read the LioLi", "err", err)
				pw <- withErr(err)
				continue // no refresh expected, manual action it is
			}
			pw <- updateLioLi(lioli)
			// fallthrough to update the manifest
		case http.StatusNoContent:
			// fallthrough to update the manifest
		default:
			rsp.Body.Close()
			pw <- withErr(fmt.Errorf("invalid server status: %s", rsp.Status))
			continue // no refresh expected, manual action it is
		}
		upd <- mfst
		pw <- updateManifest(mfst)
	}
}
