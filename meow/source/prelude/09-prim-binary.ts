const binary_allocate = (size: number, value: number) => {
  if (value === 0) {
    return new Uint8Array(size);
  } else {
    const v = new Uint8Array(size);
    v.fill(value);
    return v;
  }
};

const binary_copy = (x: Uint8Array) => new Uint8Array(x);
const binary_from_array = (x: Uint8Array) => new Uint8Array(x);
const binary_concat = (xs: Uint8Array[]) => {
  const size = xs.reduce((a, b) => b.length + a, 0);
  const r = new Uint8Array(size);
  let offset = 0;
  for (const x of xs) {
    r.set(x, offset);
    offset += x.length;
  }
  return r;
};

const binary_count = (x: Uint8Array) => x.length;

const binary_at = (x: Uint8Array, i: number) => {
  if (i < 0 || i >= x.length) {
    throw new $Panic("out-of-bounds", `Index ${i} out of bounds`, { array: x, index: i });
  }
  return x[i];
};

const binary_at_put = (x: Uint8Array, i: number, v: number) => {
  if (i < 0 || i >= x.length) {
    throw new $Panic("out-of-bounds", `Index ${i} out of bounds`, { array: x, index: i });
  }
  x[i] = v;
  return null;
};

const binary_at_put_all = (x: Uint8Array, i: number, y: Uint8Array) => {
  x.set(y, i);
  return null;
};

const binary_fill = (x: Uint8Array, v: number, from: number, to: number) => {
  if (from > to || from < 0 || to > x.length) {
    throw new $Panic("out-of-bounds", `Range [${from}, ${to}) out of bounds`, {
      array: x,
      from,
      to,
    });
  }
  x.fill(v, from, to);
  return null;
};

const binary_fill_all = (x: Uint8Array, v: number) => {
  x.fill(v);
  return null;
};

const binary_to_array = (x: Uint8Array) => Array.from(x);

// -- old
const binary_eq = (x: Uint8Array, y: Uint8Array) => {
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

const binary_slice_eq = (
  x: Uint8Array,
  xo: number,
  xl: number,
  y: Uint8Array,
  yo: number,
  yl: number
) => {
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

const binary_materialise_slice = (x: Uint8Array, offset: number, length: number) => {
  return x.slice(offset, offset + length);
};

const binary_clone = (x: Uint8Array) => {
  return new Uint8Array(x);
};

const binary_put_slice = (x: Uint8Array, i: number, y: Uint8Array, yo: number, yl: number) => {
  x.set(y.subarray(yo, yl), i);
  return x;
};
