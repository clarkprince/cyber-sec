package main

import (
	"strconv"

	"trout.software/kraken/webapp/hub/msg"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

func FilterWidget(ctx Context) Widget {
	input := Get(`<input type="text" placeholder=".*" data-testid="regexp-filter" class="ml-1 py-1 px-2.5 grow bg-transparent">`)
	if s := _viewport(ctx).search; s != nil {
		input.AddAttr("value", s.String())
	}

	return W(Get(`<div class="w-80 my-1 shrink-0 vbox dark:bg-neutral-800 border border-zinc-300 rounded-sm">`).
		AddChildren(
			input,
			Get(`<button type="button" class="min-w-min m-1 px-1 w-5 h-3">`).
				AddChildren(searchicon())),
		OnIntent(Change, func(ctx Context) Context { return filterView(ctx, R1(ctx)) }))

}

// When lioli is not empty, but the view is empty
// typically after filtering all data during a frontend search
func EmptyViewport(ctx Context) *Node {
	return Get(`<div class="flex flex-col items-baseline">`).
		AddChildren(
			Get(`<p class="text-md dark:text-gray-200">All has been filtered out</p>`),
			W(btn1().AddClasses("h-6").
				SetText("Reset filter"),
				OnIntent(Click, func(ctx Context) Context { return filterView(ctx, "") }),
			).Build(ctx))

}

func ProgressBar(ctx Context) *Node {
	vp := _viewport(ctx)
	progress := 0
	if vp.records.Len() > 0 {
		progress = 100 * (vp.offset + vp.maxLinesInView()) / vp.records.Len()
	}
	if progress < 1 || vp.records.Len() <= vp.maxLinesInView() {
		return Nothing()
	}
	// edge case when we reach the end
	if progress > 100 {
		progress = 100
	}
	return Get(`<div class="rounded h-2 w-full bg-neutral-200">`).
		AddChildren(
			Get(`<div class="rounded h-2 bg-blue-200">`).AddAttr("style", "{width:"+strconv.Itoa(progress)+"%;}"),
		)
}

func titleEditor(ctx Context) *Node {
	return Get(`<input type="text" class="ml-1 py-1 px-2.5 w-64 right-10 mt-8 bg-transparent dark:text-neutral-200 italic border-b border-color text-zinc-300 focus:text-zinc-600 dark:focus:text-neutral-200">`).AddAttr("value", _cell(ctx).Title).
		OnIntent(Change, func(ctx Context) Context {
			title := R1(ctx)
			_cell(ctx).trans <- func(m *msg.Cell) { m.Title = title }
			return ctx
		})
}
