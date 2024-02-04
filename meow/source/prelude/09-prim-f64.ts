// -- Arithmetic
const f64_add = (a: $F64, b: $F64) => new $F64(a.value + b.value);

const f64_sub = (a: $F64, b: $F64) => new $F64(a.value - b.value);

const f64_mul = (a: $F64, b: $F64) => new $F64(a.value * b.value);

const f64_div = (a: $F64, b: $F64) => new $F64(a.value / b.value);

const f64_idiv = (a: $F64, b: $F64) => new $F64(Math.floor(a.value / b.value));

const f64_pow = (a: $F64, b: $F64) => new $F64(a.value ** b.value);

const f64_mod = (a: $F64, b: $F64) => new $F64(a.value % b.value);

const f64_negate = (a: $F64) => new $F64(-a.value);

// -- Relational
const f64_eq = (a: $F64, b: $F64) => a.value === b.value;

const f64_neq = (a: $F64, b: $F64) => a.value !== b.value;

const f64_gt = (a: $F64, b: $F64) => a.value > b.value;

const f64_gte = (a: $F64, b: $F64) => a.value >= b.value;

const f64_lt = (a: $F64, b: $F64) => a.value < b.value;

const f64_lte = (a: $F64, b: $F64) => a.value <= b.value;

// -- Floating point
const f64_truncate = (a: $F64) => new $F64(Math.trunc(a.value));

const f64_floor = (a: $F64) => new $F64(Math.floor(a.value));

const f64_ceiling = (a: $F64) => new $F64(Math.ceil(a.value));

const f64_round = (a: $F64) => new $F64(Math.round(a.value));

const f64_is_nan = (a: $F64) => Number.isNaN(a.value);

const f64_is_finite = (a: $F64) => Number.isFinite(a.value);

const f64_nan = () => new $F64(NaN);

const f64_positive_inf = () => new $F64(Number.POSITIVE_INFINITY);

const f64_negative_inf = () => new $F64(Number.NEGATIVE_INFINITY);

const f64_max = () => new $F64(Number.MAX_VALUE);
const f64_min = () => new $F64(Number.MIN_VALUE);

// -- Conversions
const f64_to_text = (a: $F64) => String(a.value);

const f64_to_i32 = (a: $F64) => a.value | 0;

const f64_to_i64 = (a: $F64) => BigInt(Math.floor(a.value));

const f64_to_int = (a: $F64) => Math.floor(a.value);

const f64_to_bool = (a: $F64) => Boolean(a.value);
