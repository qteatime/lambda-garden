"use strict";
module.exports = {
    *base64__encode(x) {
        const str = Array.from(x, (v) => String.fromCharCode(v)).join("");
        return globalThis.btoa(str);
    },
    *base64__decode(x) {
        return new Uint8Array(globalThis
            .atob(x)
            .split("")
            .map((x) => x.charCodeAt(0)));
    },
};
