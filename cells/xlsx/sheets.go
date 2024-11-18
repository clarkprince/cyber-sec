package xlsx

import (
	"errors"

	"github.com/tealeg/xlsx"
	"go.starlark.net/starlark"
)

type sheet struct {
	*xlsx.Sheet
}

func (s *sheet) Type() string { return "trout.software/workbook/sheet" }
func (s *sheet) String() string {
	return s.Name
}
func (s *sheet) Truth() starlark.Bool { return true }
func (s *sheet) Freeze()              {}

func (s *sheet) Hash() (uint32, error) {
	return 0, errors.New("unhashable type: trout.software/workbook/sheet")
}

func workbook_iter_sheets(thread *starlark.Thread, b *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {
	recv := b.Receiver().(*wb)
	sh := make([]starlark.Value, len(recv.Workbook.Sheets))
	for i, ss := range recv.Workbook.Sheets {
		sh[i] = &sheet{ss}
	}
	return starlark.NewList(sh), nil
}
