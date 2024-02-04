// -- Arithmetic
const i32_add = (a: $I32, b: $I32) => new $I32(((a.value | 0) + (b.value | 0)) | 0);

const i32_sub = (a: $I32, b: $I32) => new $I32(((a.value | 0) - (b.value | 0)) | 0);

const i32_mul = (a: $I32, b: $I32) => new $I32(((a.value | 0) * (b.value | 0)) | 0);

const i32_div = (a: $I32, b: $I32) => new $I32(((a.value | 0) / (b.value | 0)) | 0);

const i32_pow = (a: $I32, b: $I32) => new $I32(((a.value | 0) ** (b.value | 0)) | 0);

const i32_mod = (a: $I32, b: $I32) => new $I32((a.value | 0) % (b.value | 0) | 0);

const i32_negate = (a: $I32) => new $I32(-a.value);

// -- Relational
const i32_eq = (a: $I32, b: $I32) => (a.value | 0) === (b.value | 0);

const i32_neq = (a: $I32, b: $I32) => (a.value | 0) !== (b.value | 0);

const i32_lt = (a: $I32, b: $I32) => (a.value | 0) < (b.value | 0);

const i32_lte = (a: $I32, b: $I32) => (a.value | 0) <= (b.value | 0);

const i32_gt = (a: $I32, b: $I32) => (a.value | 0) > (b.value | 0);

const i32_gte = (a: $I32, b: $I32) => (a.value | 0) >= (b.value | 0);

// -- Bitwise
const i32_bshl = (a: $I32, b: $I32) => new $I32((a.value | 0) << (b.value | 0));

const i32_bashr = (a: $I32, b: $I32) => new $I32((a.value | 0) >> (b.value | 0));

const i32_blshr = (a: $I32, b: $I32) => new $I32((a.value | 0) >>> (b.value | 0));

const i32_band = (a: $I32, b: $I32) => new $I32((a.value | 0) & (b.value | 0));

const i32_bor = (a: $I32, b: $I32) => new $I32(a.value | 0 | (b.value | 0));

const i32_bxor = (a: $I32, b: $I32) => new $I32((a.value | 0) ^ (b.value | 0));

const i32_bnot = (a: $I32) => new $I32(~a.value);

// -- Conversions
const i32_to_text = (a: $I32) => String(a.value);

const i32_to_int = (a: $I32) => a.value;

const i32_to_i64 = (a: $I32) => BigInt(a.value);

const i32_to_bool = (a: $I32) => Boolean(a.value);

const i32_to_f64 = (a: $I32) => new $F64(a.value);
