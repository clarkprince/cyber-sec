package hub

import (
	"container/heap"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"trout.software/kraken/webapp/hub/iam"
	"trout.software/kraken/webapp/hub/msg"
	"trout.software/kraken/webapp/hub/tasks"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/ulid"
)

type Search struct {
	Notebook
	DataSources []DataSource `json:"datasources"`
	Pivots      []Pivot      `json:"pivots"`
	Content     string       `json:"content"`

	score float64
}

type SearchQuery struct {
	Query      string `json:"query,omitempty"`
	Author     string `json:"author,omitempty"`
	Start      string `json:"start,omitempty"`
	End        string `json:"end,omitempty"`
	DataSource string `json:"datasource,omitempty"`
}

type SearchResponse struct {
	Results     []Search     `json:"results"`
	Authors     []iam.User   `json:"authors"`
	Start       string       `json:"start"`
	End         string       `json:"end"`
	DataSources []DataSource `json:"datasources"`
}

type SearchSFS struct {
	Notebook
	DataSources string `json:"datasources"`
	Pivots      string `json:"pivots"`
	Content     string `json:"content"`

	score float64
}

type SearchResponseSFS struct {
	Results     []Search `json:"results"`
	Authors     string   `json:"authors"`
	Start       string   `json:"start"`
	End         string   `json:"end"`
	DataSources string   `json:"datasources"`
}

func (app *App) SearchHandler(ctx context.Context, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	switch r.URL.Path {
	case "/search/query":
		err := DoSearch(ctx, app.db, ssn, w, r)
		if err != nil {
			tasks.SecureErr(ctx, w, err, "cannot search")
		}
	case "/search/filters":
		getFilters(ctx, app.db, ssn, w, r)
	case "/search/users":
		SearchUsers(ctx, app.db, ssn, w, r)
	}
}

// save the search entry when the original entry is saved
// for now we are saving the text cell
func SaveSearch(ctx context.Context, ctn Executor, notebook ulid.ULID) error {
	// check if ref exists in vtable
	// using exists() would have been nice, but it doesn't seem to work with fts5
	var count int
	ctn.Exec(ctx, "SELECT count(rkey) FROM search WHERE rkey = ?", "/notebooks/"+notebook.String()).ScanOne(&count)

	// find notebook
	nb, err := FindOne[Notebook](ctx, ctn, "/notebooks/"+notebook.String())
	if err != nil {
		return fmt.Errorf("error finding notebook: %w", err)
	}

	// find text cell, if dont find one we can proceeed with just the title
	var data string
	content, _ := FindOne[CompressedBytes](ctx, ctn, "/notebooks/data/"+notebook.String())
	if content != nil {
		data, err = ParseEditorJSON(string(content))
		if err != nil {
			return fmt.Errorf("error parsing JSON: %w", err)
		}
	}

	if nb.Title != "" {
		data = nb.Title + " " + data
	}

	tags := ""
	for _, t := range nb.Tag {
		tags += t.Value + ","
	}

	if count > 0 {
		if err := ctn.Exec(ctx, `UPDATE search SET tags = ?, authors = ?, date = ?, body = ? 
				WHERE rkey = ?`, tags, nb.Owner.ID, nb.Created, data, "/notebooks/"+nb.ID.String()).Err(); err != nil {
			return fmt.Errorf("error updating search entry: %w", err)
		}
		return nil
	}

	// if it doesn't, create it
	// fts5 does not seem support [onconflict], so we take the long way around
	if err := ctn.Exec(ctx, `INSERT INTO search (rkey, tags, authors, date, body) 
			VALUES (?, ?, ?, ?, ?)`, "/notebooks/"+nb.ID.String(), tags, nb.Owner.ID, nb.Created, data).Err(); err != nil {
		return fmt.Errorf("error creating search entry: %w", err)
	}

	return nil
}

