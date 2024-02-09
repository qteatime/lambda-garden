type MMap = Map<$Value, $Value>;

const map_from_entries = (entries: $Record[]) => {
  const map: MMap = new Map();
  for (const entry of entries) {
    map.set(entry.$dict["key"], entry.$dict["value"]);
  }
  return map;
};

const map_count = (x: MMap) => x.size;

const map_maybe_at = (x: MMap, k: $Value) => {
  const v = x.get(k);
  if (v === undefined) {
    return $meow.record({ ok: false, value: null });
  } else {
    return $meow.record({ ok: true, value: v });
  }
};

const map_at = (x: MMap, k: $Value) => {
  const v = x.get(k);
  if (v === undefined) {
    throw new $Panic("no-key", `No key ${$pprint(k)} in map`, { map: x, key: k });
  }
  return v;
};

const map_has_key = (x: MMap, k: $Value) => {
  return x.has(k);
};

const map_entries = (x: MMap) => {
  return (function* () {
    for (const [k, v] of x.entries()) {
      yield $meow.record({ key: k, value: v });
    }
  })();
};

const map_keys = (x: MMap) => x.keys();

const map_values = (x: MMap) => x.values();

const map_copy = (x: MMap) => new Map(x.entries());

const map_mut_put = (x: MMap, k: $Value, v: $Value) => {
  x.set(k, v);
  return null;
};

const map_mut_remove = (x: MMap, k: $Value) => {
  x.delete(k);
  return null;
};

const map_mut_clear = (x: MMap) => {
  x.clear();
  return null;
};
