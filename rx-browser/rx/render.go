package rx

import (
	"encoding/binary"
	"fmt"
	"strconv"
	"strings"
	"sync"
)

type Node struct {
	Entity   // simple reference
	TagName  string
	Classes  string
	Text     string
	Focused  bool
	Children []*Node
	Attrs    []Attr // for arbitrary HTML elements

	visited bool

	old Entity // for reuse nodes
	hdl intentHandler
}

func (n *Node) SetText(text string) *Node { n.Text = text; return n }

func (n *Node) AddChildren(cs ...*Node) *Node { n.Children = append(n.Children, cs...); return n }
func (n *Node) GiveKey(ctx Context) *Node     { n.Entity = ctx.ng.cnt.Inc(); return n }
func (n *Node) AddAttr(key, val string) *Node {
	n.Attrs = append(n.Attrs, Attr{Name: key, Value: val})
	return n
}
func (n *Node) OnIntent(evt IntentType, h Action) *Node {
	n.hdl[evt] = h
	return n
}
func (n *Node) Focus(ctx Context) *Node { n.Focused = true; return n.GiveKey(ctx) }

// Set ARIA role, using the "role" property
// Useful for reliable tests
func (n *Node) AddRole(role string) *Node {
	// it's "role", not "aria-role"
	return n.AddAttr("role", role)
}

// AddClasses to a node.
// If the classes already exists, they are not modified.
// Empty classes are simply ignored.
//
// Example:
//
//	GetNode("td").SetClass("table-cell"); td().AddClass("bg-blue")
func (n *Node) AddClasses(cls ...string) *Node {

	c := strings.Join(cls, " ")
	if n.Classes == "" {
		n.Classes = c
	} else {
		n.Classes = n.Classes + " " + c
	}
	return n
}

// Can be used for attributes such as checkbox "checked", button "disabled"
// Example:
// GetNode("button").AddBoolAttr("disabled", isDisabled)
func (n *Node) AddBoolAttr(key string, val bool) *Node {
	if val {
		n.Attrs = append(n.Attrs, Attr{Name: key, Value: ""})
	}
	return n
}

func (n *Node) IsNothing() bool {
	return n.TagName == "nothing"
}

func printEntityTreeRec(n *Node, strb *strings.Builder, level int) {
	if n == nil {
		return
	}
	tabs := strings.Repeat("\t", level) + "| "
	if n.Entity != 0 {
		ntag := fmt.Sprintf(tabs+n.PrintInline()+"\n", n.TagName, n.Entity, n.Classes, n.Attrs)
		strb.WriteString(ntag)
	} else {
		strb.WriteString(tabs + "non-entity-node\n")
	}
	for _, c := range n.Children {
		printEntityTreeRec(c, strb, level+1)
	}
}

// PrintEntityTree for debugging
// Running on the root node should show all entities
func (n *Node) PrintEntityTree() string {
	var strb strings.Builder
	printEntityTreeRec(n, &strb, 0)
	return strb.String()
}
func (n *Node) PrintInline() string {
	return fmt.Sprintf("%s entity='%d' class='%s' attrs='%v'", n.TagName, n.Entity, n.Classes, n.Attrs)

}

// CopyFrom creates a node that will be copied from its previous value in the DOM.
func ReuseFrom(ctx Context, nt Entity) *Node {
	n := GetNode("reuse")
	n.old = nt
	return n.GiveKey(ctx)
}

type Attr struct{ Name, Value string }

type flist struct {
	next  *flist
	nodes []Node
}

var npool = struct {
	flist
	free *flist
	nmtx sync.Mutex
}{flist: flist{nodes: make([]Node, 0, 512)}}

