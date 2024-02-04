const Path = require("path");

const $meow = new (class Meow {
  pprint(x: $Value) {
    return $pprint(x);
  }

  info(x: Function, opts: { name: string; file: string; line: number }) {
    Object.defineProperty(x, "name", { value: `${opts.name} in ${opts.file}:${opts.line}` });
    return x;
  }

  in_package(name: string | null, fn: (_: $Scope) => void) {
    const scope = new $Scope(
      $scope,
      name,
      null,
      [name === "meow.core" ? null : name, "meow.core"].filter((x) => x != null) as string[]
    );
    fn(scope);
  }

  declare_type(name: string) {
    this.deftype(name, $placeholder_type(name));
  }

  defglobal(name: string, value: MeowFn) {
    if ($globals.has(name)) {
      throw new $Panic("duplicate-global", `Duplicate global ${name}`);
    }
    const v = $meow.wait_sync(value());
    $globals.set(name, v);
  }

  global(name: string) {
    if (!$globals.has(name)) {
      throw new $Panic("no-global", `Undefined global ${name} in ${$scope}`);
    }
    const value = $globals.get(name);
    return value;
  }

  foreign_path(dirname: string, path: string) {
    return Path.join(dirname, path);
  }

  defjs(scope: $Scope, path: string, mod: any) {
    if (mod == null || typeof mod !== "object") {
      throw new $Panic(
        "invalid-foreign",
        `Invalid foreign module exports: ${path} in ${scope.pkg}`
      );
    }
    for (const [k, v] of Object.entries(mod)) {
      if (typeof v !== "function") {
        continue;
      }
      const name = scope.wrap_pkg(k.replace(/__/g, ".").replace(/_/g, "-"));
      if ($foreign.has(name)) {
        throw new $Panic(
          "duplicate-foreign",
          `Duplicate foreign function ${k}: ${path} in ${scope.pkg}`
        );
      }
      $foreign.set(name, v as MeowFn);
    }
  }

  *calljs(name: string, args: $Value[]) {
    const fn = $foreign.get(name);
    if (fn == null) {
      throw new $Panic("no-foreign", `Undefined foreign ${name} in ${$scope}`);
    }
    return yield* fn(...args);
  }

  defun(name: string, types: $Type[], fn: MeowFn) {
    const fns = $fns.get(name) ?? [];
    fns.push(new $Fn(name, types, fn));
    if (fns.some((x) => x.types.length !== types.length)) {
      console.log(fns.map((x) => `${x.name} :: ${x.types.map((x) => x.name).join(", ")}`));
      throw new $Panic(
        "invalid-arity",
        `Invalid arity for ${name}: ${types.length} (expected ${fns[0].types.length})`
      );
    }
    fns.sort((a, b) => {
      for (let i = 0; i < a.types.length; ++i) {
        const ta = a.types[i];
        const tb = b.types[i];
        if (ta.distance !== tb.distance) {
          return ta.distance - tb.distance;
        }
      }
      return 0;
    });
    $fns.set(name, fns);
  }

  *call(name: string, ...args: $Value[]) {
    const fns = $fns.get(name);
    if (fns == null) {
      throw new $Panic("no-function", `Undefined function ${name}`);
    }
    SEARCH: for (const fn of fns) {
      for (let i = 0; i < args.length; ++i) {
        if (!fn.types[i].is(args[i])) {
          continue SEARCH;
        }
      }
      return yield* fn.code(...args);
    }
    throw new $Panic(
      "no-method",
      `No branch of ${name} matched (${args.map((x) => $pprint(x, 1))})`
    );
  }

  deftype(name: string, type: $Type) {
    if ($types.has(name)) {
      const existing = $types.get(name)!;
      if (type.placeholder && existing.placeholder) {
        return;
      }
      if (!existing.placeholder) {
        throw new $Panic("duplicate-type", `Duplicated type ${name}`);
      }
      existing.placeholder = false;
      existing.distance = type.distance;
      existing.is = type.is;
      return;
    }
    $types.set(name, type);
  }

  type(name: string) {
    const t = $types.get(name);
    if (t == null) {
      throw new $Panic("no-type", `Undefined type ${name} in ${$scope}`);
    }
    return t;
  }

  typeof(x: $Value) {
    if (x === null) {
      return $meow.type("nothing");
    } else if (typeof x === "string") {
      return $meow.type("text");
    } else if (typeof x === "number") {
      return $meow.type("i32");
    } else if (typeof x === "bigint") {
      return $meow.type("integer");
    } else if (typeof x === "boolean") {
      return $meow.type("bool");
    } else if (x instanceof Map) {
      return $meow.type("map");
    } else if (Array.isArray(x)) {
      return $meow.type("array");
    } else if (x instanceof Uint8Array) {
      return $meow.type("byte-array");
    } else if (x instanceof WeakRef) {
      return $meow.type("weak-ref");
    } else if (
      x instanceof $Struct ||
      x instanceof $Static ||
      x instanceof $Variant ||
      x instanceof $Cell ||
      x instanceof $Graphemes
    ) {
      return x.$type;
    } else if (typeof x === "function") {
      return $meow.type(`lambda-${x.length}`);
    } else {
      throw new $Panic("weird-value", `Unknown type`);
    }
  }

  deftrait(name: string, defaults: { [key: string]: null | MeowFn }) {
    if ($traits.has(name)) {
      throw new $Panic("duplicate-trait", `Duplicated trait ${name}`);
    }
    $traits.set(name, new $Trait(name, defaults));
  }

  implement(name: string, type: $Type, dict: { [key: string]: MeowFn }) {
    const trait = $traits.get(name);
    if (trait == null) {
      throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
    }
    trait.implement(type, dict);
  }

  trait(name: string) {
    const trait = $traits.get(name);
    if (trait == null) {
      throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
    }
    return trait.type;
  }

  vtype(name: string, variant: string) {
    return this.type(`${name}..${variant}`);
  }

  defsingleton(name: string) {
    if ($structs.has(name)) {
      throw new $Panic("duplicate-struct", `Duplicate struct ${name}`);
    }
    if ($globals.has(name)) {
      throw new $Panic("duplicate-global", `Duplicate global ${name}`);
    }
    const s = class Struct extends $Struct {
      get $type() {
        return $meow.type(name);
      }
      get $fields() {
        return [];
      }
      get $name() {
        return name;
      }
      toString() {
        return `${name}()`;
      }
      static of() {
        throw new $Panic("invalid-new", `new on a singleton`);
      }
      $clone(dict: any): this {
        throw new $Panic("invalid-clone", `Cannot clone a singleton`);
      }
    };
    Object.defineProperty(s, "name", { value: name });
    $structs.set(name, s as any);
    $globals.set(name, new s());
    this.deftype(
      name,
      $type(name, (x) => x instanceof s, 0)
    );
  }

  defstruct(name: string, fields: string[], types0: (() => $Type)[]) {
    if ($structs.has(name)) {
      throw new $Panic("duplicate-struct", `Duplicate struct ${name}`);
    }
    let types: $Type[];
    const s = class Struct extends $Struct {
      get $type() {
        return $meow.type(name);
      }
      get $name() {
        return name;
      }
      get $fields() {
        return fields;
      }
      static fields = fields;
      static types = types;
      private $dict;

      constructor(value: any) {
        super();
        this.$dict = value;
        for (let i = 0; i < fields.length; ++i) {
          const field = fields[i];
          const type = types[i];
          if (!type.is(value[field])) {
            throw new $Panic(
              "invalid-type",
              `Invalid value (${$pprint(value[field])}) in '${name}.${field}'. Expected ${
                type.name
              }`
            );
          }
          (this as any)[field] = value[field];
        }
      }
      toString() {
        return `${name}(${fields.map((x) => `${x}: ${(this as any)[x]}`).join(", ")})`;
      }
      static of(value: object) {
        return new s(value);
      }
      static of_pos(values: $Value[]) {
        if (fields.length !== values.length) {
          throw new $Panic("invalid-arity", `Invalid arity for ${name}`);
        }
        return new s(Object.fromEntries(fields.map((x, i) => [x, values[i]])));
      }
      $clone(dict: any): any {
        return new s({ ...this.$dict, ...dict });
      }
    };
    Object.defineProperty(s, "name", { value: name });
    $structs.set(name, s as any);
    this.deftype(
      name,
      $type(name, (x) => x instanceof s, 0)
    );
    types = types0.map((x) => x());
  }

  defunion(
    name: string,
    variants: { name: string; fields: string[] | null; types: (() => $Type)[] | null }[]
  ) {
    if ($structs.has(name)) {
      throw new $Panic("duplicate-struct", `Duplicate struct ${name}`);
    }
    const constructors: { [key: string]: { name: string; fields: string[]; types: $Type[] } } =
      Object.create(null);
    let singletons: { [key: string]: $Variant } = Object.create(null);
    const allowed = new Set(variants.map((x) => x.name));
    const s = class Union extends $Variant {
      get $type() {
        return $meow.type(name);
      }
      get $fields() {
        return constructors[this.$variant]?.fields ?? [];
      }
      get $name() {
        return name;
      }
      static variants = variants;
      static singletons = singletons;
      private $dict;

      constructor(readonly $variant: string, value: any | null) {
        super();
        this.$dict = value;
        if (value != null) {
          const v = constructors[$variant];
          for (let i = 0; i < v.fields.length; ++i) {
            const field = v.fields[i];
            const type = v.types[i];
            if (!type.is(value[field])) {
              throw new $Panic(
                "invalid-type",
                `Invalid value (${$pprint(
                  value[field]
                )}) in '${name}..${$variant}.${field}'. Expected ${type.name}`
              );
            }
            (this as any)[field] = value[field];
          }
        }
      }

      static make_variant(variant: string, value: any) {
        if (!allowed.has(variant)) {
          throw new $Panic("invalid-variant", `Invalid variant ${name}.${variant}`);
        }
        return new s(variant, value);
      }

      static make_variant_pos(variant: string, values: $Value[]) {
        if (!allowed.has(variant)) {
          throw new $Panic("invalid-variant", `Invalid variant ${name}.${variant}`);
        }
        const fields = constructors[variant].fields;
        if (fields.length !== values.length) {
          throw new $Panic("invalid-arity", `Invalid arity for ${name}.${variant}`);
        }
        return new s(variant, Object.fromEntries(fields.map((x, i) => [x, values[i]])));
      }

      static get_variant(name: string) {
        const v = singletons[name];
        if (v == null) {
          throw new $Panic("invalid-variatnt", `Invalid singleton variant ${name}`);
        }
        return v;
      }

      $clone(dict: any): any {
        if (this.$dict == null) {
          throw new $Panic("invalid-clone", `Cannot clone a nullary variant`);
        } else {
          return new s(this.$variant, { ...this.$dict, ...dict });
        }
      }
    };
    Object.defineProperty(s, "name", { value: name });
    $structs.set(name, s as any);

    this.deftype(
      name,
      $type(name, (x) => x instanceof s, 1)
    );

    for (const v of variants) {
      this.deftype(
        `${name}..${v.name}`,
        $type(`${name}..${v.name}`, (x) => x instanceof s && x.$variant === v.name, 0)
      );
      if (v.fields == null) {
        const i = new s(v.name, null);
        singletons[v.name] = i;
      } else {
        constructors[v.name] = {
          name: v.name,
          fields: v.fields!,
          types: v.types!.map((x) => x()),
        };
      }
    }
  }

  make(name: string, value: any) {
    const struct = $structs.get(name) as StaticStruct | null;
    if (struct == null || !("of" in struct)) {
      throw new $Panic("invalid-struct", `Invalid struct ${name} in ${$scope}`);
    }
    return struct.of(value);
  }

  make_pos(name: string, values: $Value[]) {
    const struct = $structs.get(name) as StaticStruct | null;
    if (struct == null || !("of" in struct)) {
      throw new $Panic("invalid-struct", `Invalid struct ${name} in ${$scope}`);
    }
    return struct.of_pos(values);
  }

  make_variant(name: string, variant: string, value: any) {
    const struct = $structs.get(name) as StaticUnion | null;
    if (struct == null || !("make_variant" in struct)) {
      throw new $Panic("invalid-union", `Invalid union ${name} in ${$scope}`);
    }
    return struct.make_variant(variant, value);
  }

  make_variant_pos(name: string, variant: string, values: $Value[]) {
    const struct = $structs.get(name) as StaticUnion | null;
    if (struct == null || !("make_variant" in struct)) {
      throw new $Panic("invalid-union", `Invalid union ${name} in ${$scope}`);
    }
    return struct.make_variant_pos(variant, values);
  }

  get_variant(name: string, variant: string) {
    const struct = $structs.get(name) as StaticUnion | null;
    if (struct == null || !("make_variant" in struct)) {
      throw new $Panic("invalid-union", `Invalid union ${name} in ${$scope}`);
    }
    return struct.get_variant(variant);
  }

  *force(value: $Value) {
    if (value instanceof $Thunk) {
      return yield* value.force();
    } else {
      throw new $Panic("invalid-type", `Expected thunk.`);
    }
  }

  f64(x: number) {
    return new $F64(x);
  }

  i32(x: number) {
    return new $I32(x | 0);
  }

  smake(name: string) {
    return new $Static(name);
  }

  stype(name: string) {
    return new $StaticType(name);
  }

  is(v: $Value, t: string) {
    const type = $meow.type(t);
    return type.is(v);
  }

  is_variant(x: $Value, t: string, v: string) {
    const type = $meow.vtype(t, v);
    return type.is(x);
  }

  eq(l: $Value, r: $Value): boolean {
    if (l instanceof $Static && r instanceof $Static) {
      return l.name === r.name;
    } else if (l instanceof $F64 && r instanceof $F64) {
      return l.value === r.value;
    } else {
      return l === r;
    }
  }

  record(xs: any) {
    return new $Record(xs);
  }

  extend(x: $Value, binds: any) {
    if (x instanceof $Record) {
      return new $Record({ ...x.$dict, binds });
    } else if (x instanceof $Struct || x instanceof $Variant) {
      return x.$clone(binds);
    } else {
      throw new $Panic("invalid-clone", `Non-extensible value ${$meow.pprint(x)}`);
    }
  }

  assert_fail(tag: string | null, expr: string, source: any = null) {
    throw new $AssertionFailed(tag ?? "", expr, source);
  }

  unreachable() {
    throw new $Panic("unreachable", `Unexpected execution of unreachable code`);
  }

  checked(x: unknown) {
    if (x === undefined) {
      throw new $Panic("weird-value", `Unexpected undefined value`);
    } else {
      return x;
    }
  }

  // -- Effects
  defeff(name: string, types: $Type[], non_local: boolean, line: number) {
    const location = `${$stack.current()}`;
    if ($effects.has(name)) {
      throw new $Panic("duplicate-effect", `Effect ${name} is already defined.`);
    }
    $effects.set(name, new $Effect(name, types, non_local, location));
  }

  eff_resume(value: $Value) {
    return new $ResumeSignal(value);
  }

  eff_abort(value: $Value) {
    return new $AbortSignal(value);
  }

  eff_perform(name: string, args: $Value[]) {
    const eff = $effects.get(name);
    if (eff == null) {
      throw new $Panic("no-effect", `No effect ${name} is defined.`);
    }
    if (eff.types.length !== args.length) {
      throw new $Panic("invalid-arity", `Invalid arity for effect ${name}`);
    }
    for (let i = 0; i < args.length; ++i) {
      if (!eff.types[i].is(args[i])) {
        throw new $Panic(
          "invalid-type",
          `Invalid type for effect ${name} at ${i}. Expected ${eff.types[i].name}, got ${$pprint(
            args[i]
          )}`
        );
      }
    }
    return new $PerformSignal(name, args);
  }

  eff_handle(fn: MeowFn0, handlers: { [key: string]: MeowFn }) {
    return new $HandleSignal(fn(), handlers);
  }

  eff_on(name: string, fn: MeowFn) {
    return { [name]: fn };
  }

  *eff_use(name: string, args: $Value[]) {
    const handler = $handlers.get(name);
    if (handler == null) {
      throw new $Panic("no-handler", `Undefined handler ${name}`);
    }
    if (args.length !== handler.types.length) {
      throw new $Panic("invalid-arity", `Invalid arity (${args.length}) for handler ${name}`);
    }
    for (let i = 0; i < handler.types.length; ++i) {
      if (!handler.types[i].is(args[i])) {
        throw new $Panic(
          "invalid-type",
          `Expected ${handler.types[i].name} at ${i} in handler ${name}, got ${$pprint(args[i])}`
        );
      }
    }
    return yield* handler.fn(...args);
  }

  eff_cases(xs: { [key: string]: MeowFn }[]) {
    return Object.assign({}, ...xs);
  }

  defhandler(name: string, fn: MeowFn, types: $Type[], is_default: boolean) {
    if ($handlers.has(name)) {
      throw new $Panic("duplicate-handler", `Duplicate handler ${name} definition`);
    }
    const handler = new $Handler(name, types, fn);
    if (is_default) {
      $default_handlers.push(handler);
    }
    $handlers.set(name, handler);
  }

  // -- Tests
  deftest(name: string, fn: MeowFn) {
    $tests.push(new $Test(name, fn));
  }

  async run_tests() {
    const tf0 = process.argv.indexOf("--test-filter");
    const tf1 = tf0 >= 0 ? process.argv[tf0 + 1] : null;
    const test_filter = tf1 == null ? (x: string) => true : (x: string) => x.includes(tf1);

    const start = performance.now();
    const errors: { error: unknown; test: $Test }[] = [];
    for (const x of $tests) {
      if (!test_filter(x.name)) {
        continue;
      }
      try {
        await $meow.wait(
          $meow.with_default_handlers(function* () {
            return yield* x.fn();
          })
        );
        console.log(`[OK ] ${x.name}`);
      } catch (e) {
        console.log(`[ERR] ${x.name} (${errors.length + 1})`);
        errors.push({ error: e, test: x });
      }
    }
    const stop = performance.now();
    const duration = stop - start;

    console.log("-".repeat(72));
    let i = 1;
    for (const x of errors) {
      console.error(`${i++}) ${x.test.name}`);
      console.error($meow_format_error(x.error));
      console.error("");
    }
    console.log("-".repeat(72));
    console.log(`Ran ${$tests.length} tests in ${duration}ms | ${errors.length} errors`);
    return null;
  }

  wait_sync(gen: MeowGen): $Value {
    let result = gen.next();
    while (true) {
      if (result.done) {
        return result.value;
      } else {
        throw new $Panic("signal-in-sync-execution", `Signal raised in synchronous execution`, {
          signal: result.value,
        });
      }
    }
  }

  *with_default_handlers(fn: MeowFn0) {
    for (const handler of $default_handlers) {
      const cases = yield* handler.fn();
      yield new $InstallHandlerCasesSignal(cases as any);
    }
    return yield* fn();
  }

  async wait(gen: MeowGen): Promise<$Value> {
    let ctx = new $HandleStack(null, gen, {}, null);
    let result = ctx.gen.next();
    while (true) {
      if (result.done) {
        if (ctx.parent == null) {
          return result.value;
        } else {
          ctx = ctx.parent;
          result = ctx.gen.next(result.value);
        }
      } else {
        const signal = result.value;
        if (signal instanceof $PanicSignal) {
          throw signal.error;
        } else if (signal instanceof $AwaitSignal) {
          const value = await signal.value;
          result = ctx.gen.next(value);
        } else if (signal instanceof $PerformSignal) {
          const { stack, handler } = ctx.find_handler(signal.name);
          const gen = handler(...signal.args);
          ctx = new $HandleStack(ctx, gen, {}, stack.parent);
          result = gen.next();
        } else if (signal instanceof $HandleSignal) {
          ctx = new $HandleStack(ctx, signal.gen, signal.cases, ctx.abort_to);
          result = ctx.gen.next();
        } else if (signal instanceof $ResumeSignal) {
          if (ctx.parent == null) {
            return signal.value;
          } else {
            ctx = ctx.parent;
            result = ctx.gen.next(signal.value);
          }
        } else if (signal instanceof $AbortSignal) {
          if (ctx.abort_to == null) {
            return signal.value;
          } else {
            ctx = ctx.abort_to;
            result = ctx.gen.next(signal.value);
          }
        } else if (signal instanceof $InstallHandlerCasesSignal) {
          for (const [k, v] of Object.entries(signal.cases)) {
            if (Object.hasOwn(ctx.cases, k)) {
              throw new $Panic(
                "duplicate-install-handler",
                `Scope already has a handler defined for ${k} (${ctx.cases[k].name}), but a new one (${v.name}) was installed.`
              );
            }
            ctx.cases[k] = v;
          }
          result = ctx.gen.next(null);
        } else {
          throw new $Panic("unknown-signal", `Unknown signal in execution`, { signal });
        }
      }
    }
  }

  async run(args: string[]) {
    try {
      if (args.includes("--test")) {
        $stack.push("<runtime> run tests");
        return await $meow.run_tests();
      } else {
        $stack.push("<runtime> main entry point");
        return await $meow.wait(
          $meow.with_default_handlers(function* () {
            return yield* $meow.call("main()/1", args);
          })
        );
      }
    } catch (error: any) {
      console.error(`PANIC: Meow exited with an error at ${$stack.current()}.`);
      console.error($meow_format_error(error));
      process.exit(1);
    }
  }
})();
