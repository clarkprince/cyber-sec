package main

import (
	. "trout.software/kraken/webapp/rx-browser/rx"
)

func btn1() *Node {
	return Get(`<button type="button" 
		class="rounded-sm text-xs p-1 border border-zinc-300 black dark:bg-neutral-600 dark:white">`)
}
