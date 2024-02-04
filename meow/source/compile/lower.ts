import * as Ast from "../syntax/parser";
import * as Path from "path";
import * as FS from "fs";
import { desugar } from "./desugar";

export const prelude_code = FS.readFileSync(Path.join(__dirname, "../../meow-prelude.js"), "utf-8");

export class Ctx {
  private next_id = 0;
  private loc: Ast.Meta | null = null;
  constructor(readonly params: string[], readonly options: Options) {}

  fresh() {
    return `$r${this.next_id++}`;
  }

  set_loc(loc: Ast.Meta | null) {
    this.loc = loc;
  }

  get_loc() {
    return this.loc;
  }
}

export class Block {
  private lines: (string | Block)[] = [];
  constructor(readonly indent: number) {}
  static of(line: string) {
    const r = new Block(0);
    r.push(line);
    return r;
  }
  static of_info(line: string, ctx: Ctx, loc: Ast.Meta | null) {
    const r = new Block(0);
    r.push(line);
    return r;
  }
  push(line: string | Block) {
    this.lines.push(line);
  }
  push_atomic(expr: Ast.MExpr, ctx: Ctx) {
    const r = ctx.fresh();
    this.lines.push(`let ${r};`);
    this.lines.push(lower_expr(expr, ctx, r));
    return r;
  }
  push_fresh(ctx: Ctx) {
    const r = ctx.fresh();
    this.lines.push(`let ${r}`);
    return r;
  }
  push_stack(name: string, options: Options, ctx: Ctx, loc: Ast.Meta | null) {
    if (loc != null) {
      const pkg = options.pkg ?? "(root)";
      const file = `${pkg}/${options.file}`;
      this.push(`$t(${str(name + " at " + file + ":" + String(loc.position.line))})`);
    }
  }
  block_wrap() {
    const res = new Block(0);
    res.push(`{\n${this.render(2)}\n}`);
    return res;
  }
  render(indent: number): string {
    return this.lines
      .map((x) => (x instanceof Block ? x.render(0) : `${x}`))
      .join("\n")
      .split(/\r\n|\r|\n/)
      .map((x) => `${" ".repeat(indent + this.indent)}${x}`)
      .join("\n");
  }
}

export function str(x: string) {
  return JSON.stringify(x);
}

function mstr(x: string | null) {
  return x == null ? "null" : str(x);
}

function mangle(x: string) {
  return x.replace(/\-/g, "_");
}

function mangle_prim(x: string) {
  return x.replace(/\-|\./g, "_");
}

function mangle_fn(x: string) {
  return x
    .replace(/^(\+\+|\+|\-\|<<|<=\|<|<\-|>>>|>>|\>=\|\>|\===\|=\/\=\|\*\*|\*|%|\/)/g, (_, m) => {
      switch (m) {
        case "++":
          return "$cat";
        case "+":
          return "$plus";
        case "-":
          return "$minus";
        case "<<":
          return "$bshl";
        case "<=":
          return "$lte";
        case "<":
          return "$lt";
        case "<-":
          return "$xgh";
        case ">>>":
          return "$blshr";
        case ">>":
          return "$bashr";
        case ">=":
          return "$gte";
        case ">":
          return "$gt";
        case "===":
          return "$eq";
        case "=/=":
          return "$neq";
        case "**":
          return "$pow";
        case "*":
          return "$times";
        case "%":
          return "$mod";
        case "/":
          return "$div";
        default:
          return "__";
      }
    })
    .replace(/[^\$_a-zA-Z0-9]/g, "_");
}

function attach_info(info: Ast.Meta | null, pkg: string, file: string, name: string, fn: string) {
  if (info == null) {
    return fn;
  } else {
    const { line } = info.position;
    return `$meow.info(${fn}, {name: ${str(name)}, file: ${str(
      pkg + "/" + file
    )}, line: ${line} })`;
  }
}

export type Options = {
  no_prelude: boolean;
  no_cache: boolean;
  cwd: string;
  file: string;
  pkg: string | null;
  no_stdlib: boolean;
  no_test: boolean;
  no_static_linking: boolean;
  compiling: boolean;
  search_path: string[];
  // Goals
  test: boolean;
  build: boolean;
};
export type ImportContext = { pkgs: Set<string>; files: Set<string> };

export function find_package(name: string, search_path: string[]) {
  for (const dir of search_path) {
    if (FS.existsSync(Path.resolve(dir, name, `main.meow`))) {
      return Path.resolve(dir, name, "main.meow");
    }
  }
  throw new Error(
    `Could not find package ${name} in search path (${search_path.map(str).join(", ")})`
  );
}