func ParseEditorJSON(value string) (string, error) {
	dec := json.NewDecoder(strings.NewReader(value))
	var buf strings.Builder

	modes := []rune{':'}
	pop := func() rune {
		last := modes[len(modes)-1]
		modes = modes[:len(modes)-1]
		return last
	}
	peek := func() rune { return modes[len(modes)-1] }
	push := func(r rune) {
		modes = append(modes, r)
	}

parseLoop:
	for len(modes) > 0 {
		tk, err := dec.Token()

		switch {
		case errors.Is(err, io.EOF):
			break parseLoop
		case err != nil:
			return "", fmt.Errorf("reading token: %w", err)
		}

		var pr string
		switch tk := tk.(type) {
		case json.Delim:
			switch tk {
			case '[', '{':
				push(rune(tk))
				continue
			case ']', '}':
				pop()
			}
		case string:
			pr = tk
		}

		switch peek() {
		case '{':
			if pr != "text" {
				push(':')
			} else {
				push('&')
			}
		case ':':
			pop()
		case '&':
			pop()
			buf.WriteString(pr + " ")
		}
	}
	return buf.String(), nil
}

// if the original entry is deleted,
// the search entry needs to be deleted as well
func DeleteSearch(ctx context.Context, ctn Executor, ref string) error {
	if err := ctn.Exec(ctx, "DELETE FROM search WHERE rkey = ?", ref).Err(); err != nil {
		return fmt.Errorf("error deleting search entry: %w", err)
	}
	return nil
}

// Turns a string into valid FTS5 barewords
// Leave alone spaces (string can contain multiple barewords, extra spaces are ignored)
// Keep only runes that matches:
// - Non-ASCII range characters (i.e. unicode codepoints greater than 127), or
// - One of the 52 upper and lower case ASCII characters, or
// - One of the 10 decimal digit ASCII characters, or
// - The underscore character (unicode codepoint 96).
// - The substitute character (unicode codepoint 26).
func barewords(str string) string {
	return strings.Map(func(r rune) rune {
		if r > utf8.RuneSelf || 1<<(r&0xf)&fts_keep[r>>4] != 0 {
			return r
		}
		// TODO: assuming that special chars are often separators,
		// we replace by a space instead of removing
		// need confirmation
		return ' ' //-1
	}, str)
}

// "0b0000000001000001, // 0x2." means we should keep runes 0x20 and 0x26 (bits 1 and 6 at 1)
// generated by https://go.dev/play/p/oI9_QBbCCbS
var fts_keep = [...]uint16{
	0b0000000000000000, // 0x0.
	0b0000000000000000, // 0x1.
	0b0000000001000001, // 0x2.
	0b0000001111111111, // 0x3.
	0b1111111111111110, // 0x4.
	0b0000011111111111, // 0x5.
	0b1111111111111110, // 0x6.
	0b0000011111111111, // 0x7.
	0b1111111111111111, // 0x8.
	0b1111111111111111, // 0x9.
	0b1111111111111111, // 0xa.
	0b1111111111111111, // 0xb.
	0b1111111111111111, // 0xc.
	0b1111111111111111, // 0xd.
	0b1111111111111111, // 0xe.
	0b1111111111111111, // 0xf.

}

