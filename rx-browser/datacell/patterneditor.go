package main

import (
	"fmt"
	"strings"
	"time"

	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/mdt"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

func exampleLine(ctx Context) string {
	vp := _viewport(ctx)
	switch {
	case len(_selection(ctx)) > 0:
		iter := vp.Iter()
		first := _selection(ctx)[0]
		for iter.Next() {
			lo, hi := iter.Range()
			if lo <= first && first <= hi {
				return iter.Record().String()
			}
		}

		return "" // should not happen
	case vp.records.Len() > 0:
		// or if none exist, the first one in the records is fine
		// use the first lioli line to initialize pattern creation
		iter := vp.Iter()
		iter.Next()
		return iter.Record().String()
	default:
		// no data, can't initialize parsing
		return ""
	}

}

func parsingPreview(ctx Context, pattern string, line string) *Node {
	preview := Get(`<p class="rounded italic text-xs flex items-end">`)
	if pattern == "" {
		return preview.SetText(line)
	}

	g, err := mdt.CompilePattern(pattern)
	if err != nil {
		return preview.
			AddClasses("bg-orange-600").
			SetText(fmt.Sprintf("The pattern is invalid: %v", err))
	}
	Logger_(ctx).Debug("compile pattern to grammar",
		"pattern", pattern,
		"grammar", g.PrettyPrint("root"))
	r, ok := mdt.ReadLine(g, []byte(line))
	if !ok {
		return preview.
			AddClasses("bg-orange-600").
			AddChildren(
				Text("text-white", "The record can't be parsed, you may need to replace a variable by '<_>' or add some separators."),
			)
	}

	for w := r.WalkRoot(); w.Next(); {
		if w.IsSeparator() {
			preview.AddChildren(
				Get(`<span>`).SetText(w.Value()))
			continue
		}

		if probablyADate(w.Name()) && g.Metadata(w.Name()) != "" {
			ts, err := time.Parse(g.Metadata(w.Name()), w.Value())
			Logger_(ctx).Debug("parsed time",
				"origin", w.Value(),
				"found", ts.String())
			if err != nil {
				preview.AddChildren(
					Get(`<div class="inline-flex flex-col border-x border-t rounded-t-sm border-zinc-400">`).AddChildren(
						Get(`<p class="border-b border-zinc-400 bg-orange-400 text-center truncate">`).SetText(fmt.Sprint(w.Name(), ":", err.Error())),
						Get(`<span class="not-italic">`).SetText(w.Value()),
					))
				continue
			}
		}

		preview.AddChildren(
			Get(`<div class="inline-flex flex-col border-x border-t rounded-t-sm border-zinc-400">`).AddChildren(
				Get(`<p class="border-b border-zinc-400 text-center truncate">`).SetText(w.Name()),
				Get(`<span class="not-italic">`).SetText(w.Value()),
			))

	}
	return preview
}

func probablyADate(name string) bool {
	return strings.Contains(name, "date") || strings.Contains(name, "ts") || strings.Contains(name, "timestamp")
}

func PatternEditor(ctx Context) *Node {
	line := exampleLine(ctx)
	pattern, haspat := _tentativePattern(ctx)
	if !haspat {
		pattern = _cell(ctx).Pattern
	}

	input := Get(`<input class="pl-1 mr-2 border-b border-zinc-100 dark:bg-neutral-800 grow" type="text">`)
	if len(pattern) != 0 {
		input.AddAttr("value", pattern).GiveKey(ctx)
	} else {
		input.AddAttr("placeholder", "use <value> to capture, <_> to ignore").GiveKey(ctx)
	}

	return Get(`<div class="my-2 p-2 border border-zinc-200 drop-shadow-sm">`).
		AddChildren(
			Get(`<div data-testid="patterneditor" class="text-sm italic vbox dark:text-gray-200">`).
				AddChildren(
					Get(`<label class="mr-2">`).SetText("pattern:").
						AddAttr("for", fmt.Sprint(input.Entity)),
					input.OnIntent(Change, previewPattern),
					btn1().SetText("Apply").OnIntent(Click, applyPattern),
				),
			GetNode("div").
				AddChildren(parsingPreview(ctx, pattern, line)),
		)
}

func PatternEditorButton(ctx Context) *Node {
	btn := btn1().
		AddAttr("aria-label", "Edit Pattern").
		AddChildren(pencilicon()).
		OnIntent(Click, func(ctx Context) Context {
			return togglePatternEditor(ctx)
		})

	if _patternEditorVisible(ctx) {
		btn.AddClasses("p-2")
	} else {
		btn.AddClasses("p-2 invisible group-hover:visible")
	}

	return btn
}

func togglePatternEditor(ctx Context) Context {
	if _patternEditorVisible(ctx) {
		return WithValue(ctx, OverlayKey, "")
	}
	return WithValue(ctx, OverlayKey, "pattern-editor")
}

func _patternEditorVisible(ctx Context) bool {
	v := Value(ctx, OverlayKey)
	return v != nil && v.(string) == "pattern-editor"
}

func _tentativePattern(ctx Context) (string, bool) {
	v := Value(ctx, PatternKey)
	if v == nil {
		return "", false
	}
	return v.(string), true
}

func previewPattern(ctx Context) Context {
	if R1(ctx) == _cell(ctx).Pattern {
		return NoAction
	}
	pattern := R1(ctx)
	return WithValue(ctx, PatternKey, pattern)
}

func applyPattern(ctx Context) Context {
	pattern, _ := _tentativePattern(ctx)
	if pattern == _cell(ctx).Pattern {
		return WithValue(ctx, OverlayKey, "")
	}

	_cell(ctx).trans <- func(m *msg.Cell) {
		m.Pattern = pattern
		m.Viewport.Fields = []string{} // reset viewport fields, they might not exist
	}
	return WithValue(ctx, OverlayKey, "")
}