export function get_package_code(name: string, options: Options, ictx: ImportContext) {
  const entry = find_package(name, options.search_path);
  const cache = Path.join(Path.dirname(entry), ".pkg.meowc");
  if (!options.no_cache && FS.existsSync(cache)) {
    const data: PkgCache = JSON.parse(FS.readFileSync(cache, "utf-8"));
    return pkg_from_cache(data, options, ictx);
  } else {
    return pkg_from_file(entry, name, options, ictx);
  }
}

export type PkgCache = {
  name: string;
  created_at: number;
  code: string;
  deps: string[];
};

function pkg_from_cache(cache: PkgCache, options: Options, ictx: ImportContext): string {
  const code = [];
  for (const dep of cache.deps) {
    if (!options.no_static_linking && !ictx.pkgs.has(dep)) {
      ictx.pkgs.add(dep);
      code.push(get_package_code(dep, options, ictx));
    }
  }
  code.push(cache.code);
  return code.join("\n;\n");
}

export function pkg_from_file(entry: string, name: string, options: Options, ictx: ImportContext) {
  const source = FS.readFileSync(entry, "utf-8");
  const ast = Ast.parse(source);
  const js = lower(
    ast,
    {
      ...options,
      file: "main.meow",
      pkg: name,
      no_prelude: true,
      cwd: Path.dirname(entry),
    },
    ictx
  );
  return js;
}

export function lower(m: Ast.MModule, options: Options, ictx: ImportContext) {
  const block = new Block(0);
  if (!options.no_prelude) {
    block.push("//-- START PRELUDE --");
    block.push(prelude_code);
    if (!options.no_stdlib) {
      block.push("//-- START_STDLIB --");
      ictx.pkgs.add("meow.core");
      block.push(get_package_code("meow.core", options, ictx));
      block.push(`$scope.open_pkg(${str("meow.core")}, null);`);
    }
    block.push("//-- END_PRELUDE --");
    block.push("");
  }

  block.push(`$meow.in_package(${options.pkg == null ? "null" : str(options.pkg)}, ($scope) => {`);
  for (const x of m.declarations) {
    block.push(lower_decl(x, options, ictx));
  }
  block.push(`});`);

  if (!options.no_prelude) {
    block.push("");
    block.push("$meow.run(process.argv.slice(2));");
  }

  return block.render(0);
}

