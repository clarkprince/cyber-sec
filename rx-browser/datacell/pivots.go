package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"unicode/utf8"

	"log/slog"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/internal/ulid"
	. "trout.software/kraken/webapp/rx-browser/rx"
)

type Pivot struct {
	msg.PivotDefinition
	msg.PivotApplication

	// copy here of the hub, but with a different flair => handle it for view and edit
	// will be equal to the pivot name for piql queries
	Value json.RawMessage `json:"value"`

	// error report to the user
	err string
	// for sorted insert
	next *Pivot
}

func (p Pivot) ValueString() string {
	if p.Type == "pivot:piql:piql" {
		str, err := strconv.Unquote(string(p.Value))
		if err != nil {
			log.Printf("Error while reading PiQL value: %v", err)
			return ""
		}
		return str
	}
	panic("value string not supported for non PiQL pivot")
}

// ID can be null in definition or application => handle all logic
func (p Pivot) ID() ulid.ULID {
	if p.PivotDefinition.ID.IsZero() {
		return p.PivotApplication.Pivot
	}
	return p.PivotDefinition.ID
}

type PivotRack struct {
	pivots *Pivot
	keep   map[ulid.ULID]Entity
	// single value being edited
	edit ulid.ULID

	updates chan pivotUpdate
}

func _pivotrack(ctx Context) *PivotRack {
	r := &_cell(ctx).rack
	return r
}

type pivotUpdate struct {
	URL    string
	Pivot  Pivot
	Values url.Values

	// if not nil, it is written to and closed when query is a success, and after the view is updated
	done chan Pivot
}

func NewRack(m msg.Cell) PivotRack {
	r := PivotRack{
		keep:    make(map[ulid.ULID]Entity),
		updates: make(chan pivotUpdate),
	}
	for _, p := range m.Pivots {
		r.insertpivot(Pivot{PivotApplication: p})
	}
	return r
}

func (rack PivotRack) Build(ctx Context) *Node {
	nd := Get(`<div class="p-1 border border-dashed border-zinc-200 dark:border-neutral-700 rounded-sm grow flex flex-wrap gap-1 select-none">`).
		AddAttr("data-testid", "pivot-rack").
		OnIntent(Drop, applyPivotFromRack).
		OnIntent(Click, DoNothing).
		// We must prevent rerendering on DragOver, otherwise the element is recreated
		// and won't accept drop for a few ms until a new "dragenter" event is fired
		OnIntent(DragOver, DoNothing).
		OnIntent(DoubleClick, func(ctx Context) Context {
			go func() {
				pivotcreated := make(chan Pivot)
				rack.updates <- pivotUpdate{URL: "/api/pivot?action=edit-piql", done: pivotcreated}
				pivot := <-pivotcreated
				Actions_(ctx) <- func(ctx Context) Context {
					_pivotrack(ctx).edit = pivot.ID()
					return ctx
				}
			}()

			return ctx
		})
	if rack.pivots == nil {
		nd.AddChildren(Get(`<p class="text-sm italic pr-2 dark:text-gray-200">Drag data here to pivot on it</p>`))
	}

	for pivot := rack.pivots; pivot != nil; pivot = pivot.next {
		if nt, ok := rack.keep[pivot.ID()]; ok {
			p := ReuseFrom(ctx, nt)
			rack.keep[pivot.ID()] = p.Entity
			nd.AddChildren(p)
			continue
		}
		pivot := pivot
		nd.AddChildren(pivotpill(ctx, pivot))
	}
	return nd
}

func pivotedit(ctx Context, pivot *Pivot) *Node {
	currVal, err := strconv.Unquote(string(pivot.Value))
	if err != nil {
		panic("cannot get pivot value")
	}
	return Get(`<input type="text" class="my-1 px-1 dark:bg-neutral-800 dark:text-neutral-200" placeholder="|=">`).
		Focus(ctx).
		AddAttr("value", currVal).
		OnIntent(Click, func(ctx Context) Context { return NoAction }).
		OnIntent(Blur, func(ctx Context) Context {
			// close edit mode if no change has been made
			rack := _pivotrack(ctx)
			if pivot.ID() == rack.edit && R1(ctx) == pivot.ValueString() {
				rack.edit = ulid.ULID{}
			}
			return ctx
		}).
		OnIntent(Change, func(ctx Context) Context {
			if pivot.Type != "pivot:piql:piql" {
				panic("editing non piql pivot not implemented")
			}
			piql := rewriteMacQuotes(R1(ctx))
			// both overwritten by server, but only if successful => set them in case of failure
			pivot.Name = piql
			pivot.Value = []byte(strconv.Quote(piql))

			pivotupdated := make(chan Pivot)
			_pivotrack(ctx).updates <- pivotUpdate{
				URL:    "/api/pivot?action=edit-piql&pivot=" + pivot.ID().String(),
				Values: url.Values{"query": {piql}},
				Pivot:  *pivot,
				done:   pivotupdated,
			}
			go func() {
				<-pivotupdated
				_cell(ctx).trans <- func(m *msg.Cell) { m.ForceReload = true }
			}()
			_pivotrack(ctx).edit = ulid.ULID{}
			return ctx
		})
}

