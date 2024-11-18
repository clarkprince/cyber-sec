package xlsx

import (
	"errors"
	"fmt"
	"hash/maphash"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/tealeg/xlsx"
	"go.starlark.net/starlark"
)

var BuiltIns = starlark.StringDict{
	"record":   starlark.NewBuiltin("record", record),
	"workbook": starlark.None,
	"load":     starlark.None,
}

var workbookMethods = map[string]*starlark.Builtin{
	"iter_sheets":   starlark.NewBuiltin("iter_sheets", workbook_iter_sheets),
	"iter_rows":     starlark.NewBuiltin("iter_rows", workbook_iter_rows),
	"iter_cols":     starlark.NewBuiltin("iter_cols", workbook_iter_cols),
	"defined_names": starlark.NewBuiltin("defined_names", workbook_defined_names),
	"row_has_data":  starlark.NewBuiltin("row_has_data", workbook_row_has_data),
	"parserange":    starlark.NewBuiltin("parserange", workbook_parserange),
}

type wb struct {
	Workbook *xlsx.File
	Name     string
}

var xlHashSeed = maphash.MakeSeed()

func (w *wb) Type() string         { return "trout.software/workbook" }
func (w *wb) String() string       { return string(w.Name) }
func (w *wb) Truth() starlark.Bool { return true }
func (w *wb) Freeze()              {}

func (w *wb) Hash() (uint32, error) { return uint32(maphash.String(xlHashSeed, w.Name)), nil }

func workbook(path string) (starlark.Value, error) {
	xlsxFile, err := xlsx.OpenFile(path)
	if err != nil {
		return nil, err
	}
	return &wb{Workbook: xlsxFile, Name: filepath.Base(path)}, nil
}

type ranges struct {
	sheet    *sheet
	rowstart int
	rowend   int
	colstart string
	colend   string
}

func (rn *ranges) Type() string { return "trout.software/workbook/ranges" }
func (rn *ranges) String() string {
	return ""
}
func (rn *ranges) Truth() starlark.Bool { return true }
func (rn *ranges) Freeze()              {}

func (rn *ranges) Hash() (uint32, error) {
	return 0, errors.New("unhashable type: trout.software/workbook/ranges")
}

func (rn *ranges) Attr(name string) (starlark.Value, error) {
	switch name {
	case "sheet":
		return rn.sheet, nil
	case "rowstart":
		return starlark.MakeInt(rn.rowstart), nil
	case "rowend":
		return starlark.MakeInt(rn.rowend), nil
	case "colstart":
		return starlark.String(rn.colstart), nil
	case "colend":
		return starlark.String(rn.colend), nil
	default:
		return nil, nil
	}
}

func (rn *ranges) AttrNames() []string {
	return []string{"sheet", "rowstart", "rowend", "colstart", "colend"}
}

func workbook_defined_names(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	recv := b.Receiver().(*wb)
	var name string
	err := starlark.UnpackArgs("defined_names", args, kwargs,
		"name", &name,
	)
	if err != nil {
		return starlark.None, err
	}

	for _, definedName := range recv.Workbook.DefinedNames {
		if definedName.Name != name {
			continue
		}
		cellRefs := strings.Split(definedName.Data, ",")
		for _, cellRef := range cellRefs {
			cellRef = strings.TrimSpace(cellRef)
			if strings.Contains(cellRef, ":") {
				ranges, err := parserange(recv, cellRef)
				if err != nil {
					return starlark.None, err
				}
				return ranges, nil
			}
		}
	}
	return starlark.None, nil
}

func workbook_parserange(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	recv := b.Receiver().(*wb)
	var cellRef string
	err := starlark.UnpackArgs("parserange", args, kwargs,
		"cellRef", &cellRef,
	)
	if err != nil {
		return starlark.None, err
	}

	return parserange(recv, cellRef)
}

func parserange(w *wb, cellRef string) (starlark.Value, error) {
	parts := strings.Split(cellRef, "!")
	if len(parts) != 2 {
		return starlark.None, fmt.Errorf("invalid cell reference %s", cellRef)
	}

	ranges := &ranges{}
	sheetName := strings.Trim(parts[0], "'")
	worksheet, ok := w.Workbook.Sheet[sheetName]
	if !ok {
		return starlark.None, fmt.Errorf("sheet %s not found", sheetName)
	}
	ranges.sheet = &sheet{worksheet}

	points := strings.Split(parts[1], ":")
	if len(points) != 2 {
		return starlark.None, fmt.Errorf("invalid cell reference %s", cellRef)
	}

	startPoint := strings.Split(points[0], "$")
	if len(startPoint) != 3 {
		return starlark.None, fmt.Errorf("invalid start point %s", cellRef)
	}
	ranges.colstart = startPoint[1]

	endPoint := strings.Split(points[1], "$")
	if len(endPoint) != 3 {
		return starlark.None, fmt.Errorf("invalid end point %s", cellRef)
	}
	ranges.colend = endPoint[1]

	var err error
	ranges.rowstart, err = strconv.Atoi(startPoint[2])
	if err != nil {
		return starlark.None, fmt.Errorf("invalid row start %s", cellRef)
	}

	ranges.rowend, err = strconv.Atoi(endPoint[2])
	if err != nil {
		return starlark.None, fmt.Errorf("invalid row end %s", cellRef)
	}
	return ranges, nil
}

func (w *wb) Attr(name string) (starlark.Value, error) {
	return builtinAttr(w, name, workbookMethods)
}
func (w *wb) AttrNames() []string { return builtinAttrNames(workbookMethods) }
