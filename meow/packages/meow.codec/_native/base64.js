module.exports = {
  *base64__encode(x) {
    const str = Array.from(x, (v) => String.fromCharCode(v)).join("");
    return globalThis.btoa(str);
  },

  *base64__decode(x) {
    return new Uint8Array(
      globalThis
        .atob(x)
        .split("")
        .map((x) => x.charCodeAt(0))
    );
  },

  *hex__encode(bytes) {
    return Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("");
  },

  *hex__decode(str) {
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

function from_digit(x) {
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
