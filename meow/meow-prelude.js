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
    constructor(name, types, code) {
        this.name = name;
        this.types = types;
        this.code = code;
    }
}
class $Record {
    get type() {
        return $type("record", (x) => x instanceof $Record, 1);
    }
    constructor($dict) {
        this.$dict = $dict;
        for (const [k, v] of Object.entries($dict)) {
            this[k] = v;
        }
    }
}
class $Graphemes {
    get $type() {
        return $meow.type("grapheme-cluster");
    }
    constructor(cluster) {
        this.cluster = cluster;
    }
    toString() {
        return `grapheme-cluster(${$pprint(this.cluster)})`;
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
    constructor(tname, defaults) {
        this.tname = tname;
        this.defaults = defaults;
        this._implementations = new Map();
    }
    implement(t, implementation) {
        if (this._implementations.has(t.name)) {
            throw new $Panic("duplicate-trait", `Duplicate trait ${this.tname} implementation for ${t.name}`);
        }
        const dict = { ...this.defaults, ...implementation };
        for (const k of Object.keys(this.defaults)) {
            if (typeof dict[k] !== "function") {
                throw new $Panic("no-method", `No method ${k} in ${t.name} implementation of trait ${this.tname}`);
            }
        }
        this._implementations.set(t.name, dict);
    }
    *call(name, args) {
        const t = $meow.typeof(args[0]);
        const dict = this._implementations.get(t.name);
        if (dict == null) {
            throw new $Panic("no-trait", `No trait ${this.tname} implementation for ${t.name}`);
        }
        const m = dict[name];
        if (m == null) {
            throw new $Panic("no-method", `No method ${name} in trait ${this.tname}`);
        }
        return yield* m(...args);
    }
}
class $Type {
}
function $type(name, check, distance) {
    return new (class extends $Type {
        constructor() {
            super(...arguments);
            this.placeholder = false;
            this.name = name;
            this.distance = distance;
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
        }
        is(value) {
            return false;
        }
    })();
}
class $StaticType extends $Type {
    get name() {
        return `#${this.sname}`;
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
    else if ("$meow_message" in x) {
        return String(x.$meow_message) + $native_trace(x);
    }
    else {
        return String(x.stack ?? x);
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
        super(`Panic(${tag}): ${msg}`);
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
    resolve(name, box) {
        if (name.includes("/")) {
            if (this.pkg_aliases.size === 0) {
                return name;
            }
            else {
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
        }
        else {
            return name;
        }
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
const $meow = new (class Meow {
    pprint(x) {
        return $pprint(x);
    }
    info(x, opts) {
        Object.defineProperty(x, "name", { value: `${opts.name} in ${opts.file}:${opts.line}` });
        return x;
    }
    in_package(name, fn) {
        const scope = new $Scope($scope, name, null, [name === "meow.core" ? null : name, "meow.core"].filter((x) => x != null));
        fn(scope);
    }
    declare_type(name) {
        this.deftype(name, $placeholder_type(name));
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
    defun(name, types, fn) {
        const fns = $fns.get(name) ?? [];
        fns.push(new $Fn(name, types, fn));
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
            return yield* fn.code(...args);
        }
        throw new $Panic("no-method", `No branch of ${name} matched (${args.map((x) => $pprint(x, 1))})`);
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
            return;
        }
        $types.set(name, type);
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
            return $meow.type("i32");
        }
        else if (typeof x === "bigint") {
            return $meow.type("integer");
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
        else if (x instanceof $Struct ||
            x instanceof $Static ||
            x instanceof $Variant ||
            x instanceof $Cell ||
            x instanceof $Graphemes) {
            return x.$type;
        }
        else if (typeof x === "function") {
            return $meow.type(`lambda-${x.length}`);
        }
        else {
            throw new $Panic("weird-value", `Unknown type`);
        }
    }
    deftrait(name, defaults) {
        if ($traits.has(name)) {
            throw new $Panic("duplicate-trait", `Duplicated trait ${name}`);
        }
        $traits.set(name, new $Trait(name, defaults));
    }
    implement(name, type, dict) {
        const trait = $traits.get(name);
        if (trait == null) {
            throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
        }
        trait.implement(type, dict);
    }
    trait(name) {
        const trait = $traits.get(name);
        if (trait == null) {
            throw new $Panic("no-trait", `Undefined trait ${name} in ${$scope}`);
        }
        return trait.type;
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
                return `${name}()`;
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
                    return `${name}(${fields.map((x) => `${x}: ${this[x]}`).join(", ")})`;
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
                    return $meow.type(name);
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
        this.deftype(name, $type(name, (x) => x instanceof s, 1));
        for (const v of variants) {
            this.deftype(`${name}..${v.name}`, $type(`${name}..${v.name}`, (x) => x instanceof s && x.$variant === v.name, 0));
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
            return new $Record({ ...x.$dict, binds });
        }
        else if (x instanceof $Struct || x instanceof $Variant) {
            return x.$clone(binds);
        }
        else {
            throw new $Panic("invalid-clone", `Non-extensible value ${$meow.pprint(x)}`);
        }
    }
    assert_fail(tag, expr, source = null) {
        throw new $AssertionFailed(tag ?? "", expr, source);
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
            try {
                await $meow.wait($meow.with_default_handlers(function* () {
                    return yield* x.fn();
                }));
                console.log(`[OK ] ${x.name}`);
            }
            catch (e) {
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
    *with_default_handlers(fn) {
        for (const handler of $default_handlers) {
            const cases = yield* handler.fn();
            yield new $InstallHandlerCasesSignal(cases);
        }
        return yield* fn();
    }
    async wait(gen) {
        let ctx = new $HandleStack(null, gen, {}, null);
        let result = ctx.gen.next();
        while (true) {
            if (result.done) {
                if (ctx.parent == null) {
                    return result.value;
                }
                else {
                    ctx = ctx.parent;
                    result = ctx.gen.next(result.value);
                }
            }
            else {
                const signal = result.value;
                if (signal instanceof $PanicSignal) {
                    throw signal.error;
                }
                else if (signal instanceof $AwaitSignal) {
                    const value = await signal.value;
                    result = ctx.gen.next(value);
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
                        return signal.value;
                    }
                    else {
                        ctx = ctx.abort_to;
                        result = ctx.gen.next(signal.value);
                    }
                }
                else if (signal instanceof $InstallHandlerCasesSignal) {
                    for (const [k, v] of Object.entries(signal.cases)) {
                        if (Object.hasOwn(ctx.cases, k)) {
                            throw new $Panic("duplicate-install-handler", `Scope already has a handler defined for ${k} (${ctx.cases[k].name}), but a new one (${v.name}) was installed.`);
                        }
                        ctx.cases[k] = v;
                    }
                    result = ctx.gen.next(null);
                }
                else {
                    throw new $Panic("unknown-signal", `Unknown signal in execution`, { signal });
                }
            }
        }
    }
    async run(args) {
        try {
            if (args.includes("--test")) {
                $stack.push("<runtime> run tests");
                return await $meow.run_tests();
            }
            else {
                $stack.push("<runtime> main entry point");
                return await $meow.wait($meow.with_default_handlers(function* () {
                    return yield* $meow.call("main()/1", args);
                }));
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
$meow.deftype("i64", $type("integer", (x) => typeof x === "bigint", 0));
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
$meow.deftype("grapheme-cluster", $type("grapheme-cluster", (x) => x instanceof $Graphemes, 0));
$meow.deftype("record", $type("record", (x) => x instanceof $Record, 1));
$meow.deftype("static", $type("static", (x) => x instanceof $Static, 1));
//# sourceMappingURL=05-setup.js.map
void 0;
"use strict";
function $pprint(value, depth = 0, visited = new Set()) {
    if (visited.has(value)) {
        return "(circular)";
    }
    if (value === null) {
        return "nothing";
    }
    else if (typeof value === "string") {
        return JSON.stringify(value);
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
        const xs = value.map((x) => $pprint(x, depth + 1, visited));
        return `[${xs.join(", ")}]`;
    }
    else if (value instanceof Map) {
        visited.add(value);
        const xs = [];
        for (const [k, v] of value.entries()) {
            xs.push(`${$pprint(k, depth + 1, visited)}: ${$pprint(v, depth + 1, visited)}`);
        }
        return xs.length === 0 ? "[:]" : `[${xs.join(", ")}]`;
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
        const xs = [];
        for (const f of value.$fields) {
            xs.push(`${f}: ${$pprint(value[f], depth + 1, visited)}`);
        }
        return `${value.$name}(${xs.join(", ")})`;
    }
    else if (value instanceof $Variant) {
        const xs = [];
        for (const f of value.$fields) {
            xs.push(`${f}: ${$pprint(value[f], depth + 1, visited)}`);
        }
        return `${value.$name}..${value.$variant}(${xs.join(", ")})`;
    }
    else if (value instanceof $Static) {
        return String(value);
    }
    else if (value instanceof $Thunk) {
        visited.add(value);
        if (value._forced) {
            return `<thunk: ${$pprint(value._value, depth + 1, visited)}>`;
        }
        else {
            return `<thunk: (unevaluated)>`;
        }
    }
    else if (value instanceof $Cell) {
        visited.add(value);
        return `<cell: ${$pprint(value._value, depth + 1, visited)}>`;
    }
    else if (value instanceof $F64) {
        return `${value.value}f`;
    }
    else if (value instanceof $I32) {
        return `${value.value}s`;
    }
    else if (value instanceof $Record) {
        visited.add(value);
        const xs = [];
        for (const [k, v] of Object.entries(value.$dict)) {
            xs.push(`${k}: ${$pprint(v, depth + 1, visited)}`);
        }
        return `#(${xs.join(", ")})`;
    }
    else if (value instanceof $Graphemes) {
        return `grapheme-cluster(${JSON.stringify(value.cluster)})`;
    }
    return String(`<native: ${value}>`);
}
//# sourceMappingURL=06-pprint.js.map
void 0;
"use strict";
const $deep_eq = (l, r) => {
    if (Array.isArray(l) && Array.isArray(r)) {
        return l.length === r.length && l.every((x, i) => $deep_eq(x, r[i]));
    }
    else if (l instanceof Map && r instanceof Map) {
        if (l.size !== r.size)
            return false;
        for (const [k, v] of l.entries()) {
            if (!r.has(k))
                return false;
            const e = r.get(k);
            if (!$deep_eq(v, e))
                return false;
        }
        return true;
    }
    else if (l instanceof $Record && r instanceof $Record) {
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
const array_allocate = (size, x) => new Array(size).fill(x);
const array_at_put_mut = (x, i, v) => {
    x[i] = v;
    return x;
};
const array_at_put_all = (x, i, xs) => {
    for (let ox = 0; ox < xs.length; ++ox) {
        x[ox + i] = xs[ox];
    }
    return x;
};
const array_at_put_all_slice = (x, i, xs, start, end) => {
    for (let ox = 0; ox < end - start; ++ox) {
        x[ox + i] = xs[ox + start];
    }
    return x;
};
const array_fill = (x, v, start, end) => {
    for (let i = start; i < end; ++i) {
        x[i] = v;
    }
    return x;
};
const array_fill_all = (x, v) => {
    x.fill(v);
    return x;
};
const array_prepend_mut = (x, v) => {
    x.unshift(v);
    return x;
};
const array_append_mut = (x, v) => {
    x.push(v);
    return x;
};
const array_count = (x) => x.length;
const array_at = (x, i) => x[i];
const array_map = (x, fn) => x.map((x) => $meow.wait_sync(fn(x)));
const array_filter = (x, fn) => x.filter((x) => $meow.wait_sync(fn(x)));
const aray_some = (x, fn) => x.some((x) => $meow.wait_sync(fn(x)));
const array_all = (x, fn) => x.every((x) => $meow.wait_sync(fn(x)));
const array_fold_left = (x, init, fn) => x.reduce((p, x) => $meow.wait_sync(fn(p, x)), init);
const array_fold_right = (x, init, fn) => x.reduceRight((p, x) => $meow.wait_sync(fn(x, p)), init);
const array_flat_map = (x, fn) => x.flatMap((x) => $meow.wait_sync(fn(x)));
const array_slice = (x, start, end) => x.slice(start, end);
const array_slice_from = (x, start) => x.slice(start);
const array_slice_to = (x, end) => x.slice(end);
const array_concat = (x, y) => x.concat(y);
const array_remove_at = (x, i) => {
    const r = x.slice();
    r.splice(i, 1);
    return r;
};
const array_insert_before = (x, i, v) => {
    const r = x.slice();
    r.splice(i, 0, v);
    return r;
};
const array_insert_after = (x, i, v) => {
    const r = x.slice();
    r.splice(i + 1, 0, v);
    return r;
};
const array_at_put = (x, i, v) => {
    const r = x.slice();
    r[i] = v;
    return r;
};
const array_reverse = (x) => x.slice().reverse();
const array_sort_by = (x, fn) => x.toSorted(fn);
const array_zip_with = (x, y, fn) => x.map((a, i) => $meow.wait_sync(fn(a, y[i])));
const array_each = (x, fn) => {
    x.forEach((x) => $meow.wait_sync(fn(x)));
    return null;
};
const array_slice_eq = (x, xo, xl, y, yo, yl) => {
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
const array_materialise_slice = (x, offset, length) => x.slice(offset, offset + length);
//# sourceMappingURL=09-prim-array.js.map
void 0;
"use strict";
const binary_count = (x) => x.length;
const binary_at = (x, i) => x[i];
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
const binary_from_array = (x) => {
    return new Uint8Array(x);
};
const binary_clone = (x) => {
    return new Uint8Array(x);
};
const binary_fill = (x, v, from, to) => {
    x.fill(v, from, to);
    return x;
};
const binary_fill_all = (x, v) => {
    x.fill(v);
    return x;
};
const binary_put_all = (x, i, y) => {
    x.set(y, i);
    return x;
};
const binary_put_slice = (x, i, y, yo, yl) => {
    x.set(y.subarray(yo, yl), i);
    return x;
};
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
const binary_to_array = (x) => Array.from(x);
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
const map_keys = (x) => [...x.keys()];
const map_values = (x) => [...x.values()];
const map_entries = (x) => [...x.entries()].map((x) => $meow.record({ key: x[0], value: x[1] }));
const map_count = (x) => x.size;
const map_has = (x, k) => x.has(k);
const map_get = (x, k) => x.get(k);
const map_put = (x, k, v) => x.set(k, v);
const map_copy = (x) => new Map(x.entries());
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
const i64_parse = (x) => {
    try {
        return $meow.record({ ok: true, value: BigInt(x.replace(/_/g, "")) });
    }
    catch (_) {
        return $meow.record({ ok: false, reason: "not-integer" });
    }
};
const f64_parse = (x) => {
    const v = Number(x.replace(/_/g, ""));
    if (Number.isNaN(v) || !Number.isFinite(v)) {
        return $meow.record({ ok: false, reason: "not-float" });
    }
    else {
        return $meow.record({ ok: true, value: $meow.f64(v) });
    }
};
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
const text_count_code_units = (a) => a.length;
const text_repeat = (a, n) => a.repeat(n);
const text_concat = (a, b) => a + b;
const text_slice = (a, from, to) => a.slice(from, to);
const text_slice_from = (a, from) => a.slice(from);
const text_ends_with = (a, b) => a.endsWith(b);
const text_starts_with = (a, b) => a.startsWith(b);
const text_contains = (a, b) => a.includes(b);
const text_trim_start = (a) => a.trimStart();
const text_trim_end = (a) => a.trimEnd();
const text_trim = (a) => a.trim();
const text_utf8_bytes = (a) => new TextEncoder().encode(a);
const text_utf16_code_points = (a) => [...a].map((x) => x.codePointAt(0));
const text_graphemes = Intl?.Segmenter
    ? (x) => [...new Intl.Segmenter().segment(x)].map((x) => new $Graphemes(x.segment))
    : (x) => [...x].map((x) => new $Graphemes(x));
const text_from_utf8_bytes = (x) => {
    try {
        return new TextDecoder().decode(x);
    }
    catch (_) {
        return null;
    }
};
const text_from_code_points = (a) => {
    try {
        return String.fromCodePoint(...a);
    }
    catch (_) {
        return null;
    }
};
const text_lines = (a) => a.split(/\r\n|\r|\n/);
//# sourceMappingURL=09-prim-text.js.map