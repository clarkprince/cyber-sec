package nbar

import (
	"bytes"
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"

	"trout.software/kraken/webapp/internal/ulid"
)

var encoders = make(map[reflect.Type][]proc)

func init() {
	registerencoder(typefor[Playbook]())
	registerencoder(typefor[Framework]())
}

type proc func(v reflect.Value, dst *bytes.Buffer)

func typefor[T any]() reflect.Type { return reflect.TypeOf((*T)(nil)).Elem() }

type Manifestable interface {
	ManifestType() string
}

var _mfstable = reflect.TypeOf((*Manifestable)(nil)).Elem()

func registerencoder(tt reflect.Type) proc {
	if enc := encoders[tt]; enc != nil {
		return marshalEntity
	}

	type encoder struct {
		Name string
		Idx  int
		Proc proc
	}

	if !tt.Implements(_mfstable) {
		panic(fmt.Sprintf("invalid type %s: entities must implement the Manifestable interface", tt))
	}

	if fld := tt.Field(0); fld.Name != "ID" && fld.Type != typefor[ulid.ULID]() {
		panic(fmt.Sprintf("invalid type %s: entities must start with an ID ULID definition", tt))
	}

	var ecs []proc
	ecs = append(ecs, func(v reflect.Value, dst *bytes.Buffer) {
		dst.WriteString(strings.ToLower(v.Interface().(Manifestable).ManifestType()))
		dst.WriteString("\n")
	})

	for i := 0; i < tt.NumField(); i++ {
		fld := tt.Field(i)
		if fld.Tag.Get("nbar") == "-" || hasDataTag(fld) {
			continue
		}
		ec := encoder{Name: fld.Name, Idx: i}

		switch {
		default:
			ec.Proc = registerencoder(fld.Type)
		case fld.Type == typefor[bool]():
			ec.Proc = marshalBool
		case fld.Type == typefor[ulid.ULID]():
			// entity are serialized when reified
			continue
		case fld.Type == typefor[time.Time]():
			ec.Proc = marshalTime
		case fld.Type == typefor[string]():
			ec.Proc = marshalString
		case isValue(fld.Type):
			ec.Proc = marshalStruct(fld.Type)
		case isBytesType(fld.Type):
			ec.Proc = marshalByte
		case isSlice(fld.Type):
			var proc proc
			if isValue(fld.Type.Elem()) {
				proc = marshalStruct(fld.Type.Elem())
			} else {
				proc = registerencoder(fld.Type.Elem())
			}
			ecs = append(ecs, func(v reflect.Value, dst *bytes.Buffer) {
				v = v.Field(ec.Idx)
				for i := 0; i < v.Len(); i++ {
					dst.WriteString(strings.ToLower(ec.Name))
					dst.WriteString(" ")
					proc(v.Index(i), dst)
					dst.WriteString("\n")
				}
			})
			// using our custom encoder
			continue

		}
		ecs = append(ecs, func(v reflect.Value, dst *bytes.Buffer) {
			if v.Field(ec.Idx).IsZero() {
				return
			}

			dst.WriteString(strings.ToLower(ec.Name))
			dst.WriteString(" ")
			ec.Proc(v.Field(ec.Idx), dst)
			dst.WriteString("\n")

		})
	}

	encoders[tt] = ecs
	return marshalEntity
}

func marshalStruct(tt reflect.Type) proc {
	var procs []proc
	for i := 0; i < tt.NumField(); i++ {
		fld := tt.Field(i)
		if fld.Tag.Get("nbar") == "-" {
			continue
		}

		var proc proc
		switch {
		default:
			proc = registerencoder(fld.Type)
		case fld.Type == typefor[time.Time]():
			proc = marshalTime
		case fld.Type == typefor[string]():
			proc = marshalString
		case isValue(fld.Type):
			proc = marshalStruct(fld.Type)
		case fld.Type == typefor[struct{}]():
			// marker types
			continue
		}
		i := i
		procs = append(procs, func(v reflect.Value, dst *bytes.Buffer) { proc(v.Field(i), dst) })
	}
	return func(v reflect.Value, dst *bytes.Buffer) {
		for i, p := range procs {
			if i > 0 {
				dst.WriteString(" ")
			}
			p(v, dst)
		}
	}
}

func isBytesType(tt reflect.Type) bool {
	if isSlice(tt) && tt.Elem().Kind() == reflect.Uint8 {
		return true
	}
	return false
}

func isValue(tt reflect.Type) bool {
	if tt.Kind() != reflect.Struct || tt.NumField() < 1 {
		return false
	}

	return tt.Field(0).Tag.Get("nbar") == ",inline"
}

func hasDataTag(t reflect.StructField) bool {
	return t.Tag.Get("nbar") == ",data"
}

func isSlice(tt reflect.Type) bool { return tt.Kind() == reflect.Slice }

func ToMfst(v reflect.Value, dst *bytes.Buffer) {
	for _, enc := range encoders[v.Type()] {
		enc(v, dst)
	}
}

func marshalEntity(v reflect.Value, dst *bytes.Buffer) {
	dst.WriteString(v.Field(0).Interface().(ulid.ULID).String())
}

func marshalTime(v reflect.Value, dst *bytes.Buffer) {
	dst.WriteString(v.Interface().(time.Time).Format(time.RFC3339))
}

