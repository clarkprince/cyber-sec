package httpform

import (
	"fmt"
	"reflect"
	"strings"
)

type Field struct {
	Name, Value   string
	Pattern       string
	Placeholder   string
	Required      bool
	Type          string
	SelectOptions []SelectOption
}

type SelectOption struct {
	Value    string
	Label    string
	Selected bool
}

type FieldDefiner interface{ DefineField() Field }

var (
	typeOfFieldDefiner = reflect.TypeOf((*FieldDefiner)(nil)).Elem()
)

func GenerateDefinition(v any) []Field {
	tt := reflect.TypeOf(v)
	vv := reflect.ValueOf(v)

	// cannot get fields on pointer to struct
	for tt.Kind() == reflect.Ptr {
		tt = tt.Elem()
		vv = vv.Elem()
	}

	var def []Field

	for i := 0; i < tt.NumField(); i++ {
		if tt.Field(i).Type.Implements(typeOfFieldDefiner) {
			def = append(def, vv.Field(i).Interface().(FieldDefiner).DefineField())
			continue
		}

		tag := tt.Field(i).Tag.Get("form")
		if tag == "" {
			continue
		}

		dirs := strings.Split(tag, ",")
		fld := Field{
			Name: dirs[0],
		}
		if !vv.Field(i).IsZero() {
			fld.Value = fmt.Sprint(vv.Field(i)) // use fact that fmt prints underlying value
		}

		for _, extra := range dirs[1:] {
			pf, val, _ := strings.Cut(extra, "=")

			switch pf {
			default:
				panic(fmt.Sprintf("invalid extra specifier in %T: %s (want pattern,placeholder)", v, extra))
			case "pattern":
				fld.Pattern = val
			case "placeholder":
				fld.Placeholder = val
			case "required":
				fld.Required = true
			case "type":
				fld.Type = val
			}
		}

		def = append(def, fld)
	}
	return def
}
