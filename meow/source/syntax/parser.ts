import * as Ast from "../generated/grammar";
export * from "../generated/grammar";

export function parse(source: string) {
  const tree = Ast.parse(source, "Module");
  if (tree.ok) {
    return tree.value;
  } else {
    throw new SyntaxError(tree.error);
  }
}

export function parse_repl(source: string): Ast.MRepl {
  const result = Ast.grammar.match(source, "Repl");
  if (result.failed()) {
    throw new SyntaxError(result.message as string);
  } else {
    return Ast.toAst(result);
  }
}

export function trait_req_name(x: Ast.TraitReq) {
  return x.match({
    Required(name, params) {
      const kws = ["self:"]
        .concat(params.flatMap((x) => (x.keyword == null ? [] : [x.keyword + ":"])))
        .join("");
      return `${name}(${kws})/${params.length + 1}`;
    },
    Provided(fn: Ast.$$MDecl$_SFun) {
      const { name } = sfun_parts(fn.name, fn.self, fn.params);
      return name;
    },
  });
}

export function fun_parts(name: string, params: Ast.MParam[]) {
  const keywords = params.flatMap((x) => (x.keyword == null ? [] : [x.keyword + ":"])).join("");
  const args = params.map((x, i) => (x.name == null || x.name === "_" ? `$${i}` : x.name));
  const types = params.map((x) => x.typ);

  return {
    name: `${name}(${keywords})/${params.length}`,
    args,
    types,
  };
}

export function sfun_parts(name: string, self: Ast.MParam, params0: Ast.MParam[]) {
  const params = [new Ast.MParam(self.info, "self", self.name, self.typ), ...params0];
  const keywords = params.flatMap((x) => (x.keyword == null ? [] : [x.keyword + ":"])).join("");
  const args = params.map((x, i) => (x.name == null ? `$${i}` : x.name));
  const types = params.map((x) => x.typ);

  return {
    name: `${name}(${keywords})/${params.length}`,
    args,
    types,
  };
}

export function invoke_parts(name: string, params: Ast.MInvokeArg[]) {
  const keywords = params.flatMap((x) => (x.keyword == null ? [] : [x.keyword + ":"])).join("");
  const args = params.map((x, i) => x.value);

  return {
    name: `${name}(${keywords})/${params.length}`,
    args,
  };
}

export function sinvoke_parts(name: string, self: Ast.MExpr, params: Ast.MInvokeArg[]) {
  const keywords = ["self:"]
    .concat(params.flatMap((x) => (x.keyword == null ? [] : [x.keyword + ":"])))
    .join("");
  const args = [self, ...params.map((x, i) => x.value)];

  return {
    name: `${name}(${keywords})/${params.length + 1}`,
    args,
  };
}