func marshalString(v reflect.Value, dst *bytes.Buffer) {
	dst.WriteString(strconv.Quote(v.Interface().(string)))
}

func marshalBool(v reflect.Value, dst *bytes.Buffer) {
	dst.WriteString(strconv.FormatBool(v.Interface().(bool)))
}

func marshalByte(v reflect.Value, dst *bytes.Buffer) {
	for _, b := range v.Bytes() {
		dst.WriteByte(b)
	}
}

func checkCardType(data []byte) error {
	size := min(len(data), 30)
	var cardType = string(data[strings.Index(string(data[0:size]), "nbar/"):strings.Index(string(data[0:size]), "\n")])
	if !strings.EqualFold(User{}.ManifestType(), cardType) &&
		!strings.EqualFold(Cell{}.ManifestType(), cardType) &&
		!strings.EqualFold(Pivot{}.ManifestType(), cardType) &&
		!strings.EqualFold(Playbook{}.ManifestType(), cardType) &&
		!strings.EqualFold(DataSource{}.ManifestType(), cardType) &&
		!strings.EqualFold(Framework{}.ManifestType(), cardType) {
		return errors.New("non valid cardtype")
	}
	return nil
}

func unmarshalEntity(v reflect.Value, entity string) error {
	t := v.Type()
	if t.Field(0).Name == "ID" && t.Field(0).Type == typefor[ulid.ULID]() {
		id, err := ulid.Parse(entity)
		if err != nil {
			return err
		}
		v.Field(0).Set(reflect.ValueOf(id))
	}
	return nil
}

func unmarshalStruct(t reflect.Type, field reflect.Value, val string) error {
	switch {
	case t == typefor[time.Time]():
		parsedT, err := time.Parse(time.RFC3339, val)
		if err != nil {
			return err
		}
		field.Set(reflect.ValueOf(parsedT))
	case isValue(t):
		if field.NumField() == 0 {
			return nil
		}
		values := strings.Split(val, " ")
		var valueCounter int
		for i := 0; i < field.NumField(); i++ {
			if t.Field(i).Tag.Get("nbar") == "-" {
				continue
			}
			word := strings.Trim(values[valueCounter], `"`)
			switch {
			case t.Field(i).Type == typefor[string]():
				field.Field(i).SetString(word)
			case t.Field(i).Type == typefor[struct{}]():
				// marker types
				continue
			case t.Field(i).Type.Kind() == reflect.Struct:
				if err := unmarshalStruct(t.Field(i).Type, field.Field(i), word); err != nil {
					return err
				}
			default:
				panic("not implemented")
			}
			valueCounter++
		}
	default:
		if err := unmarshalEntity(field, val); err != nil {
			return err
		}
	}
	return nil
}

func Unmarshal(data []byte, out interface{}) error {
	if err := checkCardType(data); err != nil {
		return err
	}

	tt := reflect.TypeOf(out).Elem()
	v := reflect.ValueOf(out).Elem()
	for i := 0; i < v.NumField(); i++ {
		key := strings.ToLower(tt.Field(i).Name)
		field := v.Field(i)
		t := field.Type()
		if tt.Field(i).Tag.Get("nbar") == "-" || hasDataTag(tt.Field(i)) {
			continue
		}

		val, offset := getValueForKey(string(data), key, "\n", 0)
		if len(val) == 0 {
			//No value in the manifest for this field
			continue
		}
		switch {
		case t == typefor[time.Time]():
			parsedT, err := time.Parse(time.RFC3339, val)
			if err != nil {
				return err
			}
			field.Set(reflect.ValueOf(parsedT))
		case t.Kind() == reflect.String:
			field.SetString(val)
		case t.Kind() == reflect.Bool:
			b, err := strconv.ParseBool(val)
			if err != nil {
				return err
			}
			field.SetBool(b)
		case isBytesType(t):
			field.SetBytes([]byte(val))
		case t.Kind() == reflect.Slice:
			numItems := strings.Count(string(data), key)
			sl := reflect.MakeSlice(t, numItems, numItems)
			for k := 0; k < numItems; k++ {
				if k != 0 {
					val, offset = getValueForKey(string(data), key, "\n", offset)
				}
				switch sl.Index(k).Type().Kind() {
				case reflect.Struct:
					if err := unmarshalStruct(sl.Index(k).Type(), sl.Index(k), val); err != nil {
						return err
					}
				}
			}
			field.Set(reflect.AppendSlice(field, sl))
		case t.Kind() == reflect.Struct:
			if err := unmarshalStruct(t, field, val); err != nil {
				return err
			}
		default:
			panic("not implemented")
		}
	}
	return nil
}

// getValueForKey searchs in the manifest for the value for the specied key, it starts looking from
// the given offset and returns the new offset after finding the value.
// When no value is found for the given key it returns an empty string.
func getValueForKey(manifest, key, cutset string, offset int) (string, int) {
	var start = strings.Index(manifest[offset:], key)
	if start == -1 {
		return "", 0
	}
	start += offset
	end := strings.Index(manifest[start+len(key):], cutset)
	word := strings.TrimSpace(manifest[start+len(key) : start+len(key)+end])
	return strings.Trim(word, `"`), start + len(key) + end
}
