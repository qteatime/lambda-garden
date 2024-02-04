module.exports = {
  *date__year(x) {
    return BigInt(new Date(Number(x)).getUTCFullYear());
  },
  *date__month(x) {
    return BigInt(new Date(Number(x)).getUTCMonth() + 1);
  },
  *date__day(x) {
    return BigInt(new Date(Number(x)).getUTCDate());
  },
  *date__hours(x) {
    return BigInt(new Date(Number(x)).getUTCHours());
  },
  *date__minutes(x) {
    return BigInt(new Date(Number(x)).getUTCMinutes());
  },
  *date__seconds(x) {
    return BigInt(new Date(Number(x)).getUTCSeconds());
  },
  *date__milliseconds(x) {
    return BigInt(new Date(Number(x)).getUTCMilliseconds());
  },
  *date__instant(yy, mm, dd, h, m, s, ms) {
    const d = new Date(
      Date.UTC(Number(yy), Number(mm - 1n), Number(dd), Number(h), Number(m), Number(s), Number(ms))
    );
    d.setUTCFullYear(Number(yy));
    return BigInt(d.getTime());
  },
  *date__valid(yy, mm, dd) {
    const d = new Date(Date.UTC(Number(yy), Number(mm - 1n), Number(dd)));
    d.setUTCFullYear(Number(yy));
    return (
      BigInt(d.getUTCFullYear()) === yy &&
      BigInt(d.getUTCMonth() + 1) === mm &&
      BigInt(d.getUTCDate()) === dd
    );
  },
};
