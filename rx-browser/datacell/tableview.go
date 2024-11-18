package main

import (
	"strconv"
	"strings"

	"trout.software/kraken/webapp/internal/features"
	"trout.software/kraken/webapp/internal/mdt"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

var ShowNestedRecords = features.HasFlag("nestedrecords")
var ExpandRecordsFeature = !features.HasFlag("kill-expandedrecords")

type tableview struct {
	showMenu  bool
	menuStart int
}

func _tableview(ctx Context) *tableview {
	if t := Value(ctx, TableViewKey); t != nil {
		return t.(*tableview)
	}
	return new(tableview)
}

func (v tableview) Build(ctx Context) *Node {
	vp := _viewport(ctx)
	if vp.records.Len() == 0 {
		return EmptyViewport(ctx)
	}

	visiblecols := _viewport(ctx).fields.Columns(isShown)
	if len(visiblecols) == 0 {
		return Get(`<p class="italic relative">No columns are currently visible</p>`).AddChildren(recordmenu(ctx))
	}

	Logger_(ctx).Debug("building table view",
		"records_count", vp.records.Len(),
		"columns_visible_count", len(visiblecols))
	return Get(`<div role="table" class="w-full text-left h-[38rem]">`).
		AddChildren(
			theaders(ctx, visiblecols),
			// tbodylocked(ctx), // selected records if any
			trows(ctx),
		)
}

func theaders(ctx Context, headercols []int) *Node {
	headers := make([]*Node, len(headercols)+1)
	headers[0] = Get(`<div class="w-4 shrink-0">`) // matches expanded icon

	for i, col := range headercols {
		col := col // https://github.com/golang/go/discussions/56010
		field := _viewport(ctx).fields.At(col)

		nd := Get(`<div scope="col" role="columnheader" class="flex flex-row flex-none items-center overflow-clip">`).
			AddClasses(field.size.String()).
			AddAttr("aria-label", prettify(field.name))
		switch field.sorted {
		case NoSort:
			nd.AddChildren(
				Get(`<div class="w-3">`), // matches icons size
				Get(`<p class="truncate">`).SetText(prettify(field.name)),
			)
		case SortAsc:
			nd.AddChildren(
				sortedAscIndicator(""),
				Get(`<p class="truncate">`).SetText(prettify(field.name)),
			).AddAttr("aria-sort", field.sorted.AriaSort())
		case SortDesc:
			nd.AddChildren(
				sortedDescIndicator(""),
				Get(`<p class="truncate">`).SetText(prettify(field.name)),
			).AddAttr("aria-sort", field.sorted.AriaSort())
		}

		headers[i+1] = nd.OnIntent(Click, func(ctx Context) Context { return toggleSortAt(ctx, col) })
	}

	menu := recordmenu(ctx)
	view := _tableview(ctx)

	Logger_(ctx).Debug("headers rendered",
		"menu_present", view.showMenu)
	return Get(`<div role="row" class="flex flex-row items-baseline shrink-0 h-7 smallcaps bold border-b-2 order-zinc-300 cursor-pointer relative group">`).
		AddChildren(headers...).AddChildren(menu)

}

func recordmenu(ctx Context) *Node {
	view := _tableview(ctx)
	menu := btn1().
		AddClasses("absolute top-0 right-0").
		AddAttr("data-testid", "columnsbtn").
		AddChildren(elllipsisV("black")).
		OnIntent(Click, func(ctx Context) Context {
			v := _tableview(ctx)
			v.showMenu = !v.showMenu
			return WithValue(ctx, TableViewKey, v)
		})

	if view.showMenu {
		menu.AddChildren(tableColumnMenu(ctx))
	} else {
		menu.AddClasses("invisible group-hover:visible") // hide only when not visible, otherwise effect is weird
	}

	return menu
}

// prettify returns a form of the name ignoring the element paths
func prettify(name string) string {
	if strings.HasPrefix(name, "$.") {
		return name[2:]
	}
	return name
}

// Return the node representing a line
// and the node for each column
func recordtr(ctx Context, iter *mdt.LViewIterator) *Node {
	nodes := make([]*Node, _viewport(ctx).fields.Len())
	sln := _rows(ctx).sel

	for wlk := iter.WalkRecord(mdt.SkipSeparator); wlk.Next(); {
		col := wlk.Name()
		field := _viewport(ctx).fields.Get(col)
		if field == nil {
			return Nothing()
		}
		textnode := Get(`<span class="truncate">`).SetText(wlk.Value())
		recordcell := Get(`<p role="cell" class="flex-none pl-3 truncate select-none">`).
			AddClasses(field.size.String()).
			AddChildren(textnode)

		switch {
		case sln.includes(wlk.Pos()):
			recordcell.AddClasses("rounded bg-zinc-100 dark:bg-neutral-800 dark:font-semibold").
				AddAttr("aria-selected", "true").
				AddAttr("data-offset", wlk.Pos().String()).
				AddAttr("draggable", "true").
				GiveKey(ctx) // TODO(rdo) this is a bug – the way we locate currently the drop target is incorrect (lack ID)
		default:
			recordcell.
				AddAttr("data-offset", wlk.Pos().String())
		}
		nodes[_viewport(ctx).fields.Idx(col)] = recordcell
	}

	rn := Get(`<div role="row" class="text-sm whitespace-normal break-all flex flex-row items-baseline shrink-0 border-b border-zinc-300 dark:border-gray-400 cursor-pointer">`).
		AddAttr("data-offset", iter.Pos().String()).
		AddAttr("data-record", "").
		GiveKey(ctx)

	empty := true

	// keep space on the left for parsing marker
	if ExpandRecordsFeature {
		rn.AddChildren(Get(`<button class="w-min group">`).
			AddChildren(explodeicon().
				AddClasses("inline-block stroke-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0")).
			AddAttr("aria-label", "expand-line").
			OnIntent(Click, toggleRowExpand(iter.Pos())))
	} else {
		rn.AddChildren(Get(`<div class="w-2">`))
	}
	// record may not have all known columns => track absent columns and add empty cells
	fields := _viewport(ctx).fields

	for _, c := range fields.Columns(isShown) {
		if nodes[c] == nil {
			rn.AddChildren(Get(`<div role="cell" class="flex-none">`).
				AddClasses(fields.At(c).size.String()))
		} else {
			rn.AddChildren(nodes[c])
			empty = false
		}
	}

	if ExpandRecordsFeature {
		// Check if this item should be expanded

		if _viewport(ctx).rowsExpanded.Test(int(iter.Pos())) {
			rnorg := rn

			rn = Get(`<div role="group">`).AddChildren(rnorg)

			row := Get(`<div role="rowgroup" class="text-sm pb-2 pl-3 whitespace-normal break-all flex flex-col items-baseline shrink-0 border-b border-zinc-300 dark:border-gray-400 cursor-pointer">`).
				AddAttr("data-testid", "expanded-record-row")

			var wlk *mdt.RecordWalker

			if ShowNestedRecords {
				wlk = iter.WalkRecord(mdt.SkipSeparator, mdt.TraverseChildren)
			} else {
				wlk = iter.WalkRecord(mdt.SkipSeparator)
			}

			for wlk.Next() {
				indentDepth := wlk.GetDepth()

				if indentDepth > 10 {
					indentDepth = 10
				}

				indentString := "w-" + strconv.Itoa(indentDepth+1)
				indent := Get(`<div>`).AddClasses(indentString)

				valueField := Get(`<p class="break-normal">`).
					AddAttr("data-offset", wlk.Pos().String()).
					SetText(wlk.Value())

				if sln.includes(wlk.Pos()) {
					valueField.AddClasses("rounded bg-zinc-100 dark:bg-neutral-800 dark:font-semibold").
						AddAttr("aria-selected", "true").
						AddAttr("data-offset", wlk.Pos().String()).
						AddAttr("draggable", "true").
						GiveKey(ctx)
				}

				entry := Get(`<div role="row" class="flex">`).AddChildren(
					indent,
					Get(`<p class="smallcaps mr-2 break-normal">`).SetText(prettify(wlk.Name())),
					valueField,
				)
				row.AddChildren(entry)
			}

			rn.AddChildren(row)
		}
	}

	if empty {
		return Nothing()
	}

	return rn
}

func tableColumnMenu(ctx Context) *Node {
	const maxColumnsInMenu = 20

	entries := make([]*Node, maxColumnsInMenu)
	view := _tableview(ctx)
	var j int

	for i := 0; i < _viewport(ctx).fields.Len(); i++ {
		if i < view.menuStart {
			continue
		}
		c := _viewport(ctx).fields.At(i)
		sel := Get(`<input type="checkbox">`)
		if !c.hidden {
			sel.AddAttr("checked", "1")
		}

		ci := i // capture for callback…
		entries[j] = Get(`<div class="flex items-center">`).
			AddChildren(sel, Get(`<p class="px-1">`).SetText(prettify(c.name))).
			OnIntent(Click, func(ctx Context) Context {
				return _viewport(ctx).toggleVisibility(ctx, ci)
			})

		if j++; j == maxColumnsInMenu {
			break
		}
	}
	// TODO(rdo) be smarter about this
	entries = entries[:j]

	return Get(`<div class="absolute z-10 border-b border-zinc-300 top-7 right-0 bg-white dark:bg-neutral-600 p-2 drop-shadow rounded flex flex-col w-64">`).
		AddChildren(entries...).
		OnIntent(Scroll, func(ctx Context) Context {
			v := _tableview(ctx)
			step, err := strconv.Atoi(R1(ctx))
			if err != nil {
				panic("invalid interface implementation: " + err.Error())
			}

			// shift with boundaries
			v.menuStart += step
			if v.menuStart > _viewport(ctx).fields.Len()-maxColumnsInMenu {
				v.menuStart = _viewport(ctx).fields.Len() - maxColumnsInMenu
			}
			if v.menuStart < 0 {
				v.menuStart = 0
			}
			return WithValue(ctx, TableViewKey, v)
		})
}
