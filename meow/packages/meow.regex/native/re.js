const re = $meow.def_foreign_type("compiled-regex", (x) => x instanceof RegExp);
const match = $meow.def_foreign_type("regex-match", (x) => x instanceof RegexMatch);

module.exports = {
  *re__compile(code, flags) {
    return re.box(new RegExp(code, flags));
  },
  *re__test(code0, text) {
    const code = re.unbox(code0);
    return code.test(text);
  },
  *re__split(code0, text) {
    const code = re.unbox(code0);
    return text.split(code);
  },
  *re__escape(text) {
    return text.replace(/(\W)/g, "\\$1");
  },
  *re__valid_regex(text) {
    try {
      new RegExp(text);
      return true;
    } catch (_) {
      return false;
    }
  },
  *re__valid_id(text) {
    return /^[a-zA-Z][a-zA-Z_0-9]*$/.test(text);
  },
};
