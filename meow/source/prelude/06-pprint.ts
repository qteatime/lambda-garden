function $pprint(value: any, depth = 0, visited = new Set<unknown>()): string {
  if (visited.has(value)) {
    return "(circular)";
  }
  if (value === null) {
    return "nothing";
  } else if (typeof value === "string") {
    return JSON.stringify(value);
  } else if (typeof value === "number") {
    return `${value}`;
  } else if (typeof value === "bigint") {
    return `${value}L`;
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
  } else if (value instanceof $I32) {
    return `${value.value}s`;
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
