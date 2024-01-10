import * as Ast from "../syntax/parser";

export function desugar(x: Ast.MExpr): Ast.MExpr {
  return x.match({
    Apply(info, callee, args) {
      return lift([callee, ...args], ([callee, ...args]) => {
        return new Ast.MExpr.Apply(info, callee, args);
      });
    },
    Assert(info, expr, atag) {
      return new Ast.MExpr.Assert(info, desugar(expr), atag);
    },
    Block(info, exprs) {
      return new Ast.MExpr.Block(info, exprs.map(desugar));
    },
    Const(info, value) {
      return x;
    },
    Force(info, thunk) {
      return lift([thunk], (xthunk) => new Ast.MExpr.Force(info, thunk));
    },
    GetGlobal(info, ref) {
      return x;
    },
    GetVariant(info, ref, variant) {
      return x;
    },
    Hole(info) {
      return x;
    },
    If(info, clauses) {
      return new Ast.MExpr.If(
        null,
        clauses.map((x) => {
          return new Ast.MIfClause(null, desugar(x.guard), desugar(x.body));
        })
      );
    },
    Pipe(info, left, right) {
      return new Ast.MExpr.Pipe(info, desugar(left), desugar(right));
    },
    IntrinsicEq(info, left, right) {
      return lift([left, right], ([left, right]) => {
        return new Ast.MExpr.IntrinsicEq(info, left, right);
      });
    },
    Invoke(info, name, args) {
      return lift(
        args.map((x) => x.value),
        (vals) => {
          return new Ast.MExpr.Invoke(
            info,
            name,
            args.map((x, i) => new Ast.MInvokeArg(x.info, x.keyword, vals[i]))
          );
        }
      );
    },
    InvokeSelf(info, name, self, args) {
      return lift([self, ...args.map((x) => x.value)], ([self, ...vals]) => {
        return new Ast.MExpr.InvokeSelf(
          info,
          name,
          self,
          args.map((x, i) => new Ast.MInvokeArg(x.info, x.keyword, vals[i]))
        );
      });
    },
    Is(info, expr, typ) {
      return lift([expr], ([expr]) => {
        return new Ast.MExpr.Is(info, expr, typ);
      });
    },
    IsVariant(info, expr, typ, variant) {
      return lift([expr], ([expr]) => {
        return new Ast.MExpr.IsVariant(info, expr, typ, variant);
      });
    },
    Lambda(info, params, body) {
      return new Ast.MExpr.Lambda(info, params, desugar(body));
    },
    Lazy(info, expr) {
      return new Ast.MExpr.Lazy(info, desugar(expr));
    },
    Let(info, name, typ, value) {
      return new Ast.MExpr.Let(info, name, typ, desugar(value));
    },
    List(info, items) {
      return lift(items.flatMap(list_subexprs), (exprs) => {
        return new Ast.MExpr.List(
          info,
          items.map((x, i) => list_item(x, exprs[i]))
        );
      });
    },
    Map(info, pairs) {
      return lift(pairs.flatMap(map_subexprs), (exprs) => {
        return new Ast.MExpr.Map(
          info,
          pairs.reduce(
            ({ entries, args: args0 }, x) => {
              const { entry, args } = map_item(x, args0);
              return { entries: entries.concat([entry]), args };
            },
            { entries: [] as Ast.MapItem[], args: exprs }
          ).entries
        );
      });
    },
    New(info, ref, fields) {
      return lift(
        fields.map((x) => x.value),
        (exprs) => {
          return new Ast.MExpr.New(
            info,
            ref,
            fields.map((x, i) => new Ast.EPair(x.name, exprs[i]))
          );
        }
      );
    },
    NewPos(info, ref, values) {
      return lift(values, (values) => {
        return new Ast.MExpr.NewPos(info, ref, values);
      });
    },
    NewVariant(info, ref, variant, fields) {
      return lift(
        fields.map((x) => x.value),
        (exprs) => {
          return new Ast.MExpr.NewVariant(
            info,
            ref,
            variant,
            fields.map((x, i) => new Ast.EPair(x.name, exprs[i]))
          );
        }
      );
    },
    NewVariantPos(info, ref, variant, args) {
      return lift(args, (args) => {
        return new Ast.MExpr.NewVariantPos(info, ref, variant, args);
      });
    },
    Primitive(info, name, args) {
      return lift(args, (args) => new Ast.MExpr.Primitive(info, name, args));
    },
    Foreign(info, name, args) {
      return lift(args, (args) => new Ast.MExpr.Foreign(info, name, args));
    },
    Project(info, value, field) {
      return lift([value], ([value]) => new Ast.MExpr.Project(info, value, field));
    },
    Record(info, fields) {
      return lift(
        fields.map((x) => x.value),
        (vals) =>
          new Ast.MExpr.Record(
            info,
            fields.map((x, i) => new Ast.EPair(x.name, vals[i]))
          )
      );
    },
    Self(info) {
      return x;
    },
    Static(info, ref) {
      return x;
    },
    Var(info, name) {
      return x;
    },
    Continue(info, bindings) {
      return new Ast.MExpr.Continue(
        info,
        bindings.map((x) => new Ast.EPair(x.name, desugar(x.value)))
      );
    },
    Repeat(info, bindings, body) {
      return new Ast.MExpr.Repeat(
        info,
        bindings.map((x) => new Ast.EBind(x.name, x.typ, desugar(x.value))),
        desugar(body)
      );
    },
    Break(info, value) {
      return new Ast.MExpr.Break(info, desugar(value));
    },
    Binary(info, elements) {
      return x;
    },
  });
}

