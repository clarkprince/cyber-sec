package main

import (
	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/mdt"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

var HasWindowFunctions = features.HasFlag("windowfuncs")

type Rows struct {
	keep map[mdt.Position]Entity
	sel  Selection
}

func _rows(ctx Context) *Rows {
	if r := Value(ctx, RowsKey); r != nil {
		return r.(*Rows)
	}

	return &Rows{keep: make(map[mdt.Position]Entity)}
}

func _selection(ctx Context) Selection { return _rows(ctx).sel }

func _select(ctx Context, p mdt.Position) Context {
	r := _rows(ctx)
	r.sel = Selection{p}
	return WithValue(ctx, RowsKey, r)
}

func _multiselect(ctx Context, p mdt.Position) Context {
	r := _rows(ctx)
	if r.sel.includes(p) {
		for i, v := range r.sel {
			if v == p {
				r.sel = append(r.sel[:i], r.sel[i+1:]...)
			}
		}
		return WithValue(ctx, RowsKey, r)
	}
	r.sel = append(r.sel, p)
	return WithValue(ctx, RowsKey, r)
}

// selectFromPoint updates the current selection based on the point
// adding the point to multiselection if CTRL is pressed
// or changing the selection
func selectFromPoint(ctx Context) Context {
	switch {
	default:
		return _select(ctx, mdt.Position(Point_(ctx)))
	case Modifers_(ctx).CTRL:
		return _multiselect(ctx, mdt.Position(Point_(ctx)))
	case Modifers_(ctx).SHIFT && HasWindowFunctions:
		_viewport(ctx).window[0] = _selection(ctx)[0]
		_viewport(ctx).window[1] = mdt.Position(Point_(ctx))
		Logger_(ctx).Debug("selecting window", "window", _viewport(ctx).window)
		return _select(ctx, 0)
	}
}

// during a drag and drop, select the underlying node
// so user can have visual feedback
// It's important to return "DoNothing" if the selection didn't change
// to avoid unexpected re-renders
func selectDropzone(ctx Context) Context {
	r := _rows(ctx)
	p := mdt.Position(Point_(ctx))
	if len(r.sel) == 1 && r.sel.includes(p) {
		return DoNothing(ctx)
	}
	return _select(ctx, p)
}

// Table view for the lioli
// Will NOT display separators
// Display all columns found in the lioli
// This include columns not visible in current viewport
// but exclude columns in the grammar but not found in the lioli
func trows(ctx Context) *Node {
	rows, vp := _rows(ctx), _viewport(ctx)
	dst := make([]*Node, vp.maxLinesInView())
	i, rc := 0, 0
	win := [2]int{-1, -1}

	for iter := vp.Iter(); iter.Next(); {
		if nt, ok := rows.keep[iter.Pos()]; ok {
			dst[i] = ReuseFrom(ctx, nt)
			rows.keep[iter.Pos()] = dst[i].Entity
			rc++
		} else {
			dst[i] = recordtr(ctx, iter)
		}

		i++
	}

	Logger_(ctx).Debug("rendering table view",
		"lines_count", i,
		"reuse_count", rc,
		"window", win,
	)
	if win[0] == -1 {
		return Get(`<div role="rowgroup" aria-label="log records">`).
			AddChildren(dst[:i]...)
	} else {
		return Nothing(
			Get(`<div role="rowgroup" aria-label="log records">`).
				AddChildren(dst[:win[0]]...),
			Get(`<div class="border-zinc-400 border-l-4 border-y rounded-s-sm">`).AddChildren(
				Get(`<div role="rowgroup" aria-label="log records">`).
					AddChildren(dst[win[0]:win[1]]...),
			),
			Get(`<div role="rowgroup" aria-label="log records">`).
				AddChildren(dst[win[1]:i]...),
		)
	}
}

func (r *Rows) Keep(p mdt.Position, nt Entity) { r.keep[p] = nt }
func (r *Rows) Release() {
	for k := range r.keep {
		delete(r.keep, k)
	}
}
