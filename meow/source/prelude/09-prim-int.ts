// -- Arithmetic
const int_add = (a: number, b: number) => a + b;

const int_sub = (a: number, b: number) => a - b;

const int_mul = (a: number, b: number) => a * b;

const int_div = (a: number, b: number) => Math.floor(a / b);

const int_pow = (a: number, b: number) => a ** b;

const int_mod = (a: number, b: number) => a % b;

const int_negate = (a: number) => -a;

// -- Relational
const int_eq = (a: number, b: number) => a === b;

const int_neq = (a: number, b: number) => a !== b;

const int_lt = (a: number, b: number) => a < b;

const int_lte = (a: number, b: number) => a <= b;

const int_gt = (a: number, b: number) => a > b;

const int_gte = (a: number, b: number) => a >= b;

// -- Bitwise
const int_bshl = (a: number, b: number) => a << b;

const int_bashr = (a: number, b: number) => a >> b;

const int_blshr = (a: number, b: number) => a >>> b;

const int_band = (a: number, b: number) => a & b;

const int_bor = (a: number, b: number) => a | b;

const int_bxor = (a: number, b: number) => a ^ b;

const int_bnot = (a: number) => ~a;

// -- Conversions
const int_to_text = (a: number) => String(a);

const int_to_i64 = (a: number) => BigInt(a);

const int_to_bool = (a: number) => Boolean(a);

const int_to_f64 = (a: number) => new $F64(a);

const int_to_i32 = (a: number) => new $I32(a);

// -- Bounds
const int_max = () => Number.MAX_SAFE_INTEGER;
const int_min = () => Number.MIN_SAFE_INTEGER;
