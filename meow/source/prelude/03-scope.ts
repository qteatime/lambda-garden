class $Scope {
  readonly pkg_aliases = new Map<string, string>();
  readonly ns_aliases = new Map<string, string>();
  readonly ns_prefixes: string[] = [];
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

  resolve_ns(ns: string): [string, boolean] {
    const names = ns.split(".");
    if (names.length === 1) {
      return [ns, false];
    } else {
      const [alias, ...rest] = names;
      const expanded = this.ns_aliases.get(alias);
      if (expanded == null) {
        return [ns, false];
      } else {
        return [[expanded, ...rest].join("."), true];
      }
    }
  }

  resolve<A>(name0: string, box: Map<string, A>): string {
    if (name0.includes("/")) {
      if (this.pkg_aliases.size === 0) {
        return name0;
      } else {
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
    } else {
      return name;
    }
  }

  in_namespace(ns: string, fn: (_: $Scope) => void) {
    const scope = new $Scope(this, this.pkg, this.ns == null ? ns : `${this.ns}.${ns}`, []);
    fn(scope);
  }

  open_namespace(ns: string, alias: string) {
    if (this.ns_aliases.has(alias)) {
      throw new $Panic(
        "duplicate-ref",
        `Duplicate alias ${alias} already refers to ${this.ns_aliases.get(ns)}`
      );
    }
    this.ns_aliases.set(alias, ns);
  }

  open_pkg(name: string, alias: string | null) {
    if (alias == null) {
      if (this.pkg_prefixes.includes(name) && name !== "meow.core") {
        throw new $Panic("invalid-state", `Package ${name} is already open`);
      }
      this.pkg_prefixes.push(name);
    } else {
      if (this.pkg_aliases.has(alias)) {
        throw new $Panic(
          "duplicate-ref",
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
  rtrait(name: string) {
    return this.resolve(name, $traits);
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
  is(value: $Value, type: string) {
    return $meow.is(value, this.resolve(type, $types));
  }
  is_variant(value: $Value, type: string, variant: string) {
    return $meow.is_variant(value, this.resolve(type, $types), variant);
  }
  has_trait(value: $Value, trait: string) {
    return $meow.has_trait(value, this.resolve(trait, $traits));
  }
  effect(name: string) {
    return this.resolve(name, $effects);
  }
  handler(name: string) {
    return this.resolve(name, $handlers);
  }
}
let $scope: $Scope = new $Scope(null, null, null, ["meow.core"]);