func pivotpill(ctx Context, pivot *Pivot) *Node {
	rack := _pivotrack(ctx)
	leftop := Nothing()
	if len(pivot.On) > 0 {
		leftop = Get(`<p class="p-1 self-stretch bg-zinc-200 dark:bg-neutral-700 dark:border-r smallcaps">`).SetText(prettify(pivot.On[0]))
	}
	var pivotname *Node
	switch {
	// Manifest only contains application, fetch information
	// If application is also zero, this is a creation
	case pivot.PivotDefinition.ID.IsZero() && !pivot.Pivot.IsZero():
		go func() {
			rack.updates <- pivotUpdate{URL: "/api/pivot?action=read&pivot=" + pivot.Pivot.String(), Pivot: *pivot}
		}()
		pivotname = Get(`<div class="flex gap-1 px-1">
				<svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<p>Loading</p>
				</div>`)
	case pivot.ID() == rack.edit:
		pivotname = pivotedit(ctx, pivot)
	default:
		pivotname = Get(`<p class="my-1 px-1">`).SetText(pivot.Name)
	}
	errtooltip := Nothing()
	if pivot.err != "" {
		errtooltip = Get(`<div class="
				rounded p-1 bg-orange-600 dark:bg-amber-700 text-white
				flex z-10 absolute top-full
				before:content-[''] before:bg-transparent before:block before:absolute before:bottom-full before:border-4 before:border-transparent
				before:border-b-orange-600 before:dark:border-b-amber-700
			">`).
			AddChildren(
				Get(`<p class="w-64 pl-1">`).SetText(pivot.err),
				Get(`<button class="m-1">`).
					AddChildren(crossicon()).
					AddAttr("aria-label", "Remove").
					OnIntent(Click, func(ctx Context) Context {
						_pivotrack(ctx).hideerror(*pivot)
						return ctx
					}),
			)
		if !leftop.IsNothing() {
			errtooltip.AddClasses("left-[10%]")
		}
	}
	return Get(`<div draggable="true">`).
		AddClasses("flex flex-initial items-center border-2 dark:border border-zinc-300 rounded cursor-pointer text-xs relative").
		AddAttr("data-pivot-id", pivot.ID().String()).
		AddChildren(
			leftop,
			pivotname,
			errtooltip,
			Get(`<button class="my-1">`).
				AddChildren(crossicon()).
				AddAttr("aria-label", "Remove").
				OnIntent(Click, func(ctx Context) Context {
					_pivotrack(ctx).deletepivot(*pivot)
					_cell(ctx).trans <- func(m *msg.Cell) {
						removePivot(pivot.ID(), m)
					}
					return ctx
				})).
		OnIntent(DragStart, func(ctx Context) Context {
			dt, _ := json.Marshal(pivot)
			S1(ctx, string(dt))
			_pivotrack(ctx).keep[pivot.ID()] = Entity_(ctx)
			return NoAction
		}).
		OnIntent(DragEnd, func(ctx Context) Context {
			rack := _pivotrack(ctx)
			for k := range rack.keep {
				delete(rack.keep, k)
			}
			return NoAction
		}).
		OnIntent(DoubleClick, func(ctx Context) Context {
			_pivotrack(ctx).hideerror(*pivot)
			_pivotrack(ctx).edit = pivot.ID()
			return ctx
		})
}

// copy from piql package.
// TODO(rdo) Is there a better way?
type PiQLFrontEndError struct {
	Line, Col int
	Message   string
}

