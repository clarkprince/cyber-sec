// Package httpform implements convenient data reading from HTTP forms submissions.
//
// See [Unmarshal] function for a quick introduction.
package httpform

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"strings"
	"sync"
	"time"

	"trout.software/kraken/webapp/internal/ulid"
)

const (
	defaultMaxMemory = 32 << 20 // 32 MB
)

// Unmarshal populates v from reading the request POST form values (not the URL, …)
// Values are matched using the "form" tag on the data structure, e.g.:
//
//	  type Entity struct {
//			MyField string `form:"my-field"`
//	  }
//
// The package understand base types (strings, bytes, numbers, bool, time);
// consult the source code of the package for the most up-to-date list.
// Custom reading logic can be configured by implementing the [FormFiller] interface.
//
// This functions panics if the data type is unknown, and does not implement [FormFiller].
func Unmarshal(r *http.Request, v any) error {
	if r.PostForm == nil {
		if err := r.ParseMultipartForm(defaultMaxMemory); err != nil {
			return err
		}
	}

	vv := reflect.ValueOf(v).Elem()
	for k := range r.PostForm {
		fld, ok := getField(vv, k)
		if !ok {
			continue
		}
		if err := decodeValue(r.PostForm[k], vv.Field(fld)); err != nil {
			return fmt.Errorf("Error decoding POST form value %s: %s", k, err)
		}
	}

	return nil
}

var formFields = new(sync.Map)

func getField(v reflect.Value, name string) (int, bool) {
	ref, ok := formFields.Load(v.Type())
	if !ok {
		t := v.Type()
		ref = make(map[string]int)
		for i := 0; i < t.NumField(); i++ {
			mb := t.Field(i)
			if tag := mb.Tag.Get("form"); tag != "" {
				nm, _, _ := strings.Cut(tag, ",")
				ref.(map[string]int)[nm] = i
			}
		}
		formFields.Store(v.Type(), ref)
	}

	t, ok := ref.(map[string]int)[name]
	if !ok {
		return -1, false
	}
	return t, true
}

// FormFiller is the interface for types to define how to be read from POST form values.
type FormFiller interface{ FillForm([]string) error }

func typefor[T any]() reflect.Type { return reflect.TypeOf((*T)(nil)).Elem() }

var (
	tyTime   = typefor[time.Time]()
	tyULID   = typefor[ulid.ULID]()
	tyBool   = typefor[bool]()
	tyString = typefor[string]()
	tyBytes  = typefor[[]byte]()
	tyJSON   = typefor[json.RawMessage]()

	tyFiller = typefor[FormFiller]()
)

func decodeValue(input []string, v reflect.Value) error {
	if v.CanAddr() && v.Addr().NumMethod() > 0 && v.Addr().CanInterface() {
		if u, ok := v.Addr().Interface().(FormFiller); ok {
			return u.FillForm(input)
		}
	}

	switch v.Type() {
	default:
		panic(fmt.Sprintf("unknown type %s", v.Type()))

	case tyTime:
		if len(input) > 0 {
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#date_strings
			ts, err := time.Parse("2006-01-02", input[0])
			if err != nil {
				return err
			}
			v.Set(reflect.ValueOf(ts))
		}

	case tyULID:
		if len(input) > 0 {
			id, err := ulid.Parse(input[0])
			if err != nil {
				return err
			}
			v.Set(reflect.ValueOf(id))
		}

	case tyBool:
		// HTTP form only set on true
		v.SetBool(true)

	case tyString:
		if len(input) > 0 {
			v.SetString(input[0])
		}

	case tyBytes, tyJSON:
		if len(input) > 0 {
			v.SetBytes([]byte(input[0]))
		}

	}
	return nil
}
