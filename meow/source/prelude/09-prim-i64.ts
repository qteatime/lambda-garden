// -- Arithmetic
const i64_add = (a: bigint, b: bigint) => a + b;

const i64_sub = (a: bigint, b: bigint) => a - b;

const i64_mul = (a: bigint, b: bigint) => a * b;

const i64_div = (a: bigint, b: bigint) => a / b;

const i64_pow = (a: bigint, b: bigint) => a ** b;

const i64_mod = (a: bigint, b: bigint) => a % b;

const i64_negate = (a: bigint) => -a;

// -- Relational
const i64_eq = (a: bigint, b: bigint) => a === b;

const i64_neq = (a: bigint, b: bigint) => a !== b;

const i64_gt = (a: bigint, b: bigint) => a > b;

const i64_gte = (a: bigint, b: bigint) => a >= b;

const i64_lt = (a: bigint, b: bigint) => a < b;

const i64_lte = (a: bigint, b: bigint) => a <= b;

// -- Bitwise
const i64_bshl = (a: bigint, b: bigint) => a << b;

const i64_bashr = (a: bigint, b: bigint) => a >> b;

const i64_band = (a: bigint, b: bigint) => a & b;

const i64_bor = (a: bigint, b: bigint) => a | b;

const i64_bxor = (a: bigint, b: bigint) => a ^ b;

const i64_bnot = (a: bigint) => ~a;

// -- Conversions
const i64_to_text = (a: bigint) => String(a);

const i64_to_i32 = (a: bigint) => Number(a) | 0;

const i64_to_int = (a: bigint) => Number(a);

const i64_to_f64 = (a: bigint) => new $F64(Number(a));

const i64_to_bool = (a: bigint) => Boolean(a);
