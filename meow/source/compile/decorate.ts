import * as Ast from "../syntax/parser";
import { eval_const_expr } from "./lower";

export function decorate(x: Ast.$$MDecl$_Decorator): Ast.MDecl[] {
  const args = x.args.map(eval_const_expr) as any[];
  switch (x.name) {
    case "derive":
      return derive([x.decl], args[0]);

    case "enum":
      return derive_enum([x.decl]);

    default:
      throw new Error(
        `Unsupported decorator: ${x.name}\n\nAt: ${x.info?.formatted_position_message}`
      );
  }
}

export function derive(x: Ast.MDecl[], traits: string[]) {
  return traits.reduce((decls: Ast.MDecl[], t: string) => {
    switch (t) {
      case "equality":
        return derive_eq(decls);
      default:
        throw new Error(
          `Unsupported trait derivation: ${t}\n\n${(x[0] as any)?.info?.formatted_position_message}`
        );
    }
  }, x);
}

const param = (name: string, type: Ast.MType) => new Ast.MParam(null, null, name, type);
const arg = (value: Ast.MExpr) => new Ast.MInvokeArg(null, null, value);
const get_var = (name: string) => new Ast.MExpr.Var(null, name);
const project = (v: Ast.MExpr, f: string) => new Ast.MExpr.Project(null, v, f);
const type_ref = (ref: Ast.MRef) => new Ast.MType.Ref(null, ref);
const type_variant = (type: Ast.$$MType$_Ref, name: string) =>
  new Ast.MType.Variant(null, type.ref, name);
const nref = (name: string[]) => new Ast.MRef.Named(null, name);
const qref = (pkg: string, name: string[]) => new Ast.MRef.Qualified(null, pkg, name);
const invoke = (name: string, args: Ast.MInvokeArg[]) => new Ast.MExpr.Invoke(null, name, args);
const sinvoke = (name: string, self: Ast.MExpr, args: Ast.MInvokeArg[]) =>
  new Ast.MExpr.InvokeSelf(null, name, self, args);
const lit = (x: Ast.MConst) => new Ast.MExpr.Const(null, x);
const cbool = (x: boolean) => (x ? new Ast.MConst.True(null) : new Ast.MConst.False(null));
const cint = (x: bigint) => new Ast.MConst.Int(null, x);
const ctext = (x: string) => new Ast.MConst.Text(null, JSON.stringify(x));

const tint = type_ref(nref(["int"]));
const tbool = type_ref(nref(["bool"]));
const ttext = type_ref(nref(["text"]));
const tordering = type_ref(qref("meow.core", ["ordering"]));

const lt = new Ast.MExpr.GetVariant(null, qref("meow.core", ["ordering"]), "less-than");
const eq = new Ast.MExpr.GetVariant(null, qref("meow.core", ["ordering"]), "equal");
const gt = new Ast.MExpr.GetVariant(null, qref("meow.core", ["ordering"]), "greater-than");

function derive_eq(x: Ast.MDecl[]): Ast.MDecl[] {
  return x.flatMap((x) => {
    return match(
      x,
      {
        Struct(x0) {
          const x = x0 as any as Ast.$$MDecl$_Struct;
          const t = type_ref(nref([x.name]));
          return [
            x,
            new Ast.MDecl.Implement(x.info, qref("meow.core", ["equality"]), t),
            new Ast.MDecl.Fun(
              x.info,
              "===",
              [param("A", t), param("B", t)],
              tbool,
              [],
              fields_eq(x.fields),
              null,
              null
            ),
          ];
        },
        Union(x0) {
          const x = x0 as any as Ast.$$MDecl$_Union;
          const t = type_ref(nref([x.name]));
          return [
            x,
            new Ast.MDecl.Implement(x.info, qref("meow.core", ["equality"]), t),
            new Ast.MDecl.Fun(
              x.info,
              "===",
              [param("A", t), param("B", t)],
              tbool,
              [],
              lit(cbool(false)),
              null,
              null
            ),
            ...x.variants.map((variant) => {
              const vt = type_variant(t, variant.name);
              return new Ast.MDecl.Fun(
                x.info,
                "===",
                [param("A", vt), param("B", vt)],
                tbool,
                [],
                fields_eq(variant.fields ?? []),
                null,
                null
              );
            }),
          ];
        },
        Decorator: (x) => decorate(x as any).flatMap((v) => derive_eq([v])),
      },
      (x) => [x]
    );
  });
}

function derive_enum(decls: Ast.MDecl[]): Ast.MDecl[] {
  return decls.flatMap((x) => {
    return match(
      x,
      {
        Union(x0) {
          const x = x0 as any as Ast.$$MDecl$_Union;
          const t = type_ref(nref([x.name]));
          return [
            ...derive_eq([x]),
            new Ast.MDecl.Implement(x.info, qref("meow.core", ["total-order"]), t),
            new Ast.MDecl.SFun(
              x.info,
              "compare-to",
              param("Self", t),
              [param("That", t)],
              tordering,
              [],
              sinvoke("compare-to", sinvoke("code", get_var("Self"), []), [
                arg(sinvoke("code", get_var("That"), [])),
              ]),
              null,
              "pure"
            ),
            new Ast.MDecl.Implement(x.info, qref("meow.core", ["enum"]), t),
            ...x.variants.flatMap((variant, i) => {
              const vt = type_variant(t, variant.name);
              return [
                new Ast.MDecl.SFun(
                  x.info,
                  "code",
                  param("Self", vt),
                  [],
                  tint,
                  [],
                  lit(cint(BigInt(i))),
                  null,
                  "pure"
                ),
                new Ast.MDecl.SFun(
                  x.info,
                  "name",
                  param("Self", vt),
                  [],
                  ttext,
                  [],
                  lit(ctext(variant.name)),
                  null,
                  "pure"
                ),
              ];
            }),
          ];
        },
        Decorator(x) {
          return decorate(x as any).flatMap((v) => derive_enum([v]));
        },
      },
      (x) => [x]
    );
  });
}

function fields_eq(fields: Ast.Field[]) {
  return fields.reduce(
    (prev: Ast.MExpr, f: Ast.Field) =>
      invoke("and", [
        arg(prev),
        arg(
          invoke("===", [arg(project(get_var("A"), f.name)), arg(project(get_var("B"), f.name))])
        ),
      ]),
    lit(cbool(true))
  );
}

type DeclPattern = Parameters<Ast.MDecl["match"]>[0];
type OptDeclPattern<A> = { [k in keyof DeclPattern]?: (x: Ast.MDecl) => A };
function match<A>(x: Ast.MDecl, pattern: OptDeclPattern<A>, not_found: (_: Ast.MDecl) => A): A {
  return pattern[x.tag]?.(x) ?? not_found(x);
}
