package main

import (
	"trout.software/kraken/webapp/hub/msg"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

func RefreshWidget(ctx Context, tr chan func(*msg.Cell)) Widget {
	return Get(`
	<div class="refresh-widget my-8 flex flex-row justify-center">
		</div>
	`).
		AddChildren(
			Get(`<div class="flex flex-col items-center p-2 pl-3 pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
		</div>`).
				AddChildren(
					Get(`<p class="text-sm font-medium">Seems there is an issue connecting to the data source</p>`),
					Get(`<p class="mt-1 text-sm">Perhaps a bad configuration?</p>`),
					Get(`<button classes="mt-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Refresh</button>`).
						OnIntent(Click, func(bc Context) Context {
							tr <- func(m *msg.Cell) {
								m.ForceReload = true
							}
							return bc
						})))
}
