function prelude() {
  //@@@START_PRELUDE@@@
  const Path = require("path");

  abstract class $Signal {}
  class $PanicSignal extends $Signal {
    constructor(readonly error: $Panic) {
      super();
    }
  }
  class $AwaitSignal extends $Signal {
    constructor(readonly value: Promise<$Value>) {
      super();
    }
  }

  type MeowGen = Generator<$Signal, $Value, $Value>;
  type MeowFn = (...args: $Value[]) => MeowGen;

  class $F64 {
    constructor(readonly value: number) {}
  }
  class $Fn {
    constructor(readonly name: string, readonly types: $Type[], readonly code: MeowFn) {}
  }
  class $Record {
    get type() {
      return $type("record", (x) => x instanceof $Record, 1);
    }
    constructor(readonly $dict: { [key: string]: $Value }) {
      for (const [k, v] of Object.entries($dict)) {
        (this as any)[k] = v;
      }
    }
  }
  type $Prim = null | string | number | bigint | boolean;
  type $Ref =
    | $Value[]
    | $Struct
    | $Static
    | $Variant
    | $Thunk
    | Map<$Value, $Value>
    | $Cell
    | MeowFn
    | Uint8Array
    | $F64
    | $Record
    | $Graphemes;
  type $Value = $Prim | $Ref | WeakRef<$Ref>;

  class $Graphemes {
    get $type() {
      return $meow.type("grapheme-cluster");
    }
    constructor(readonly cluster: string) {}
    toString() {
      return `grapheme-cluster(${$show(this.cluster)})`;
    }
  }

  class $Static {
    get $type() {
      return $meow.stype(this.name);
    }
    constructor(readonly name: string) {}
    toString() {
      return `#${this.$type.name}`;
    }
  }

  class $Thunk {
    get type() {
      return $meow.type("thunk");
    }
    _forced = false;
    _value: $Value = null;
    constructor(readonly fn: () => MeowGen) {}

    *force() {
      if (this._forced) {
        return this._value;
      } else {
        const value = yield* this.fn();
        this._forced = true;
        this._value = value;
        return value;
      }
    }
  }

  class $Cell {
    get $type() {
      return $meow.type("cell");
    }
    constructor(public _value: $Value) {}
    exchange(value: $Value) {
      const old = this._value;
      this._value = value;
      return old;
    }
    cas(value: $Value, old: $Value) {
      if ($meow.eq(this._value, old)) {
        this._value = value;
        return true;
      } else {
        return false;
      }
    }
    deref() {
      return this._value;
    }
  }

  class $Trait {
    private _implementations = new Map<string, { [key: string]: MeowFn }>();
    get type() {
      return $type(
        this.tname,
        (x) => {
          const t = $meow.typeof(x);
          return this._implementations.has(t.name);
        },
        2
      );
    }
    constructor(readonly tname: string, readonly defaults: { [key: string]: null | MeowFn }) {}
    implement(t: $Type, implementation: any) {
      if (this._implementations.has(t.name)) {
        throw new Error(`Duplicate trait ${this.tname} implementation for ${t.name}`);
      }
      const dict = { ...this.defaults, ...implementation };
      for (const k of Object.keys(this.defaults)) {
        if (typeof dict[k] !== "function") {
          throw new Error(`No method ${k} in ${t.name} implementation of trait ${this.tname}`);
        }
      }
      this._implementations.set(t.name, dict);
    }
    *call(name: string, args: $Value[]) {
      const t = $meow.typeof(args[0]);
      const dict = this._implementations.get(t.name);
      if (dict == null) {
        throw new Error(`No trait ${this.tname} implementation for ${t.name}`);
      }
      const m = dict[name];
      if (m == null) {
        throw new Error(`No method ${name} in trait ${this.tname}`);
      }
      return yield* m(...args);
    }
  }

  abstract class $Type {
    abstract name: string;
    abstract distance: number;
    abstract is(value: $Value): boolean;
    abstract placeholder: boolean;
  }
  function $type(name: string, check: (_: $Value) => boolean, distance: number) {
    return new (class extends $Type {
      readonly placeholder = false;
      readonly name = name;
      readonly distance = distance;
      is(value: $Value) {
        return check(value);
      }
    })();
  }
  function $placeholder_type(name: string) {
    return new (class extends $Type {
      readonly placeholder = true;
      readonly name = name;
      readonly distance = 0;
      is(value: $Value) {
        return false;
      }
    })();
  }

  class $StaticType extends $Type {
    get name() {
      return `#${this.sname}`;
    }
    placeholder = false;
    distance = 0;
    constructor(readonly sname: string) {
      super();
    }
    is(value: $Value): boolean {
      return value instanceof $Static && value.name === this.sname;
    }
  }

  interface StaticStruct {
    name: string;
    fields: string;
    types: $Type[];
    of(value: any): $Struct;
    of_pos(values: $Value[]): $Struct;
  }

  abstract class $Struct {
    abstract $type: $Type;
    abstract $fields: string[];
    abstract $name: string;
  }

  interface StaticUnion {
    variants: StaticStruct[];
    singletons: { [key: string]: $Variant };
    get_variant(name: string): $Variant;
    make_variant(name: string, values: any): $Variant;
    make_variant_pos(name: string, values: $Value[]): $Variant;
  }

  abstract class $Variant {
    abstract $type: $Type;
    abstract $fields: string[];
    abstract $name: string;
    abstract $variant: string;
  }

  class $Test {
    constructor(readonly name: string, readonly fn: MeowFn) {}
  }

  class $AssertionFailed extends Error {
    constructor(readonly tag: string, readonly expr: string) {
      super(`Assertion failed: ${tag}\n\n${expr}`);
    }
  }

  class $UnifyFailed extends Error {
    constructor(expected: unknown, actual: unknown) {
      super(`Unification failed.\nExpected: ${$show(expected)}\nActual: ${$show(actual)}`);
    }
  }

  class $Panic extends Error {
    constructor(readonly tag: string, readonly message: string, readonly data: unknown) {
      super(`Panic(${tag}): ${message}\n\nAssociated data: ${$show(data)}`);
    }
  }

  const $show = (x: any) => require("util").inspect(x);

  const $fns = new Map<string, $Fn[]>();
  const $types = new Map<string, $Type>();
  const $structs = new Map<string, StaticStruct | StaticUnion>();
  const $globals = new Map<string, $Value>();
  const $traits = new Map<string, $Trait>();
  const $foreign = new Map<string, MeowFn>();
  const $tests: $Test[] = [];

  class $Scope {
    readonly pkg_aliases = new Map<string, string>();
    constructor(
      readonly parent: $Scope | null,
      readonly pkg: string | null,
      readonly ns: string | null,
      readonly pkg_prefixes: string[]
    ) {}
    get prefix() {
      const pkg_prefix = this.pkg == null ? "" : `${this.pkg}`;
      const ns_prefix = this.ns == null ? "" : `${this.ns}`;
      return `(pkg: ${pkg_prefix}, ns: ${ns_prefix})`;
    }
    wrap(name: string) {
      const pkg_prefix = this.pkg == null ? "" : `${this.pkg}/`;
      const ns_prefix = this.ns == null ? "" : `${this.ns}.`;
      return `${pkg_prefix}${ns_prefix}${name}`;
    }
    wrap_pkg(name: string) {
      return this.pkg == null ? name : `${this.pkg}/${name}`;
    }
    resolve<A>(name: string, box: Map<string, A>): string {
      if (name.includes("/")) {
        if (this.pkg_aliases.size === 0) {
          return name;
        } else {
          const [pkg0, ns] = name.split("/");
          const pkg = this.pkg_aliases.get(pkg0) ?? pkg0;
          return `${pkg}/${ns}`;
        }
      }
      for (const p of this.pkg_prefixes) {
        const n = `${p}/${name}`;
        if (box.has(n)) {
          return n;
        }
      }
      if (this.parent != null) {
        return this.parent.resolve(name, box);
      } else {
        return name;
      }
    }
    open_pkg(name: string, alias: string | null) {
      if (alias == null) {
        if (this.pkg_prefixes.includes(name)) {
          throw new Error(`Package ${name} is already open`);
        }
        this.pkg_prefixes.push(name);
      } else {
        if (this.pkg_aliases.has(alias)) {
          throw new Error(
            `Duplicate alias ${alias} already refer to ${this.pkg_aliases.get(name)}`
          );
        }
        this.pkg_aliases.set(alias, name);
      }
    }
    toString() {
      return `scope(${this.prefix})[${this.pkg_prefixes.join(", ")}]`;
    }

    global(name: string) {
      return $meow.global(this.resolve(name, $globals));
    }
    trait(name: string) {
      return $meow.trait(this.resolve(name, $traits));
    }
    type(name: string) {
      return $meow.type(this.resolve(name, $types));
    }
    stype(name: string) {
      return $meow.stype(this.resolve(name, $types));
    }
    vtype(name: string, variant: string) {
      return $meow.vtype(this.resolve(name, $types), variant);
    }
    make(name: string, value: any) {
      return $meow.make(this.resolve(name, $structs), value);
    }
    make_pos(name: string, value: any) {
      return $meow.make_pos(this.resolve(name, $structs), value);
    }
    smake(name: string) {
      return $meow.smake(this.resolve(name, $types));
    }
    make_variant(name: string, variant: string, value: any) {
      return $meow.make_variant(this.resolve(name, $structs), variant, value);
    }
    make_variant_pos(name: string, variant: string, value: any) {
      return $meow.make_variant_pos(this.resolve(name, $structs), variant, value);
    }
    get_variant(name: string, variant: string) {
      return $meow.get_variant(this.resolve(name, $structs), variant);
    }
    is(value: any, type: string) {
      return $meow.is(value, this.resolve(type, $types));
    }
    is_variant(value: any, type: string, variant: string) {
      return $meow.is_variant(value, this.resolve(type, $types), variant);
    }
  }
  let $scope: $Scope = new $Scope(null, null, null, ["meow.core"]);

  function $is_prim(x: $Value) {
    return (
      x === null ||
      typeof x === "bigint" ||
      typeof x === "boolean" ||
      typeof x === "number" ||
      typeof x === "string"
    );
  }

  const $meow = new (class Meow {
    pprint(x: $Value) {
      return $pprint(x);
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
        throw new Error(`Duplicate global ${name}`);
      }
      const v = $meow.wait_sync(value());
      $globals.set(name, v);
    }

    global(name: string) {
      if (!$globals.has(name)) {
        throw new Error(`Undefined global ${name} in ${$scope}`);
      }
      const value = $globals.get(name);
      return value;
    }

    foreign_path(dirname: string, path: string) {
      return Path.join(dirname, path);
    }

    defjs(scope: $Scope, path: string, mod: any) {
      if (mod == null || typeof mod !== "object") {
        throw new Error(`Invalid foreign module exports: ${path} in ${scope.pkg}`);
      }
      for (const [k, v] of Object.entries(mod)) {
        if (typeof v !== "function") {
          continue;
        }
        const name = scope.wrap_pkg(k.replace(/__/g, ".").replace(/_/g, "-"));
        if ($foreign.has(name)) {
          throw new Error(`Duplicate foreign function ${k}: ${path} in ${scope.pkg}`);
        }
        $foreign.set(name, v as MeowFn);
      }
    }

    *calljs(name: string, args: $Value[]) {
      const fn = $foreign.get(name);
      if (fn == null) {
        throw new Error(`Undefined foreign ${name} in ${$scope}`);
      }
      return yield* fn(...args);
    }

    defun(name: string, types: $Type[], fn: MeowFn) {
      const fns = $fns.get(name) ?? [];
      Object.defineProperty(fn, "name", { value: name });
      fns.push(new $Fn(name, types, fn));
      if (fns.some((x) => x.types.length !== types.length)) {
        console.log(fns.map((x) => `${x.name} :: ${x.types.map((x) => x.name).join(", ")}`));
        throw new Error(
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
        throw new Error(`Undefined function ${name}`);
      }
      SEARCH: for (const fn of fns) {
        for (let i = 0; i < args.length; ++i) {
          if (!fn.types[i].is(args[i])) {
            continue SEARCH;
          }
        }
        return yield* fn.code(...args);
      }
      throw new Error(`No branch of ${name} matched (${args.map($show)})`);
    }

    deftype(name: string, type: $Type) {
      if ($types.has(name)) {
        const existing = $types.get(name)!;
        if (type.placeholder && existing.placeholder) {
          return;
        }
        if (!existing.placeholder) {
          throw new Error(`Duplicated type ${name}`);
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
        throw new Error(`Undefined type ${name} in ${$scope}`);
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
        throw new Error(`Unknown type`);
      }
    }

    deftrait(name: string, defaults: { [key: string]: null | MeowFn }) {
      if ($traits.has(name)) {
        throw new Error(`Duplicated trait ${name}`);
      }
      $traits.set(name, new $Trait(name, defaults));
    }

    implement(name: string, type: $Type, dict: { [key: string]: MeowFn }) {
      const trait = $traits.get(name);
      if (trait == null) {
        throw new Error(`Undefined trait ${name} in ${$scope}`);
      }
      trait.implement(type, dict);
    }

    trait(name: string) {
      const trait = $traits.get(name);
      if (trait == null) {
        throw new Error(`Undefined trait ${name} in ${$scope}`);
      }
      return trait.type;
    }

    vtype(name: string, variant: string) {
      return this.type(`${name}..${variant}`);
    }

    defsingleton(name: string) {
      if ($structs.has(name)) {
        throw new Error(`Duplicate struct ${name}`);
      }
      if ($globals.has(name)) {
        throw new Error(`Duplicate global ${name}`);
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
          throw new Error(`new on a singleton`);
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
        throw new Error(`Duplicate struct ${name}`);
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

        constructor(value: any) {
          super();
          for (let i = 0; i < fields.length; ++i) {
            const field = fields[i];
            const type = types[i];
            if (!type.is(value[field])) {
              throw new Error(
                `Invalid value (${$show(value[field])}) in '${name}.${field}'. Expected ${
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
            throw new Error(`Invalid arity for ${name}`);
          }
          return new s(Object.fromEntries(fields.map((x, i) => [x, values[i]])));
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
        throw new Error(`Duplicate struct ${name}`);
      }
      const constructors: { [key: string]: { name: string; fields: string[]; types: $Type[] } } =
        Object.create(null);
      let singletons: { [key: string]: $Variant } = Object.create(null);
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

        constructor(readonly $variant: string, value: any | null) {
          super();
          if (value != null) {
            const v = constructors[$variant];
            for (let i = 0; i < v.fields.length; ++i) {
              const field = v.fields[i];
              const type = v.types[i];
              if (!type.is(value[field])) {
                throw new Error(
                  `Invalid value (${$show(
                    value[field]
                  )}) in '${name}..${$variant}.${field}'. Expected ${type.name}`
                );
              }
              (this as any)[field] = value[field];
            }
          }
        }

        static make_variant(name: string, value: any) {
          return new s(name, value);
        }

        static make_variant_pos(variant: string, values: $Value[]) {
          const fields = constructors[variant].fields;
          if (fields.length !== values.length) {
            throw new Error(`Invalid arity for ${name}.${variant}`);
          }
          return new s(variant, Object.fromEntries(fields.map((x, i) => [x, values[i]])));
        }

        static get_variant(name: string) {
          const v = singletons[name];
          if (v == null) {
            throw new Error(`Invalid singleton variant ${name}`);
          }
          return v;
        }
      };
      Object.defineProperty(s, "name", { value: name });
      $structs.set(name, s as any);

      this.deftype(
        name,
        $type(name, (x) => x instanceof s, 0)
      );

      for (const v of variants) {
        this.deftype(
          `${name}..${v.name}`,
          $type(`${name}..${v.name}`, (x) => x instanceof s && x.$variant === v.name, 1)
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
        throw new Error(`Invalid struct ${name} in ${$scope}`);
      }
      return struct.of(value);
    }

    make_pos(name: string, values: $Value[]) {
      const struct = $structs.get(name) as StaticStruct | null;
      if (struct == null || !("of" in struct)) {
        throw new Error(`Invalid struct ${name} in ${$scope}`);
      }
      return struct.of_pos(values);
    }

    make_variant(name: string, variant: string, value: any) {
      const struct = $structs.get(name) as StaticUnion | null;
      if (struct == null || !("make_variant" in struct)) {
        throw new Error(`Invalid union ${name} in ${$scope}`);
      }
      return struct.make_variant(variant, value);
    }

    make_variant_pos(name: string, variant: string, values: $Value[]) {
      const struct = $structs.get(name) as StaticUnion | null;
      if (struct == null || !("make_variant" in struct)) {
        throw new Error(`Invalid union ${name} in ${$scope}`);
      }
      return struct.make_variant_pos(variant, values);
    }

    get_variant(name: string, variant: string) {
      const struct = $structs.get(name) as StaticUnion | null;
      if (struct == null || !("make_variant" in struct)) {
        throw new Error(`Invalid union ${name} in ${$scope}`);
      }
      return struct.get_variant(variant);
    }

    *force(value: $Value) {
      if (value instanceof $Thunk) {
        return yield* value.force();
      } else {
        throw new Error(`Expected thunk.`);
      }
    }

    f64(x: number) {
      return new $F64(x);
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

    assert_fail(tag: string | null, expr: string) {
      throw new $AssertionFailed(tag ?? "", expr);
    }

    deftest(name: string, fn: MeowFn) {
      $tests.push(new $Test(name, fn));
    }

    *run_tests() {
      const start = performance.now();
      const errors: { error: unknown; test: $Test }[] = [];
      for (const x of $tests) {
        try {
          yield* x.fn();
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
        console.error(x.error instanceof Error ? x.error.stack ?? String(x) : String(x));
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

    async wait(gen: MeowGen): Promise<$Value> {
      let result = gen.next();
      while (true) {
        if (result.done) {
          return result.value;
        } else {
          const signal = result.value;
          if (signal instanceof $PanicSignal) {
            throw signal.error;
          } else if (signal instanceof $AwaitSignal) {
            const value = await signal.value;
            result = gen.next(value);
          } else {
            throw new $Panic("unknown-signal", `Unknown signal in execution`, { signal });
          }
        }
      }
    }

    async run(args: string[]) {
      try {
        if (args.includes("--test")) {
          $meow.wait($meow.run_tests());
        } else {
          $meow.wait($meow.call("main()/1", args));
        }
      } catch (error: any) {
        console.error(`PANIC: Meow exited with an error.`);
        console.error(error?.stack ?? error);
        process.exit(1);
      }
    }
  })();

  $meow.deftype(
    "i32",
    $type("i32", (x) => typeof x === "number", 0)
  );
  $meow.deftype(
    "f64",
    $type("f64", (x) => x instanceof $F64, 0)
  );
  $meow.deftype(
    "text",
    $type("text", (x) => typeof x === "string", 0)
  );
  $meow.deftype(
    "nothing",
    $type("nothing", (x) => x === null, 0)
  );
  $meow.deftype(
    "integer",
    $type("integer", (x) => typeof x === "bigint", 0)
  );
  $meow.deftype(
    "bool",
    $type("bool", (x) => typeof x === "boolean", 0)
  );
  $meow.deftype(
    "array",
    $type("array", (x) => Array.isArray(x), 0)
  );
  $meow.deftype(
    "byte-array",
    $type("byte-array", (x) => x instanceof Uint8Array, 0)
  );
  $meow.deftype(
    "unknown",
    $type("unknown", (x) => true, 255)
  );
  $meow.deftype(
    "thunk",
    $type("thunk", (x) => x instanceof $Thunk, 0)
  );
  $meow.deftype(
    "weak-ref",
    $type("weak-ref", (x) => x instanceof WeakRef, 0)
  );
  $meow.deftype(
    "map",
    $type("map", (x) => x instanceof Map, 0)
  );
  $meow.deftype(
    "cell",
    $type("cell", (x) => x instanceof $Cell, 0)
  );
  for (let i = 0; i < 32; ++i) {
    $meow.deftype(
      `lambda-${i}`,
      $type(`lambda-${i}`, (x) => typeof x === "function" && x.length === i, 0)
    );
  }
  $meow.deftype(
    "grapheme-cluster",
    $type("grapheme-cluster", (x) => x instanceof $Graphemes, 0)
  );
  $meow.deftype(
    "record",
    $type("record", (x) => x instanceof $Record, 1)
  );
  const $unknown = $meow.type("unknown");

  // -- Primitives -------------------------------------------------------------
  const i32_add = (a: number, b: number) => ((a | 0) + (b | 0)) | 0;
  const i32_sub = (a: number, b: number) => ((a | 0) - (b | 0)) | 0;
  const i32_mul = (a: number, b: number) => ((a | 0) * (b | 0)) | 0;
  const i32_div = (a: number, b: number) => ((a | 0) / (b | 0)) | 0;
  const i32_pow = (a: number, b: number) => ((a | 0) ** (b | 0)) | 0;
  const i32_mod = (a: number, b: number) => (a | 0) % (b | 0) | 0;
  const i32_eq = (a: number, b: number) => (a | 0) === (b | 0);
  const i32_neq = (a: number, b: number) => (a | 0) !== (b | 0);
  const i32_lt = (a: number, b: number) => (a | 0) < (b | 0);
  const i32_lte = (a: number, b: number) => (a | 0) <= (b | 0);
  const i32_gt = (a: number, b: number) => (a | 0) > (b | 0);
  const i32_gte = (a: number, b: number) => (a | 0) >= (b | 0);
  const i32_bshl = (a: number, b: number) => (a | 0) << (b | 0);
  const i32_bashr = (a: number, b: number) => (a | 0) >> (b | 0);
  const i32_blshr = (a: number, b: number) => (a | 0) >>> (b | 0);
  const i32_band = (a: number, b: number) => (a | 0) & (b | 0);
  const i32_bor = (a: number, b: number) => a | 0 | (b | 0);
  const i32_bxor = (a: number, b: number) => (a | 0) ^ (b | 0);
  const i32_bnot = (a: number) => ~a;
  const i32_negate = (a: number) => -a;
  const i32_to_text = (a: number) => String(a);
  const i32_to_integer = (a: number) => BigInt(a);
  const i32_to_bool = (a: number) => Boolean(a);
  const i32_to_f64 = (a: number) => new $F64(a);

  const integer_add = (a: bigint, b: bigint) => a + b;
  const integer_sub = (a: bigint, b: bigint) => a - b;
  const integer_mul = (a: bigint, b: bigint) => a * b;
  const integer_div = (a: bigint, b: bigint) => a / b;
  const integer_pow = (a: bigint, b: bigint) => a ** b;
  const integer_mod = (a: bigint, b: bigint) => a % b;
  const integer_eq = (a: bigint, b: bigint) => a === b;
  const integer_neq = (a: bigint, b: bigint) => a !== b;
  const integer_gt = (a: bigint, b: bigint) => a > b;
  const integer_gte = (a: bigint, b: bigint) => a >= b;
  const integer_lt = (a: bigint, b: bigint) => a < b;
  const integer_lte = (a: bigint, b: bigint) => a <= b;
  const integer_bshl = (a: bigint, b: bigint) => a << b;
  const integer_bashr = (a: bigint, b: bigint) => a >> b;
  const integer_band = (a: bigint, b: bigint) => a & b;
  const integer_bor = (a: bigint, b: bigint) => a | b;
  const integer_bxor = (a: bigint, b: bigint) => a ^ b;
  const integer_bnot = (a: bigint) => ~a;
  const integer_negate = (a: bigint) => -a;
  const integer_to_text = (a: bigint) => String(a);
  const integer_to_i32 = (a: bigint) => Number(a) | 0;
  const integer_to_f64 = (a: bigint) => Number(a);
  const integer_to_bool = (a: bigint) => Boolean(a);

  const f64_add = (a: $F64, b: $F64) => new $F64(a.value + b.value);
  const f64_sub = (a: $F64, b: $F64) => new $F64(a.value - b.value);
  const f64_mul = (a: $F64, b: $F64) => new $F64(a.value * b.value);
  const f64_div = (a: $F64, b: $F64) => new $F64(a.value / b.value);
  const f64_idiv = (a: $F64, b: $F64) => new $F64(Math.floor(a.value / b.value));
  const f64_pow = (a: $F64, b: $F64) => new $F64(a.value ** b.value);
  const f64_mod = (a: $F64, b: $F64) => new $F64(a.value % b.value);
  const f64_eq = (a: $F64, b: $F64) => a.value === b.value;
  const f64_neq = (a: $F64, b: $F64) => a.value !== b.value;
  const f64_gt = (a: $F64, b: $F64) => a.value > b.value;
  const f64_gte = (a: $F64, b: $F64) => a.value >= b.value;
  const f64_lt = (a: $F64, b: $F64) => a.value < b.value;
  const f64_lte = (a: $F64, b: $F64) => a.value <= b.value;
  const f64_truncate = (a: $F64) => new $F64(Math.trunc(a.value));
  const f64_floor = (a: $F64) => new $F64(Math.floor(a.value));
  const f64_ceiling = (a: $F64) => new $F64(Math.ceil(a.value));
  const f64_round = (a: $F64) => new $F64(Math.round(a.value));
  const f64_is_nan = (a: $F64) => Number.isNaN(a.value);
  const f64_is_finite = (a: $F64) => Number.isFinite(a.value);
  const f64_nan = () => new $F64(NaN);
  const f64_positive_inf = () => new $F64(Number.POSITIVE_INFINITY);
  const f64_negative_inf = () => new $F64(Number.NEGATIVE_INFINITY);
  const f64_negate = (a: $F64) => new $F64(-a.value);
  const f64_to_text = (a: $F64) => String(a.value);
  const f64_to_i32 = (a: $F64) => a.value | 0;
  const f64_to_integer = (a: $F64) => BigInt(Math.floor(a.value));
  const f64_to_bool = (a: $F64) => Boolean(a.value);
  const f64_parse = (a: string) => {
    const x = Number(a.replace(/_/g, ""));
    return Number.isNaN(x) ? null : new $F64(x);
  };

  const bool_and = (a: boolean, b: boolean) => a && b;
  const bool_or = (a: boolean, b: boolean) => a || b;
  const bool_not = (a: boolean) => !a;
  const bool_eq = (a: boolean, b: boolean) => a === b;
  const bool_neq = (a: boolean, b: boolean) => a !== b;

  const panic_raise = (tag: string, msg: string, data: unknown) => {
    throw new $Panic(tag, msg, data);
  };

  const cell_new = (a: $Value) => new $Cell(a);
  const cell_deref = (a: $Cell) => a.deref();
  const cell_exchange = (a: $Cell, b: $Value) => a.exchange(b);
  const cell_cas = (a: $Cell, v: $Value, o: $Value) => a.cas(v, o);

  const weak_ref_new = (a: $Ref) => new WeakRef(a);
  const weak_ref_deref = (a: WeakRef<$Ref>) => a.deref() ?? null;

  const text_count_code_units = (a: string) => a.length;
  const text_repeat = (a: string, n: number) => a.repeat(n);
  const text_concat = (a: string, b: string) => a + b;
  const text_slice = (a: string, from: number, to: number) => a.slice(from, to);
  const text_slice_from = (a: string, from: number) => a.slice(from);
  const text_ends_with = (a: string, b: string) => a.endsWith(b);
  const text_starts_with = (a: string, b: string) => a.startsWith(b);
  const text_contains = (a: string, b: string) => a.includes(b);
  const text_trim_start = (a: string) => a.trimStart();
  const text_trim_end = (a: string) => a.trimEnd();
  const text_trim = (a: string) => a.trim();
  const text_utf8_bytes = (a: string) => new TextEncoder().encode(a);
  const text_utf16_code_points = (a: string) => [...a].map((x) => x.codePointAt(0));
  const text_graphemes = Intl?.Segmenter
    ? (x: string) => [...new Intl.Segmenter().segment(x)].map((x) => new $Graphemes(x.segment))
    : (x: string) => [...x].map((x) => new $Graphemes(x));
  const text_from_utf8_bytes = (x: Uint8Array) => {
    try {
      return new TextDecoder().decode(x);
    } catch (_) {
      return null;
    }
  };
  const text_from_code_points = (a: number[]) => {
    try {
      return String.fromCodePoint(...a);
    } catch (_) {
      return null;
    }
  };
  const text_lines = (a: string) => a.split(/\r\n|\r|\n/);

  const binary_count = (x: Uint8Array) => x.length;
  const binary_at = (x: Uint8Array, i: number) => x[i];
  const binary_eq = (x: Uint8Array, y: Uint8Array) => {
    if (x.length !== y.length) {
      return false;
    }
    for (let i = 0; i < x.length; ++i) {
      if (x[i] !== y[i]) {
        return false;
      }
    }
    return true;
  };
  const binary_slice_eq = (
    x: Uint8Array,
    xo: number,
    xl: number,
    y: Uint8Array,
    yo: number,
    yl: number
  ) => {
    if (xl !== yl) {
      return false;
    }
    for (let i = 0; i < xl; ++i) {
      if (x[xo + i] !== y[yo + i]) {
        return false;
      }
    }
    return true;
  };
  const binary_materialise_slice = (x: Uint8Array, offset: number, length: number) => {
    return x.slice(offset, offset + length);
  };
  const binary_allocate = (size: number, value: number) => {
    if (value === 0) {
      return new Uint8Array(size);
    } else {
      const v = new Uint8Array(size);
      v.fill(value);
      return v;
    }
  };
  const binary_from_array = (x: number[]) => {
    return new Uint8Array(x);
  };
  const binary_clone = (x: Uint8Array) => {
    return new Uint8Array(x);
  };
  const binary_fill = (x: Uint8Array, v: number, from: number, to: number) => {
    x.fill(v, from, to);
    return x;
  };
  const binary_fill_all = (x: Uint8Array, v: number) => {
    x.fill(v);
    return x;
  };
  const binary_put_all = (x: Uint8Array, i: number, y: Uint8Array) => {
    x.set(y, i);
    return x;
  };
  const binary_put_slice = (x: Uint8Array, i: number, y: Uint8Array, yo: number, yl: number) => {
    x.set(y.subarray(yo, yl), i);
    return x;
  };
  const binary_concat = (xs: Uint8Array[]) => {
    const size = xs.reduce((a, b) => b.length + a, 0);
    const r = new Uint8Array(size);
    let offset = 0;
    for (const x of xs) {
      r.set(x, offset);
      offset += x.length;
    }
    return r;
  };
  const binary_to_array = (x: Uint8Array) => Array.from(x);

  const array_count = (x: $Value[]) => x.length;
  const array_at = (x: $Value[], i: number) => x[i];
  const array_map = (x: $Value[], fn: MeowFn) => x.map((x) => $meow.wait_sync(fn(x)));
  const array_filter = (x: $Value[], fn: MeowFn) => x.filter((x) => $meow.wait_sync(fn(x)));
  const aray_some = (x: $Value[], fn: MeowFn) => x.some((x) => $meow.wait_sync(fn(x)));
  const array_all = (x: $Value[], fn: MeowFn) => x.every((x) => $meow.wait_sync(fn(x)));
  const array_fold_left = (x: $Value[], init: $Value, fn: MeowFn) =>
    x.reduce((p, x) => $meow.wait_sync(fn(p, x)) as any, init);
  const array_fold_right = (x: $Value[], init: $Value, fn: MeowFn) =>
    x.reduceRight((p, x) => $meow.wait_sync(fn(x, p)) as any, init);
  const array_flat_map = (x: $Value[], fn: MeowFn) => x.flatMap((x) => $meow.wait_sync(fn(x)));
  const array_slice = (x: $Value[], start: number, end: number) => x.slice(start, end);
  const array_slice_from = (x: $Value[], start: number) => x.slice(start);
  const array_slice_to = (x: $Value[], end: number) => x.slice(end);
  const array_concat = (x: $Value[], y: $Value[]) => x.concat(y);
  const array_remove_at = (x: $Value[], i: number) => {
    const r = x.slice();
    r.splice(i, 1);
    return r;
  };
  const array_insert_before = (x: $Value[], i: number, v: $Value) => {
    const r = x.slice();
    r.splice(i, 0, v);
    return r;
  };
  const array_insert_after = (x: $Value[], i: number, v: $Value) => {
    const r = x.slice();
    r.splice(i + 1, 0, v);
    return r;
  };
  const array_at_put = (x: $Value[], i: number, v: $Value) => {
    const r = x.slice();
    r[i] = v;
    return r;
  };
  const array_reverse = (x: $Value[]) => x.toReversed();
  const array_sort_by = (x: $Value[], fn: (a: $Value, b: $Value) => number) => x.toSorted(fn);
  const array_zip_with = (x: $Value[], y: $Value[], fn: MeowFn) =>
    x.map((a, i) => $meow.wait_sync(fn(a, y[i])));

  const transcript_log = (x: $Value) => console.log(x);

  // Utils
  function $pprint(value: any, depth = 0, visited = new Set<unknown>()): string {
    if (visited.has(value)) {
      return "(circular)";
    }
    if (value === null) {
      return "nothing";
    } else if (typeof value === "string") {
      return JSON.stringify(value);
    } else if (typeof value === "number") {
      return `${value}n`;
    } else if (typeof value === "bigint") {
      return `${value}`;
    } else if (typeof value === "boolean") {
      return `${value}`;
    } else if (Array.isArray(value)) {
      visited.add(value);
      const xs = value.map((x) => $pprint(x, depth + 1, visited));
      return `[${xs.join(", ")}]`;
    } else if (value instanceof Map) {
      visited.add(value);
      const xs: string[] = [];
      for (const [k, v] of value.entries()) {
        xs.push(`${$pprint(k, depth + 1, visited)}: ${$pprint(v, depth + 1, visited)}`);
      }
      return xs.length === 0 ? "[:]" : `[${xs.join(", ")}]`;
    } else if (value instanceof Uint8Array) {
      const repr = Array.from(value.subarray(0, 16))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join(", ");
      if (value.length > 15) {
        return `<<${repr}... (${value.length} bytes)>>`;
      } else {
        return `<<${repr}>>`;
      }
    } else if (typeof value === "function") {
      return `<lambda-${value.length}>`;
    } else if (value instanceof WeakRef) {
      return `<weak-ref>`;
    } else if (value instanceof $Struct) {
      const xs: string[] = [];
      for (const f of value.$fields) {
        xs.push(`${f}: ${$pprint((value as any)[f], depth + 1, visited)}`);
      }
      return `${value.$name}(${xs.join(", ")})`;
    } else if (value instanceof $Variant) {
      const xs: string[] = [];
      for (const f of value.$fields) {
        xs.push(`${f}: ${$pprint((value as any)[f], depth + 1, visited)}`);
      }
      return `${value.$name}..${value.$variant}(${xs.join(", ")})`;
    } else if (value instanceof $Static) {
      return String(value);
    } else if (value instanceof $Thunk) {
      visited.add(value);
      if (value._forced) {
        return `<thunk: ${$pprint(value._value, depth + 1, visited)}>`;
      } else {
        return `<thunk: (unevaluated)>`;
      }
    } else if (value instanceof $Cell) {
      visited.add(value);
      return `<cell: ${$pprint(value._value, depth + 1, visited)}>`;
    } else if (value instanceof $F64) {
      return `${value.value}f`;
    } else if (value instanceof $Record) {
      visited.add(value);
      const xs: string[] = [];
      for (const [k, v] of Object.entries(value.$dict)) {
        xs.push(`${k}: ${$pprint(v, depth + 1, visited)}`);
      }
      return `#(${xs.join(", ")})`;
    } else if (value instanceof $Graphemes) {
      return `grapheme-cluster(${JSON.stringify(value.cluster)})`;
    }

    return String(`<native: ${value}>`);
  }

  const $deep_eq: (l: $Value, r: $Value) => boolean = (l: $Value, r: $Value) => {
    if (Array.isArray(l) && Array.isArray(r)) {
      return l.length === r.length && l.every((x, i) => $deep_eq(x, r[i]));
    } else if (l instanceof Map && r instanceof Map) {
      if (l.size !== r.size) return false;
      for (const [k, v] of l.entries()) {
        if (!r.has(k)) return false;
        const e = r.get(k)!;
        if (!$deep_eq(v, e)) return false;
      }
      return true;
    } else if (l instanceof $Record && r instanceof $Record) {
      const ld = l.$dict;
      const rd = r.$dict;
      const kd = Object.keys(ld);
      const kr = Object.keys(rd);
      if (kd.length !== kr.length) {
        return false;
      }
      for (const k of kd) {
        if (!$deep_eq(ld[k], rd[k])) {
          return false;
        }
      }
      return true;
    } else if (l instanceof $Static && r instanceof $Static) {
      return l.name === r.name;
    } else if (l instanceof $F64 && r instanceof $F64) {
      return l.value === r.value;
    } else if (l instanceof Uint8Array && r instanceof Uint8Array) {
      if (l.length !== r.length) {
        return false;
      }
      for (let i = 0; i < l.length; ++i) {
        if (l[i] !== r[i]) {
          return false;
        }
      }
      return true;
    } else {
      return l === r;
    }
  };

  $meow.defun("==>()/2", [$unknown, $unknown], function* (a, b) {
    if (!$deep_eq(a, b)) {
      throw new $UnifyFailed(b, a);
    } else {
      return true;
    }
  });
  //@@@END_PRELUDE@@@
}

export function prelude_code() {
  const code = prelude.toString();
  const re = /@@@START_PRELUDE@@@([\s\S]*)@@@END_PRELUDE@@@/;
  const [_, text] = code.match(re)!;
  return text;
}