export function lower_decl(m: Ast.MDecl, options: Options, ictx: ImportContext): Block {
  return m.match({
    Fun(info, name, params, ret, body, test) {
      const { name: fname, args, types } = Ast.fun_parts(name, params);

      const n = str(fname);
      const sn = mangle_fn(fname);
      const ts = types.map(type_ref).join(", ");
      const tn = types.map(type_name).join(", ");
      const as = args.map(mangle);

      const ctx = new Ctx(as, options);
      const ref = ctx.fresh();
      const res = new Block(0);
      const b = new Block(2);
      b.push_stack(fname, options, ctx, info);
      b.push(`let ${ref};`);
      b.push(lower_expr(desugar(body), ctx, ref));
      b.push(`$stack.pop();`);
      b.push(`return ${ref};`);

      const fn0 = `function* ${sn} (${as.join(", ")}) {\n${b.render(0)}\n}`;
      const fn = attach_info(info, options.pkg ?? "()", options.file, fname, fn0);
      res.push(`$meow.defun(${n}, [${ts}], ${fn});`);
      if (test != null) {
        res.push(lower_decl(new Ast.MDecl.Test(info, `${fname} for (${tn})`, test), options, ictx));
      }
      return res;
    },

    SFun(info, name, self, params, ret, body, test) {
      const { name: fname, args, types } = Ast.sfun_parts(name, self, params);

      const n = str(fname);
      const sn = mangle_fn(fname);
      const ts = types.map(type_ref).join(", ");
      const tn = types.map(type_name).join(", ");
      const as = args.map(mangle);

      const ctx = new Ctx(as, options);
      const ref = ctx.fresh();
      const res = new Block(0);
      const b = new Block(2);
      b.push_stack(fname, options, ctx, info);
      b.push(`let ${ref};`);
      b.push(lower_expr(desugar(body), ctx, ref));
      b.push(`$stack.pop();`);
      b.push(`return ${ref};`);

      const fn0 = `function* ${sn} (${as.join(", ")}) {\n${b.render(0)}\n}`;
      const fn = attach_info(info, options.pkg ?? "()", options.file, fname, fn0);
      res.push(`$meow.defun(${n}, [${ts}], ${fn});`);
      if (test != null) {
        res.push(lower_decl(new Ast.MDecl.Test(info, `${fname} for (${tn})`, test), options, ictx));
      }
      return res;
    },

    Struct(info, name, fields) {
      const names = fields.map((x) => str(x.name)).join(", ");
      const types = fields.map((x) => `() => ${type_ref(x.typ)}`).join(", ");
      const res = new Block(0);
      res.push(`$meow.defstruct($scope.wrap(${str(name)}), [${names}], [${types}]);`);
      return res;
    },

    Singleton(info, name) {
      return Block.of(`$meow.defsingleton($scope.wrap(${str(name)}));`);
    },

    Union(info, name, variants) {
      const res = new Block(0);
      const vblock = new Block(2);
      for (const v of variants) {
        const fields0 = v.fields?.map((x) => str(x.name)).join(", ") ?? null;
        const types0 = v.fields?.map((x) => `() => ${type_ref(x.typ)}`).join(", ") ?? null;
        const fields = fields0 == null ? "null" : `[${fields0}]`;
        const types = types0 == null ? "null" : `[${types0}]`;
        vblock.push(`{name: ${str(v.name)}, fields: ${fields}, types: ${types}},`);
      }
      res.push(`$meow.declare_type($scope.wrap(${str(name)}));`);
      res.push(`$meow.defunion($scope.wrap(${str(name)}), [\n${vblock.render(0)}\n]);`);
      return res;
    },

    Def(info, name, typ, body) {
      const sn = mangle_fn(name);
      const ctx = new Ctx([], options);
      const ref = ctx.fresh();
      const res = new Block(0);
      const b = new Block(2);
      b.push_stack(`global ${name}`, options, ctx, info);
      b.push(`let ${ref}`);
      b.push(lower_expr(desugar(body), ctx, ref));
      b.push(`$stack.pop();`);
      b.push(`return ${ref}`);
      const fn0 = `function* ${sn} () {\n${b.render(0)}\n}`;
      const fn = attach_info(info, options.pkg ?? "()", options.file, name, fn0);
      res.push(`$meow.defglobal($scope.wrap(${str(name)}), ${fn});`);
      return res;
    },

    DeclareType(info, name) {
      return Block.of(`$meow.declare_type($scope.wrap(${str(name)}))`);
    },

    Test(info, name, body) {
      if (options.no_test) {
        return Block.of("");
      } else {
        const ctx = new Ctx([], options);
        const b = new Block(2);
        b.push_stack(`test ${str(name)}`, options, ctx, info);
        const v = b.push_atomic(desugar(body), ctx);
        b.push(`$stack.pop();`);
        b.push(`return ${v}`);
        const res = new Block(0);
        const fn0 = `function* () {\n${b.render(0)}\n}`;
        const fn = attach_info(info, options.pkg ?? "()", options.file, name, fn0);
        res.push(`$meow.deftest($scope.wrap(${str(name)}), ${fn});`);
        return res;
      }
    },

    Import(info, id) {
      const path = Path.resolve(options.cwd, id);
      ictx.files.add(path);
      const source = FS.readFileSync(path, "utf-8");
      const ast = Ast.parse(source);
      const js = lower(
        ast,
        { ...options, file: id, no_prelude: true, cwd: Path.dirname(path) },
        ictx
      );
      return Block.of(js);
    },

    ImportForeign(info, path) {
      const source = FS.readFileSync(Path.resolve(options.cwd, path), "utf-8");
      ictx.files.add(path);
      const file = options.compiling
        ? `${options.pkg ?? "native"}/${path}`
        : Path.resolve(options.cwd, path);
      const dir = Path.dirname(file);
      return Block.of(`void function(__dirname, __filename) { // ${str(path)}
const module = {exports: {}};
${source}
$meow.defjs($scope, ${str(path)}, module.exports);
}(${str(dir)}, ${str(file)});`);
    },

    Trait(info, name, reqs) {
      const res = new Block(0);
      const dict = reqs.flatMap((x) => {
        if (x == null) {
          return [];
        } else {
          const name = Ast.trait_req_name(x);
          const fn = lower_trait_fn(x, options);
          return [[name, fn] as [string, Block]];
        }
      });
      const dict1 = dict.map(([k, v]) => `${str(k)}: ${v.render(2)}`).join(",\n  ");
      res.push(`$meow.deftrait($scope.wrap(${str(name)}), {\n  ${dict1}\n});`);
      return res;
    },

    Effect(info, name, cases) {
      const xs = cases.map((x) => {
        const types = x.params.map((x) => type_ref(x.typ));
        return `$meow.defeff($scope.wrap(${str(name + "." + x.name)}), [${types.join(", ")}], ${
          x.nonlocal_ret != null
        }, ${info?.position.line ?? 0})`;
      });
      return Block.of(xs.join("\n;"));
    },

    Implement(info, name, typ, decls) {
      const res = new Block(0);
      const dict = decls.map((x0) => {
        const x = x0 as any as Ast.$$MDecl$_SFun;
        const { name } = Ast.sfun_parts(x.name, x.self, x.params);
        const fn = lower_trait_fn(new Ast.TraitReq.Provided(x), options);
        return [name, fn] as [string, Block];
      });
      const dict1 = dict.map(([k, v]) => `${str(k)}: ${v.render(2)}`).join(",\n  ");
      res.push(`$meow.implement(${str(name)}, ${type_ref(typ)}, {\n  ${dict1}\n});`);
      return res;
    },

    OpenPkg(info, name, alias) {
      const res = new Block(0);
      if (!ictx.pkgs.has(name)) {
        ictx.pkgs.add(name);
        if (!options.no_static_linking) {
          res.push(get_package_code(name, options, ictx));
        }
      }
      res.push(`$scope.open_pkg(${str(name)}, ${mstr(alias)});`);
      return res;
    },

    Handler(info, name0, params0, init, cases, auto_install) {
      const { name, args, types } = Ast.handler_parts(name0, params0);
      if (auto_install && args.length !== 0) {
        throw new Error(
          `Cannot make handler ${name} default because it's parameterised.\n\n${info?.formatted_position_message}`
        );
      }
      const res = new Block(0);
      const ps = args.map((x) => mangle(x));
      const ts = types.map((x) => type_ref(x));

      const ctx = new Ctx(args, options);
      const b = new Block(2);
      b.push_stack(`handler ${name}`, options, ctx, info);
      if (init != null) {
        b.push(lower_expr(init, ctx, null));
      }
      const { bind: h, code: hc } = make_handle_cases(cases, ctx);
      b.push(hc);
      b.push(`$stack.pop();`);
      b.push(`return ${h};`);
      const fn0 = `function* ${mangle_fn(name)}(${ps.join(", ")}) {\n${b.render(0)}\n}`;
      const fn = attach_info(info, options.pkg ?? "()", options.file, name, fn0);
      res.push(
        `$meow.defhandler($scope.wrap(${str(name)}), ${fn}, [${ts.join(", ")}], ${auto_install})`
      );
      return res;
    },
  });
}