// DoSearch performs a search on the fts5 search table.
// The function gets a slice from 0 to 30 documents matching the query search conditions.
// The list of documents returned is ordered by the relevance of this documents for the user by using the ranking function Okapi BM25
func DoSearch(ctx context.Context, ctn Executor, ssn *iam.Session, w http.ResponseWriter, r *http.Request) error {
	defer r.Body.Close()
	var sq SearchQuery
	if err := json.NewDecoder(r.Body).Decode(&sq); err != nil {
		return fmt.Errorf("error decoding request: %s", err)
	}
	sr := &SearchResponse{}

	var buf strings.Builder
	fmt.Fprint(&buf, `select search.rowid, rkey, body, a.value
		from search, entities a
		where a.pkey = search.rkey and body match ?`)

	query := sq.Query
	// leave prefix queries alone, remove punctuation from other queries
	// TODO: we should probably also leave exact queries alone (double-quoted)
	if !strings.ContainsRune(query, '*') {
		query = barewords(sq.Query)
	}
	query = strings.TrimSpace(query)
	if len(query) == 0 {
		sr.noResults(ctx, ctn, ssn, w)
		return nil
	}
	args := []any{query}

	if sq.Author != "" {
		fmt.Fprintf(&buf, " and authors = ?")
		author, err := ulid.Parse(sq.Author)
		if err != nil {
			return fmt.Errorf("error parsing author: %w", err)
		}
		args = append(args, author)
	}

	if sq.Start != "" {
		start, err := time.Parse("2006-01-02", sq.Start)
		if err != nil {
			return fmt.Errorf("error parsing time: %w", err)
		}
		fmt.Fprint(&buf, " and date >= ?")
		args = append(args, start)

	}

	if sq.End != "" {
		end, err := time.Parse("2006-01-02 15:04:05", sq.End+" 23:59:59")
		if err != nil {
			return fmt.Errorf("error parsing time: %w", err)
		}
		fmt.Fprint(&buf, " and date <= ?")
		fmt.Println(end)
		args = append(args, end)
	}

	if sq.DataSource != "" {
		fmt.Fprintf(&buf, " and pb_filter(a.value, ?, 'datasource') = 1")
		args = append(args, sq.DataSource)
	}

	var totalDocLen int
	err := ctn.Exec(ctx, "SELECT SUM(length(body)) FROM search").ScanOne(&totalDocLen)
	if err != nil {
		return fmt.Errorf("error calculating length: %w", err)
	}
	var numDocs int
	err = ctn.Exec(ctx, "SELECT COUNT(*) FROM search").ScanOne(&numDocs)
	if err != nil {
		return fmt.Errorf("error counting documents: %w", err)
	}
	avgDocLen := float64(totalDocLen) / float64(numDocs)
	var priorityQueue = &searchHeap{}
	stn := ctn.Exec(ctx, buf.String(), args...)

	for stn.Next() {
		var rowid int
		var k string
		var b string
		var nb Notebook
		var s Search

		stn.Scan(&rowid, &k, &b, &nb)
		sr.filters(ctx, ctn, ssn, &nb, &s)

		s.Notebook = Notebook{
			ID:      nb.ID,
			Title:   nb.Title,
			Owner:   iam.User{ID: nb.Owner.ID, Profile: iam.Profile{Name: nb.Owner.Name}},
			Created: nb.Created, LastEdit: nb.LastEdit,
		}
		s.Notebook.Cells = make([]Manifest, len(nb.Cells))
		for i, c := range nb.Cells {
			s.Notebook.Cells[i] = Manifest{
				ID:         c.ID,
				Title:      c.Title,
				DataSource: c.DataSource,
			}
			s.Notebook.Cells[i].Pivots = make([]msg.PivotApplication, len(c.Pivots))
			for j, p := range c.Pivots {
				s.Notebook.Cells[i].Pivots[j] = msg.PivotApplication{Pivot: p.Pivot}
			}
		}

		s.Content = b

		s.score, err = getOkapiBM25Rank(ctx, ctn, strings.ToLower(sq.Query), strings.ToLower(b), float64(numDocs), avgDocLen, 0.75, 1.2, rowid)
		if err != nil {
			//[TO-DO] add some metrics here to control the number of errors
			s.score = 0.1
		}
		if priorityQueue.Len() == 30 {
			heap.Pop(priorityQueue)
		}
		heap.Push(priorityQueue, s)
	}
	if stn.Err() != nil {
		return fmt.Errorf("error while scanning: %w", stn.Err())
	}
	l := priorityQueue.Len()
	if l > 0 {
		sr.Results = make([]Search, l)
		for i := l - 1; i >= 0; i-- {
			sr.Results[i] = heap.Pop(priorityQueue).(Search)
		}
	}

	if sr.Results == nil {
		sr.noResults(ctx, ctn, ssn, w)
		return nil
	}
	return json.NewEncoder(w).Encode(sr)
}

