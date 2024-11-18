package xlsx

import (
	"errors"
	"hash/maphash"
	"strconv"
	"strings"

	"github.com/tealeg/xlsx"
	"go.starlark.net/starlark"
	"go.starlark.net/syntax"
)

type cell struct {
	cell      *xlsx.Cell
	rownum    int
	col       string
	is_date   bool
	data_type string
}

func (c *cell) Type() string { return "trout.software/workbook/sheet/row/cell" }
func (c *cell) String() string {
	val, _ := c.cell.FormattedValue()
	return val
}

func (c *cell) Truth() starlark.Bool { return true }
func (c *cell) Freeze()              {}

func (c *cell) Hash() (uint32, error) {
	return uint32(maphash.String(xlHashSeed, c.cell.Row.Sheet.Name+"!$"+strconv.Itoa(c.rownum)+"$"+c.cell.Value)), nil
}

func (c *cell) CompareSameType(op syntax.Token, y starlark.Value, depth int) (bool, error) {
	// TODO this is inconsistent with Hash above => maybe we want to update String
	// check what openPyXL does, and update spec
	switch op {
	default:
		// TODO that could actually pass
		return false, errors.New("cells are not (yet) totally ordered")
	case syntax.EQL:
		return c.String() == y.String(), nil
	case syntax.NEQ:
		return c.String() != y.String(), nil
	}

}

func (c *cell) Attr(name string) (starlark.Value, error) {
	switch name {
	case "value":
		val, _ := c.cell.FormattedValue()
		if c.is_date {
			return starlark.String(strings.ReplaceAll(val, "\\", "")), nil
		}
		return starlark.String(val), nil
	case "row":
		return starlark.MakeInt(c.rownum), nil
	case "col":
		return starlark.String(c.col), nil
	case "is_date":
		return starlark.Bool(c.is_date), nil
	case "data_type":
		return starlark.String(c.data_type), nil
	default:
		return nil, nil
	}
}

func (c *cell) AttrNames() []string {
	return []string{"value", "row", "col", "is_date", "data_type"}
}

func workbook_iter_cols(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	var (
		row     *row
		min_col string
		max_col string
	)
	err := starlark.UnpackArgs("iter_cols", args, kwargs,
		"row", &row,
		"min_col?", &min_col,
		"max_col?", &max_col,
	)
	if err != nil {
		return starlark.None, err
	}

	if starlark.Value(row) == starlark.None {
		return starlark.None, nil
	}

	cs := make([]starlark.Value, len(row.Cells))
	for i := 0; i < len(row.Cells); i++ {
		max := frombase26(max_col)
		if i+1 < frombase26(min_col) || (max > 0 && i+1 > max) {
			continue
		}
		cs[i] = &cell{cell: row.Cells[i], col: tobase26(i + 1), rownum: row.num, data_type: row.Cells[i].NumFmt, is_date: row.Cells[i].IsTime()}
	}
	return starlark.NewList(cs), nil
}

// convert to a base26 number with digits between 'A' and 'Z' (such as in column names)
// If a number exceeds 16384 (the maximum number of colums [1]), an empty string is returned
//
// [1]: https://support.microsoft.com/en-gb/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3
func tobase26(num int) string {
	if num > 16384 {
		return ""
	}

	result := [3]byte{} // protected by check above
	i := 2
	for num > 0 {
		remainder := (num - 1) % 26
		result[i] = byte('A' + remainder)
		num = (num - 1) / 26
		i--
	}
	return string(result[i+1:])
}

// frombase26 returns the integer from a base26-encoded value with digits between 'A' and 'Z'
// if the string contains non-sensical characters or exceeds the maximum value allowed (16384), 1 is returned instead.
// there is no way to distinguish between 'A' and an invalid value.
func frombase26(col string) int {
	result := 0
	for _, c := range col {
		if c < 'A' || c > 'Z' {
			return 1
		}

		result *= 26
		result += int(c) - int('A') + 1

		if result > 16384 {
			return 1
		}
	}
	return result
}