function list_subexprs(x: Ast.ListItem) {
  return x.match({
    Item(value) {
      return [value];
    },
    Spread(value) {
      return [value];
    },
  });
}

function list_item(x: Ast.ListItem, v: Ast.MExpr) {
  return x.match<Ast.ListItem>({
    Item(value) {
      return new Ast.ListItem.Item(v);
    },
    Spread(value) {
      return new Ast.ListItem.Spread(v);
    },
  });
}

function map_subexprs(x: Ast.MapItem) {
  return x.match({
    Pair(key, value) {
      return [key, value];
    },
    Spread(value) {
      return [value];
    },
  });
}

function map_item(x: Ast.MapItem, args: Ast.MExpr[]) {
  return x.match<{ entry: Ast.MapItem; args: Ast.MExpr[] }>({
    Pair(key, value) {
      const [k, v, ...rest] = args;
      return { entry: new Ast.MapItem.Pair(k, v), args: rest };
    },
    Spread(value) {
      const [v, ...rest] = args;
      return { entry: new Ast.MapItem.Spread(v), args: rest };
    },
  });
}

function lift(exprs0: Ast.MExpr[], build: (args: Ast.MExpr[]) => Ast.MExpr) {
  const exprs = exprs0.map(desugar);
  if (exprs.some(is_hole)) {
    const holes = exprs.map((x, i) => ({ index: i, value: x }));
    const params = holes.flatMap((x) => to_lambda_param(x));
    const args = holes.map((x) => to_lambda_arg(x));
    return new Ast.MExpr.Lambda(null, params, build(args));
  } else {
    return build(exprs);
  }
}

function to_lambda_param(x: { index: number; value: Ast.MExpr }) {
  if (is_hole(x.value)) {
    return [`$h${x.index}`];
  } else {
    return [];
  }
}

function to_lambda_arg(x: { index: number; value: Ast.MExpr }) {
  if (is_hole(x.value)) {
    return new Ast.MExpr.Var(null, `$h${x.index}`);
  } else {
    return x.value;
  }
}

function is_hole(x: Ast.MExpr) {
  return x.tag === "Hole";
}
