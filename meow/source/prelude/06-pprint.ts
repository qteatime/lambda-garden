function $pprint(
  value: any,
  depth = 0,
  visited = new Set<unknown>(),
  flat: boolean = false
): string {
  const pad = (x: string, n: number = 2) => {
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
  } else if (typeof value === "string") {
    if (value.length < 50) {
      return JSON.stringify(value);
    } else {
      return JSON.stringify(value.slice(0, 50)) + `<${value.length} units>`;
    }
  } else if (typeof value === "number") {
    return `${value}`;
  } else if (typeof value === "bigint") {
    return `${value}L`;
  } else if (typeof value === "boolean") {
    return `${value}`;
  } else if (Array.isArray(value)) {
    visited.add(value);
    const xs0 = value.map((x) => $pprint(x, depth + 1, visited, flat));
    const xs = xs0.slice(0, 10);
    if (xs0.length > xs.length) {
      xs.push(`...(${xs0.length} items)`);
    }
    const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
    if (len > 40) {
      return `[\n${xs.map((x) => pad(x, 2)).join(",\n")}\n]`;
    } else {
      return `[${xs.join(", ")}]`;
    }
  } else if (value instanceof Map) {
    visited.add(value);
    const xs0: string[] = [];
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
    } else if (len > 40) {
      return `[\n${xs.map((x) => pad(x, 2)).join(",\n")}\n]`;
    } else {
      return `[${xs.join(", ")}]`;
    }
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
    const xs0: string[] = [];
    for (const f of value.$fields) {
      xs0.push(`${f}: ${$pprint((value as any)[f], depth + 1, visited, flat)}`);
    }
    const xs = xs0.slice(0, 10);
    if (xs0.length > xs.length) {
      xs.push(`...(${xs0.length} items)`);
    }
    const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
    if (len < 40) {
      return `${value.$name}(${xs.join(", ")})`;
    } else {
      return `${value.$name}(\n${xs.map((x) => pad(x, 2)).join(",\n")}\n)`;
    }
  } else if (value instanceof $Variant) {
    const xs0: string[] = [];
    for (const f of value.$fields) {
      xs0.push(`${f}: ${$pprint((value as any)[f], depth + 1, visited, flat)}`);
    }
    const xs = xs0.slice(0, 10);
    if (xs0.length > xs.length) {
      xs.push(`...(${xs0.length} items)`);
    }
    const len = xs.map((x) => x.length).reduce((a, b) => a + b, 0);
    if (len < 40) {
      return `${value.$name}..${value.$variant}(${xs.join(", ")})`;
    } else {
      return `${value.$name}..${value.$variant}(\n${xs.map((x) => pad(x, 2)).join("\n,")}\n)`;
    }
  } else if (value instanceof $Static) {
    return String(value);
  } else if (value instanceof $Thunk) {
    visited.add(value);
    if (value._forced) {
      return `<thunk: ${$pprint(value._value, depth + 1, visited, flat)}>`;
    } else {
      return `<thunk: (unevaluated)>`;
    }
  } else if (value instanceof $Cell) {
    visited.add(value);
    return `<cell: ${$pprint(value._value, depth + 1, visited, flat)}>`;
  } else if (value instanceof $F64) {
    return `${value.value}f`;
  } else if (value instanceof $I32) {
    return `${value.value}s`;
  } else if (value instanceof $Record) {
    visited.add(value);
    const xs0: string[] = [];
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
    } else {
      return `#(\n${xs.map((x) => pad(x, 2)).join(",\n")}\n)`;
    }
  } else if (value instanceof $Foreign) {
    return value.$type.name;
  } else if (value instanceof $Asset) {
    return `${value.name}(${Array.from(value.data.slice(0, 10)).join(", ")} (${
      value.data.length
    } bytes))`;
  } else if (value instanceof $Process) {
    return `<process ${value.name} (${value.alive ? "alive" : "dead"})>`;
  }

  return String(`<native: ${value}>`);
}
