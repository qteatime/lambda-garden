"use strict";
class $ShadowStack {
    constructor() {
        this.entries = new Array(2 ** 16).fill(null);
        this.length = 0;
    }
    push(entry) {
        if (this.length === this.entries.length) {
            this.gc();
        }
        this.entries[this.length] = entry;
        this.length += 1;
    }
    pop() {
        this.length = Math.max(this.length - 1, 0);
    }
    gc() {
        const len = this.entries.length;
        for (let i = 0; i < 10; ++i) {
            this.entries[i] = this.entries[len - 11 + i];
        }
        this.length = 10;
    }
    *all_entries() {
        for (let i = Math.max(0, this.length - 10); i < this.length; ++i) {
            const entry = this.entries[i];
            if (entry == null) {
                break;
            }
            yield entry;
        }
    }
    current() {
        if (this.length === 0) {
            return `(root)`;
        }
        else {
            return this.entries[this.length - 1];
        }
    }
    format() {
        const result = [];
        for (const name of this.all_entries()) {
            result.push(`  At ${name}`);
        }
        return result.join("\n");
    }
}
const $stack = new $ShadowStack();
let $file = null;
let $line = null;
const $t = (data) => $stack.push(data);
//# sourceMappingURL=00-trace.js.map
void 0;
"use strict";
class $Signal {
}
class $PanicSignal extends $Signal {
    constructor(error) {
        super();
        this.error = error;
    }
}
class $AwaitSignal extends $Signal {
    constructor(value) {
        super();
        this.value = value;
    }
}
class $AbortSignal extends $Signal {
    constructor(value) {
        super();
        this.value = value;
    }
}
class $ResumeSignal extends $Signal {
    constructor(value) {
        super();
        this.value = value;
    }
}
class $PerformSignal extends $Signal {
    constructor(name, args) {
        super();
        this.name = name;
        this.args = args;
    }
}
class $HandleSignal extends $Signal {
    constructor(gen, cases) {
        super();
        this.gen = gen;
        this.cases = cases;
    }
}
class $InstallHandlerCasesSignal extends $Signal {
    constructor(cases) {
        super();
        this.cases = cases;
    }
}
class $YieldProcessSignal extends $Signal {
}
class $HandleStack {
    constructor(parent, gen, cases, abort_to) {
        this.parent = parent;
        this.gen = gen;
        this.cases = cases;
        this.abort_to = abort_to;
    }
    find_handler(name) {
        if (Object.hasOwn(this.cases, name)) {
            return { stack: this, handler: this.cases[name] };
        }
        else if (this.parent != null) {
            return this.parent.find_handler(name);
        }
        else {
            throw new $Panic("no-handler", `No handler defined for ${name}`);
        }
    }
    collect_handlers() {
        const base = this.parent ? this.parent.cases : {};
        return { ...base, ...this.cases };
    }
}
//# sourceMappingURL=01-signal.js.map
void 0;
"use strict";
class $F64 {
    constructor(value) {
        this.value = value;
    }
}
class $I32 {
    constructor(value) {
        this.value = value;
    }
}
class $Fn {
    constructor(name, types, code, pure) {
        this.name = name;
        this.types = types;
        this.code = code;
        this.pure = pure;
    }
}
class $Record {
    get $type() {
        return $type("record", (x) => x instanceof $Record, 1);
    }
    constructor($dict) {
        this.$dict = $dict;
        for (const [k, v] of Object.entries($dict)) {
            this[k] = v;
        }
    }
}
class $Asset {
    get $type() {
        return $type("package-asset", (x) => x instanceof $Asset, 0);
    }
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
    as_text() {
        return new TextDecoder().decode(this.data);
    }
    as_bytes() {
        return this.data;
    }
}
class $Static {
    get $type() {
        return $meow.stype(this.name);
    }
    constructor(name) {
        this.name = name;
    }
    toString() {
        return `#${this.$type.name}`;
    }
}
class $Effect {
    constructor(name, types, non_local, loc) {
        this.name = name;
        this.types = types;
        this.non_local = non_local;
        this.loc = loc;
    }
}
class $Handler {
    constructor(name, types, fn) {
        this.name = name;
        this.types = types;
        this.fn = fn;
    }
}
class $Thunk {
    get type() {
        return $meow.type("thunk");
    }
    constructor(fn) {
        this.fn = fn;
        this._forced = false;
        this._value = null;
    }
    *force() {
        if (this._forced) {
            return this._value;
        }
        else {
            const value = yield* this.fn();
            this._forced = true;
            this._value = value;
            return value;
        }
    }
}
class $Foreign {
    constructor($type, value) {
        this.$type = $type;
        this.value = value;
        $type.check(value);
    }
    deref() {
        this.$type.check(this.value);
        return this.value;
    }
    replace(value) {
        this.$type.check(value);
        this.value = value;
    }
}
class $Cell {
    get $type() {
        return $meow.type("cell");
    }
    constructor(_value) {
        this._value = _value;
    }
    exchange(value) {
        const old = this._value;
        this._value = value;
        return old;
    }
    cas(value, old) {
        if ($meow.eq(this._value, old)) {
            this._value = value;
            return true;
        }
        else {
            return false;
        }
    }
    deref() {
        return this._value;
    }
}
class $Trait {
    get type() {
        return $type(this.tname, (x) => {
            const t = $meow.typeof(x);
            return this._implementations.has(t.name);
        }, 2);
    }
    constructor(tname, _placeholder) {
        this.tname = tname;
        this._placeholder = _placeholder;
        this._implementations = new Set();
    }
    has(v) {
        return this._implementations.has($meow.typeof(v).name);
    }
    implement(t) {
        if (this._implementations.has(t.name)) {
            throw new $Panic("duplicate-trait", `Duplicate trait ${this.tname} implementation for ${t.name}`);
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
class $Type {
    constructor() {
        this.subtypes = [];
    }
}
function $type(name, check, distance, subtypes = []) {
    return new (class extends $Type {
        constructor() {
            super(...arguments);
            this.placeholder = false;
            this.name = name;
            this.distance = distance;
            this.subtypes = subtypes;
            this.$static = new $StaticType(name);
        }
        is(value) {
            return check(value);
        }
    })();
}
function $placeholder_type(name) {
    return new (class extends $Type {
        constructor() {
            super(...arguments);
            this.placeholder = true;
            this.name = name;
            this.distance = 0;
            this.subtypes = [];
            this.$static = new $StaticType(name);
        }
        is(value) {
            return false;
        }
    })();
}
class $ForeignType extends $Type {
    get name() {
        return `<foreign ${this._name}>`;
    }
    constructor(_name, test) {
        super();
        this._name = _name;
        this.test = test;
        this.placeholder = false;
        this.distance = 0;
        this.subtypes = [];
        this.$static = new $StaticType(`<foreign ${this._name}>`);
    }
    is(value) {
        return value instanceof $Foreign && this.test(value.deref());
    }
    check(value) {
        if (!this.test(value)) {
            throw new $Panic("invalid-type", `Expected ${this.name}`);
        }
        return value;
    }
    box(value) {
        return new $Foreign(this, this.check(value));
    }
    unbox(value) {
        if (value instanceof $Foreign && value.$type === this) {
            return value.deref();
        }
        else {
            throw new Error(`Expected ${this.name} (${$pprint(value)})`);
        }
    }
}
class $StaticType extends $Type {
    get name() {
        return `#${this.sname}`;
    }
    get $static() {
        return this;
    }
    constructor(sname) {
        super();
        this.sname = sname;
        this.placeholder = false;
        this.distance = 0;
    }
    is(value) {
        return value instanceof $Static && value.name === this.sname;
    }
}
class $Struct {
}
class $Variant {
}
class $Test {
    constructor(name, fn) {
        this.name = name;
        this.fn = fn;
    }
}
function $meow_error_arising(x) {
    if (x == null) {
        return "";
    }
    else if ("$meow_message" in x) {
        return `== Arising from:\n${x.$meow_message}`;
    }
    else {
        return `== Arising from:\n${x.stack ?? x}`;
    }
}
function $meow_format_error(x) {
    if (x == null) {
        return "";
    }
    else if (Object(x) === x && "$meow_message" in x) {
        return String(x.$meow_message) + $native_trace(x);
    }
    else {
        return String(x.stack ?? x);
    }
}
function $meow_wrap_error(x) {
    if (x == null) {
        throw new $Panic("panic", `Unknown error`, { error: x });
    }
    else if (Object(x) === x && "$meow_message" in x) {
        return x;
    }
    else {
        return new $Panic("native-error", `Meow panicked with an error from host.\n\n${x?.stack ?? x}`, { error: x });
    }
}
function $native_trace(x) {
    if (process.env.MEOW_VERBOSE && x?.stack) {
        return `\n\n== Native stack:\n${x.stack}`;
    }
    else {
        return "";
    }
}
class $AssertionFailed extends Error {
    constructor(tag, expr, source) {
        const stack = $stack.format();
        super(`Assertion failed: ${tag}\n\n${expr}`);
        this.tag = tag;
        this.expr = expr;
        this.source = source;
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
    constructor(expected, actual) {
        const stack = $stack.format();
        super(`Unification failed. Expected ${$pprint(expected)}, got ${$pprint(actual)}`);
        this.expected = expected;
        this.actual = actual;
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
    constructor(tag, msg, data = null) {
        const stack = $stack.format();
        super(`Panic(${tag}) (${$file}:${$line}): ${msg}`);
        this.tag = tag;
        this.msg = msg;
        this.data = data;
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
const $fns = new Map();
const $types = new Map();
const $structs = new Map();
const $globals = new Map();
const $traits = new Map();
const $foreign = new Map();
const $effects = new Map();
const $handlers = new Map();
const $assets = new Map();
const $default_handlers = [];
const $tests = [];
//# sourceMappingURL=02-universe.js.map
void 0;
"use strict";
class $Scope {
    constructor(parent, pkg, ns, pkg_prefixes) {
        this.parent = parent;
        this.pkg = pkg;
        this.ns = ns;
        this.pkg_prefixes = pkg_prefixes;
        this.pkg_aliases = new Map();
        this.ns_aliases = new Map();
        this.ns_prefixes = [];
    }
    get prefix() {
        const pkg_prefix = this.pkg == null ? "" : `${this.pkg}`;
        const ns_prefix = this.ns == null ? "" : `${this.ns}`;
        return `(pkg: ${pkg_prefix}, ns: ${ns_prefix})`;
    }
    wrap(name) {
        const pkg_prefix = this.pkg == null ? "" : `${this.pkg}/`;
        const ns_prefix = this.ns == null ? "" : `${this.ns}.`;
        return `${pkg_prefix}${ns_prefix}${name}`;
    }
    wrap_pkg(name) {
        return this.pkg == null ? name : `${this.pkg}/${name}`;
    }
    resolve_ns(ns) {
        const names = ns.split(".");
        if (names.length === 1) {
            return [ns, false];
        }
        else {
            const [alias, ...rest] = names;
            const expanded = this.ns_aliases.get(alias);
            if (expanded == null) {
                return [ns, false];
            }
            else {
                return [[expanded, ...rest].join("."), true];
            }
        }
    }
    resolve(name0, box) {
        if (name0.includes("/")) {
            if (this.pkg_aliases.size === 0) {
                return name0;
            }
            else {
                const [pkg0, ns] = name0.split("/");
                const pkg = this.pkg_aliases.get(pkg0) ?? pkg0;
                return `${pkg}/${ns}`;
            }
        }
        const [name, aliased] = this.resolve_ns(name0);
        for (const p of this.pkg_prefixes) {
            const n = `${p}/${name}`;
            if (!aliased && this.ns != null && box.has(`${p}/${this.ns}.${name}`)) {
                return `${p}/${this.ns}.${name}`;
            }
            if (box.has(n)) {
                return n;
            }
        }
        if (!aliased && this.ns != null && box.has(`${this.ns}.${name}`)) {
            return `${this.ns}.${name}`;
        }
        if (this.parent != null) {
            return this.parent.resolve(name, box);
        }
        else {
            return name;
        }
    }
    in_namespace(ns, fn) {
        const scope = new $Scope(this, this.pkg, this.ns == null ? ns : `${this.ns}.${ns}`, []);
        fn(scope);
    }
    open_namespace(ns, alias) {
        if (this.ns_aliases.has(alias)) {
            throw new $Panic("duplicate-ref", `Duplicate alias ${alias} already refers to ${this.ns_aliases.get(ns)}`);
        }
        this.ns_aliases.set(alias, ns);
    }
    open_pkg(name, alias) {
        if (alias == null) {
            if (this.pkg_prefixes.includes(name) && name !== "meow.core") {
                throw new $Panic("invalid-state", `Package ${name} is already open`);
            }
            this.pkg_prefixes.push(name);
        }
        else {
            if (this.pkg_aliases.has(alias)) {
                throw new $Panic("duplicate-ref", `Duplicate alias ${alias} already refer to ${this.pkg_aliases.get(name)}`);
            }
            this.pkg_aliases.set(alias, name);
        }
    }
    toString() {
        return `scope(${this.prefix})[${this.pkg_prefixes.join(", ")}]`;
    }
    global(name) {
        return $meow.global(this.resolve(name, $globals));
    }
    trait(name) {
        return $meow.trait(this.resolve(name, $traits));
    }
    rtrait(name) {
        return this.resolve(name, $traits);
    }
    type(name) {
        return $meow.type(this.resolve(name, $types));
    }
    stype(name) {
        return $meow.stype(this.resolve(name, $types));
    }
    vtype(name, variant) {
        return $meow.vtype(this.resolve(name, $types), variant);
    }
    make(name, value) {
        return $meow.make(this.resolve(name, $structs), value);
    }
    make_pos(name, value) {
        return $meow.make_pos(this.resolve(name, $structs), value);
    }
    smake(name) {
        return $meow.smake(this.resolve(name, $types));
    }
    make_variant(name, variant, value) {
        return $meow.make_variant(this.resolve(name, $structs), variant, value);
    }
    make_variant_pos(name, variant, value) {
        return $meow.make_variant_pos(this.resolve(name, $structs), variant, value);
    }
    get_variant(name, variant) {
        return $meow.get_variant(this.resolve(name, $structs), variant);
    }
    is(value, type) {
        return $meow.is(value, this.resolve(type, $types));
    }
    is_variant(value, type, variant) {
        return $meow.is_variant(value, this.resolve(type, $types), variant);
    }
    has_trait(value, trait) {
        return $meow.has_trait(value, this.resolve(trait, $traits));
    }
    effect(name) {
        return this.resolve(name, $effects);
    }
    handler(name) {
        return this.resolve(name, $handlers);
    }
}
let $scope = new $Scope(null, null, null, ["meow.core"]);
//# sourceMappingURL=03-scope.js.map
void 0;
"use strict";
const Path = require("path");
const Show = require("util").inspect;
const $meow = new (class Meow {
    pprint(x) {
        return $pprint(x);
    }
    info(x, opts) {
        Object.defineProperty(x, "name", { value: `${opts.name} in ${opts.file}:${opts.line}` });
        return x;
    }
    start_package(name) {
        const pkg = this.package_type_name(name);
        this.defsingleton(pkg);
        this.defsingleton(pkg + `-assets`);
        this.defun("name(self:)/1", [this.type(pkg)], (_) => name, true);
        this.defun("assets(self:)/1", [this.type(pkg)], (_) => this.global(pkg + "-assets"), true);
    }
    package_type_name(name) {
        return name == null ? `package` : `${name}/package`;
    }
    in_package(name, fn) {
        if (!$types.has(this.package_type_name(name))) {
            this.start_package(name);
        }
        const scope = new $Scope($scope, name, null, [name === "meow.core" ? null : name, "meow.core"].filter((x) => x != null));
        fn(scope);
    }
    declare_type(name) {
        this.deftype(name, $placeholder_type(name));
    }
    declare_trait(name) {
        this.deftrait(name, true);
    }
    defglobal(name, value) {
        if ($globals.has(name)) {
            throw new $Panic("duplicate-global", `Duplicate global ${name}`);
        }
        const v = $meow.wait_sync(value());
        $globals.set(name, v);
    }
    global(name) {
        if (!$globals.has(name)) {
            throw new $Panic("no-global", `Undefined global ${name} in ${$scope}`);
        }
        const value = $globals.get(name);
        return value;
    }
    foreign_path(dirname, path) {
        return Path.join(dirname, path);
    }
    defjs(scope, path, mod) {
        if (mod == null || typeof mod !== "object") {
            throw new $Panic("invalid-foreign", `Invalid foreign module exports: ${path} in ${scope.pkg}`);
        }
        for (const [k, v] of Object.entries(mod)) {
            if (typeof v !== "function") {
                continue;
            }
            const name = scope.wrap_pkg(k.replace(/__/g, ".").replace(/_/g, "-"));
            if ($foreign.has(name)) {
                throw new $Panic("duplicate-foreign", `Duplicate foreign function ${k}: ${path} in ${scope.pkg}`);
            }
            $foreign.set(name, v);
        }
    }
    *calljs(name, args) {
        const fn = $foreign.get(name);
        if (fn == null) {
            throw new $Panic("no-foreign", `Undefined foreign ${name} in ${$scope}`);
        }
        return yield* fn(...args);
    }
    calljs_pure(name, args) {
        const fn = $foreign.get(name);
        if (fn == null) {
            throw new $Panic("no-foreign", `Undefined foreign ${name} in ${$scope}`);
        }
        return fn(...args);
    }
    defun(name, types, fn, pure = false) {
        const fns = $fns.get(name) ?? [];
        fns.push(new $Fn(name, types, fn, pure));
        if (fns.some((x) => x.types.length !== types.length)) {
            console.log(fns.map((x) => `${x.name} :: ${x.types.map((x) => x.name).join(", ")}`));
            throw new $Panic("invalid-arity", `Invalid arity for ${name}: ${types.length} (expected ${fns[0].types.length})`);
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
    call_pure(name, ...args) {
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
        throw new $Panic("no-method", `No branch of ${name} matched (${args
            .map((x) => $meow.typeof(x).name)
            .join(", ")})\n\nDefined branches:\n${branches}`);
    }
    *call(name, ...args) {
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
                return fn.code(...args);
            }
            else {
                return yield* fn.code(...args);
            }
        }
        const branches = fns.map((x) => `  - (${x.types.map((t) => t.name).join(", ")})\n`).join("");
        throw new $Panic("no-method", `No branch of ${name} matched (${args
            .map((x) => $meow.typeof(x).name)
            .join(", ")})\n\nDefined branches:\n${branches}`);
    }
    deftype(name, type) {
        if ($types.has(name)) {
            const existing = $types.get(name);
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
    def_foreign_type(name, test) {
        if ($types.has(name)) {
            throw new $Panic("duplicate-type", `Duplicated type ${name}`);
        }
        const t = new $ForeignType(name, test);
        $types.set(name, t);
        return t;
    }
    with_trait(type, traits) {
        return $type(`(${type.name} has ${traits.map((x) => x.name).join(", ")})`, (x) => type.is(x) && traits.every((t) => t.is(x)), Math.min(type.distance, 254), []);
    }
    type(name) {
        const t = $types.get(name);
        if (t == null) {
            throw new $Panic("no-type", `Undefined type ${name} in ${$scope}`);
        }
        return t;
    }
    typeof(x) {
        if (x === null) {
            return $meow.type("nothing");
        }
        else if (typeof x === "string") {
            return $meow.type("text");
        }
        else if (typeof x === "number") {
            return $meow.type("int");
        }
        else if (typeof x === "bigint") {
            return $meow.type("i64");
        }
        else if (typeof x === "boolean") {
            return $meow.type("bool");
        }
        else if (x instanceof Map) {
            return $meow.type("map");
        }
        else if (Array.isArray(x)) {
            return $meow.type("array");
        }
        else if (x instanceof Uint8Array) {
            return $meow.type("byte-array");
        }
        else if (x instanceof WeakRef) {
            return $meow.type("weak-ref");
        }
        else if (x instanceof $Process) {
            return $meow.type("process");
        }
        else if (x instanceof $Struct ||
            x instanceof $Static ||
            x instanceof $Variant ||
            x instanceof $Cell ||
            x instanceof $Foreign ||
            x instanceof $Record ||
            x instanceof $Asset) {
            return x.$type;
        }
        else if (typeof x === "function") {
            return $meow.type(`lambda-${x.length}`);
        }
        else {
            throw new $Panic("weird-value", `Unknown type for ${Show(x)}`);
        }
    }
    deftrait(name, placeholder = false) {
        if ($traits.has(name)) {
            const trait = $traits.get(name);
            if (!trait.is_placeholder) {
                if (placeholder)
                    return;
                throw new $Panic("duplicate-trait", `Duplicate trait ${name}`);
            }
            if (!placeholder) {
                trait.materialise();
            }
        }
        else {
            $traits.set(name, new $Trait(name, placeholder));
        }
    }
    implement(name, type) {
        const trait = $traits.get(name);
        if (trait == null) {
            throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
        }
        trait.implement(type);
        trait.implement(type.$static);
    }
    trait(name) {
        const trait = $traits.get(name);
        if (trait == null) {
            throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
        }
        return trait.type;
    }
    has_trait(value, name) {
        const trait = $traits.get(name);
        if (trait == null) {
            throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
        }
        return trait.has(value);
    }
    vtype(name, variant) {
        return this.type(`${name}..${variant}`);
    }
    defsingleton(name) {
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
            $clone(dict) {
                throw new $Panic("invalid-clone", `Cannot clone a singleton`);
            }
        };
        Object.defineProperty(s, "name", { value: name });
        $structs.set(name, s);
        $globals.set(name, new s());
        this.deftype(name, $type(name, (x) => x instanceof s, 0));
    }
    defstruct(name, fields, types0) {
        var _a;
        if ($structs.has(name)) {
            throw new $Panic("duplicate-struct", `Duplicate struct ${name}`);
        }
        let types;
        const s = (_a = class Struct extends $Struct {
                get $type() {
                    return $meow.type(name);
                }
                get $name() {
                    return name;
                }
                get $fields() {
                    return fields;
                }
                constructor(value) {
                    super();
                    this.$dict = value;
                    for (let i = 0; i < fields.length; ++i) {
                        const field = fields[i];
                        const type = types[i];
                        if (!type.is(value[field])) {
                            throw new $Panic("invalid-type", `Invalid value (${$pprint(value[field])}) in '${name}.${field}'. Expected ${type.name}`);
                        }
                        this[field] = value[field];
                    }
                }
                toString() {
                    return $pprint(this);
                }
                static of(value) {
                    return new s(value);
                }
                static of_pos(values) {
                    if (fields.length !== values.length) {
                        throw new $Panic("invalid-arity", `Invalid arity for ${name}`);
                    }
                    return new s(Object.fromEntries(fields.map((x, i) => [x, values[i]])));
                }
                $clone(dict) {
                    return new s({ ...this.$dict, ...dict });
                }
            },
            _a.fields = fields,
            _a.types = types,
            _a);
        Object.defineProperty(s, "name", { value: name });
        $structs.set(name, s);
        this.deftype(name, $type(name, (x) => x instanceof s, 0));
        types = types0.map((x) => x());
    }
    defunion(name, variants) {
        var _a;
        if ($structs.has(name)) {
            throw new $Panic("duplicate-struct", `Duplicate struct ${name}`);
        }
        const constructors = Object.create(null);
        let singletons = Object.create(null);
        const allowed = new Set(variants.map((x) => x.name));
        const s = (_a = class Union extends $Variant {
                get $type() {
                    return $meow.type(`${name}..${this.$variant}`);
                }
                get $fields() {
                    return constructors[this.$variant]?.fields ?? [];
                }
                get $name() {
                    return name;
                }
                constructor($variant, value) {
                    super();
                    this.$variant = $variant;
                    this.$dict = value;
                    if (value != null) {
                        const v = constructors[$variant];
                        for (let i = 0; i < v.fields.length; ++i) {
                            const field = v.fields[i];
                            const type = v.types[i];
                            if (!type.is(value[field])) {
                                throw new $Panic("invalid-type", `Invalid value (${$pprint(value[field])}) in '${name}..${$variant}.${field}'. Expected ${type.name}`);
                            }
                            this[field] = value[field];
                        }
                    }
                }
                static make_variant(variant, value) {
                    if (!allowed.has(variant)) {
                        throw new $Panic("invalid-variant", `Invalid variant ${name}.${variant}`);
                    }
                    return new s(variant, value);
                }
                static make_variant_pos(variant, values) {
                    if (!allowed.has(variant)) {
                        throw new $Panic("invalid-variant", `Invalid variant ${name}.${variant}`);
                    }
                    const fields = constructors[variant].fields;
                    if (fields.length !== values.length) {
                        throw new $Panic("invalid-arity", `Invalid arity for ${name}.${variant}`);
                    }
                    return new s(variant, Object.fromEntries(fields.map((x, i) => [x, values[i]])));
                }
                static get_variant(name) {
                    const v = singletons[name];
                    if (v == null) {
                        throw new $Panic("invalid-variatnt", `Invalid singleton variant ${name}`);
                    }
                    return v;
                }
                $clone(dict) {
                    if (this.$dict == null) {
                        throw new $Panic("invalid-clone", `Cannot clone a nullary variant`);
                    }
                    else {
                        return new s(this.$variant, { ...this.$dict, ...dict });
                    }
                }
            },
            _a.variants = variants,
            _a.singletons = singletons,
            _a);
        Object.defineProperty(s, "name", { value: name });
        $structs.set(name, s);
        const variant_types = variants.map((v) => {
            const t = $type(`${name}..${v.name}`, (x) => x instanceof s && x.$variant === v.name, 0);
            this.deftype(`${name}..${v.name}`, t);
            return t;
        });
        this.deftype(name, $type(name, (x) => x instanceof s, 1, variant_types));
        for (const v of variants) {
            if (v.fields == null) {
                const i = new s(v.name, null);
                singletons[v.name] = i;
            }
            else {
                constructors[v.name] = {
                    name: v.name,
                    fields: v.fields,
                    types: v.types.map((x) => x()),
                };
            }
        }
    }
    make(name, value) {
        const struct = $structs.get(name);
        if (struct == null || !("of" in struct)) {
            throw new $Panic("invalid-struct", `Invalid struct ${name} in ${$scope}`);
        }
        return struct.of(value);
    }
    make_pos(name, values) {
        const struct = $structs.get(name);
        if (struct == null || !("of" in struct)) {
            throw new $Panic("invalid-struct", `Invalid struct ${name} in ${$scope}`);
        }
        return struct.of_pos(values);
    }
    make_variant(name, variant, value) {
        const struct = $structs.get(name);
        if (struct == null || !("make_variant" in struct)) {
            throw new $Panic("invalid-union", `Invalid union ${name} in ${$scope}`);
        }
        return struct.make_variant(variant, value);
    }
    make_variant_pos(name, variant, values) {
        const struct = $structs.get(name);
        if (struct == null || !("make_variant" in struct)) {
            throw new $Panic("invalid-union", `Invalid union ${name} in ${$scope}`);
        }
        return struct.make_variant_pos(variant, values);
    }
    get_variant(name, variant) {
        const struct = $structs.get(name);
        if (struct == null || !("make_variant" in struct)) {
            throw new $Panic("invalid-union", `Invalid union ${name} in ${$scope}`);
        }
        return struct.get_variant(variant);
    }
    *force(value) {
        if (value instanceof $Thunk) {
            return yield* value.force();
        }
        else {
            throw new $Panic("invalid-type", `Expected thunk.`);
        }
    }
    f64(x) {
        return new $F64(x);
    }
    i32(x) {
        return new $I32(x | 0);
    }
    smake(name) {
        return new $Static(name);
    }
    stype(name) {
        return new $StaticType(name);
    }
    is(v, t) {
        const type = $meow.type(t);
        return type.is(v);
    }
    is_variant(x, t, v) {
        const type = $meow.vtype(t, v);
        return type.is(x);
    }
    eq(l, r) {
        if (l instanceof $Static && r instanceof $Static) {
            return l.name === r.name;
        }
        else if (l instanceof $F64 && r instanceof $F64) {
            return l.value === r.value;
        }
        else {
            return l === r;
        }
    }
    record(xs) {
        return new $Record(xs);
    }
    extend(x, binds) {
        if (x instanceof $Record) {
            return new $Record({ ...x.$dict, ...binds });
        }
        else if (x instanceof $Struct || x instanceof $Variant) {
            return x.$clone(binds);
        }
        else {
            throw new $Panic("invalid-clone", `Non-extensible value ${$meow.pprint(x)}`);
        }
    }
    assert_fail(tag, expr, source = null) {
        if (!(source instanceof $AssertionFailed)) {
            throw new $AssertionFailed(tag ?? "", expr, source);
        }
        else {
            throw source;
        }
    }
    unreachable() {
        throw new $Panic("unreachable", `Unexpected execution of unreachable code`);
    }
    checked(x) {
        if (x === undefined) {
            throw new $Panic("weird-value", `Unexpected undefined value`);
        }
        else {
            return x;
        }
    }
    checked_project(x, v, f) {
        if (x === undefined) {
            throw new $Panic("invalid-field", `Invalid field ${f} for type ${$meow.typeof(v).name}`);
        }
        else {
            return x;
        }
    }
    // -- Effects
    defeff(name, types, non_local, line) {
        const location = `${$stack.current()}`;
        if ($effects.has(name)) {
            throw new $Panic("duplicate-effect", `Effect ${name} is already defined.`);
        }
        $effects.set(name, new $Effect(name, types, non_local, location));
    }
    eff_resume(value) {
        return new $ResumeSignal(value);
    }
    eff_abort(value) {
        return new $AbortSignal(value);
    }
    eff_perform(name, args) {
        const eff = $effects.get(name);
        if (eff == null) {
            throw new $Panic("no-effect", `No effect ${name} is defined.`);
        }
        if (eff.types.length !== args.length) {
            throw new $Panic("invalid-arity", `Invalid arity for effect ${name}`);
        }
        for (let i = 0; i < args.length; ++i) {
            if (!eff.types[i].is(args[i])) {
                throw new $Panic("invalid-type", `Invalid type for effect ${name} at ${i}. Expected ${eff.types[i].name}, got ${$pprint(args[i])}`);
            }
        }
        return new $PerformSignal(name, args);
    }
    eff_handle(fn, handlers) {
        return new $HandleSignal(fn(), handlers);
    }
    eff_on(name, fn) {
        return { [name]: fn };
    }
    *eff_use(name, args) {
        const handler = $handlers.get(name);
        if (handler == null) {
            throw new $Panic("no-handler", `Undefined handler ${name}`);
        }
        if (args.length !== handler.types.length) {
            throw new $Panic("invalid-arity", `Invalid arity (${args.length}) for handler ${name}`);
        }
        for (let i = 0; i < handler.types.length; ++i) {
            if (!handler.types[i].is(args[i])) {
                throw new $Panic("invalid-type", `Expected ${handler.types[i].name} at ${i} in handler ${name}, got ${$pprint(args[i])}`);
            }
        }
        return yield* handler.fn(...args);
    }
    eff_cases(xs) {
        return Object.assign({}, ...xs);
    }
    defhandler(name, fn, types, is_default) {
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
    put_asset(name, data) {
        if ($assets.has(name)) {
            throw new $Panic("duplicate-asset", `Duplicate asset ${name}`);
        }
        $assets.set(name, new $Asset(name, data));
    }
    put_asset_base64(name, data) {
        this.put_asset(name, Uint8Array.from(atob(data), (x) => x.codePointAt(0)));
    }
    get_asset(name) {
        const x = $assets.get(name);
        if (x == null) {
            throw new $Panic("no-asset", `Undefined asset ${name}`);
        }
        return x;
    }
    // -- Tests
    deftest(name, fn) {
        $tests.push(new $Test(name, fn));
    }
    async run_tests() {
        const tf0 = process.argv.indexOf("--test-filter");
        const tf1 = tf0 >= 0 ? process.argv[tf0 + 1] : null;
        const test_filter = tf1 == null ? (x) => true : (x) => x.includes(tf1);
        const start = performance.now();
        const errors = [];
        for (const x of $tests) {
            if (!test_filter(x.name)) {
                continue;
            }
            process.stdout.write(`[...] ${x.name}`.slice(0, process.stdout.columns - 5));
            try {
                const test = await $run_throw($with_default_handlers((function* () {
                    return yield* x.fn();
                })()), `<test: ${x.name}>`);
                await $loop_run();
                await test.result;
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                console.log(`[OK ] ${x.name}`);
            }
            catch (e) {
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
    wait_promise(promise) {
        return new $AwaitSignal(promise);
    }
    yield() {
        return new $YieldProcessSignal();
    }
    wait_sync(gen) {
        let result = gen.next();
        while (true) {
            if (result.done) {
                return result.value;
            }
            else {
                throw new $Panic("signal-in-sync-execution", `Signal raised in synchronous execution`, {
                    signal: result.value,
                });
            }
        }
    }
    async run(args) {
        $file = null;
        $line = null;
        try {
            if (args.includes("--test")) {
                $stack.push("<runtime> run tests");
                await $meow.run_tests();
            }
            else {
                $stack.push("<runtime> main entry point");
                $keep_alive(true);
                const main = await $run_throw($with_default_handlers((function* () {
                    return yield* $meow.call("main()/1", args);
                })()), "<main>");
                await $loop_run();
                await main.result;
                $keep_alive(false);
            }
        }
        catch (error) {
            console.error(`PANIC: Meow exited with an error at ${$stack.current()}.`);
            console.error($meow_format_error(error));
            process.exit(1);
        }
    }
})();
//# sourceMappingURL=04-meow.js.map
void 0;
"use strict";
$meow.deftype("i32", $type("i32", (x) => x instanceof $I32, 0));
$meow.deftype("i64", $type("i64", (x) => typeof x === "bigint", 0));
$meow.deftype("int", $type("int", (x) => typeof x === "number", 0));
$meow.deftype("f64", $type("f64", (x) => x instanceof $F64, 0));
$meow.deftype("text", $type("text", (x) => typeof x === "string", 0));
$meow.deftype("nothing", $type("nothing", (x) => x === null, 0));
$meow.deftype("bool", $type("bool", (x) => typeof x === "boolean", 0));
$meow.deftype("array", $type("array", (x) => Array.isArray(x), 0));
$meow.deftype("byte-array", $type("byte-array", (x) => x instanceof Uint8Array, 0));
$meow.deftype("unknown", $type("unknown", (x) => true, 255));
$meow.deftype("thunk", $type("thunk", (x) => x instanceof $Thunk, 0));
$meow.deftype("weak-ref", $type("weak-ref", (x) => x instanceof WeakRef, 0));
$meow.deftype("map", $type("map", (x) => x instanceof Map, 0));
$meow.deftype("cell", $type("cell", (x) => x instanceof $Cell, 0));
for (let i = 0; i < 32; ++i) {
    $meow.deftype(`lambda-${i}`, $type(`lambda-${i}`, (x) => typeof x === "function" && x.length === i, 0));
}
$meow.deftype("record", $type("record", (x) => x instanceof $Record, 1));
$meow.deftype("static", $type("static", (x) => x instanceof $Static, 1));
$meow.deftype("foreign", $type("foreign", (x) => x instanceof $Foreign, 1));
$meow.deftype("package-asset", $type("package-asset", (x) => x instanceof $Asset, 0));
$meow.deftype("process", $type("process", (x) => x instanceof $Process, 0));
// -- Root package (for files ran outside of proper packages)
$meow.start_package(null);
//# sourceMappingURL=05-setup.js.map
void 0;
"use strict";
function $pprint(value, depth = 0, visited = new Set(), flat = false) {
    const pad = (x, n = 2) => {
        return x
            .split(/\r\n|\r|\n/)
            .map((x) => " ".repeat(n) + x)
            .join("\n");
    };
    if (visited.has(value)) {
        return "(circular)";
    }
    if (depth > 5) {
        return "(...)";
    }
    if (value === null) {
        return "nothing";
    }
    else if (typeof value === "string") {
        if (value.length < 50) {
            return JSON.stringify(value);
        }
        else {
            return JSON.stringify(value.slice(0, 50)) + `<${value.length} units>`;
        }
    }
    else if (typeof value === "number") {
        return `${value}`;
    }
    else if (typeof value === "bigint") {
        return `${value}L`;
    }
    else if (typeof value === "boolean") {
        return `${value}`;
    }
    else if (Array.isArray(value)) {
        visited.add(value);
        const xs0 = value.map((x) => $pprint(x, depth + 1, visited, flat));
        const xs = xs0.slice(0, 10);
        if (xs0.length > xs.length) {
            xs.push(`...(${xs0.length} items)`);
        }
        const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
        if (len > 40) {
            return `[\n${xs.map((x) => pad(x, 2)).join(",\n")}\n]`;
        }
        else {
            return `[${xs.join(", ")}]`;
        }
    }
    else if (value instanceof Map) {
        visited.add(value);
        const xs0 = [];
        for (const [k, v] of value.entries()) {
            xs0.push(`${$pprint(k, depth + 1, visited, flat)}: ${$pprint(v, depth + 1, visited, flat)}`);
        }
        const xs = xs0.slice(0, 10);
        if (xs0.length > xs.length) {
            xs.push(`...(${xs0.length} items)`);
        }
        const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
        if (xs0.length === 0) {
            return "[:]";
        }
        else if (len > 40) {
            return `[\n${xs.map((x) => pad(x, 2)).join(",\n")}\n]`;
        }
        else {
            return `[${xs.join(", ")}]`;
        }
    }
    else if (value instanceof Uint8Array) {
        const repr = Array.from(value.subarray(0, 16))
            .map((x) => x.toString(16).padStart(2, "0"))
            .join(", ");
        if (value.length > 15) {
            return `<<${repr}... (${value.length} bytes)>>`;
        }
        else {
            return `<<${repr}>>`;
        }
    }
    else if (typeof value === "function") {
        return `<lambda-${value.length}>`;
    }
    else if (value instanceof WeakRef) {
        return `<weak-ref>`;
    }
    else if (value instanceof $Struct) {
        const xs0 = [];
        for (const f of value.$fields) {
            xs0.push(`${f}: ${$pprint(value[f], depth + 1, visited, flat)}`);
        }
        const xs = xs0.slice(0, 10);
        if (xs0.length > xs.length) {
            xs.push(`...(${xs0.length} items)`);
        }
        const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
        if (len < 40) {
            return `${value.$name}(${xs.join(", ")})`;
        }
        else {
            return `${value.$name}(\n${xs.map((x) => pad(x, 2)).join(",\n")}\n)`;
        }
    }
    else if (value instanceof $Variant) {
        const xs0 = [];
        for (const f of value.$fields) {
            xs0.push(`${f}: ${$pprint(value[f], depth + 1, visited, flat)}`);
        }
        const xs = xs0.slice(0, 10);
        if (xs0.length > xs.length) {
            xs.push(`...(${xs0.length} items)`);
        }
        const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
        if (len < 40) {
            return `${value.$name}..${value.$variant}(${xs.join(", ")})`;
        }
        else {
            return `${value.$name}..${value.$variant}(\n${xs.map((x) => pad(x, 2)).join("\n,")}\n)`;
        }
    }
    else if (value instanceof $Static) {
        return String(value);
    }
    else if (value instanceof $Thunk) {
        visited.add(value);
        if (value._forced) {
            return `<thunk: ${$pprint(value._value, depth + 1, visited, flat)}>`;
        }
        else {
            return `<thunk: (unevaluated)>`;
        }
    }
    else if (value instanceof $Cell) {
        visited.add(value);
        return `<cell: ${$pprint(value._value, depth + 1, visited, flat)}>`;
    }
    else if (value instanceof $F64) {
        return `${value.value}f`;
    }
    else if (value instanceof $I32) {
        return `${value.value}s`;
    }
    else if (value instanceof $Record) {
        visited.add(value);
        const xs0 = [];
        for (const [k, v] of Object.entries(value.$dict)) {
            xs0.push(`${k}: ${$pprint(v, depth + 1, visited, flat)}`);
        }
        const xs = xs0.slice(0, 10);
        if (xs0.length > xs.length) {
            xs.push(`...(${xs0.length} items)`);
        }
        const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
        if (len < 40) {
            return `#(${xs.join(", ")})`;
        }
        else {
            return `#(\n${xs.map((x) => pad(x, 2)).join(",\n")}\n)`;
        }
    }
    else if (value instanceof $Foreign) {
        return value.$type.name;
    }
    else if (value instanceof $Asset) {
        return `${value.name}(${Array.from(value.data.slice(0, 10)).join(", ")} (${value.data.length} bytes))`;
    }
    else if (value instanceof $Process) {
        return `<process ${value.name} (${value.alive ? "alive" : "dead"})>`;
    }
    return String(`<native: ${value}>`);
}
//# sourceMappingURL=06-pprint.js.map
void 0;
"use strict";
const $deep_eq = (l, r, visited = new Set()) => {
    if (visited.has(l) || visited.has(r)) {
        return l === r;
    }
    if (Array.isArray(l) && Array.isArray(r)) {
        visited.add(l);
        visited.add(r);
        return l.length === r.length && l.every((x, i) => $deep_eq(x, r[i], visited));
    }
    else if (l instanceof Map && r instanceof Map) {
        visited.add(l);
        visited.add(r);
        if (l.size !== r.size)
            return false;
        for (const [k, v] of l.entries()) {
            if (!r.has(k))
                return false;
            const e = r.get(k);
            if (!$deep_eq(v, e, visited))
                return false;
        }
        return true;
    }
    else if (l instanceof $Record && r instanceof $Record) {
        visited.add(l);
        visited.add(r);
        const ld = l.$dict;
        const rd = r.$dict;
        const kd = Object.keys(ld);
        const kr = Object.keys(rd);
        if (kd.length !== kr.length) {
            return false;
        }
        for (const k of kd) {
            if (!$deep_eq(ld[k], rd[k], visited)) {
                return false;
            }
        }
        return true;
    }
    else if (l instanceof $Static && r instanceof $Static) {
        return l.name === r.name;
    }
    else if (l instanceof $F64 && r instanceof $F64) {
        return l.value === r.value;
    }
    else if (l instanceof $I32 && r instanceof $I32) {
        return l.value === r.value;
    }
    else if (l instanceof Uint8Array && r instanceof Uint8Array) {
        if (l.length !== r.length) {
            return false;
        }
        for (let i = 0; i < l.length; ++i) {
            if (l[i] !== r[i]) {
                return false;
            }
        }
        return true;
    }
    else if (l instanceof $Struct && r instanceof $Struct) {
        visited.add(l);
        visited.add(r);
        return (l.$name === r.$name &&
            l.$fields.length === r.$fields.length &&
            l.$fields.every((k) => $deep_eq(l[k], r[k], visited)));
    }
    else if (l instanceof $Variant && r instanceof $Variant) {
        visited.add(l);
        visited.add(r);
        return (l.$name === r.$name &&
            l.$fields.length === r.$fields.length &&
            l.$fields.every((k) => $deep_eq(l[k], r[k], visited)));
    }
    else {
        return l === r;
    }
};
$meow.defun("==>()/2", [$meow.type("unknown"), $meow.type("unknown")], function* (a, b) {
    if (!$deep_eq(a, b)) {
        throw new $UnifyFailed(b, a);
    }
    else {
        return true;
    }
});
//# sourceMappingURL=07-deep-eq.js.map
void 0;
"use strict";
const array_count = (xs) => xs.length;
const array_at = (xs, ix) => xs[ix];
const array_copy_put = (xs0, ix, x) => {
    const xs = xs0.slice();
    xs[ix] = x;
    return xs;
};
const array_copy_remove = (xs0, ix) => {
    const xs = xs0.slice();
    xs.splice(ix, 1);
    return xs;
};
const array_copy_insert_at = (xs0, ix, x) => {
    const xs = xs0.slice();
    xs.splice(ix, 0, x);
    return xs;
};
const array_concat = (xs, ys) => {
    return xs.concat(ys);
};
const array_copy_sort_by = (xs, fn) => {
    return xs.slice().sort((a, b) => $meow.wait_sync(fn(a, b)));
};
const array_copy_reverse = (xs) => {
    return xs.slice().reverse();
};
const array_shallow_copy = (xs) => xs.slice();
const array_mut_put = (xs, ix, x) => {
    xs[ix] = x;
    return xs;
};
const array_mut_remove = (xs, ix) => {
    xs.splice(ix, 1);
    return xs;
};
const array_mut_insert_at = (xs, ix, x) => {
    xs.splice(ix, 0, x);
    return xs;
};
const array_mut_append = (xs, x) => {
    xs.push(x);
    return xs;
};
const array_mut_sort_by = (xs, fn) => {
    xs.sort((a, b) => $meow.wait_sync(fn(a, b)));
    return xs;
};
const array_mut_reverse = (xs) => {
    xs.reverse();
    return xs;
};
const array_slice = (xs, start, end) => xs.slice(start, end);
const array_allocate = (size, x) => new Array(size).fill(x);
const array_mut_put_all_at = (x, xs, i) => {
    for (let ox = 0; ox < xs.length; ++ox) {
        x[ox + i] = xs[ox];
    }
    return x;
};
const array_mut_fill = (xs, v) => {
    xs.fill(v);
    return xs;
};
const array_mut_fill_slice = (xs, v, start, stop) => {
    xs.fill(v, start, stop);
    return xs;
};
// const array_length = (xs: $Value[]) => xs.length;
// const array_unsafe_at = (xs: $Value[], ix: number) => xs[ix];
// const array_rest = (xs: $Value[]) => xs.slice(1);
// const array_contains = (xs: $Value[], x: $Value) => {
//   for (let i = 0; i < xs.length; ++i) {
//     if ($meow.eq(xs[i], x)) return true;
//   }
//   return false;
// };
// const array_slice_contains = (xs: $Value[], ox: number, len: number, x: $Value) => {
//   for (let i = ox; i < ox + len; ++i) {
//     if ($meow.eq(xs[i], x)) return true;
//   }
//   return false;
// };
// -- old
//
// const array_at_put_mut = (x: $Value[], i: number, v: $Value) => {
//   x[i] = v;
//   return x;
// };
// const array_at_put_all = (x: $Value[], i: number, xs: $Value[]) => {
//   for (let ox = 0; ox < xs.length; ++ox) {
//     x[ox + i] = xs[ox];
//   }
//   return x;
// };
// const array_at_put_all_slice = (
//   x: $Value[],
//   i: number,
//   xs: $Value[],
//   start: number,
//   end: number
// ) => {
//   for (let ox = 0; ox < end - start; ++ox) {
//     x[ox + i] = xs[ox + start];
//   }
//   return x;
// };
// const array_fill = (x: $Value[], v: $Value, start: number, end: number) => {
//   for (let i = start; i < end; ++i) {
//     x[i] = v;
//   }
//   return x;
// };
// const array_fill_all = (x: $Value[], v: $Value) => {
//   x.fill(v);
//   return x;
// };
// const array_prepend_mut = (x: $Value[], v: $Value) => {
//   x.unshift(v);
//   return x;
// };
// const array_append_mut = (x: $Value[], v: $Value) => {
//   x.push(v);
//   return x;
// };
// const array_count = (x: $Value[]) => x.length;
// const array_at = (x: $Value[], i: number) => x[i];
// const array_map = (x: $Value[], fn: MeowFn) => x.map((x) => $meow.wait_sync(fn(x)));
// const array_filter = (x: $Value[], fn: MeowFn) => x.filter((x) => $meow.wait_sync(fn(x)));
// const aray_some = (x: $Value[], fn: MeowFn) => x.some((x) => $meow.wait_sync(fn(x)));
// const array_all = (x: $Value[], fn: MeowFn) => x.every((x) => $meow.wait_sync(fn(x)));
// const array_fold_left = (x: $Value[], init: $Value, fn: MeowFn) =>
//   x.reduce((p, x) => $meow.wait_sync(fn(p, x)) as any, init);
// const array_fold_right = (x: $Value[], init: $Value, fn: MeowFn) =>
//   x.reduceRight((p, x) => $meow.wait_sync(fn(x, p)) as any, init);
// const array_flat_map = (x: $Value[], fn: MeowFn) => x.flatMap((x) => $meow.wait_sync(fn(x)));
// const array_slice = (x: $Value[], start: number, end: number) => x.slice(start, end);
// const array_slice_from = (x: $Value[], start: number) => x.slice(start);
// const array_slice_to = (x: $Value[], end: number) => x.slice(end);
// const array_concat = (x: $Value[], y: $Value[]) => x.concat(y);
// const array_remove_at = (x: $Value[], i: number) => {
//   const r = x.slice();
//   r.splice(i, 1);
//   return r;
// };
// const array_insert_before = (x: $Value[], i: number, v: $Value) => {
//   const r = x.slice();
//   r.splice(i, 0, v);
//   return r;
// };
// const array_insert_after = (x: $Value[], i: number, v: $Value) => {
//   const r = x.slice();
//   r.splice(i + 1, 0, v);
//   return r;
// };
// const array_at_put = (x: $Value[], i: number, v: $Value) => {
//   const r = x.slice();
//   r[i] = v;
//   return r;
// };
// const array_reverse = (x: $Value[]) => x.slice().reverse();
// const array_sort_by = (x: $Value[], fn: (a: $Value, b: $Value) => number) => x.toSorted(fn);
// const array_zip_with = (x: $Value[], y: $Value[], fn: MeowFn) =>
//   x.map((a, i) => $meow.wait_sync(fn(a, y[i])));
// const array_each = (x: $Value[], fn: MeowFn) => {
//   x.forEach((x) => $meow.wait_sync(fn(x)));
//   return null;
// };
// const array_slice_eq = (
//   x: $Value[],
//   xo: number,
//   xl: number,
//   y: $Value[],
//   yo: number,
//   yl: number
// ) => {
//   if (xl !== yl) {
//     return false;
//   }
//   for (let i = 0; i < xl; ++i) {
//     if (x[xo + i] !== y[yo + i]) {
//       return false;
//     }
//   }
//   return true;
// };
// const array_materialise_slice = (x: $Value[], offset: number, length: number) =>
//   x.slice(offset, offset + length);
//# sourceMappingURL=09-prim-array.js.map
void 0;
"use strict";
const asset_name = (x) => x.name;
const asset_text = (x) => x.as_text();
const asset_bytes = (x) => x.as_bytes();
//# sourceMappingURL=09-prim-asset.js.map
void 0;
"use strict";
const binary_allocate = (size, value) => {
    if (value === 0) {
        return new Uint8Array(size);
    }
    else {
        const v = new Uint8Array(size);
        v.fill(value);
        return v;
    }
};
const binary_copy = (x) => new Uint8Array(x);
const binary_from_array = (x) => new Uint8Array(x);
const binary_concat = (xs) => {
    const size = xs.reduce((a, b) => b.length + a, 0);
    const r = new Uint8Array(size);
    let offset = 0;
    for (const x of xs) {
        r.set(x, offset);
        offset += x.length;
    }
    return r;
};
const binary_count = (x) => x.length;
const binary_at = (x, i) => {
    if (i < 0 || i >= x.length) {
        throw new $Panic("out-of-bounds", `Index ${i} out of bounds`, { array: x, index: i });
    }
    return x[i];
};
const binary_at_put = (x, i, v) => {
    if (i < 0 || i >= x.length) {
        throw new $Panic("out-of-bounds", `Index ${i} out of bounds`, { array: x, index: i });
    }
    x[i] = v;
    return null;
};
const binary_at_put_all = (x, i, y) => {
    x.set(y, i);
    return null;
};
const binary_fill = (x, v, from, to) => {
    if (from > to || from < 0 || to > x.length) {
        throw new $Panic("out-of-bounds", `Range [${from}, ${to}) out of bounds`, {
            array: x,
            from,
            to,
        });
    }
    x.fill(v, from, to);
    return null;
};
const binary_fill_all = (x, v) => {
    x.fill(v);
    return null;
};
const binary_to_array = (x) => Array.from(x);
// -- old
const binary_eq = (x, y) => {
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
const binary_slice_eq = (x, xo, xl, y, yo, yl) => {
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
const binary_materialise_slice = (x, offset, length) => {
    return x.slice(offset, offset + length);
};
const binary_clone = (x) => {
    return new Uint8Array(x);
};
const binary_put_slice = (x, i, y, yo, yl) => {
    x.set(y.subarray(yo, yl), i);
    return x;
};
//# sourceMappingURL=09-prim-binary.js.map
void 0;
"use strict";
const bool_and = (a, b) => a && b;
const bool_or = (a, b) => a || b;
const bool_not = (a) => !a;
const bool_eq = (a, b) => a === b;
const bool_neq = (a, b) => a !== b;
//# sourceMappingURL=09-prim-bool.js.map
void 0;
"use strict";
const transcript_log = (x) => console.log($pprint(x));
const transcript_write = (x) => console.log(x);
const transcript_trace = (x, tag) => console.trace(`(${tag}) ${$pprint(x)}\n\nStack:\n${$stack.format()}\n---`);
const breakpoint = () => {
    debugger;
    return null;
};
//# sourceMappingURL=09-prim-debug.js.map
void 0;
"use strict";
const panic_raise = (tag, msg, data) => {
    throw new $Panic(tag, msg, data);
};
const panic_catch = (block) => {
    return function* () {
        try {
            const value = yield* block();
            return $meow.record({ ok: true, value: value });
        }
        catch (e) {
            if (e instanceof $Panic) {
                return $meow.record({
                    ok: false,
                    reason: $meow.record({
                        tag: e.tag,
                        message: e.msg,
                    }),
                });
            }
            else {
                return $meow.record({
                    ok: false,
                    reason: $meow.record({
                        tag: "native-error",
                        message: String(e),
                    }),
                });
            }
        }
    };
};
//# sourceMappingURL=09-prim-error.js.map
void 0;
"use strict";
// -- Arithmetic
const f64_add = (a, b) => new $F64(a.value + b.value);
const f64_sub = (a, b) => new $F64(a.value - b.value);
const f64_mul = (a, b) => new $F64(a.value * b.value);
const f64_div = (a, b) => new $F64(a.value / b.value);
const f64_idiv = (a, b) => new $F64(Math.floor(a.value / b.value));
const f64_pow = (a, b) => new $F64(a.value ** b.value);
const f64_mod = (a, b) => new $F64(a.value % b.value);
const f64_negate = (a) => new $F64(-a.value);
// -- Relational
const f64_eq = (a, b) => a.value === b.value;
const f64_neq = (a, b) => a.value !== b.value;
const f64_gt = (a, b) => a.value > b.value;
const f64_gte = (a, b) => a.value >= b.value;
const f64_lt = (a, b) => a.value < b.value;
const f64_lte = (a, b) => a.value <= b.value;
// -- Floating point
const f64_truncate = (a) => new $F64(Math.trunc(a.value));
const f64_floor = (a) => new $F64(Math.floor(a.value));
const f64_ceiling = (a) => new $F64(Math.ceil(a.value));
const f64_round = (a) => new $F64(Math.round(a.value));
const f64_is_nan = (a) => Number.isNaN(a.value);
const f64_is_finite = (a) => Number.isFinite(a.value);
const f64_nan = () => new $F64(NaN);
const f64_positive_inf = () => new $F64(Number.POSITIVE_INFINITY);
const f64_negative_inf = () => new $F64(Number.NEGATIVE_INFINITY);
const f64_max = () => new $F64(Number.MAX_VALUE);
const f64_min = () => new $F64(Number.MIN_VALUE);
// -- Conversions
const f64_to_text = (a) => String(a.value);
const f64_to_i32 = (a) => a.value | 0;
const f64_to_i64 = (a) => BigInt(Math.floor(a.value));
const f64_to_int = (a) => Math.floor(a.value);
const f64_to_bool = (a) => Boolean(a.value);
//# sourceMappingURL=09-prim-f64.js.map
void 0;
"use strict";
// -- Arithmetic
const i32_add = (a, b) => new $I32(((a.value | 0) + (b.value | 0)) | 0);
const i32_sub = (a, b) => new $I32(((a.value | 0) - (b.value | 0)) | 0);
const i32_mul = (a, b) => new $I32(((a.value | 0) * (b.value | 0)) | 0);
const i32_div = (a, b) => new $I32(((a.value | 0) / (b.value | 0)) | 0);
const i32_pow = (a, b) => new $I32(((a.value | 0) ** (b.value | 0)) | 0);
const i32_mod = (a, b) => new $I32((a.value | 0) % (b.value | 0) | 0);
const i32_negate = (a) => new $I32(-a.value);
// -- Relational
const i32_eq = (a, b) => (a.value | 0) === (b.value | 0);
const i32_neq = (a, b) => (a.value | 0) !== (b.value | 0);
const i32_lt = (a, b) => (a.value | 0) < (b.value | 0);
const i32_lte = (a, b) => (a.value | 0) <= (b.value | 0);
const i32_gt = (a, b) => (a.value | 0) > (b.value | 0);
const i32_gte = (a, b) => (a.value | 0) >= (b.value | 0);
// -- Bitwise
const i32_bshl = (a, b) => new $I32((a.value | 0) << (b.value | 0));
const i32_bashr = (a, b) => new $I32((a.value | 0) >> (b.value | 0));
const i32_blshr = (a, b) => new $I32((a.value | 0) >>> (b.value | 0));
const i32_band = (a, b) => new $I32((a.value | 0) & (b.value | 0));
const i32_bor = (a, b) => new $I32(a.value | 0 | (b.value | 0));
const i32_bxor = (a, b) => new $I32((a.value | 0) ^ (b.value | 0));
const i32_bnot = (a) => new $I32(~a.value);
// -- Conversions
const i32_to_text = (a) => String(a.value);
const i32_to_int = (a) => a.value;
const i32_to_i64 = (a) => BigInt(a.value);
const i32_to_bool = (a) => Boolean(a.value);
const i32_to_f64 = (a) => new $F64(a.value);
//# sourceMappingURL=09-prim-i32.js.map
void 0;
"use strict";
// -- Arithmetic
const i64_add = (a, b) => a + b;
const i64_sub = (a, b) => a - b;
const i64_mul = (a, b) => a * b;
const i64_div = (a, b) => a / b;
const i64_pow = (a, b) => a ** b;
const i64_mod = (a, b) => a % b;
const i64_negate = (a) => -a;
// -- Relational
const i64_eq = (a, b) => a === b;
const i64_neq = (a, b) => a !== b;
const i64_gt = (a, b) => a > b;
const i64_gte = (a, b) => a >= b;
const i64_lt = (a, b) => a < b;
const i64_lte = (a, b) => a <= b;
// -- Bitwise
const i64_bshl = (a, b) => a << b;
const i64_bashr = (a, b) => a >> b;
const i64_band = (a, b) => a & b;
const i64_bor = (a, b) => a | b;
const i64_bxor = (a, b) => a ^ b;
const i64_bnot = (a) => ~a;
// -- Conversions
const i64_to_text = (a) => String(a);
const i64_to_i32 = (a) => Number(a) | 0;
const i64_to_int = (a) => Number(a);
const i64_to_f64 = (a) => new $F64(Number(a));
const i64_to_bool = (a) => Boolean(a);
//# sourceMappingURL=09-prim-i64.js.map
void 0;
"use strict";
// -- Arithmetic
const int_add = (a, b) => a + b;
const int_sub = (a, b) => a - b;
const int_mul = (a, b) => a * b;
const int_div = (a, b) => Math.floor(a / b);
const int_pow = (a, b) => a ** b;
const int_mod = (a, b) => a % b;
const int_negate = (a) => -a;
// -- Relational
const int_eq = (a, b) => a === b;
const int_neq = (a, b) => a !== b;
const int_lt = (a, b) => a < b;
const int_lte = (a, b) => a <= b;
const int_gt = (a, b) => a > b;
const int_gte = (a, b) => a >= b;
// -- Bitwise
const int_bshl = (a, b) => a << b;
const int_bashr = (a, b) => a >> b;
const int_blshr = (a, b) => a >>> b;
const int_band = (a, b) => a & b;
const int_bor = (a, b) => a | b;
const int_bxor = (a, b) => a ^ b;
const int_bnot = (a) => ~a;
// -- Conversions
const int_to_text = (a) => String(a);
const int_to_i64 = (a) => BigInt(a);
const int_to_bool = (a) => Boolean(a);
const int_to_f64 = (a) => new $F64(a);
const int_to_i32 = (a) => new $I32(a);
// -- Bounds
const int_max = () => Number.MAX_SAFE_INTEGER;
const int_min = () => Number.MIN_SAFE_INTEGER;
//# sourceMappingURL=09-prim-int.js.map
void 0;
"use strict";
const map_from_entries = (entries) => {
    const map = new Map();
    for (const entry of entries) {
        map.set(entry.$dict["key"], entry.$dict["value"]);
    }
    return map;
};
const map_count = (x) => x.size;
const map_maybe_at = (x, k) => {
    const v = x.get(k);
    if (v === undefined) {
        return $meow.record({ ok: false, value: null });
    }
    else {
        return $meow.record({ ok: true, value: v });
    }
};
const map_at = (x, k) => {
    const v = x.get(k);
    if (v === undefined) {
        throw new $Panic("no-key", `No key ${$pprint(k)} in map`, { map: x, key: k });
    }
    return v;
};
const map_has_key = (x, k) => {
    return x.has(k);
};
const map_entries = (x) => {
    return (function* () {
        for (const [k, v] of x.entries()) {
            yield $meow.record({ key: k, value: v });
        }
    })();
};
const map_keys = (x) => x.keys();
const map_values = (x) => x.values();
const map_copy = (x) => new Map(x.entries());
const map_mut_put = (x, k, v) => {
    x.set(k, v);
    return null;
};
const map_mut_remove = (x, k) => {
    x.delete(k);
    return null;
};
const map_mut_clear = (x) => {
    x.clear();
    return null;
};
//# sourceMappingURL=09-prim-map.js.map
void 0;
"use strict";
const int_parse = (x) => {
    const n = Number(x.replace(/_/g, ""));
    const v = Math.max(Number.MIN_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n)));
    if (Number.isNaN(n) || Math.floor(n) !== n) {
        return $meow.record({ ok: false, reason: "not-integer" });
    }
    else if (v !== n) {
        return $meow.record({ ok: false, reason: "out-of-range" });
    }
    else {
        return $meow.record({ ok: true, value: v });
    }
};
const int_unparse = (x) => String(x);
const i64_parse = (x) => {
    try {
        return $meow.record({ ok: true, value: BigInt(x.replace(/_/g, "")) });
    }
    catch (_) {
        return $meow.record({ ok: false, reason: "not-integer" });
    }
};
const i64_unparse = (x) => x.toString();
const f64_parse = (x) => {
    const v = Number(x.replace(/_/g, ""));
    if (Number.isNaN(v) || !Number.isFinite(v)) {
        return $meow.record({ ok: false, reason: "not-float" });
    }
    else {
        return $meow.record({ ok: true, value: $meow.f64(v) });
    }
};
const f64_unparse = (x) => String(x.value);
const text_parse = (x) => {
    try {
        const text = x
            .trim()
            .replace(/[\u0000-\u001f]/g, (x) => `\\u${x.charCodeAt(0).toString(16).padStart(4, "0")}`);
        return $meow.record({ ok: true, value: JSON.parse(text) });
    }
    catch (_) {
        return $meow.record({ ok: false, reason: "not-text" });
    }
};
const text_unparse = (x) => JSON.stringify(x);
//# sourceMappingURL=09-prim-parse.js.map
void 0;
"use strict";
const record_to_map = (x) => new Map(Object.entries(x.$dict));
//# sourceMappingURL=09-prim-record.js.map
void 0;
"use strict";
// -- Cell references
const cell_new = (a) => new $Cell(a);
const cell_deref = (a) => a.deref();
const cell_exchange = (a, b) => a.exchange(b);
const cell_cas = (a, v, o) => a.cas(v, o);
// -- Weak references
const weak_ref_new = (a) => new WeakRef(a);
const weak_ref_deref = (a) => a.deref() ?? null;
//# sourceMappingURL=09-prim-refs.js.map
void 0;
"use strict";
// -- Content testing
const text_ends_with = (a, b) => a.endsWith(b);
const text_starts_with = (a, b) => a.startsWith(b);
const text_contains = (a, b) => a.includes(b);
const text_slice_contains = (a, offset, length, part) => {
    return a.slice(offset, offset + length).includes(part);
};
const text_slice_starts_with = (a, offset, length, part) => {
    return a.slice(offset, offset + length).startsWith(part);
};
const text_slice_ends_with = (a, offset, length, part) => {
    return a.slice(offset, offset + length).endsWith(part);
};
const text_slice_eq_text = (a, ox, len, b) => {
    return a.slice(ox, ox + len) === b;
};
const text_slice_eq = (a, aox, alen, b, box, blen) => {
    return a.slice(aox, aox + alen) === b.slice(box, box + blen);
};
// -- Constructing
const text_decode_utf8 = (a, strict) => {
    try {
        return new TextDecoder("utf-8", {
            fatal: strict,
        }).decode(a);
    }
    catch (_) {
        return null;
    }
};
const text_from_code_units = (xs) => String.fromCharCode(...xs);
const text_from_unicode = (xs) => String.fromCodePoint(...xs);
const text_join = (xs, s) => xs.join(s);
// -- Combining
const text_concat = (a, b) => a + b;
const text_repeat = (a, n) => a.repeat(n);
// -- Transforming text
const text_trim_start = (a) => a.trimStart();
const text_trim_end = (a) => a.trimEnd();
const text_trim = (a) => a.trim();
const text_split = (a, sep) => a.split(sep);
const text_replace_first = (a, patt, subst) => a.replace(patt, subst);
const text_replace_all = (a, patt, subst) => a.replaceAll(patt, subst);
const text_pad_start = (a, size, c) => {
    const space = size - a.length;
    const fill = a.length + c.length * Math.floor(space / c.length);
    return a.padStart(Math.min(size, fill), c);
};
const text_pad_end = (a, size, c) => {
    const space = size - a.length;
    const fill = a.length + c.length * Math.floor(space / c.length);
    return a.padEnd(Math.min(size, fill), c);
};
// -- Representation properties
const text_count_code_units = (a) => a.length;
const text_is_well_formed = (a) => a.isWellFormed();
const text_to_well_formed = (a) => a.toWellFormed();
// -- Slicing
const text_unsafe_slice = (a, from, length) => {
    return a.slice(from, from + length);
};
// -- Conversions
const text_to_unicode_scalars = (a) => {
    if (!a.isWellFormed()) {
        return null;
    }
    else {
        return [...a].map((x) => x.codePointAt(0));
    }
};
const text_to_utf8_bytes = (a) => {
    if (!a.isWellFormed()) {
        return null;
    }
    else {
        return new TextEncoder().encode(a);
    }
};
// -- UTF16 representation -----------------------------------------------------
const text_code_unit_at = (x, ix) => x.charCodeAt(ix);
const $text_segmenter = Intl.Segmenter
    ? function* (x) {
        for (const v of new Intl.Segmenter().segment(x)) {
            yield [v.index, v.segment];
        }
    }
    : function* (x) {
        let i = 0;
        for (const v of x) {
            yield [i++, v];
        }
    };
const text_graphemes = (x) => {
    return $text_segmenter(x);
};
const text_words = (x) => {
    return (function* () {
        for (const v of new Intl.Segmenter(undefined, { granularity: "word" }).segment(x)) {
            yield [v.index, v.segment, v.isWordLike];
        }
    })();
};
const text_sentences = (x) => {
    return (function* () {
        for (const v of new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(x)) {
            yield [v.index, v.segment];
        }
    })();
};
const text_lines = (x) => {
    return (function* () {
        let last_offset = 0;
        const re = /\r\n|\r|\n/g;
        while (true) {
            re.lastIndex = last_offset;
            const match = re.exec(x);
            if (match == null || re.lastIndex < last_offset) {
                yield [last_offset, x.slice(last_offset)];
                return;
            }
            yield [last_offset, x.slice(last_offset, match.index)];
            last_offset = re.lastIndex;
        }
    })();
};
//# sourceMappingURL=09-prim-text.js.map
void 0;
"use strict";
let $process_queue = []; // TODO: double-ended list
let $stuck_set = new Set();
let $next_process_id = 0;
let $free_process_id = [];
let $queue_waiter = $defer();
let $processes = new Map();
let $current_process = null;
let $main_loop_running = false;
class $Process {
    constructor(id, context) {
        this.id = id;
        this.context = context;
        this.mailbox = [];
        this.alive = true;
        this.active = false;
        this.resolver = $defer();
        this._name = null;
    }
    get name() {
        return this._name == null ? `anonymous(${this.id})` : `${this._name}(${this.id})`;
    }
}
function $defer() {
    const p = {};
    p.promise = new Promise((resolve, reject) => {
        p.resolve = resolve;
        p.reject = reject;
    });
    return p;
}
async function $next_process() {
    if ($process_queue.length > 0) {
        return $process_queue.shift();
    }
    else if ($stuck_set.size > 0) {
        await $queue_waiter.promise;
        return $next_process();
    }
    else {
        return null;
    }
}
function $push_process(process, input) {
    $stuck_set.delete(process);
    if (!process.alive) {
        return;
    }
    $process_queue.push({ process, input });
    if ($process_queue.length === 1) {
        const p = $queue_waiter;
        $queue_waiter = $defer();
        p.resolve();
    }
}
function $mark_stuck_process(process, ctx) {
    process.context = ctx;
    $stuck_set.add(process);
}
function $get_next_process_id() {
    if ($free_process_id.length !== 0) {
        return $free_process_id.pop();
    }
    else {
        return $next_process_id++;
    }
}
function $spawn_process(gen, name = null) {
    const id = $get_next_process_id();
    const process = new $Process(id, new $HandleStack(null, gen, {}, null));
    process._name = name;
    $processes.set(id, process);
    $push_process(process, null);
    return process;
}
function $resolve_process(process, value, ctx) {
    process.resolver.resolve({ ok: true, value });
    process.alive = false;
    process.context = ctx;
    $free_process(process);
}
function $crash_process(process, reason, ctx) {
    process.resolver.resolve({ ok: false, reason });
    process.alive = false;
    process.context = ctx;
    $free_process(process);
}
function $free_process(process) {
    $processes.delete(process.id);
    $free_process_id.push(process.id);
    $stuck_set.delete(process);
}
function $with_default_handlers(gen) {
    return (function* () {
        for (const handler of $default_handlers) {
            const cases = yield* handler.fn();
            yield new $InstallHandlerCasesSignal(cases);
        }
        return yield* gen;
    })();
}
function $with_given_handlers(gen, handlers) {
    return (function* () {
        yield new $InstallHandlerCasesSignal(handlers);
        return yield* gen;
    })();
}
function $run(process, input) {
    if (!process.alive) {
        return true;
    }
    let ctx = process.context;
    try {
        let result = ctx.gen.next(input);
        while (true) {
            if (result.done) {
                if (ctx.parent == null) {
                    $resolve_process(process, result.value, ctx);
                    return true;
                }
                else {
                    ctx = ctx.parent;
                    result = ctx.gen.next(result.value);
                }
            }
            else {
                const signal = result.value;
                if (signal instanceof $PanicSignal) {
                    $crash_process(process, signal.error, ctx);
                    return false;
                }
                else if (signal instanceof $AwaitSignal) {
                    $mark_stuck_process(process, ctx);
                    signal.value.then((value) => {
                        $push_process(process, value);
                    }, (error) => {
                        $crash_process(process, $meow_wrap_error(error), ctx);
                    });
                    return false;
                }
                else if (signal instanceof $PerformSignal) {
                    const { stack, handler } = ctx.find_handler(signal.name);
                    const gen = handler(...signal.args);
                    ctx = new $HandleStack(ctx, gen, {}, stack.parent);
                    result = gen.next();
                }
                else if (signal instanceof $HandleSignal) {
                    ctx = new $HandleStack(ctx, signal.gen, signal.cases, ctx.abort_to);
                    result = ctx.gen.next();
                }
                else if (signal instanceof $ResumeSignal) {
                    if (ctx.parent == null) {
                        return signal.value;
                    }
                    else {
                        ctx = ctx.parent;
                        result = ctx.gen.next(signal.value);
                    }
                }
                else if (signal instanceof $AbortSignal) {
                    if (ctx.abort_to == null) {
                        $resolve_process(process, signal.value, ctx);
                        return true;
                    }
                    else {
                        ctx = ctx.abort_to;
                        result = ctx.gen.next(signal.value);
                    }
                }
                else if (signal instanceof $InstallHandlerCasesSignal) {
                    for (const [k, v] of Object.entries(signal.cases)) {
                        if (Object.hasOwn(ctx.cases, k)) {
                            const error = new $Panic("duplicate-install-handler", `Scope already has a handler defined for ${k} (${ctx.cases[k].name}), but a new one (${v.name}) was installed.`);
                            $crash_process(process, error, ctx);
                            return true;
                        }
                        ctx.cases[k] = v;
                    }
                    result = ctx.gen.next(null);
                }
                else if (signal instanceof $YieldProcessSignal) {
                    process.context = ctx;
                    $push_process(process, null);
                    return false;
                }
                else {
                    const error = new $Panic("unknown-signal", `Unknown signal in execution`, { signal });
                    $crash_process(process, error, ctx);
                    return true;
                }
            }
        }
    }
    catch (error) {
        $crash_process(process, $meow_wrap_error(error), ctx);
        return true;
    }
}
async function $loop_run() {
    if ($main_loop_running) {
        throw new Error(`$loop_run() called twice`);
    }
    $main_loop_running = true;
    while (true) {
        // TODO: proper traces for the scheduler and stuff
        // console.debug(
        //   "tick:",
        //   $process_queue.map((x) => x.process.name),
        //   [...$stuck_set].map((x) => x.name)
        // );
        const next = await $next_process();
        // console.debug("next process:", next?.process.name, next?.input);
        if (next == null) {
            $main_loop_running = false;
            return;
        }
        $current_process = next.process;
        next.process.active = true;
        $run(next.process, next.input);
        next.process.active = false;
        $current_process = null;
    }
}
async function $run_throw(fn, name) {
    const process = $spawn_process(fn, name);
    return {
        process,
        result: process.resolver.promise.then((x) => {
            if (x.ok) {
                return x.value;
            }
            else {
                throw x.reason;
            }
        }),
    };
}
async function $run_wait(fn) {
    const process = $spawn_process(fn);
    return process.resolver.promise;
}
let $busy_id = null;
function $keep_alive(x) {
    clearInterval($busy_id);
    if (x) {
        $busy_id = setInterval(() => { }, 60000);
    }
}
//# sourceMappingURL=10-execution.js.map