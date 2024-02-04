function parse_iso(text) {
  const m = [
    [
      /^(\d+)-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d+)Z$/,
      (_, y, m, d, h, mm, ss, ms) => [+y, +m, +d, +h, +mm, +ss, +ms],
    ],
    [
      /^(\d+)-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/,
      (_, y, m, d, h, mm, ss) => [+y, +m, +d, +h, +mm, +ss, 0],
    ],
    [/^(\d+)-(\d{2})-(\d{2})$/, (_, y, m, d) => [+y, +m, +d, 0, 0, 0, 0]],
  ];

  for (const [re, f] of m) {
    const match = text.match(re);
    if (match != null) {
      const [Y, M, D, h, m, s, ms] = f(...match);
      return new Date(Date.UTC(Y, M - 1, D, h, m, s, ms));
    }
  }

  return null;
}

module.exports = {
  *instant__from_iso(source) {
    const date = parse_iso(source);
    if (date == null) {
      return null;
    } else {
      return BigInt(date.getTime());
    }
  },

  *instant__to_iso(time) {
    const d = new Date(Number(time));
    const p = (n, x) => String(x).padStart(n, "0");
    const yy = d.getUTCFullYear();
    const mm = d.getUTCMonth() + 1;
    const dd = d.getUTCDate();
    const h = d.getUTCHours();
    const m = d.getUTCMinutes();
    const s = d.getUTCSeconds();
    const ms = d.getUTCMilliseconds();
    return `${yy}-${p(2, mm)}-${p(2, dd)}T${p(2, h)}:${p(2, m)}:${p(2, s)}.${p(3, ms)}Z`;
  },

  *clock__now() {
    return BigInt(new Date().getTime());
  },
};
