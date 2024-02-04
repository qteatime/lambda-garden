const panic_raise = (tag: string, msg: string, data: unknown) => {
  throw new $Panic(tag, msg, data);
};

const panic_catch = (block: MeowFn) => {
  return function* () {
    try {
      const value = yield* block();
      return $meow.record({ ok: true, value: value });
    } catch (e) {
      if (e instanceof $Panic) {
        return $meow.record({
          ok: false,
          reason: $meow.record({
            tag: e.tag,
            message: e.msg,
          }),
        });
      } else {
        return $meow.record({
          ok: false,
          reason: $meow.record({
            tag: "native-error",
            message: String(e),
          }),
        });
      }
    }
  };
};