function lower_trait_fn(x: Ast.TraitReq, options: Options) {
  return x.match({
    Provided(fn: Ast.$$MDecl$_SFun) {
      const { name, args, types } = Ast.sfun_parts(fn.name, fn.self, fn.params);
      const n = str(name);
      const sn = mangle_fn(name);
      const ts = types.map(type_ref).join(", ");
      const as = args.map(mangle);
      const ctx = new Ctx(as, options);
      const res = new Block(0);
      const b = new Block(2);
      b.push_stack(name, options, ctx, fn.info);
      const v = b.push_atomic(desugar(fn.body), ctx);
      b.push(`$stack.pop();`);
      b.push(`return ${v}`);
      const fn0 = `function* ${sn} () {\n${b.render(0)}\n}`;
      const fn1 = attach_info(fn.info, options.pkg ?? "()", options.file, name, fn0);
      res.push(fn1);
      return res;
    },
    Required(name, params) {
      return Block.of("null");
    },
  });
}

function type_name(x: Ast.MType) {
  return x.match({
    Infer(info) {
      return "unknown";
    },
    Trait(info, ref) {
      return `trait ${ref_name(ref)}`;
    },
    Ref(info, ref) {
      return ref_name(ref);
    },
    Static(info, ref) {
      return `#${ref_name(ref)}`;
    },
    Variant(info, ref, variant) {
      return `${ref_name(ref)}..${variant}`;
    },
    Var(info, name) {
      return name;
    },
    Fun(info, input, output) {
      return `lambda-${input.length}`;
    },
    Record(info, fields) {
      return `record`;
    },
  });
}

function type_ref(x: Ast.MType) {
  return x.match({
    Infer(info) {
      return `$meow.type("unknown")`;
    },
    Trait(info, ref) {
      return `$scope.trait(${str(ref_name(ref))})`;
    },
    Ref(info, ref) {
      return `$scope.type(${str(ref_name(ref))})`;
    },
    Static(info, ref) {
      return `$scope.stype(${str(ref_name(ref))})`;
    },
    Variant(info, ref, variant) {
      return `$scope.vtype(${str(ref_name(ref))}, ${str(variant)})`;
    },
    Var(info, name) {
      return `$meow.type("unknown")`;
    },
    Fun(info, input, output) {
      return `$meow.type(${str("lambda-" + input.length)})`;
    },
    Record(info, fields) {
      return `$meow.type("record")`;
    },
  });
}

