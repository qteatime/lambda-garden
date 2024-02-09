import * as FS from "fs";
import * as Path from "path";
import * as Ast from "../generated/grammar";
import { from_json, to_json } from "./serialise";
export * from "../generated/grammar";

const version = 6;

export function parse_file(path: string, root0: string | null) {
  try {
    const stat = FS.statSync(path);
    const root = root0 ?? Path.dirname(path);
    const cache = Path.join(root, ".meow", Path.relative(root, path) + ".meowc");
    if (FS.existsSync(cache)) {
      const cstat = FS.statSync(cache);
      if (cstat.mtimeMs >= stat.mtimeMs) {
        const { source, version: cv, ast } = JSON.parse(FS.readFileSync(cache, "utf-8"));
        if (cv != null && cv === version) {
          return from_json(ast, source);
        }
      }
    }
    const source = FS.readFileSync(path, "utf-8");
    const ast = parse(source, path);
    FS.mkdirSync(Path.dirname(cache), { recursive: true });
    FS.writeFileSync(cache, JSON.stringify({ source, version, ast: to_json(ast) }));
    return ast;
  } catch (e: any) {
    throw new Error(`Failed to parse ${path}:\n\n${e?.stack ?? e}`);
  }
}

export function parse(source: string, filename: string) {
  const tree = Ast.parse(source, "Module");
  if (tree.ok) {
    return tree.value;
  } else {
    throw new SyntaxError(`Failed to parse ${filename}:\n\n${tree.error}`);
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

export function fun_parts(name: string, params: Ast.MParam[], constraints: Ast.MTypeConstraint[]) {
  return def_from_params(name, params, constraints);
}

export function sfun_parts(
  name: string,
  self: Ast.MParam,
  params0: Ast.MParam[],
  constraints: Ast.MTypeConstraint[]
) {
  const params = [new Ast.MParam(self.info, "self", self.name, self.typ), ...params0];
  return def_from_params(name, params, constraints);
}

export function handler_parts(
  name: string,
  params: Ast.MParam[],
  constraints: Ast.MTypeConstraint[]
) {
  return def_from_params(name, params, constraints);
}

function def_from_params(name: string, params: Ast.MParam[], constraints: Ast.MTypeConstraint[]) {
  const apply = (name0: string, constraint: Ast.MTypeConstraint) => {
    return constraint.match({
      HasTrait(info, name, ref) {
        if (name0 === name) {
          return [ref];
        } else {
          return [];
        }
      },
    });
  };

  const resolve = (t: Ast.MType) => {
    return t.match({
      Fun: () => t,
      Infer: () => t,
      Record: () => t,
      Ref: () => t,
      Self: () => t,
      Static: () => t,
      StaticSelf: () => t,
      Trait: () => t,
      Variant: () => t,
      WithTraits: () => t,
      Package: () => t,
      StaticVar(info, name) {
        const traits = constraints.flatMap((x) => apply(name, x));
        return new Ast.MType.WithTraits(info, t, traits);
      },
      Var(info, name) {
        const traits = constraints.flatMap((x) => apply(name, x));
        return new Ast.MType.WithTraits(info, t, traits);
      },
    });
  };

  const keywords = params.flatMap((x) => (x.keyword == null ? [] : [x.keyword + ":"])).join("");
  const args = params.map((x, i) => (x.name == null || x.name === "_" ? `$${i}` : x.name));
  const types = params.map((x) => resolve(x.typ));
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
