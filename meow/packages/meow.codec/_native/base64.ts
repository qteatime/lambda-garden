module.exports = {
  *base64__encode(x: Uint8Array) {
    const str = Array.from(x, (v) => String.fromCharCode(v)).join("");
    return globalThis.btoa(str);
  },

  *base64__decode(x: string) {
    return new Uint8Array(
      globalThis
        .atob(x)
        .split("")
        .map((x) => x.charCodeAt(0))
    );
  },
};