function ref_name(x: Ast.MRef): string {
  return x.match({
    Named(info, names) {
      return names.join(".");
    },
    Qualified(info, pkg, names) {
      return `${pkg}/${names.join(".")}`;
    },
  });
}

export function lower_expr(x: Ast.MExpr, ctx: Ctx, k: string | null): Block {
  return x.match({
    Block(info, exprs) {
      const res = new Block(0);
      for (const x of exprs.slice(0, -1)) {
        res.push(lower_expr(x, ctx, null));
      }
      res.push(lower_expr(exprs.at(-1)!, ctx, k));
      return res;
    },

    Const(info, value) {
      return Block.of(bind(k, lower_const(value)));
    },

    Let(info, name, typ, value) {
      const res = new Block(0);
      const v = res.push_atomic(value, ctx);
      res.push(`const ${mangle(name)} = ${v}`);
      return res;
    },

    If(info, clauses) {
      const statements = clauses.reduceRight((p: If | null, v) => {
        return {
          guard: v.guard,
          if_true: v.body,
          if_false: p,
        };
      }, null);
      const go: (x: If | null, k: string | null) => Block = (x: If | null, k: string | null) => {
        if (x == null) {
          return Block.of(`throw $meow.unreachable("no clause matched");`);
        }
        const r = ctx.fresh();
        const g = ctx.fresh();
        const res = new Block(0);
        res.push(`let ${r}, ${g};`);
        res.push(lower_expr(x.guard, ctx, g));
        const tres = new Block(2);
        tres.push(lower_expr(x.if_true, ctx, r));
        const fres = new Block(2);
        fres.push(go(x.if_false, r));
        res.push(`if (${g}) {\n${tres.render(0)}\n} else {\n${fres.render(0)}\n}`);
        if (k != null) {
          res.push(bind(k, r));
        }
        return res;
      };
      const res = new Block(0);
      res.push(go(statements, k));
      return res;
    },

    Invoke(info, name, args) {
      const lines = new Block(0);
      const xs = [];
      const { name: real_name, args: real_args } = Ast.invoke_parts(name, args);
      for (const x of real_args) {
        const r = ctx.fresh();
        lines.push(`let ${r};`);
        lines.push(lower_expr(x, ctx, r));
        xs.push(r);
      }
      lines.push(bind(k, `yield* $meow.call(${str(real_name)}, ${xs.join(", ")})`));
      return lines;
    },

    InvokeSelf(info, name, self, args) {
      const lines = new Block(0);
      const xs = [];
      const { name: real_name, args: real_args } = Ast.sinvoke_parts(name, self, args);
      for (const x of real_args) {
        const r = ctx.fresh();
        lines.push(`let ${r};`);
        lines.push(lower_expr(x, ctx, r));
        xs.push(r);
      }
      lines.push(bind(k, `yield* $meow.call(${str(real_name)}, ${xs.join(", ")})`));
      return lines;
    },

    Var(info, name) {
      return Block.of_info(bind(k, `${mangle(name)}`), ctx, info);
    },

    IntrinsicEq(info, left, right) {
      const res = new Block(0);
      const l = res.push_atomic(left, ctx);
      const r = res.push_atomic(right, ctx);
      res.push(bind(k, `$meow.eq(${l}, ${r})`));
      return res;
    },

    Self(info) {
      if (ctx.params.length === 0) {
        throw new Error(`self outside of function.`);
      }
      return Block.of(bind(k, ctx.params[0]));
    },

    Project(info, value, field) {
      const res = new Block(0);
      const r = res.push_atomic(value, ctx);
      res.push(bind(k, `$meow.checked(${r}[${str(field)}])`));
      return res;
    },

    Foreign(info, name, args) {
      const res = new Block(0);
      const xs = args.map((x) => res.push_atomic(x, ctx));
      res.push(bind(k, `yield* $meow.calljs($scope.wrap_pkg(${str(name)}), [${xs.join(", ")}])`));
      return res;
    },

    New(info, ref, fields) {
      const res = new Block(0);
      const fs: { name: string; value: string }[] = [];
      for (const x of fields) {
        fs.push({ name: x.name, value: res.push_atomic(x.value, ctx) });
      }
      const entries = fs.map((x) => `${str(x.name)}: ${x.value}`);
      res.push(bind(k, `$scope.make(${str(ref_name(ref))}, {${entries.join(", ")}})`));
      return res;
    },

    NewPos(info, ref, values) {
      const res = new Block(0);
      const fs: string[] = [];
      for (const x of values) {
        fs.push(res.push_atomic(x, ctx));
      }
      res.push(bind(k, `$scope.make_pos(${str(ref_name(ref))}, [${fs.join(", ")}])`));
      return res;
    },

    Static(info, ref) {
      return Block.of_info(bind(k, `$scope.smake(${str(ref_name(ref))})`), ctx, info);
    },

    NewVariant(info, ref, variant, fields) {
      const res = new Block(0);
      const fs: { name: string; value: string }[] = [];
      for (const x of fields) {
        fs.push({ name: x.name, value: res.push_atomic(x.value, ctx) });
      }
      const entries = fs.map((x) => `${str(x.name)}: ${x.value}`);
      res.push(
        bind(
          k,
          `$scope.make_variant(${str(ref_name(ref))}, ${str(variant)}, {${entries.join(", ")}})`
        )
      );
      return res;
    },

    NewVariantPos(info, ref, variant, args) {
      const res = new Block(0);
      const fs: string[] = [];
      for (const x of args) {
        fs.push(res.push_atomic(x, ctx));
      }
      res.push(
        bind(
          k,
          `$scope.make_variant_pos(${str(ref_name(ref))}, ${str(variant)}, [${fs.join(", ")}])`
        )
      );
      return res;
    },

    GetVariant(info, ref, variant) {
      return Block.of_info(
        bind(k, `$scope.get_variant(${str(ref_name(ref))}, ${str(variant)})`),
        ctx,
        info
      );
    },

    GetGlobal(info, ref) {
      return Block.of_info(bind(k, `$scope.global(${str(ref_name(ref))})`), ctx, info);
    },

    List(info, items) {
      const res = new Block(0);
      const xs: string[] = [];
      for (const x of items) {
        x.match({
          Item(value) {
            xs.push(res.push_atomic(value, ctx));
          },
          Spread(value) {
            xs.push(`...${res.push_atomic(value, ctx)}`);
          },
        });
      }
      res.push(bind(k, `[${xs.join(", ")}]`));
      return res;
    },

    Lazy(info, expr) {
      const b = new Block(2);
      b.push_stack(`thunk`, ctx.options, ctx, info);
      const bctx = new Ctx(ctx.params, ctx.options);
      const v = b.push_atomic(expr, bctx);
      b.push(`$stack.pop();`);
      b.push(`return ${v};`);
      const fn0 = `function* () {\n${b.render(0)}\n}`;
      const fn = attach_info(info, ctx.options.pkg ?? "()", ctx.options.file, "thunk", fn0);
      return Block.of(bind(k, `new $Thunk(${fn})`));
    },

    Force(info, thunk) {
      const res = new Block(0);
      const v = res.push_atomic(thunk, ctx);
      res.push(bind(k, `yield* $meow.force(${v})`));
      return res;
    },

    Map(info, pairs) {
      const res = new Block(0);
      const xs: string[] = [];
      for (const x of pairs) {
        x.match({
          Pair(key, value) {
            const k = res.push_atomic(key, ctx);
            const v = res.push_atomic(value, ctx);
            xs.push(`[${k}, ${v}]`);
          },
          Spread(value) {
            xs.push(`...${res.push_atomic(value, ctx)}`);
          },
        });
      }
      res.push(bind(k, `new Map([${xs.join(", ")}])`));
      return res;
    },

    Assert(info, expr, tag) {
      const b = new Block(0);
      const v = b.push_atomic(expr, ctx);
      const loc = str(
        (info?.formatted_position_message ?? "(unknown location)") +
          " in " +
          (ctx.options.pkg ?? "()") +
          "/" +
          ctx.options.file
      );
      const t = mstr(tag);
      b.push(`if (!${v}) { throw $meow.assert_fail(${t}, ${loc}); }`);
      b.push(bind(k, v));
      const res = new Block(0);
      res.push(`try {\n${b.render(2)}\n} catch (e) {\nthrow $meow.assert_fail(${t}, ${loc}, e)\n}`);
      return res;
    },

    Is(info, expr, typ) {
      const res = new Block(0);
      const v = res.push_atomic(expr, ctx);
      res.push(bind(k, `$scope.is(${v}, ${str(ref_name(typ))})`));
      return res;
    },

    IsVariant(info, expr, typ, variant) {
      const res = new Block(0);
      const v = res.push_atomic(expr, ctx);
      res.push(bind(k, `$scope.is_variant(${v}, ${str(ref_name(typ))}, ${str(variant)})`));
      return res;
    },

    Primitive(info, name, args) {
      const res = new Block(0);
      const xs: string[] = [];
      for (const x of args) {
        xs.push(res.push_atomic(x, ctx));
      }
      res.push(bind(k, `${mangle_prim(name)}(${xs.join(", ")})`));
      return res;
    },

    Lambda(info, params, body) {
      const b = new Block(0);
      b.push_stack(`lambda`, ctx.options, ctx, info);
      const lctx = new Ctx(ctx.params, ctx.options);
      const v = b.push_atomic(body, lctx);
      b.push(`$stack.pop();`);
      b.push(`return ${v};`);
      const ps = params.map((x, i) => (x === "_" ? `$_${i}` : mangle(x))).join(", ");
      const fn0 = `function* (${ps}) {\n${b.render(2)}\n}`;
      const fn = attach_info(info, ctx.options.pkg ?? "()", ctx.options.file, "lambda", fn0);
      return Block.of(bind(k, `(${fn})`));
    },

    Apply(info, callee, args) {
      const res = new Block(0);
      const c = res.push_atomic(callee, ctx);
      const xs = args.map((x) => res.push_atomic(x, ctx));
      res.push(bind(k, `yield* ${c}(${xs.join(", ")})`));
      return res;
    },

    Pipe(info, left, right) {
      const res = new Block(0);
      const l = res.push_atomic(left, ctx);
      const r = res.push_atomic(right, ctx);
      res.push(bind(k, `yield* ${r}(${l})`));
      return res;
    },

    Record(info, fields) {
      const res = new Block(0);
      const fs: { field: string; value: string }[] = [];
      for (const x of fields) {
        fs.push({ field: x.name, value: res.push_atomic(x.value, ctx) });
      }
      const dict = fs.map((x) => `${str(x.field)}: ${x.value}`);
      res.push(bind(k, `$meow.record({${dict.join(", ")}})`));
      return res;
    },

    Hole(info) {
      throw new Error(`Unhandled hole ${info?.formatted_position_message}`);
    },

    Repeat(info, bindings, body) {
      const res = new Block(0);
      res.push(`let $wret;`);
      const xs = bindings.map((x) => res.push_atomic(x.value, ctx));
      bindings.forEach((x, i) => res.push(`let ${mangle(x.name)} = ${xs[i]};`));
      const b = new Block(2);
      b.push(lower_expr(body, ctx, null));
      res.push(`while (true) {\n${b.render(0)}\n}`);
      res.push(bind(k, `$wret`));
      return res.block_wrap();
    },

    Continue(info, bindings) {
      const res = new Block(0);
      const xs = bindings.map((x) => res.push_atomic(x.value, ctx));
      bindings.forEach((x, i) => res.push(`${mangle(x.name)} = ${xs[i]};`));
      res.push("continue;");
      return res;
    },

    Break(info, value) {
      const res = new Block(0);
      const v = res.push_atomic(value, ctx);
      res.push(`$wret = ${v};`);
      res.push(`break;`);
      return res;
    },

    Binary(info, elements) {
      const res = new Block(0);
      const xs = elements.flatMap((x) => {
        return lower_binary(x, res, ctx);
      });
      res.push(bind(k, `new Uint8Array([${xs.join(",")}])`));
      return res;
    },

    Extend(info, object, fields) {
      const res = new Block(0);
      const o = res.push_atomic(object, ctx);
      const xs = fields.map((f) => res.push_atomic(f.value, ctx));
      const pairs = fields.map((f, i) => `${str(f.name)}: ${xs[i]}`);
      res.push(bind(k, `$meow.extend(${o}, {${pairs.join(", ")}})`));
      return res;
    },

    AbortWith(info, value) {
      const res = new Block(0);
      const v = res.push_atomic(value, ctx);
      res.push(`$stack.pop();`);
      res.push(`yield $meow.eff_abort(${v});`);
      return res;
    },

    ResumeWith(info, value) {
      const res = new Block(0);
      const v = res.push_atomic(value, ctx);
      res.push(`$stack.pop();`);
      res.push(`yield $meow.eff_resume(${v});`);
      return res;
    },

    Perform(info, name, args) {
      const res = new Block(0);
      const xs = args.map((x) => res.push_atomic(x, ctx));
      res.push(
        bind(
          k,
          `yield $meow.eff_perform($scope.effect(${str(ref_name(name))}), [${xs.join(", ")}]);`
        )
      );
      return res;
    },

    Handle(info, body, handlers) {
      const res = new Block(0);

      const b = new Block(2);
      b.push_stack(`handle block`, ctx.options, ctx, info);
      const v = b.push_atomic(body, ctx);
      b.push(`$stack.pop()`);
      b.push(`return ${v}`);
      const fn0 = `function* () {\n${b.render(0)}\n}`;

      const { bind: h, code: hc } = make_handle_cases(handlers, ctx);
      res.push(hc);

      const fn = attach_info(info, ctx.options.pkg ?? "()", ctx.options.file, "handle block", fn0);
      res.push(bind(k, `yield $meow.eff_handle(${fn}, ${h})`));
      return res;
    },
  });
}

