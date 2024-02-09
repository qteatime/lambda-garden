import * as Ast from "../syntax/parser";
import * as Path from "path";
import * as FS from "fs";
import { desugar } from "./desugar";
import { decorate } from "./decorate";

export const prelude_code = FS.readFileSync(Path.join(__dirname, "../../meow-prelude.js"), "utf-8");

export class Ctx {
  private next_id = 0;
  private loc: Ast.Meta | null = null;
  constructor(readonly params: string[], readonly options: Options, readonly pure: boolean) {}

  fresh() {
    return `$r${this.next_id++}`;
  }

  set_loc(loc: Ast.Meta | null) {
    this.loc = loc;
  }

  get_loc() {
    return this.loc;
  }

  get gen_mark() {
    return this.pure ? "" : "*";
  }

  get call_prefix() {
    return this.pure ? "" : "yield*";
  }

  get call_suffix() {
    return this.pure ? "_pure" : "";
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
  push(line: string | Block) {
    this.lines.push(line);
  }
  push_atomic(expr: Ast.MExpr, ctx: Ctx) {
    if (is_atomic(expr)) {
      return lower_expr(expr, ctx, null).render(0).trim();
    } else if (is_constable(expr)) {
      const r = `$c${ctx.fresh()}`;
      this.lines.push(lower_expr(expr, ctx, r));
      return r;
    } else {
      const r = ctx.fresh();
      this.lines.push(`let ${r};`);
      this.lines.push(lower_expr(expr, ctx, r));
      return r;
    }
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
  push_file(name: string) {
    this.push(`$file = ${str(name)};`);
  }
  push_line(loc: Ast.Meta | null) {
    this.push(`$line = ${loc?.position.line ?? "null"};`);
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
export type ImportContext = { pkgs: Set<string>; files: Set<string>; cache_root: string };

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
  const cache_root = Path.dirname(entry);
  const ast = Ast.parse_file(entry, cache_root);
  const js = lower(
    ast,
    {
      ...options,
      file: "main.meow",
      pkg: name,
      no_prelude: true,
      cwd: Path.dirname(entry),
    },
    { ...ictx, cache_root: cache_root }
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

  block.push_file(`${options.pkg ?? "()"} :: ${options.file}`);
  block.push(`$meow.in_package(${options.pkg == null ? "null" : str(options.pkg)}, ($scope) => {`);
  for (const x of m.declarations) {
    block.push_line((x as any)?.info ?? null);
    block.push(lower_decl(x, options, ictx).render(2));
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
    Fun(info, name, params, ret, ct, body, test, pure) {
      const { name: fname, args, types } = Ast.fun_parts(name, params, ct);

      const n = str(fname);
      const sn = mangle_fn(fname);
      const ts = types.map(type_ref).join(", ");
      const tn = types.map(type_name).join(", ");
      const as = args.map(mangle);

      const ctx = new Ctx(as, options, pure != null);
      const res = new Block(0);
      const b = new Block(2);
      b.push_stack(fname, options, ctx, info);
      const r = b.push_atomic(desugar(body), ctx);
      b.push(`$stack.pop();`);
      b.push(`return ${r};`);

      const fn0 = `function${ctx.gen_mark} ${sn} (${as.join(", ")}) {\n${b.render(0)}\n}`;
      const fn = attach_info(info, options.pkg ?? "()", options.file, fname, fn0);
      res.push(`$meow.defun(${n}, [${ts}], ${fn}, ${ctx.pure});`);
      if (test != null) {
        res.push(lower_decl(new Ast.MDecl.Test(info, `${fname} for (${tn})`, test), options, ictx));
      }
      return res;
    },

    SFun(info, name, self, params, ret, ct, body, test, pure) {
      const { name: fname, args, types } = Ast.sfun_parts(name, self, params, ct);

      const n = str(fname);
      const sn = mangle_fn(fname);
      const ts = types.map(type_ref).join(", ");
      const tn = types.map(type_name).join(", ");
      const as = args.map(mangle);

      const ctx = new Ctx(as, options, pure != null);
      const res = new Block(0);
      const b = new Block(2);
      b.push_stack(fname, options, ctx, info);
      const r = b.push_atomic(desugar(body), ctx);
      b.push(`$stack.pop();`);
      b.push(`return ${r};`);

      const fn0 = `function${ctx.gen_mark} ${sn} (${as.join(", ")}) {\n${b.render(0)}\n}`;
      const fn = attach_info(info, options.pkg ?? "()", options.file, fname, fn0);
      res.push(`$meow.defun(${n}, [${ts}], ${fn}, ${ctx.pure});`);
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
      const ctx = new Ctx([], options, false);
      const res = new Block(0);
      const b = new Block(2);
      b.push_stack(`global ${name}`, options, ctx, info);
      const r = b.push_atomic(desugar(body), ctx);
      b.push(`$stack.pop();`);
      b.push(`return ${r}`);
      const fn0 = `function* ${sn} () {\n${b.render(0)}\n}`;
      const fn = attach_info(info, options.pkg ?? "()", options.file, name, fn0);
      res.push(`$meow.defglobal($scope.wrap(${str(name)}), ${fn});`);
      return res;
    },

    DeclareType(info, name) {
      return Block.of(`$meow.declare_type($scope.wrap(${str(ref_name(name))}))`);
    },

    DeclareTrait(info, name) {
      return Block.of(`$meow.declare_trait($scope.wrap(${str(ref_name(name))}))`);
    },

    Test(info, name, body) {
      if (options.no_test) {
        return Block.of("");
      } else {
        const ctx = new Ctx([], options, false);
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
      const ast = Ast.parse_file(path, ictx.cache_root);
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

    Trait(info, name) {
      return Block.of(`$meow.deftrait($scope.wrap(${str(name)}));`);
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

    Implement(info, name, typ) {
      return Block.of(`$meow.implement($scope.rtrait(${str(ref_name(name))}), ${type_ref(typ)});`);
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
      const { name, args, types } = Ast.handler_parts(name0, params0, []);
      if (auto_install && args.length !== 0) {
        throw new Error(
          `Cannot make handler ${name} default because it's parameterised.\n\n${info?.formatted_position_message}`
        );
      }
      const res = new Block(0);
      const ps = args.map((x) => mangle(x));
      const ts = types.map((x) => type_ref(x));

      const ctx = new Ctx(args, options, false);
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
    Decorator(info, name, args, decl) {
      const decls = decorate(m as any);
      const res = new Block(0);
      for (const x of decls) {
        res.push(lower_decl(x, options, ictx));
      }
      return res;
    },
    Asset(info, name, kind) {
      const res = new Block(0);
      const data = kind.match({
        File(info, path) {
          return FS.readFileSync(Path.join(options.cwd, path));
        },
      });
      res.push(
        `$meow.put_asset_base64($scope.wrap(${str(name)}), ${JSON.stringify(
          data.toString("base64")
        )});`
      );
      res.push(
        `$meow.defun(${str(
          name + "(self:)/1"
        )}, [$meow.type($scope.wrap("package-assets"))], (_) => $meow.get_asset($scope.wrap(${str(
          name
        )})), true);`
      );
      return res;
    },
    Namespace(info, name, decls) {
      const res = new Block(0);
      res.push(`$scope.in_namespace(${str(name.join("."))}, ($scope) => {`);
      for (const x of decls) {
        res.push(lower_decl(x, options, ictx).render(2));
      }
      res.push("});");
      return res;
    },
    OpenNamespace(info, ref, alias) {
      return Block.of(`$scope.open_namespace(${str(ref_name(ref))}, ${mstr(alias)})`);
    },
  });
}

function type_name(x: Ast.MType): string {
  return x.match({
    Infer(info) {
      return "unknown";
    },
    Trait(info, name) {
      return `&${ref_name(name)}`;
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
    Self(info) {
      return `self`;
    },
    StaticSelf(info) {
      return `#self`;
    },
    StaticVar(info, name) {
      return `#${name}`;
    },
    WithTraits(info, bound, traits) {
      return `(${type_name(bound)} has ${traits.map((x) => ref_name(x)).join(", ")})`;
    },
    Package(info) {
      return `package`;
    },
  });
}

function type_ref(x: Ast.MType): string {
  return x.match({
    Infer(info) {
      return `$meow.type("unknown")`;
    },
    Trait(info, name) {
      return `$scope.trait(${str(ref_name(name))})`;
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
    Self(info) {
      return `$meow.type("unknown")`;
    },
    StaticSelf(info) {
      return `$meow.type("static")`;
    },
    StaticVar(info, name) {
      return `$meow.type("static")`;
    },
    WithTraits(info, bound, traits) {
      return `$meow.with_trait(${type_ref(bound)}, [${traits
        .map((x) => `$scope.trait(${str(ref_name(x))})`)
        .join(", ")}])`;
    },
    Package(info) {
      return `$meow.type($scope.wrap("package"))`;
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
      const last = clauses[clauses.length - 1];
      if (last == null) {
        throw new Error(`malformed when at ${info?.formatted_position_message}`);
      }
      const statements = clauses.slice(0, -1).reduceRight(
        (p: If | null, v) => {
          return {
            guard: v.guard,
            if_true: v.body,
            if_false: p,
          };
        },
        { guard: last.guard, if_true: last.body, if_false: null }
      );
      const go: (x: If | null, k: string | null) => Block = (x: If | null, k: string | null) => {
        if (x == null) {
          return Block.of(`throw $meow.unreachable("no clause matched");`);
        }
        const res = new Block(0);
        const r = ctx.fresh();
        res.push(`let ${r}`);
        const g = res.push_atomic(x.guard, ctx);
        const tres = new Block(2);
        tres.push(lower_expr(x.if_true, ctx, r));
        if (x.if_false == null) {
          res.push(`if (${g}) {\n${tres.render(0)}\n}`);
        } else {
          const fres = new Block(2);
          fres.push(go(x.if_false, r));
          res.push(`if (${g}) {\n${tres.render(0)}\n} else {\n${fres.render(0)}\n}`);
        }
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
      const { name: real_name, args: real_args } = Ast.invoke_parts(name, args);
      const xs = real_args.map((x) => lines.push_atomic(x, ctx));
      lines.push(
        bind(
          k,
          `${ctx.call_prefix} $meow.call${ctx.call_suffix}(${str(real_name)}, ${xs.join(", ")})`
        )
      );
      return lines;
    },

    InvokeSelf(info, name, self, args) {
      const lines = new Block(0);
      const { name: real_name, args: real_args } = Ast.sinvoke_parts(name, self, args);
      const xs = real_args.map((x) => lines.push_atomic(x, ctx));
      lines.push(
        bind(
          k,
          `${ctx.call_prefix} $meow.call${ctx.call_suffix}(${str(real_name)}, ${xs.join(", ")})`
        )
      );
      return lines;
    },

    Var(info, name) {
      return Block.of(bind(k, `${mangle(name)}`));
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
      res.push(bind(k, `$meow.checked_project(${r}[${str(field)}], ${r}, ${str(field)})`));
      return res;
    },

    Foreign(info, name, args) {
      const res = new Block(0);
      const xs = args.map((x) => res.push_atomic(x, ctx));
      res.push(
        bind(
          k,
          `${ctx.call_prefix} $meow.calljs${ctx.call_suffix}($scope.wrap_pkg(${str(
            name
          )}), [${xs.join(", ")}])`
        )
      );
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
      return Block.of(bind(k, `$scope.smake(${str(ref_name(ref))})`));
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
      return Block.of(bind(k, `$scope.get_variant(${str(ref_name(ref))}, ${str(variant)})`));
    },

    GetGlobal(info, ref) {
      return Block.of(bind(k, `$scope.global(${str(ref_name(ref))})`));
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
      const bctx = new Ctx(ctx.params, ctx.options, false);
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
      const res = new Block(0);
      let r;
      if (k == null) {
        r = ctx.fresh();
        res.push(`let ${r}`);
      } else {
        r = k;
      }
      const loc_msg = str(
        (info?.formatted_position_message ?? "(unknown location)") +
          " in " +
          (ctx.options.pkg ?? "()") +
          "/" +
          ctx.options.file
      );
      const loc = ctx.fresh();
      res.push(`const ${loc} = ${loc_msg}`);
      const b = new Block(0);
      b.push(lower_expr(expr, ctx, r));
      const t = mstr(tag);
      b.push(`if (!${r}) { throw $meow.assert_fail(${t}, ${loc}); }`);
      res.push(
        `try {\n${b.render(2)}\n} catch ($e) {\n  throw $meow.assert_fail(${t}, ${loc}, $e)\n}`
      );
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
      const lctx = new Ctx(ctx.params, ctx.options, false);
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

    Unreachable(info) {
      return Block.of(
        `throw $meow.unreachable(${str(info?.formatted_position_message ?? "unrechable")})`
      );
    },

    HasTrait(info, value, ref) {
      const res = new Block(0);
      const v = res.push_atomic(value, ctx);
      res.push(bind(k, `$scope.has_trait(${v}, ${str(ref_name(ref))})`));
      return res;
    },
    Package(info) {
      return Block.of(bind(k, `$meow.global($scope.wrap("package"))`));
    },
  });
}

function make_handle_cases(handlers: Ast.HandlerCase[], ctx: Ctx) {
  const res = new Block(0);
  const hs = new Block(2);
  for (const h of handlers) {
    h.match({
      On(info, name, params, k, body) {
        const n = `$scope.effect(${str(ref_name(name))})`;
        const fb = new Block(2);
        fb.push_stack(`'on ${ref_name(name)}'`, ctx.options, ctx, info);
        if (k != null) {
          throw new Error(
            `lifting continuations is not yet implemented. At ${info?.formatted_position_message}`
          );
        }
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
      return str(parse_str(value));
    },

    TemplateText(info, value) {
      return str(fix_template_text(info, parse_str(value)));
    },
  });
}

function fix_template_text(info: Ast.Meta | null, value: string) {
  const col = info?.position.column ?? 1;
  const space_re = new RegExp(`^[ \\t]{0,${col - 1}}`);
  const lines = value.split(/\r\n|\r|\n/);
  const result = [];
  if (lines[0].trim()) {
    result.push(lines[0]);
  }
  result.push(...lines.slice(1, -1).map((x) => x.replace(space_re, "")));
  if (lines.length > 1 && lines[lines.length - 1].trim()) {
    result.push(lines[lines.length - 1].replace(space_re, ""));
  }
  return result.join("\n");
}

function bind(k: string | null, v: string) {
  if (k == null) {
    return v;
  } else if (k.startsWith(`$c$`)) {
    return `const ${k} = ${v}`;
  } else {
    return `${k} = ${v};`;
  }
}

function is_atomic(expr: Ast.MExpr): boolean {
  return expr.match({
    AbortWith(info, value) {
      return false;
    },
    Apply(info, callee, args) {
      return false;
    },
    Assert(info, expr, atag) {
      return false;
    },
    Binary(info, elements) {
      return elements.every((x) => is_atomic_bin_element(x));
    },
    Block(info, exprs) {
      return false;
    },
    Break(info, value) {
      return false;
    },
    Const(info, value) {
      return true;
    },
    Continue(info, bindings) {
      return false;
    },
    Extend(info, object, fields) {
      return false;
    },
    Force(info, thunk) {
      return false;
    },
    Foreign(info, name, args) {
      return false;
    },
    GetGlobal(info, ref) {
      return true;
    },
    GetVariant(info, ref, variant) {
      return true;
    },
    Handle(info, body, handlers) {
      return false;
    },
    Hole(info) {
      return false;
    },
    If(info, clauses) {
      return false;
    },
    IntrinsicEq(info, left, right) {
      return false;
    },
    Invoke(info, name, args) {
      return false;
    },
    InvokeSelf(info, name, self, args) {
      return false;
    },
    Is(info, expr, typ) {
      return false;
    },
    IsVariant(info, expr, typ, variant) {
      return false;
    },
    Lambda(info, params, body) {
      return true;
    },
    Lazy(info, expr) {
      return true;
    },
    Let(info, name, typ, value) {
      return false;
    },
    List(info, items) {
      return items.every((x) => is_atomic_list_element(x));
    },
    Map(info, pairs) {
      return pairs.every((x) => is_atomic_map_element(x));
    },
    New(info, ref, fields) {
      return false;
    },
    NewPos(info, ref, values) {
      return false;
    },
    NewVariant(info, ref, variant, fields) {
      return false;
    },
    NewVariantPos(info, ref, variant, args) {
      return false;
    },
    Perform(info, name, args) {
      return false;
    },
    Pipe(info, left, right) {
      return false;
    },
    Primitive(info, name, args) {
      return false;
    },
    Project(info, value, field) {
      return false;
    },
    Record(info, fields) {
      return false;
    },
    Repeat(info, bindings, body) {
      return false;
    },
    ResumeWith(info, value) {
      return false;
    },
    Self(info) {
      return true;
    },
    Static(info, ref) {
      return true;
    },
    Unreachable(info) {
      return false;
    },
    Var(info, name) {
      return true;
    },
    HasTrait(info, value, ref) {
      return false;
    },
    Package(info) {
      return true;
    },
  });
}

function is_constable(x: Ast.MExpr): boolean {
  return x.match({
    AbortWith(info, value) {
      return false;
    },
    Apply(info, callee, args) {
      return true;
    },
    Assert(info, expr, atag) {
      return false;
    },
    Binary(info, elements) {
      return true;
    },
    Block(info, exprs) {
      return false;
    },
    Break(info, value) {
      return false;
    },
    Const(info, value) {
      return true;
    },
    Continue(info, bindings) {
      return false;
    },
    Extend(info, object, fields) {
      return is_constable(object) && fields.every((x) => is_constable(x.value));
    },
    Force(info, thunk) {
      return is_constable(thunk);
    },
    Foreign(info, name, args) {
      return args.every(is_constable);
    },
    GetGlobal(info, ref) {
      return true;
    },
    GetVariant(info, ref, variant) {
      return true;
    },
    Handle(info, body, handlers) {
      return false;
    },
    Hole(info) {
      return false;
    },
    If(info, clauses) {
      return false;
    },
    IntrinsicEq(info, left, right) {
      return is_constable(left) && is_constable(right);
    },
    Invoke(info, name, args) {
      return args.every((x) => is_constable(x.value));
    },
    InvokeSelf(info, name, self, args) {
      return args.every((x) => is_constable(x.value)) && is_constable(self);
    },
    Is(info, expr, typ) {
      return is_constable(expr);
    },
    IsVariant(info, expr, typ, variant) {
      return is_constable(expr);
    },
    Lambda(info, params, body) {
      return true;
    },
    Lazy(info, expr) {
      return true;
    },
    Let(info, name, typ, value) {
      return false;
    },
    List(info, items) {
      return items.every(is_atomic_list_element);
    },
    Map(info, pairs) {
      return pairs.every(is_atomic_map_element);
    },
    New(info, ref, fields) {
      return fields.every((x) => is_constable(x.value));
    },
    NewPos(info, ref, values) {
      return values.every(is_constable);
    },
    NewVariant(info, ref, variant, fields) {
      return fields.every((x) => is_constable(x.value));
    },
    NewVariantPos(info, ref, variant, args) {
      return args.every(is_constable);
    },
    Perform(info, name, args) {
      return args.every(is_constable);
    },
    Pipe(info, left, right) {
      return is_constable(left) && is_constable(right);
    },
    Primitive(info, name, args) {
      return args.every(is_constable);
    },
    Project(info, value, field) {
      return is_constable(value);
    },
    Record(info, fields) {
      return fields.every((x) => is_constable(x.value));
    },
    Repeat(info, bindings, body) {
      return false;
    },
    ResumeWith(info, value) {
      return false;
    },
    Self(info) {
      return true;
    },
    Static(info, ref) {
      return true;
    },
    Unreachable(info) {
      return false;
    },
    Var(info, name) {
      return true;
    },
    HasTrait(info, value, ref) {
      return is_constable(value);
    },
    Package(info) {
      return true;
    },
  });
}

function is_atomic_bin_element(x: Ast.EBinElement) {
  return x.match({
    Byte(value) {
      return true;
    },
    Int(value, size, endianess, signed) {
      return true;
    },
  });
}

function is_atomic_list_element(x: Ast.ListItem): boolean {
  return x.match({
    Item(value) {
      return is_atomic(value);
    },
    Spread(value) {
      return is_atomic(value);
    },
  });
}

function is_atomic_map_element(x: Ast.MapItem): boolean {
  return x.match({
    Pair(key, value) {
      return is_atomic(key) && is_atomic(value);
    },
    Spread(value) {
      return is_atomic(value);
    },
  });
}

export function eval_const_expr(x: Ast.ConstExpr): unknown {
  return x.match({
    List(info, values) {
      return values.map(eval_const_expr);
    },
    Symbol(info, name) {
      return name;
    },
    Literal(info, value) {
      return value.match<unknown>({
        False(info) {
          return false;
        },
        Int(info, value) {
          return Number(value);
        },
        Float(info, value) {
          return value;
        },
        Int32(info, value) {
          return Number(value);
        },
        Int64(info, value) {
          return value;
        },
        Nothing(info) {
          return null;
        },
        TemplateText(info, value) {
          return fix_template_text(info, parse_str(value));
        },
        Text(info, value) {
          return parse_str(value);
        },
        True(info) {
          return true;
        },
      });
    },
  });
}

function parse_str(x0: string) {
  if (!x0.startsWith('"') || !x0.endsWith('"')) {
    throw new Error(`invalid string literal`);
  }
  const x1 = x0.slice(1, -1);
  return x1.replace(/\\u\{[^\}]+\}|\\u[a-fA-F0-9]{4}|\\./g, (match) => {
    if (match.startsWith("\\u{")) {
      return String.fromCodePoint(parseInt(match.slice(3, -1), 16));
    } else if (match.startsWith("\\u")) {
      return String.fromCharCode(parseInt(match.slice(2), 16));
    } else {
      const c = match[1];
      switch (c) {
        case "f":
          return "\f";
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "v":
          return "\v";
        case "b":
          return "\b";
        default:
          return c;
      }
    }
  });
}
