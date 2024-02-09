"use strict";
const deferred = $meow.def_foreign_type("native-deferred", (x) => x instanceof CDeferred);
const promise = $meow.def_foreign_type("native-promise", (x) => x instanceof Promise);
const WARN_ON_STATE_CHANGE = false;
class CDeferred {
    constructor() {
        this._resolved = false;
        this._value = null;
        this._resolve = null;
        this.promise = new Promise((resolve) => {
            this._resolve = resolve;
        });
    }
    resolve(value) {
        if (this._resolved) {
            if (WARN_ON_STATE_CHANGE)
                console.trace(`WARN: deferred cancel() called after settled`);
            return;
        }
        this._resolved = true;
        this._value = value;
        this._resolve(value);
    }
}
module.exports = {
    *future__defer() {
        return deferred.box(new CDeferred());
    },
    *future__resolve(self0, x) {
        const self = deferred.unbox(self0);
        self.resolve(x);
    },
    *future__state(self0) {
        const self = deferred.unbox(self0);
        return $meow.record({
            resolved: self._resolved,
            value: self._value,
        });
    },
    *future__promise(self0) {
        return promise.box(deferred.unbox(self0).promise);
    },
    *future__wait(self0) {
        return yield $meow.wait_promise(promise.unbox(self0));
    },
    *process__fate(process) {
        return promise.box(process.resolver.promise.then((x) => {
            return $meow.record(x);
        }));
    },
    *future__wait_settled(promise0, fn) {
        return promise.unbox(promise0).then(async (value) => {
            return await $run_wait(fn(value)).then((x) => {
                if (x.ok) {
                    return x.value;
                }
                else {
                    throw x.reason;
                }
            });
        });
    },
};