// read or save a pivot
// will update the rack automatically
// but won't apply the newly created/updated pivot
func watchForPivots(acts chan Action, cmd chan pivotUpdate) {
	for update := range cmd {
		update := update

		var rsp *http.Response
		var err error
		if len(update.Values) == 0 {
			rsp, err = http.Get(update.URL)
		} else {
			rsp, err = http.PostForm(update.URL, update.Values)
		}
		if err != nil {
			slog.Error("cannot contact server",
				"err", err)
		}
		if rsp.StatusCode != http.StatusOK {
			var Err PiQLFrontEndError
			if err := json.NewDecoder(rsp.Body).Decode(&Err); err != nil {
				log.Println("cannot decode", err)
				update.Pivot.err = "Pivot is not valid, could not update it"
			} else {
				update.Pivot.err = Err.Message
			}

			goto runUpdate
		}

		if err := json.NewDecoder(rsp.Body).Decode(&update.Pivot); err != nil {
			log.Println(err)
			continue
		}

	runUpdate:
		rsp.Body.Close()
		acts <- func(ctx Context) Context {
			_pivotrack(ctx).insertpivot(update.Pivot)
			return ctx
		}
		if update.done != nil {
			update.done <- update.Pivot
			close(update.done)
		}
	}
	panic("leaving watchForPivots loop, did you accidentally return from the loop?")
}

func (rack *PivotRack) haspivot(p Pivot) bool {
	q := rack.pivots
	for q != nil {
		if q.ID() == p.ID() {
			return true
		}
		q = q.next
	}
	return false
}

// insert pivot with id, maintaining order.
// If the pivot already exists, it is replaced, and moved to the right position.
func (rack *PivotRack) insertpivot(p Pivot) {
	// this is a simple insertion sort on a linked list
	rack.deletepivot(p)
	q := &rack.pivots
	for *q != nil {
		if pivotbefore(p, **q) {
			p.next, *q = *q, &p
			return
		}

		q = &(*q).next
	}
	p.next, *q = nil, &p
}

func (rack *PivotRack) hideerror(p Pivot) {
	if p.err != "" {
		p.err = ""
		rack.insertpivot(p)
	}
}

// delete entry, match done by ID only
func (rack *PivotRack) deletepivot(p Pivot) {
	q := &rack.pivots
	for *q != nil {
		if (*q).ID() == p.ID() {
			*q = (*q).next
			return
		}
		q = &(*q).next
	}
}

func pivotbefore(p, q Pivot) bool {
	if p.Pivot.IsZero() && q.Pivot.IsZero() || !p.Pivot.IsZero() && !q.Pivot.IsZero() {
		// if both applied, or neither, name comparison
		return p.Name < q.Name
	}
	return q.Pivot.IsZero()
}

// do nothing if id is not found
func removePivot(id ulid.ULID, m *msg.Cell) {
	j := 0
	for _, p := range m.Pivots {
		if p.Pivot != id {
			m.Pivots[j] = p
			j++
		}
	}
	m.Pivots = m.Pivots[:j]
}
func insertPivot(pa msg.PivotApplication, m *msg.Cell) {
	// prevent duplicates
	removePivot(pa.Pivot, m)
	m.Pivots = append(m.Pivots, pa)
}

// TODO(rdo) do we _really_ need this?
func applyPivot(ctx Context) Context {
	p := _pivot(ctx)
	// check if pivot exists
	if p.PivotDefinition.ID.IsZero() {
		return NoAction
	}
	sel := _selection(ctx)
	switch {
	case len(sel) == 0:
		log.Printf("Warning: empty or unset selection during pivot drop: %v", sel)
		return NoAction
	}

	path := _viewport(ctx).lioli.PathOf(sel[0])
	if path == "$" || path == "" {
		Logger_(ctx).Debug("ignoring drop outside of path")
		return NoAction
	}

	p.PivotApplication = msg.PivotApplication{
		Pivot: p.PivotDefinition.ID,
		On:    append([]string{path}, p.Args...),
	}
	_cell(ctx).trans <- func(m *msg.Cell) {
		insertPivot(p.PivotApplication, m)
	}
	_pivotrack(ctx).insertpivot(p)
	for k := range _pivotrack(ctx).keep {
		delete(_pivotrack(ctx).keep, k)
	}
	_cell(ctx).load = WaitingForData
	return ctx
}

