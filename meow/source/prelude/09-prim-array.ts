const array_allocate = (size: number, x: $Value) => new Array(size).fill(x);

const array_at_put_mut = (x: $Value[], i: number, v: $Value) => {
  x[i] = v;
  return x;
};

const array_at_put_all = (x: $Value[], i: number, xs: $Value[]) => {
  for (let ox = 0; ox < xs.length; ++ox) {
    x[ox + i] = xs[ox];
  }
  return x;
};

const array_at_put_all_slice = (
  x: $Value[],
  i: number,
  xs: $Value[],
  start: number,
  end: number
) => {
  for (let ox = 0; ox < end - start; ++ox) {
    x[ox + i] = xs[ox + start];
  }
  return x;
};

const array_fill = (x: $Value[], v: $Value, start: number, end: number) => {
  for (let i = start; i < end; ++i) {
    x[i] = v;
  }
  return x;
};

const array_fill_all = (x: $Value[], v: $Value) => {
  x.fill(v);
  return x;
};

const array_prepend_mut = (x: $Value[], v: $Value) => {
  x.unshift(v);
  return x;
};

const array_append_mut = (x: $Value[], v: $Value) => {
  x.push(v);
  return x;
};

const array_count = (x: $Value[]) => x.length;

const array_at = (x: $Value[], i: number) => x[i];

const array_map = (x: $Value[], fn: MeowFn) => x.map((x) => $meow.wait_sync(fn(x)));

const array_filter = (x: $Value[], fn: MeowFn) => x.filter((x) => $meow.wait_sync(fn(x)));

const aray_some = (x: $Value[], fn: MeowFn) => x.some((x) => $meow.wait_sync(fn(x)));

const array_all = (x: $Value[], fn: MeowFn) => x.every((x) => $meow.wait_sync(fn(x)));

const array_fold_left = (x: $Value[], init: $Value, fn: MeowFn) =>
  x.reduce((p, x) => $meow.wait_sync(fn(p, x)) as any, init);

const array_fold_right = (x: $Value[], init: $Value, fn: MeowFn) =>
  x.reduceRight((p, x) => $meow.wait_sync(fn(x, p)) as any, init);

const array_flat_map = (x: $Value[], fn: MeowFn) => x.flatMap((x) => $meow.wait_sync(fn(x)));

const array_slice = (x: $Value[], start: number, end: number) => x.slice(start, end);

const array_slice_from = (x: $Value[], start: number) => x.slice(start);

const array_slice_to = (x: $Value[], end: number) => x.slice(end);

const array_concat = (x: $Value[], y: $Value[]) => x.concat(y);

const array_remove_at = (x: $Value[], i: number) => {
  const r = x.slice();
  r.splice(i, 1);
  return r;
};

const array_insert_before = (x: $Value[], i: number, v: $Value) => {
  const r = x.slice();
  r.splice(i, 0, v);
  return r;
};

const array_insert_after = (x: $Value[], i: number, v: $Value) => {
  const r = x.slice();
  r.splice(i + 1, 0, v);
  return r;
};

const array_at_put = (x: $Value[], i: number, v: $Value) => {
  const r = x.slice();
  r[i] = v;
  return r;
};

const array_reverse = (x: $Value[]) => x.slice().reverse();

const array_sort_by = (x: $Value[], fn: (a: $Value, b: $Value) => number) => x.toSorted(fn);

const array_zip_with = (x: $Value[], y: $Value[], fn: MeowFn) =>
  x.map((a, i) => $meow.wait_sync(fn(a, y[i])));

const array_each = (x: $Value[], fn: MeowFn) => {
  x.forEach((x) => $meow.wait_sync(fn(x)));
  return null;
};

const array_slice_eq = (
  x: $Value[],
  xo: number,
  xl: number,
  y: $Value[],
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

const array_materialise_slice = (x: $Value[], offset: number, length: number) =>
  x.slice(offset, offset + length);