function make_handle_cases(handlers: Ast.HandlerCase[], ctx: Ctx) {
  const res = new Block(0);
  const hs = new Block(2);
  for (const h of handlers) {
    h.match({
      On(info, name, params, body) {
        const n = `$scope.effect(${str(ref_name(name))})`;
        const fb = new Block(2);
        fb.push_stack(`on ${name}`, ctx.options, ctx, info);
        fb.push(lower_expr(body, ctx, null));
        fb.push(`throw $meow.unreachable()`);
        const fn0 = `function* ${mangle_fn("_hc_on_" + ref_name(name))}(${params
          .map(mangle)
          .join(", ")}) {\n${fb.render(0)}\n}`;
        const fn = attach_info(
          info,
          ctx.options.pkg ?? "()",
          ctx.options.file,
          ref_name(name),
          fn0
        );
        hs.push(`$meow.eff_on(${n}, ${fn}),`);
      },
      Use(info, name0, args0) {
        const { name, args } = Ast.invoke_parts(ref_name(name0), args0);
        const xs = args.map((x) => res.push_atomic(x, ctx));
        hs.push(`yield* $meow.eff_use($scope.handler(${str(name)}), [${xs.join(", ")}]),`);
      },
    });
  }
  const v = ctx.fresh();
  res.push(`const ${v} = $meow.eff_cases([\n${hs.render(0)}\n])`);
  return { bind: v, code: res };
}

