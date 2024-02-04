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
  effect(name: string) {
    return this.resolve(name, $effects);
  }
  handler(name: string) {
    return this.resolve(name, $handlers);
  }
}
let $scope: $Scope = new $Scope(null, null, null, ["meow.core"]);
