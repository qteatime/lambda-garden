/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export function unreachable(x: never, message: string = "") {
  throw new Error(`Unreachable: ${x} (${message})`);
}

export function* zip<A, B>(as0: Iterable<A>, bs0: Iterable<B>) {
  const as = gen(as0);
  const bs = gen(bs0);

  while (true) {
    const a = as.next();
    const b = bs.next();
    if (!a.done && !b.done) {
      yield [a.value, b.value] as const;
    } else {
      break;
    }
  }
}

function* gen<A>(x: Iterable<A>) {
  yield* x;
}

export function* enumerate<A>(as: Iterable<A>) {
  let i = 0;
  for (const x of as) {
    yield [i, x] as const;
    i += 1;
  }
}

export function add_unique<K, V>(map: Map<K, V>, key: K, value: V) {
  if (map.has(key)) {
    throw new Error(`Duplicate key: ${key}`);
  }
  map.set(key, value);
}

function safe_inspect(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (_) {
    return String(value);
  }
}

export function check_type(spec: (_: unknown) => boolean, value: unknown) {
  if (!spec(value)) {
    throw new Error(`Invalid value: ${safe_inspect(value)}`);
  }
}

export const is = (a: unknown) => (b: unknown) => a === b;
export const is_string = (a: unknown) => typeof a === "string";
export const is_int32 = (a: unknown) => typeof a === "number" && (a | 0) === a;
export const is_bigint = (a: unknown) => typeof a === "bigint";
export const is_float = (a: unknown) => typeof a === "number";
export const is_bool = (a: unknown) => typeof a === "boolean";
export const is_null = (a: unknown) => a === null;
export const is_value = (a: unknown) =>
  is_string(a) || is_int32(a) || is_bigint(a) || is_float(a) || is_bool(a) || is_null(a);

export const is_array = (t: (_: unknown) => boolean) => (a: unknown) =>
  Array.isArray(a) && a.every(t);

export const is_object = (t: { [key: string]: (_: unknown) => boolean }) => (a: unknown) => {
  if (a == null || typeof a !== "object") {
    return false;
  }
  const v = a as { [key: string]: unknown };
  for (const [key, checker] of Object.entries(t)) {
    if (!checker(v[key])) {
      return false;
    }
  }
  return true;
};
