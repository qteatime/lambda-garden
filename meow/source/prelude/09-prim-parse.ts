const int_parse = (x: string) => {
  const n = Number(x.replace(/_/g, ""));
  const v = Math.max(Number.MIN_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n)));
  if (Number.isNaN(n) || Math.floor(n) !== n) {
    return $meow.record({ ok: false, reason: "not-integer" });
  } else if (v !== n) {
    return $meow.record({ ok: false, reason: "out-of-range" });
  } else {
    return $meow.record({ ok: true, value: v });
  }
};

const i64_parse = (x: string) => {
  try {
    return $meow.record({ ok: true, value: BigInt(x.replace(/_/g, "")) });
  } catch (_) {
    return $meow.record({ ok: false, reason: "not-integer" });
  }
};

const f64_parse = (x: string) => {
  const v = Number(x.replace(/_/g, ""));
  if (Number.isNaN(v) || !Number.isFinite(v)) {
    return $meow.record({ ok: false, reason: "not-float" });
  } else {
    return $meow.record({ ok: true, value: $meow.f64(v) });
  }
};

const text_parse = (x: string) => {
  try {
    const text = x
      .trim()
      .replace(/[\u0000-\u001f]/g, (x) => `\\u${x.charCodeAt(0).toString(16).padStart(4, "0")}`);
    return $meow.record({ ok: true, value: JSON.parse(text) });
  } catch (_) {
    return $meow.record({ ok: false, reason: "not-text" });
  }
};
