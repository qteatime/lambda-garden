module.exports = {
  *js__assert_generator(x) {
    if (x == null || !(typeof x.next === "function")) {
      throw new $Panic("invalid-type", `Expected a generator`);
    }
    return x;
  },

  *js__gen_next(x) {
    const result = x.next();
    if (result.done) {
      return $meow.record({ ok: false, value: null });
    } else {
      return $meow.record({ ok: true, value: result.value });
    }
  },

  *js__gen_sample() {
    const gen = function* () {
      yield 1;
      yield 2;
      yield 3;
      return "no";
    };
    return gen();
  },
};
