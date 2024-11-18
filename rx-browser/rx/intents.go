package rx

type container struct {
	nd *Node
	ws []Widget
	hm intentHandler
}

type intentHandler [Seppuku]func(Context) Context

func (i *intentHandler) Some() bool {
	for _, h := range i {
		if h != nil {
			return true
		}
	}
	return false
}

func (cnt *container) Build(ctx Context) *Node {
	if len(cnt.hm) != 0 && cnt.nd.Entity == 0 {
		// curtesy, create the entity for user
		cnt.nd.GiveKey(ctx)
	}

	if len(cnt.hm) != 0 {
		cnt.nd.hdl = cnt.hm
	}

	cnt.nd.Children = make([]*Node, len(cnt.ws))
	for i := range cnt.nd.Children {
		cnt.nd.Children[i] = cnt.ws[i].Build(ctx)
	}

	return cnt.nd
}

type WrapOpts func(*container)

func Children(ws ...Widget) WrapOpts {
	for _, w := range ws {
		assert(w != nil, "nil widget set as child")
	}
	return func(c *container) { c.ws = append(c.ws, ws...) }
}

func OnIntent(evt IntentType, h Action) WrapOpts {
	return func(c *container) { c.hm[evt] = h }
}

func W(nd *Node, opts ...WrapOpts) Widget {
	c := &container{nd: nd}
	c.ws = make([]Widget, len(nd.Children))
	for i := range nd.Children {
		c.ws[i] = nd.Children[i]
	}
	for _, o := range opts {
		o(c)
	}
	return c
}

// shortcut for very common widgets
func Span(cls string, v string) *Node  { return GetNode("span").AddClasses(cls).SetText(v) }
func Text(cls string, v string) *Node  { return GetNode("p").AddClasses(cls).SetText(v) }
func Button(cls string, w *Node) *Node { return GetNode("button").AddClasses(cls).AddChildren(w) }
func Img(cls string, ref string) *Node { return GetNode("img").AddClasses(cls).AddAttr("src", ref) }
func WrapIn(cls string, ws ...Widget) Widget {
	return W(GetNode("div").AddClasses(cls), Children(ws...))
}

// Nothing returns a node that does not appear in the DOM.
// This is useful in conditionals, making branches regular, e.g.:
//
//	  x := Nothing()
//	  if val > threshold {
//			x = alert()
//	  }
//
// During the rendering phase, Nothing is optimized away; which means that:
//
//  1. Terminal nodes will simply not exist
//  2. Children of Nothing nodes will become children of the parent of the Nothing node.
func Nothing(ws ...*Node) *Node { return GetNode("nothing").AddChildren(ws...) }
