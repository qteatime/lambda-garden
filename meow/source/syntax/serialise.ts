import * as Ast from "./parser";
const OhmInterval = require("ohm-js/src/Interval");

export function to_json(x: unknown): any {
  if (x === null) {
    return null;
  }
  if (typeof x === "boolean" || typeof x === "number" || typeof x === "string") {
    return x;
  }
  if (typeof x === "bigint") {
    return { "@type": "bigint", value: String(x) };
  }
  if (Array.isArray(x)) {
    return x.map(to_json);
  }
  if (x instanceof Ast.Meta) {
    return { "@type": "meta", position: x.position, range: x.range };
  }
  if (x instanceof Ast.$$MExpr$_Assert) {
    const a = to_json(x.info);
    if (a != null && x.info != null) {
      a.source = x.info.formatted_position_message;
    }
    return {
      "@type": "node",
      "@tag": x.constructor.name,
      data: {
        info: a,
        expr: to_json(x.expr),
        atag: to_json(x.atag),
      },
    };
  }
  if (x instanceof Ast.Node) {
    return {
      "@type": "node",
      "@tag": x.constructor.name,
      tag: (x as any).tag,
      data: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, to_json(v)])),
    };
  }
  throw new Error(`Unsupported value ${x}`);
}

export function from_json(x: any, source: string): any {
  if (x === null) {
    return null;
  }
  if (typeof x === "boolean" || typeof x === "number" || typeof x === "string") {
    return x;
  }
  if (Array.isArray(x)) {
    return x.map((v) => from_json(v, source));
  }
  if (x["@type"] === "bigint") {
    return BigInt(x.value);
  }
  if (x["@type"] === "meta") {
    const interval = new OhmInterval(source, x.range.start, x.range.end);
    return new Ast.Meta(interval);
  }
  if (x["@type"] === "node") {
    const m = Object.fromEntries(Object.entries(x.data).map(([k, v]) => [k, from_json(v, source)]));
    m.tag = x.tag;
    Object.setPrototypeOf(m, (Ast as any)[x["@tag"]].prototype);
    return m;
  }
  throw new Error(`Unsupported value ${x}`);
}
