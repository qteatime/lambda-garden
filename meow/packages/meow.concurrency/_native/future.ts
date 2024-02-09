const deferred = $meow.def_foreign_type<CDeferred>(
  "native-deferred",
  (x) => x instanceof CDeferred
);
const promise = $meow.def_foreign_type<Promise<any>>("native-promise", (x) => x instanceof Promise);

const WARN_ON_STATE_CHANGE = false;

type Res<T, E> = { ok: true; value: T } | { ok: false; value: E };

class CDeferred<T = unknown, E = unknown> {
  public _resolved = false;
  public _value: Res<T, E> = null as any;
  public _resolve: (_: Res<T, E>) => void = null as any;
  public promise: Promise<Res<T, E>>;

  constructor() {
    this.promise = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }

  resolve(value: Res<T, E>) {
    if (this._resolved) {
      if (WARN_ON_STATE_CHANGE) console.trace(`WARN: deferred cancel() called after settled`);
      return;
    }
    this._resolved = true;
    this._value = value;
    this._resolve(value);
  }
}

module.exports = {
  *future__defer<T, E>() {
    return deferred.box(new CDeferred<T, E>());
  },

  *future__resolve<T, E>(self0: $Foreign<CDeferred>, x: Res<T, E>) {
    const self = deferred.unbox(self0);
    self.resolve(x);
  },

  *future__state(self0: $Foreign<CDeferred>) {
    const self = deferred.unbox(self0);
    return $meow.record({
      resolved: self._resolved,
      value: self._value,
    });
  },

  *future__promise(self0: $Foreign<CDeferred>) {
    return promise.box(deferred.unbox(self0).promise);
  },

  *future__wait(self0: $Foreign<Promise<unknown>>): MeowGen {
    return yield $meow.wait_promise(promise.unbox(self0));
  },

  *process__fate(process: $Process) {
    return promise.box(
      process.resolver.promise.then((x) => {
        return $meow.record(x);
      })
    );
  },

  *future__wait_settled(promise0: $Foreign<Promise<unknown>>, fn: MeowFn) {
    return promise.unbox(promise0).then(async (value) => {
      return await $run_wait(fn(value)).then((x) => {
        if (x.ok) {
          return x.value;
        } else {
          throw x.reason;
        }
      });
    });
  },
};
