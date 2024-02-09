"use strict";
module.exports = {
    process__id(x) {
        return x.id;
    },
    *process__alive(x) {
        return x.alive;
    },
    *process__yield() {
        return yield $meow.yield();
    },
    *process__spawn(fn, name) {
        const process = $spawn_process($with_default_handlers(fn()), name);
        return process;
    },
    *process__wait(x) {
        if (x === $current_process) {
            throw new $Panic("invalid-wait", `Cannot wait process ${x.name} because it's the current process`);
        }
        return yield $meow.wait_promise(x.resolver.promise.then((x) => $meow.record(x)));
    },
    *process__wait_timeout(x, time_ms) {
        if (x === $current_process) {
            throw new $Panic("invalid-wait", `Cannot wait process ${x.name} because it's the current process`);
        }
        return yield $meow.wait_promise(Promise.race([
            x.resolver.promise.then((x) => {
                if (x.ok) {
                    return $meow.record(x);
                }
                else {
                    return $meow.record({
                        ok: false,
                        reason: $meow.record({ kind: "native", value: x.reason }),
                    });
                }
            }),
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve($meow.record({ ok: false, reason: $meow.record({ kind: "timeout" }) }));
                }, time_ms);
            }),
        ]));
    },
    *process__get_current() {
        return $current_process;
    },
    *process__show_native_error(x) {
        return $meow_format_error(x);
    },
    *process__sleep(ms) {
        yield $meow.wait_promise(new Promise((resolve) => setTimeout(() => resolve(null), Math.max(ms, 10))));
        return null;
    },
};