// If dropping a piql value, create corresponding pivot and put in rack
// If dropping a saved pivot, put it in the rack
// If dropping an applied pivot, forget the application part, put the pivot in the rack
// If pivot ID already exist in the rack, should do nothing
func applyPivotFromRack(ctx Context) Context {
	var p Pivot
	if err := json.Unmarshal([]byte(R1(ctx)), &p); err != nil {
		log.Println("error reading pivot info", err)
		return withErr(err)(ctx)
	}
	// if pivot is already in rack, do nothing
	if _pivotrack(ctx).haspivot(p) {
		return ctx
	}
	switch p.Type {
	case "pivot:piql:piql":
		var q string
		if err := json.Unmarshal(p.Value, &q); err != nil {
			log.Fatal("invalid query ", q)
		}
		pa := msg.PivotApplication{
			Pivot: p.PivotDefinition.ID,
		}
		// reset pivot application
		p.PivotApplication = pa
		// when a value is dropped, the pivot needs to be created
		if p.ID().IsZero() {
			p.PivotDefinition.ID = ulid.Make()
		}
		// TODO: is this needed for an existing pivot with a non-zero id?
		// it means we just dropped an existing pivot on the rack, we shouldn't need to update the rack?
		pivotupdated := make(chan Pivot)
		_pivotrack(ctx).updates <- pivotUpdate{
			URL:    "/api/pivot?action=edit-piql&pivot=" + p.ID().String(),
			Values: url.Values{"query": {q}},
			Pivot:  p,
			done:   pivotupdated}
		go func() {
			<-pivotupdated
			pa := msg.PivotApplication{
				Pivot: p.PivotDefinition.ID,
			}
			_cell(ctx).trans <- func(m *msg.Cell) {
				insertPivot(pa, m)
			}
		}()
	}
	return ctx
}

func applyPivotFromPoint(ctx Context) Context {
	// create and store pivot
	selectFromPoint(ctx)
	if len(_viewport(ctx).lioli.ValueOf(_selection(ctx)[0])) == 0 {
		return NoAction
	}
	q := "|= " + strconv.Quote(_viewport(ctx).lioli.ValueOf(_selection(ctx)[0]))
	p := Pivot{PivotDefinition: msg.PivotDefinition{Type: "pivot:piql:piql", ID: ulid.Make(), Name: q}}
	pivotsaved := make(chan Pivot)
	editurl := "/api/pivot?action=edit-piql"
	if !p.ID().IsZero() {
		editurl += "&pivot=" + p.ID().String()
	}
	_pivotrack(ctx).updates <- pivotUpdate{
		URL:    editurl,
		Values: url.Values{"query": {q}},
		Pivot:  p,
		done:   pivotsaved,
	}
	// apply and store pivot
	path := _viewport(ctx).lioli.PathOf(_selection(ctx)[0])
	if path == "$" {
		log.Printf("Warning: dropped on root path, can't join.")
		return NoAction
	}
	// pivot has been created succesfully and is on a valid path => apply it
	go func() {
		p = <-pivotsaved
		p.PivotApplication = msg.PivotApplication{
			Pivot: p.PivotDefinition.ID,
			On:    []string{path},
		}
		_cell(ctx).trans <- func(m *msg.Cell) {
			insertPivot(p.PivotApplication, m)
		}
		_cell(ctx).load = WaitingForData
		Actions_(ctx) <- func(ctx Context) Context {
			_pivotrack(ctx).insertpivot(p)
			return ctx
		}
	}()

	return ctx
}

// MacOS defaults to using smart quotes – and other OS could follow too.
// If users want to copy-paste from the Web, we accept a silent conversion
func rewriteMacQuotes(s string) string {
	t := -1
	for p, r := range s {
		if isDoubleQuote(r) || isSimpleQuote(r) {
			t = p
			break
		}
	}

	if t == -1 {
		return s
	}

	// we are going to reduce to ASCII range, so we know we don’t need to allocate space
	b := []byte(s)
	for i := t; i < len(b); {
		r, s := utf8.DecodeRune(b[i:])
		i += s
		switch {
		default:
			utf8.AppendRune(b[:t], r)
			t += s
		case isDoubleQuote(r):
			b[t] = '"'
			t++
		case isSimpleQuote(r):
			b[t] = '\''
			t++
		}

	}
	return string(b[:t])
}

func isDoubleQuote(r rune) bool {
	// French-style quotes, Unicode Block “Latin-1 Supplement”
	if r == 0xAA || r == 0xBB {
		return true
	}

	// Unicode Block “General Punctuation”
	return 0x201C <= r && r <= 0x201F
}

func isSimpleQuote(r rune) bool {
	// Unicode Block “General Punctuation”
	return 0x2018 <= r && r <= 0x201B
}

func _pivot(ctx Context) Pivot {
	var p Pivot
	if err := json.Unmarshal([]byte(R1(ctx)), &p); err != nil {
		panic(fmt.Sprintf("Error: pivot is invalid and can't be parsed. Received string: %s. Expected type: %T and stucture: %+v.", R1(ctx), p, p))
	}
	return p
}
