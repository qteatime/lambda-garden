const binary_count = (x: Uint8Array) => x.length;

const binary_at = (x: Uint8Array, i: number) => x[i];

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

const binary_allocate = (size: number, value: number) => {
  if (value === 0) {
    return new Uint8Array(size);
  } else {
    const v = new Uint8Array(size);
    v.fill(value);
    return v;
  }
};

const binary_from_array = (x: number[]) => {
  return new Uint8Array(x);
};

const binary_clone = (x: Uint8Array) => {
  return new Uint8Array(x);
};

const binary_fill = (x: Uint8Array, v: number, from: number, to: number) => {
  x.fill(v, from, to);
  return x;
};

const binary_fill_all = (x: Uint8Array, v: number) => {
  x.fill(v);
  return x;
};

const binary_put_all = (x: Uint8Array, i: number, y: Uint8Array) => {
  x.set(y, i);
  return x;
};

const binary_put_slice = (x: Uint8Array, i: number, y: Uint8Array, yo: number, yl: number) => {
  x.set(y.subarray(yo, yl), i);
  return x;
};

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

const binary_to_array = (x: Uint8Array) => Array.from(x);
