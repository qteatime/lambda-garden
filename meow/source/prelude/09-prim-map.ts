type MMap = Map<$Value, $Value>;

const map_keys = (x: MMap) => [...x.keys()];

const map_values = (x: MMap) => [...x.values()];

const map_entries = (x: MMap) =>
  [...x.entries()].map((x) => $meow.record({ key: x[0], value: x[1] }));

const map_count = (x: MMap) => x.size;

const map_has = (x: MMap, k: $Value) => x.has(k);

const map_get = (x: MMap, k: $Value) => x.get(k);

const map_put = (x: MMap, k: $Value, v: $Value) => x.set(k, v);

const map_copy = (x: MMap) => new Map(x.entries());
