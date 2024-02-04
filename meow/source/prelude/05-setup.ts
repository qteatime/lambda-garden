$meow.deftype(
  "i32",
  $type("i32", (x) => x instanceof $I32, 0)
);
$meow.deftype(
  "i64",
  $type("integer", (x) => typeof x === "bigint", 0)
);
$meow.deftype(
  "int",
  $type("int", (x) => typeof x === "number", 0)
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
$meow.deftype(
  "static",
  $type("static", (x) => x instanceof $Static, 1)
);
