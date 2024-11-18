package xlsx

import (
	"hash/maphash"
	"strconv"

	"github.com/tealeg/xlsx"
	"go.starlark.net/starlark"
)

type row struct {
	*xlsx.Row
	num int
}

func (r *row) Type() string { return "trout.software/workbook/sheet/row" }
func (r *row) String() string {
	return r.Sheet.Name + "!$$" + strconv.Itoa(r.num)
}
func (r *row) Truth() starlark.Bool { return true }
func (r *row) Freeze()              {}

func (r *row) Hash() (uint32, error) {
	var fpseed = maphash.MakeSeed()
	return uint32(maphash.String(fpseed, r.String())), nil
}

func workbook_iter_rows(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	var (
		sheet   *sheet
		min_row int = 0
		max_row int = 0
	)
	err := starlark.UnpackArgs("iter_rows", args, kwargs,
		"sheet", &sheet,
		"min_row?", &min_row,
		"max_row?", &max_row)
	if err != nil {
		return nil, err
	}

	rows := make([]starlark.Value, len(sheet.Rows))
	for i := 0; i < len(sheet.Rows); i++ {
		if (min_row > 0 && i+1 < min_row) || (max_row > 0 && i+1 > max_row) {
			rows[i] = starlark.None
			continue
		}
		rows[i] = &row{sheet.Rows[i], i + 1}
	}
	return starlark.NewList(rows), nil
}

func workbook_row_has_data(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	var row starlark.Value
	err := starlark.UnpackArgs("row_has_data", args, kwargs,
		"row", &row,
	)
	if err != nil {
		return starlark.None, err
	}

	if row == starlark.None {
		return starlark.False, nil
	}
	return starlark.True, nil
}
