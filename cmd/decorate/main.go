// Decorate is a tool to apply transforms to a function.
// This is mainly useful for aspect-oriented patterns around specific functions, where a simple defer is not enough.
package main

import (
	"bytes"
	"flag"
	"fmt"
	"go/ast"
	"go/format"
	"go/token"
	"go/types"
	"log"
	"strings"

	"golang.org/x/tools/go/packages"
)

func main() {
	loom := flag.String("t", "", "template used to rewrite the function")
	pointcut := flag.String("p", "", "pattern matching functions that need to be rewritten") // should probably be args
	flag.Parse()

	if !strings.HasPrefix(*pointcut, "_") {
		log.Fatal("by convention, only functions starting with an underscore are rewritten")
	}
	if m := strings.Index(*pointcut, "*"); m != -1 {
		*pointcut = (*pointcut)[:m]
	}

	out := new(bytes.Buffer)

	jp, sig := findjoinpoint(*pointcut)

	fmt.Fprintln(out, "// Code generated by the decorator; DO NOT EDIT.")
	fmt.Fprintf(out, "package %s\n", sig.Params().At(0).Name())
	fmt.Fprintln(out, "import (")

	tpl, err := packages.Load(&packages.Config{
		Mode: packages.NeedName | packages.NeedTypes | packages.NeedTypesInfo | packages.NeedSyntax | packages.NeedImports,
	}, *loom)
	if err != nil {
		log.Fatal(err)
	}
	for _, pkg := range tpl {
		for _, v := range pkg.Imports {
			fmt.Fprintf(out, "\"%s\"\n", v.PkgPath)
		}
		tgt := pkg.Types.Scope().Lookup("F")
		if tgt == nil {
			log.Fatal("function `F` must be defined in the template")
		}

		for i := 0; i < sig.Params().Len(); i++ {
			switch t := sig.Params().At(i).Type().(type) {
			case *types.Named:
				fmt.Fprintf(out, "\"%s\"\n", t.Obj().Pkg().Path())
			}
		}
		fmt.Fprintln(out, ")")

		keep := unify(sig, tgt.Type().(*types.Signature))

		for _, f := range pkg.Syntax {
			var wv *ast.FuncDecl
			for _, d := range f.Decls {
				d, ok := d.(*ast.FuncDecl)
				if ok && d.Name.Name == "Weave" {
					wv = d
				}
			}
			if wv == nil {
				log.Fatal("only one file for the rewrite?")
			}

			wv.Name = ast.NewIdent(pubname(jp.Name.Name))
			wv.Type.Params = jp.Type.Params

			var args []ast.Expr
			for _, arg := range jp.Type.Params.List {
				for _, n := range arg.Names {
					args = append(args, n)
				}
			}

			ast.Inspect(wv, func(n ast.Node) bool {
				ce, ok := n.(*ast.CallExpr)
				if !ok {
					return true
				}
				id, ok := ce.Fun.(*ast.Ident)
				if !ok || pkg.TypesInfo.Uses[id] != tgt {
					return true
				}

				ce.Fun = jp.Name
				ce.Args = append(ce.Args[:keep], args...)
				// clean up trailing aspects
				ce.Ellipsis = token.NoPos
				ce.Rparen = token.NoPos
				return false
			})

			// TODO(rdo) pass comments?
			format.Node(out, pkg.Fset, wv)
		}
	}

	got, err := format.Source(out.Bytes())
	if err != nil {
		log.Fatal("panic: incorrect code", err)
	}

	log.Println(string(got))
}

func findjoinpoint(pointcut string) (decl *ast.FuncDecl, sig *types.Signature) {
	pkg, err := packages.Load(&packages.Config{
		Mode: packages.NeedName | packages.NeedTypes | packages.NeedTypesInfo | packages.NeedSyntax,
	}, ".")
	if err != nil {
		log.Fatal(err)
	}

	for _, pkg := range pkg {
		for _, f := range pkg.Syntax {
			ast.Inspect(f, func(n ast.Node) bool {
				ts, ok := n.(*ast.FuncDecl)
				if !ok || !strings.HasPrefix(ts.Name.Name, pointcut) {
					return true
				}
				decl = ts
				sig = pkg.TypesInfo.Defs[ts.Name].Type().(*types.Signature)
				return false
			})
		}
	}

	return
}

func pubname(id string) string { return id[1:] }

// simple unification algorithm: match “any” with whatever is on the left
func unify(orig, trans *types.Signature) int {
	for i := 0; i < trans.Params().Len(); i++ {
		switch t := trans.Params().At(i).Type().(type) {
		case *types.Slice:
			// triple-dot args
			if iface, ok := t.Elem().(*types.Interface); ok && iface.Empty() {
				return i
			}
		}
	}

	return 0
}