func (sr *SearchResponse) noResults(ctx context.Context, ctn Executor, ssn *iam.Session, w http.ResponseWriter) {
	sr.Results = []Search{}

	sr.defaultFilters(ctx, ctn, ssn, nil)
	json.NewEncoder(w).Encode(sr)
}

// an SQL function that returns 1 if the notebook contains the given filter
// and 0 otherwise. Use of (t) is to be able to add more filters in the future
func PlaybookFilter(v []byte, comp string, t string) int {
	var nb Notebook
	if err := nb.UnmarshalBinary(v); err != nil {
		return 0
	}
	for _, c := range nb.Cells {
		switch t {
		case "datasource":
			if c.DataSource.String() == comp {
				return 1
			}
		}
	}
	return 0
}

func getFilters(ctx context.Context, ctn Executor, ssn *iam.Session, w http.ResponseWriter, r *http.Request) error {
	sr := &SearchResponse{}
	if err := sr.defaultFilters(ctx, ctn, ssn, nil); err != nil {
		return fmt.Errorf("error getting default filters: %w", err)
	}
	return json.NewEncoder(w).Encode(sr)
}

func (sr *SearchResponse) defaultFilters(ctx context.Context, ctn Executor, ssn *iam.Session, s *Search) error {
	nbks, err := ListPath(ctx, ctn, "/notebooks", make([]Notebook, 100))
	if err != nil {
		return fmt.Errorf("error getting notebooks: %s", err)
	}
	for _, nb := range nbks {
		sr.filters(ctx, ctn, ssn, &nb, s)
	}
	sr.Results = []Search{}

	return nil
}

func (sr *SearchResponse) filters(ctx context.Context, ctn Executor, ssn *iam.Session, nb *Notebook, s *Search) error {
	// the author part will change once we save the text cell as a cell
	if !contains(sr.Authors, nb.Owner.ID) {
		usr, err := FindOne[iam.User](ctx, ctn, fmt.Sprintf("/users/%s", nb.Owner.ID))
		if err != nil {
			return fmt.Errorf("error finding user: %w", err)
		}
		sr.Authors = append(sr.Authors, usr)
	}

	// get data sources and pivots from cell
	for _, c := range nb.Cells {
		var ds DataSource
		query := `select value from entities, streams_in(entities.value)
			where pkey like '/datasources/%' and streams_in.ulid = ?`
		if err := ctn.Exec(ctx, query, c.DataSource).ScanOne(&ds); err != nil {
			return fmt.Errorf("error finding datasource: %s", err)
		}
		ds.Key = c.DataSource.String()
		if !contains(sr.DataSources, c.DataSource) {
			sr.DataSources = append(sr.DataSources, ds)
		}
		if s != nil && !contains(s.DataSources, c.DataSource) {
			s.DataSources = append(s.DataSources, ds)
		}

		if s != nil {
			for _, p := range c.Pivots {
				if !contains(s.Pivots, p.Pivot) {
					pivot, err := FindOne[Pivot](ctx, ctn, fmt.Sprintf("/pivots/%s", p.Pivot))
					if err != nil {
						return fmt.Errorf("error finding pivot: %w", err)
					}
					s.Pivots = append(s.Pivots, pivot)
				}
			}
		}
	}
	return nil
}

func contains[T any](v []T, e ulid.ULID) bool {
	for _, a := range v {
		switch any(a).(type) {
		case iam.User:
			if any(a).(iam.User).ID == e {
				return true
			}
		case DataSource:
			if any(a).(DataSource).Key == e.String() {
				return true
			}
		case Pivot:
			if any(a).(Pivot).ID == e {
				return true
			}
		}
	}
	return false
}

