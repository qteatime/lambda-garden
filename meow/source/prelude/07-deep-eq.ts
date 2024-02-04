const $deep_eq: (l: $Value, r: $Value) => boolean = (l: $Value, r: $Value) => {
  if (Array.isArray(l) && Array.isArray(r)) {
    return l.length === r.length && l.every((x, i) => $deep_eq(x, r[i]));
  } else if (l instanceof Map && r instanceof Map) {
    if (l.size !== r.size) return false;
    for (const [k, v] of l.entries()) {
      if (!r.has(k)) return false;
      const e = r.get(k)!;
      if (!$deep_eq(v, e)) return false;
    }
    return true;
  } else if (l instanceof $Record && r instanceof $Record) {
    const ld = l.$dict;
    const rd = r.$dict;
    const kd = Object.keys(ld);
    const kr = Object.keys(rd);
    if (kd.length !== kr.length) {
      return false;
    }
    for (const k of kd) {
      if (!$deep_eq(ld[k], rd[k])) {
        return false;
      }
    }
    return true;
  } else if (l instanceof $Static && r instanceof $Static) {
    return l.name === r.name;
  } else if (l instanceof $F64 && r instanceof $F64) {
    return l.value === r.value;
  } else if (l instanceof $I32 && r instanceof $I32) {
    return l.value === r.value;
  } else if (l instanceof Uint8Array && r instanceof Uint8Array) {
    if (l.length !== r.length) {
      return false;
    }
    for (let i = 0; i < l.length; ++i) {
      if (l[i] !== r[i]) {
        return false;
      }
    }
    return true;
  } else {
    return l === r;
  }
};

$meow.defun("==>()/2", [$meow.type("unknown"), $meow.type("unknown")], function* (a, b) {
  if (!$deep_eq(a, b)) {
    throw new $UnifyFailed(b, a);
  } else {
    return true;
  }
});