function assert_byte(x: bigint, signed: boolean) {
  if ((!signed && x >= 0 && x <= 255) || (signed && x >= -128 && x <= 127)) {
    return;
  } else {
    throw new RangeError(`Invalid byte ${x}`);
  }
}

function lower_binary(x: Ast.EBinElement, b: Block, ctx: Ctx) {
  return x.match({
    Byte(value) {
      assert_byte(value, false);
      return [Number(value)];
    },

    Int(value, size, endianess, signed) {
      const le = endianess.match({ Le: () => true, Be: () => false });
      const sign = signed.match({ Signed: () => true, Unsigned: () => false });
      if (![8n, 16n, 32n, 64n].includes(size)) {
        throw new Error(`bit-size must be 8, 16, 32, or 64`);
      }
      const bytes = new Uint8Array(Number(size) / 8);
      const method = `set${size === 64n ? "Big" : ""}${sign ? "I" : "Ui"}nt${Number(size)}`;
      if (size === 64n) {
        new DataView(bytes.buffer)[method as "setBigInt64"](0, value, le);
      } else {
        new DataView(bytes.buffer)[method as "setInt32"](0, Number(value), le);
      }
      return Array.from(bytes);
    },
  });
}

type If = {
  guard: Ast.MExpr;
  if_true: Ast.MExpr;
  if_false: If | null;
};

