type MeowGen = Generator<$Signal, $Value, $Value>;
type MeowFn = (...args: $Value[]) => MeowGen;
type MeowFn0 = () => MeowGen;

class $F64 {
  constructor(readonly value: number) {}
}
class $I32 {
  constructor(readonly value: number) {}
}
class $Fn {
  constructor(
    readonly name: string,
    readonly types: $Type[],
    readonly code: MeowFn,
    readonly pure: boolean
  ) {}
}
class $Record {
  get $type() {
    return $type("record", (x) => x instanceof $Record, 1);
  }
  constructor(readonly $dict: { [key: string]: $Value }) {
    for (const [k, v] of Object.entries($dict)) {
      (this as any)[k] = v;
    }
  }
}

class $Asset {
  get $type() {
    return $type("package-asset", (x) => x instanceof $Asset, 0);
  }
  constructor(readonly name: string, readonly data: Uint8Array) {}
  as_text() {
    return new TextDecoder().decode(this.data);
  }
  as_bytes() {
    return this.data;
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
  | $I32
  | $Record
  | $Foreign<unknown>;
type $Value = $Prim | $Ref | WeakRef<$Ref>;

class $Static {
  get $type() {
    return $meow.stype(this.name);
  }
  constructor(readonly name: string) {}
  toString() {
    return `#${this.$type.name}`;
  }
}

class $Effect {
  constructor(
    readonly name: string,
    readonly types: $Type[],
    readonly non_local: boolean,
    readonly loc: string
  ) {}
}

class $Handler {
  constructor(readonly name: string, readonly types: $Type[], readonly fn: MeowFn) {}
}

class $Thunk {
  get type() {
    return $meow.type("thunk");
  }
  _forced = false;
  _value: $Value = null;
  constructor(readonly fn: MeowFn0) {}

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

class $Foreign<T> {
  constructor(readonly $type: $ForeignType<T>, private value: T) {
    $type.check(value);
  }

  deref(): T {
    this.$type.check(this.value);
    return this.value;
  }

  replace(value: T) {
    this.$type.check(value);
    this.value = value;
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
  private _implementations = new Set<string>();
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
  constructor(readonly tname: string, private _placeholder: boolean) {}
  has(v: $Value) {
    return this._implementations.has($meow.typeof(v).name);
  }
  implement(t: $Type) {
    if (this._implementations.has(t.name)) {
      throw new $Panic(
        "duplicate-trait",
        `Duplicate trait ${this.tname} implementation for ${t.name}`
      );
    }
    this._implementations.add(t.name);
    for (const child of t.subtypes) {
      this.implement(child);
    }
  }

  get is_placeholder() {
    return this._placeholder;
  }

  materialise() {
    this._placeholder = false;
  }
}

abstract class $Type {
  abstract name: string;
  abstract distance: number;
  abstract is(value: $Value): boolean;
  abstract placeholder: boolean;
  abstract $static: $StaticType;
  subtypes: $Type[] = [];
}
function $type(
  name: string,
  check: (_: $Value) => boolean,
  distance: number,
  subtypes: $Type[] = []
) {
  return new (class extends $Type {
    readonly placeholder = false;
    readonly name = name;
    readonly distance = distance;
    readonly subtypes = subtypes;
    readonly $static = new $StaticType(name);
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
    readonly subtypes = [];
    readonly $static = new $StaticType(name);
    is(value: $Value) {
      return false;
    }
  })();
}
class $ForeignType<T> extends $Type {
  placeholder = false;
  distance = 0;
  subtypes = [];
  $static = new $StaticType(`<foreign ${this._name}>`);
  get name() {
    return `<foreign ${this._name}>`;
  }

  constructor(readonly _name: string, readonly test: (_: unknown) => boolean) {
    super();
  }

  is(value: any) {
    return value instanceof $Foreign && this.test(value.deref());
  }

  check(value: any): T {
    if (!this.test(value)) {
      throw new $Panic("invalid-type", `Expected ${this.name}`);
    }
    return value;
  }

  box(value: any): $Foreign<T> {
    return new $Foreign<T>(this, this.check(value));
  }

  unbox(value: $Foreign<T>): T {
    if (value instanceof $Foreign && value.$type === this) {
      return value.deref();
    } else {
      throw new Error(`Expected ${this.name} (${$pprint(value)})`);
    }
  }
}

class $StaticType extends $Type {
  get name() {
    return `#${this.sname}`;
  }
  placeholder = false;
  distance = 0;
  get $static() {
    return this;
  }
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
  abstract $clone(dict: any): this;
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
  abstract $clone(dict: any): this;
}

class $Test {
  constructor(readonly name: string, readonly fn: MeowFn) {}
}

function $meow_error_arising(x: any) {
  if (x == null) {
    return "";
  } else if ("$meow_message" in x) {
    return `== Arising from:\n${x.$meow_message}`;
  } else {
    return `== Arising from:\n${x.stack ?? x}`;
  }
}

function $meow_format_error(x: any) {
  if (x == null) {
    return "";
  } else if (Object(x) === x && "$meow_message" in x) {
    return String(x.$meow_message) + $native_trace(x);
  } else {
    return String(x.stack ?? x);
  }
}

function $meow_wrap_error(x: any) {
  if (x == null) {
    throw new $Panic("panic", `Unknown error`, { error: x });
  } else if (Object(x) === x && "$meow_message" in x) {
    return x;
  } else {
    return new $Panic(
      "native-error",
      `Meow panicked with an error from host.\n\n${x?.stack ?? x}`,
      { error: x }
    );
  }
}

function $native_trace(x: any) {
  if (process.env.MEOW_VERBOSE && x?.stack) {
    return `\n\n== Native stack:\n${x.stack}`;
  } else {
    return "";
  }
}

class $AssertionFailed extends Error {
  readonly loc: string;
  readonly $meow_stack: string;
  constructor(readonly tag: string, readonly expr: string, readonly source: any) {
    const stack = $stack.format();
    super(`Assertion failed: ${tag}\n\n${expr}`);
    this.loc = $stack.current();
    this.$meow_stack = stack;
  }

  get $meow_message() {
    return [
      `assertion failed at ${this.loc} -- ${this.tag}:\n`,
      `${this.expr}\n`,
      `== Stack:\n${this.$meow_stack}\n\n`,
      `${$meow_error_arising(this.source)}`,
    ].join("\n");
  }
}

class $UnifyFailed extends Error {
  readonly loc: string;
  readonly $meow_stack: string;
  constructor(readonly expected: unknown, readonly actual: unknown) {
    const stack = $stack.format();
    super(`Unification failed. Expected ${$pprint(expected)}, got ${$pprint(actual)}`);
    this.loc = $stack.current();
    this.$meow_stack = stack;
  }

  get $meow_message() {
    return [
      `Unification failed at ${this.loc}\n`,
      `Expected: ${$pprint(this.expected)}`,
      `Actual: ${$pprint(this.actual)}\n`,
      `== Stack:\n${this.$meow_stack}`,
    ].join("\n");
  }
}

class $Panic extends Error {
  readonly loc: string;
  readonly $meow_stack: string;
  constructor(readonly tag: string, readonly msg: string, readonly data: unknown = null) {
    const stack = $stack.format();
    super(`Panic(${tag}) (${$file}:${$line}): ${msg}`);
    this.loc = $stack.current();
    this.$meow_stack = stack;
  }

  get $meow_message() {
    return [
      `Panic at ${this.loc} [${this.tag}]\n`,
      this.msg + "\n",
      `== Stack:\n${this.$meow_stack}\n`,
      `== Associated data:\n${$pprint(this.data)}`,
    ].join("\n");
  }
}

const $fns = new Map<string, $Fn[]>();
const $types = new Map<string, $Type>();
const $structs = new Map<string, StaticStruct | StaticUnion>();
const $globals = new Map<string, $Value>();
const $traits = new Map<string, $Trait>();
const $foreign = new Map<string, MeowFn>();
const $effects = new Map<string, $Effect>();
const $handlers = new Map<string, $Handler>();
const $assets = new Map<string, $Asset>();
const $default_handlers: $Handler[] = [];
const $tests: $Test[] = [];
