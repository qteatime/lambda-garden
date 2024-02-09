const Path = require("path");
const Show = require("util").inspect;

const $meow = new (class Meow {
  pprint(x: $Value) {
    return $pprint(x);
  }

  info(x: Function, opts: { name: string; file: string; line: number }) {
    Object.defineProperty(x, "name", { value: `${opts.name} in ${opts.file}:${opts.line}` });
    return x;
  }

  start_package(name: string | null) {
    const pkg = this.package_type_name(name);
    this.defsingleton(pkg);
    this.defsingleton(pkg + `-assets`);
    this.defun("name(self:)/1", [this.type(pkg)], (_) => name as any, true);
    this.defun(
      "assets(self:)/1",
      [this.type(pkg)],
      (_) => this.global(pkg + "-assets") as any,
      true
    );
  }

  package_type_name(name: string | null) {
    return name == null ? `package` : `${name}/package`;
  }

  in_package(name: string | null, fn: (_: $Scope) => void) {
    if (!$types.has(this.package_type_name(name))) {
      this.start_package(name);
    }
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

  declare_trait(name: string) {
    this.deftrait(name, true);
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

  calljs_pure(name: string, args: $Value[]) {
    const fn = $foreign.get(name);
    if (fn == null) {
      throw new $Panic("no-foreign", `Undefined foreign ${name} in ${$scope}`);
    }
    return fn(...args);
  }

  defun(name: string, types: $Type[], fn: MeowFn, pure: boolean = false) {
    const fns = $fns.get(name) ?? [];
    fns.push(new $Fn(name, types, fn, pure));
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

  call_pure(name: string, ...args: $Value[]) {
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
      if (!fn.pure) {
        throw new $Panic("layer-violation", `Effectful function ${fn.name} called from pure code`);
      }
      return fn.code(...args);
    }

    const branches = fns.map((x) => `  - (${x.types.map((t) => t.name).join(", ")})\n`).join("");
    throw new $Panic(
      "no-method",
      `No branch of ${name} matched (${args
        .map((x) => $meow.typeof(x).name)
        .join(", ")})\n\nDefined branches:\n${branches}`
    );
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
      if (fn.pure) {
        return fn.code(...args) as any as $Value;
      } else {
        return yield* fn.code(...args);
      }
    }

    const branches = fns.map((x) => `  - (${x.types.map((t) => t.name).join(", ")})\n`).join("");
    throw new $Panic(
      "no-method",
      `No branch of ${name} matched (${args
        .map((x) => $meow.typeof(x).name)
        .join(", ")})\n\nDefined branches:\n${branches}`
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
      existing.subtypes = type.subtypes;
      return;
    }
    $types.set(name, type);
  }

  def_foreign_type<T>(name: string, test: (_: unknown) => boolean) {
    if ($types.has(name)) {
      throw new $Panic("duplicate-type", `Duplicated type ${name}`);
    }
    const t = new $ForeignType<T>(name, test);
    $types.set(name, t);
    return t;
  }

  with_trait(type: $Type, traits: $Type[]) {
    return $type(
      `(${type.name} has ${traits.map((x) => x.name).join(", ")})`,
      (x) => type.is(x) && traits.every((t) => t.is(x)),
      Math.min(type.distance, 254),
      []
    );
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
      return $meow.type("int");
    } else if (typeof x === "bigint") {
      return $meow.type("i64");
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
    } else if (x instanceof $Process) {
      return $meow.type("process");
    } else if (
      x instanceof $Struct ||
      x instanceof $Static ||
      x instanceof $Variant ||
      x instanceof $Cell ||
      x instanceof $Foreign ||
      x instanceof $Record ||
      x instanceof $Asset
    ) {
      return x.$type;
    } else if (typeof x === "function") {
      return $meow.type(`lambda-${x.length}`);
    } else {
      throw new $Panic("weird-value", `Unknown type for ${Show(x)}`);
    }
  }

  deftrait(name: string, placeholder: boolean = false) {
    if ($traits.has(name)) {
      const trait = $traits.get(name)!;
      if (!trait.is_placeholder) {
        if (placeholder) return;
        throw new $Panic("duplicate-trait", `Duplicate trait ${name}`);
      }
      if (!placeholder) {
        trait.materialise();
      }
    } else {
      $traits.set(name, new $Trait(name, placeholder));
    }
  }

  implement(name: string, type: $Type) {
    const trait = $traits.get(name);
    if (trait == null) {
      throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
    }
    trait.implement(type);
    trait.implement(type.$static);
  }

  trait(name: string) {
    const trait = $traits.get(name);
    if (trait == null) {
      throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
    }
    return trait.type;
  }

  has_trait(value: $Value, name: string) {
    const trait = $traits.get(name);
    if (trait == null) {
      throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
    }
    return trait.has(value);
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
        return $pprint(this);
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
        return $pprint(this);
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
        return $meow.type(`${name}..${this.$variant}`);
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

    const variant_types = variants.map((v) => {
      const t = $type(`${name}..${v.name}`, (x) => x instanceof s && x.$variant === v.name, 0);
      this.deftype(`${name}..${v.name}`, t);
      return t;
    });

    this.deftype(
      name,
      $type(name, (x) => x instanceof s, 1, variant_types)
    );

    for (const v of variants) {
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
      return new $Record({ ...x.$dict, ...binds });
    } else if (x instanceof $Struct || x instanceof $Variant) {
      return x.$clone(binds);
    } else {
      throw new $Panic("invalid-clone", `Non-extensible value ${$meow.pprint(x)}`);
    }
  }

  assert_fail(tag: string | null, expr: string, source: any = null) {
    if (!(source instanceof $AssertionFailed)) {
      throw new $AssertionFailed(tag ?? "", expr, source);
    } else {
      throw source;
    }
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

  checked_project(x: unknown, v: $Value, f: string) {
    if (x === undefined) {
      throw new $Panic("invalid-field", `Invalid field ${f} for type ${$meow.typeof(v).name}`);
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

  // -- Assets
  put_asset(name: string, data: Uint8Array) {
    if ($assets.has(name)) {
      throw new $Panic("duplicate-asset", `Duplicate asset ${name}`);
    }
    $assets.set(name, new $Asset(name, data));
  }

  put_asset_base64(name: string, data: string) {
    this.put_asset(
      name,
      Uint8Array.from(atob(data) as any, (x) => (x as any as string).codePointAt(0)!)
    );
  }

  get_asset(name: string) {
    const x = $assets.get(name);
    if (x == null) {
      throw new $Panic("no-asset", `Undefined asset ${name}`);
    }
    return x;
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
      process.stdout.write(`[...] ${x.name}`.slice(0, process.stdout.columns - 5));
      try {
        const test = await $run_throw(
          $with_default_handlers(
            (function* () {
              return yield* x.fn();
            })()
          ),
          `<test: ${x.name}>`
        );
        await $loop_run();
        await test.result;
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(`[OK ] ${x.name}`);
      } catch (e) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
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

  wait_promise(promise: Promise<$Value>) {
    return new $AwaitSignal(promise);
  }

  yield() {
    return new $YieldProcessSignal();
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

  async run(args: string[]) {
    $file = null;
    $line = null;
    try {
      if (args.includes("--test")) {
        $stack.push("<runtime> run tests");
        await $meow.run_tests();
      } else {
        $stack.push("<runtime> main entry point");
        $keep_alive(true);
        const main = await $run_throw(
          $with_default_handlers(
            (function* () {
              return yield* $meow.call("main()/1", args);
            })()
          ),
          "<main>"
        );
        await $loop_run();
        await main.result;
        $keep_alive(false);
      }
    } catch (error: any) {
      console.error(`PANIC: Meow exited with an error at ${$stack.current()}.`);
      console.error($meow_format_error(error));
      process.exit(1);
    }
  }
})();