// rankOkapiBM25 is a ranking function used to estimate the relevance of each document to a given search query.
// The higher the rank the more relevant the document is.
// The algorithm we are using is well defined and described as in the "The ranking function"
// section of https://en.wikipedia.org/wiki/Okapi_BM25
func getOkapiBM25Rank(ctx context.Context, ctn Executor, query string, doc string, numDocs, avgDocLen float64, b float64, k1 float64, rowid int) (float64, error) {
	score := 0.0
	queryTerms := strings.Fields(query)
	k := k1 * ((1 - b) + b*(float64(len(doc))/avgDocLen))

	for _, qt := range queryTerms {
		var args []any
		var buf strings.Builder
		var bufOnTerm strings.Builder
		fmt.Fprint(&buf, "select doc from search_col where col='body'")
		if strings.Contains(query, "*") {
			fmt.Fprintf(&bufOnTerm, " and term like ?")
			args = []any{strings.ReplaceAll(query, "*", "%")}
		} else {
			fmt.Fprintf(&bufOnTerm, " and term = ?")
			args = []any{qt}
		}
		fmt.Fprint(&buf, bufOnTerm.String())
		var docsThatHasTheTerm int
		if err := ctn.Exec(ctx, buf.String(), args...).ScanOne(&docsThatHasTheTerm); err != nil {
			return 0, err
		}

		var bufForInstance strings.Builder
		fmt.Fprint(&bufForInstance, "select count(*) from search_instance where col='body'")
		fmt.Fprint(&bufForInstance, bufOnTerm.String())
		fmt.Fprint(&bufForInstance, " and doc = ?")
		args = append(args, any(rowid))

		var docFreq int
		if err := ctn.Exec(ctx, bufForInstance.String(), args...).ScanOne(&docFreq); err != nil {
			return 0, err
		}

		idf := math.Log((numDocs - float64(docsThatHasTheTerm) + 0.5) / (float64(docsThatHasTheTerm) + 0.5))
		score += idf*((k1+1)*float64(docFreq))/k + float64(docFreq)
	}

	return score, nil
}

type searchHeap []Search

func (h *searchHeap) Push(x any) {
	*h = append(*h, x.(Search))
}
func (h *searchHeap) Pop() any {
	it := (*h)[len(*h)-1]
	*h = (*h)[:len(*h)-1]
	return it
}

func (h searchHeap) Len() int {
	return len(h)
}

func (h searchHeap) Less(i, j int) bool {
	//we want to pop the lowest score first
	return h[i].score < h[j].score
}

func (h searchHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
}

func SearchUsers(ctx context.Context, ctn Executor, ssn *iam.Session, w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")

	stn := ctn.Exec(ctx, "select value from entities, user_from(value) as user where pkey like '/users/%' and user.name like ? || '%' limit 10", q)
	var users []iam.User
	for stn.Next() {
		var usr iam.User
		stn.Scan(&usr)
		users = append(users, usr)
	}

	if err := stn.Err(); err != nil {
		tasks.SecureErr(ctx, w, err, "invalid query")
		return
	}

	if err := json.NewEncoder(w).Encode(users); err != nil {
		tasks.SecureErr(ctx, w, err, "invalid query")
		return
	}
}

//go:generate constrainer userRecord
type userRecord struct {
	Entity     []byte `vtab:"entity,hidden,required"`
	ID         string `vtab:"id"`
	Domain     string `vtab:"domain"`
	ExternalID string `vtab:"external_id"`
	Name       string `vtab:"name"`
}

func (r userRecord) Filter(_ int, cs sqlite.Constraints) sqlite.Iter[userRecord] {
	var usr iam.User
	if err := usr.UnmarshalBinary(r.GetEntity(cs)); err != nil {
		return sqlite.FromError[userRecord](err)
	}

	return sqlite.FromOne(userRecord{
		Entity:     r.GetEntity(cs),
		ID:         usr.ID.String(),
		Domain:     usr.Domain.String(),
		ExternalID: usr.ExternalID,
		Name:       usr.Name,
	})
}

var VTabUser = sqlite.RegisterTable("user_from", userRecord{})
