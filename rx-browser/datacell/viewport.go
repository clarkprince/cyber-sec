package main

import (
	"regexp"

	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/mdt"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

// ViewPort represents the portion of the lioli actually visible for the user.
// it can be changed by the offset, or the filters applied
type ViewPort struct {
	lioli mdt.LioLi

	offset int

	search  *regexp.Regexp
	sorts   intset     // keep order for multi-columns sorts
	records *mdt.LView // filtered and sorted records
	// records is a cached value of lioli.Match(search).Sort(sorts)
	// it is maintained up to date by calling updateView when search or sorts changes

	fields *Fields

	// List of expanded rows
	rowsExpanded intset

	window [2]mdt.Position

	pins   intset     // keep order of selection
	locked *mdt.LView // manually selected records (not subject to filtering or sorting)
	// locked is a cached value of lioli.Match(pins)
	// it is maintained up to date by calling updateView when pins or lioli changes
}

func _viewport(ctx Context) *ViewPort {
	if vp := Value(ctx, ViewportKey); vp != nil {
		return vp.(*ViewPort)
	}

	vp := &ViewPort{fields: new(Fields)}
	return vp
}

func (vp ViewPort) Build(ctx Context) *Node { return _tableview(ctx).Build(ctx) }

func (vp ViewPort) maxLinesInView() int {
	maxLinesInView := 25
	return maxLinesInView
}

// Iter returns all records between offset and maxLinesInView
func (vp ViewPort) Iter() *mdt.LViewIterator {
	return vp.records.Iter(vp.offset, vp.maxLinesInView())
}

func shiftView(ctx Context, by int) Context {
	vp := _viewport(ctx)
	vp.offset += by

	// block offset shift if we are going above / beyond what is possible
	// note the order of the conditionals matter, since for small lioli, we might bounce from too much to not enough.
	maxLinesInView := vp.maxLinesInView()
	if vp.offset+maxLinesInView >= vp.records.Len() {
		vp.offset = vp.records.Len() - maxLinesInView
	}
	if vp.offset < 0 {
		vp.offset = 0
	}
	return WithValue(ctx, ViewportKey, vp)
}

func filterView(ctx Context, filter string) Context {
	vp := _viewport(ctx)
	if filter == "" {
		vp.search = nil
	} else {
		r, err := regexp.Compile(filter)
		if err != nil {
			return withErr(err)(ctx)
		}
		vp.search = r
	}
	vp.offset = 0 // filtering view changes rows visible, offset makes no sense
	vp.updateView(ctx)
	go vp.persist(ctx)
	return WithValue(ctx, ViewportKey, vp)
}

func toggleSortAt(ctx Context, colidx int) Context {
	vp := _viewport(ctx)
	// rotate between: no sort > ascending > descending > no sort
	c := vp.fields.At(colidx)
	switch c.sorted {
	case NoSort:
		c.sorted = SortAsc
		vp.sorts.Add(colidx)
	case SortAsc:
		c.sorted = SortDesc
		vp.sorts.Add(colidx)
	case SortDesc:
		c.sorted = NoSort
		vp.sorts.Remove(colidx)
	}

	vp.updateView(ctx)
	return WithValue(ctx, ViewportKey, vp)
}

func (vp *ViewPort) updateView(ctx Context) {
	const fontSMSize = 14 // px per font-sm tailwind size
	width := Screen_(ctx).X / fontSMSize
	maxcols := 16
	if width < 200 {
		maxcols = 12
	}

	j := 0
	for _, idx := range vp.fields.Columns(isShown) {
		if j++; j > maxcols {
			vp.fields.At(idx).hidden = true
		}
	}

	arrangecolumns(vp.fields, width)

	filter := mdt.AllRecords
	if vp.search != nil {
		filter = func(_ mdt.Position, s string) bool {
			return vp.search.MatchString(s)
		}
	}

	vp.records = vp.lioli.
		Match(filter).
		Sort(vp.fields.Sort(vp.sorts))
	vp.locked = vp.lioli.Match(func(i mdt.Position, _ string) bool { return vp.pins.Test(int(i)) })
	Logger_(ctx).Debug("view updated",
		"screen", Screen_(ctx),
		"screen-width", width,
		"columns-stats", vp.fields.cols,
		"filter", vp.search,
		"records_count", vp.records.Len())
}

func (vp *ViewPort) togglePin(ctx Context, pos mdt.Position) Context {
	vp.pins.Add(int(pos))
	vp.updateView(ctx)
	go vp.persist(ctx)
	return WithValue(ctx, ViewportKey, vp)
}

func (vp *ViewPort) toggleVisibility(ctx Context, col int) Context {
	c := vp.fields.At(col)
	c.hidden = !c.hidden
	vp.updateView(ctx)
	go vp.persist(ctx)
	return WithValue(ctx, ViewportKey, vp)
}

func (vp *ViewPort) persist(ctx Context) {
	_cell(ctx).trans <- func(m *msg.Cell) {
		m.Viewport = msg.Viewport{
			Pins: make([]mdt.Position, 0),
		}
		m.Viewport.Fields = make([]string, vp.fields.Len())
		j := 0
		for i := range m.Viewport.Fields {
			if !vp.fields.At(i).hidden {
				m.Viewport.Fields[j] = vp.fields.At(i).name
				j++
			}
		}
		m.Viewport.Fields = m.Viewport.Fields[:j]
		if vp.search != nil {
			m.Viewport.Search = vp.search.String()
		}
	}
}

func updateLioLi(ll mdt.LioLi) Action {
	return func(ctx Context) Context {
		vp := _viewport(ctx)
		vp.lioli = ll
		return WithValue(ctx, ViewportKey, vp)
	}
}

// updateLioli is called when we get new data from the backend
// to initialize/update the viewport
func updateManifest(mfst msg.Cell) Action {
	const lookupDist = 2000 // gives a relatively good sample
	return func(ctx Context) Context {
		vp := _viewport(ctx)
		vp.offset = 0
		// when a 204 is returned, the background sends an empty LioLi
		vp.pins = vp.pins[:0]
		vp.rowsExpanded = vp.rowsExpanded[:0]

		// capture sort by names, to carry in new UI
		oldsorts := make(map[string]SortDirection)
		for _, c := range vp.fields.cols {
			if c.sorted != NoSort {
				oldsorts[c.name] = c.sorted
			}
		}
		vp.fields.Reset()
		for it := vp.lioli.Match(mdt.AllRecords).Iter(0, lookupDist); it.Next(); {
			for w := it.WalkRecord(mdt.SkipSeparator); w.Next(); {
				c := vp.fields.Conj(w.Name())
				c.distrib.record(len(w.Value()))
				if grm, err := mfst.ParseGrammar(); err == nil {
					c.metadata = grm.Metadata(w.Name())
				}
			}
		}
		for i := 0; i < vp.fields.Len(); i++ {
			vp.fields.At(i).distrib.norm()
			vp.fields.At(i).sorted = oldsorts[vp.fields.At(i).name]
		}

		if filter := mfst.Viewport.Search; filter != "" {
			r, err := regexp.Compile(filter)
			if err != nil {
				return withErr(err)(ctx)
			}
			vp.search = r
		}

		// nothing set means everything set
		if len(mfst.Viewport.Fields) > 0 {
			for i := 0; i < vp.fields.Len(); i++ {
				vp.fields.At(i).hidden = true
			}

			for _, name := range mfst.Viewport.Fields {
				// column names might have changed if the grammar is different
				// keep what we have, user can change from the menu instead
				if c := vp.fields.Get(name); c != nil {
					c.hidden = false
				}
			}
		}

		vp.updateView(ctx)
		_cell(ctx).load = Ready
		_cell(ctx).Cell = mfst
		// TODO(rdo) pass in context
		return WithValue(ctx, ViewportKey, vp)
	}
}

func toggleRowExpand(pos mdt.Position) Action {
	return func(ctx Context) Context {
		vp := _viewport(ctx)
		if vp.rowsExpanded.Test(int(pos)) {
			vp.rowsExpanded.Remove(int(pos))
		} else {
			vp.rowsExpanded.Add(int(pos))
		}
		return WithValue(ctx, ViewportKey, _viewport(ctx))
	}
}

// intset is a set of integers remembering the insertion order
// it is optimized for small sets of sparse values, where the overhead of calculating a (even optimized) hash is greater than walking the bucket.
type intset []int

// do nothing if val is already there
func (o *intset) Add(val int) *intset {
	for _, v := range *o {
		if v == val {
			return o
		}
	}
	*o = append(*o, val)
	return o
}

func (o *intset) Test(val int) bool {
	for _, v := range *o {
		if v == val {
			return true
		}
	}
	return false
}

// do nothing if val is not there
func (o *intset) Remove(val int) *intset {
	for i, v := range *o {
		if v == val {
			*o = append((*o)[:i], (*o)[i+1:]...)
			return o
		}
	}
	return o
}