function lower_const(x: Ast.MConst) {
  return x.match({
    False(info) {
      return "false";
    },

    True(info) {
      return "true";
    },

    Float(info, value) {
      return `$meow.f64(${value.toString()})`;
    },

    Int(info, value) {
      return `${value}`;
    },

    Int64(info, value) {
      return `${value}n`;
    },

    Int32(info, value) {
      return `(${value} | 0)`;
    },

    Nothing(info) {
      return `null`;
    },

    Text(info, value) {
      return str(value.replace(/\r\n|\r/g, "\n"));
    },

    TemplateText(info, value) {
      const col = info?.position.column ?? 1;
      const space_re = new RegExp(`^[ \\t]{0,${col - 1}}`);
      const lines = value.split(/\r\n|\r|\n/);
      const result = [];
      if (lines[0].trim()) {
        result.push(lines[0]);
      }
      result.push(...lines.slice(1, -1).map((x) => x.replace(space_re, "")));
      if (lines.length > 0 && lines[lines.length - 1].trim()) {
        result.push(lines[lines.length - 1].replace(space_re, ""));
      }
      return str(result.join("\n"));
    },
  });
}

function bind(k: string | null, v: string) {
  if (k == null) {
    return v;
  } else {
    return `${k} = ${v};`;
  }
}
