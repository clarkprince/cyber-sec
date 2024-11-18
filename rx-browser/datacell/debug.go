package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"runtime/pprof"

	"trout.software/kraken/webapp/internal/txtar"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

func debugmenu() *Node {
	return Get(`<div class="z-10 center-float border bg-white flex flex-col absolute flex-auto w-32 h-60">`).AddChildren(
		Get(`<button type="button">Dump LioLi</button>`).OnIntent(Click, DumpCurrentLioLi),
		Get(`<button type="button">Allocations Profile</button>`).OnIntent(Click, RequestPProf),
	)
}

func DumpCurrentLioLi(ctx Context) Context {
	_cell(ctx).debugMenu = false // clean up

	r, w := Pipe()
	go func() {
		buf := bufio.NewWriter(w)
		vp := _viewport(ctx)

		mfst, _ := json.Marshal(_cell(ctx).Cell)

		x := &txtar.Archive{
			Comment: []byte(fmt.Sprintf("extract from %s (%s) ", _cell(ctx).Title, _cell(ctx).DataSource)),
			Files: []txtar.File{
				{Name: "manifest", Data: mfst},
				{Name: "records", Data: []byte(vp.lioli.DumpLORTH())},
			},
		}
		io.Copy(buf, bytes.NewReader(txtar.Format(x)))
		buf.Flush()
		w.Close()
	}()
	S1(ctx, "trigger-download")
	S2(ctx, "grammar_"+_cell(ctx).String())
	S3(ctx, r)
	return NoAction
}

func RequestPProf(ctx Context) Context {
	r, w := Pipe()
	go func() {
		buf := bufio.NewWriter(w)
		pprof.Lookup("allocs").WriteTo(buf, 0)
		buf.Flush()
		w.Close()
	}()
	S1(ctx, "trigger-download")
	S2(ctx, "pprof_allocs")
	S3(ctx, r)
	return NoAction
}