// GetNode returns a node from the pool, minimizing allocations.
// The pool is re-initialized as a whole during each cycle.
func GetNode(tagname string) *Node {
	npool.nmtx.Lock()
	defer npool.nmtx.Unlock()

	// invariant: pool next is nil iff len(nodes) < cap(nodes)

	pool := &npool.flist
	for pool.next != nil {
		pool = pool.next
	}

	pool.nodes = pool.nodes[:len(pool.nodes)+1]
	if len(pool.nodes) == cap(pool.nodes) {
		if npool.free != nil {
			pool.next = &flist{nodes: npool.free.nodes[:0]}
			npool.free = npool.free.next
		} else {
			pool.next = &flist{nodes: make([]Node, 0, 512)}
		}
	}

	last := &pool.nodes[len(pool.nodes)-1]
	// reset all fields, preserve space already alloc for values
	*last = Node{TagName: tagname, Attrs: last.Attrs[:0], Children: last.Children[:0]}
	return last
}

// FreePool de-allocate all nodes at once.
func FreePool() {
	npool.nmtx.Lock()
	defer npool.nmtx.Unlock()

	npool.free, npool.next = npool.next, nil
	npool.nodes = npool.nodes[:0]
}

// serialize does a preorder visit of the node tree, keeping track of nodes in the entity tree
func serialize(n *Node, tree *etree, ctr *Counter, vm XAS) XAS {
	if n.visited {
		panic("cycle detected")
	}
	n.visited = true

	switch n.TagName {
	case "":
		panic("empty tag name")

	case "nothing":
		for _, c := range n.Children {
			assert(c != nil, "nil child in node: %v", n)
			vm = serialize(c, tree, ctr, vm)
		}
		return vm

	case "reuse":
		vm = vm.AddInstr(OpReuse, strconv.FormatUint(uint64(n.old), 10))
		// walk all the child nodes to port the ID
		// TODO(rdo) check what that means wtr handlers
		tree.reuse(n.old, n.Entity, ctr, func(from, to Entity) {
			vm = vm.AddInstr(OpReID,
				strconv.FormatUint(uint64(from), 10),
				strconv.FormatUint(uint64(to), 10))

		})

		return vm
	}
	vm = vm.AddInstr(OpCreateElement, n.TagName)

	if len(n.Classes) > 0 {
		vm = vm.AddInstr(OpSetClass, n.Classes)
	}

	if n.Entity == 0 && n.hdl.Some() {
		// curtesy, create the entity for user
		n.Entity = ctr.Inc()
	}

	var idx int
	if n.Entity != 0 {
		idx = tree.add(n.Entity)
		if n.hdl.Some() {
			tree.addHandler(n.hdl)
		}
		vm = vm.AddInstr(OpSetID, strconv.FormatUint(uint64(n.Entity), 10))
	}

	for _, a := range n.Attrs {
		vm = vm.AddInstr(OpSetAttr, a.Name, a.Value)
	}
	if n.Text != "" {
		vm = vm.AddInstr(OpAddText, n.Text)
	}

	for _, c := range n.Children {
		vm = serialize(c, tree, ctr, vm)
	}
	if n.Entity != 0 {
		tree.closeScope(idx)
	}

	return vm.AddInstr(OpNext)
}

// Build bottoms-out the rendering tree: a node is a widget that is self
func (n *Node) Build(_ Context) *Node { return n }

// BuildWidgets creates a slice of nodes by rendering each widget.
// It takes care of ignoring nil values.
func BuildWidgets(ctx Context, ws []Widget) []*Node {
	ns := make([]*Node, len(ws))
	j := 0
	for _, w := range ws {
		if w == nil {
			continue
		}
		ns[j] = w.Build(ctx)
		j++
	}
	return ns[:j]
}

//go:generate rxabi -type OpType

// using an alias let's us run go generate but do not alter existing code
type OpType = byte

const (
	OpTerm OpType = iota
	OpCreateElement
	OpSetClass
	OpSetID
	OpSetAttr
	OpAddText
	OpReuse
	OpReID
	OpNext
)

type XAS []byte

func (vm XAS) AddInstr(code byte, val ...string) XAS {
	vm = append(vm, code)
	for i := range val {
		vm = binary.BigEndian.AppendUint16(vm, uint16(len(val[i])))
		vm = append(vm, val[i]...)
	}
	return vm
}
