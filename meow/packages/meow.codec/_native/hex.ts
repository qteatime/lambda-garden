function from_digit(x: string) {
  switch (x) {
    case "0":
      return 0;
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
    case "a":
      return 10;
    case "b":
      return 11;
    case "c":
      return 12;
    case "d":
      return 13;
    case "e":
      return 14;
    case "f":
      return 15;
    default:
      throw new Error(`Invalid hex digit ${x}`);
  }
}

module.exports = {
  *hex__encode(bytes: Uint8Array) {
    return Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("");
  },

  *hex__decode(str: string) {
    if (str.length % 2 !== 0) {
      throw new Error(`Invalid hex text`);
    }
    const bytes = new Uint8Array(str.length / 2);
    for (let i = 0; i < str.length / 2; ++i) {
      const b0 = from_digit(str[i * 2]);
      const b1 = from_digit(str[i * 2 + 1]);
      bytes[i] = b0 * 16 + b1;
    }
    return bytes;
  },
};
