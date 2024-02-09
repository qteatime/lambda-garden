let $process_queue: { input: $Value; process: $Process }[] = []; // TODO: double-ended list
let $stuck_set = new Set<$Process>();
let $next_process_id = 0;
let $free_process_id: number[] = [];
let $queue_waiter = $defer<void>();
let $processes = new Map<number, $Process>();
let $current_process: $Process | null = null;
let $main_loop_running = false;

class $Process {
  readonly mailbox = [];
  public alive = true;
  public active = false;
  readonly resolver = $defer<{ ok: true; value: $Value } | { ok: false; reason: $Panic }>();
  public _name: string | null = null;
  constructor(readonly id: number, public context: $HandleStack) {}

  get name() {
    return this._name == null ? `anonymous(${this.id})` : `${this._name}(${this.id})`;
  }
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (_: T) => void;
  reject: (_: any) => void;
};

function $defer<T>() {
  const p: Deferred<T> = {} as any;
  p.promise = new Promise((resolve, reject) => {
    p.resolve = resolve;
    p.reject = reject;
  });
  return p;
}

async function $next_process(): Promise<{ input: $Value; process: $Process } | null> {
  if ($process_queue.length > 0) {
    return $process_queue.shift()!;
  } else if ($stuck_set.size > 0) {
    await $queue_waiter.promise;
    return $next_process();
  } else {
    return null;
  }
}

function $push_process(process: $Process, input: $Value) {
  $stuck_set.delete(process);
  if (!process.alive) {
    return;
  }

  $process_queue.push({ process, input });
  if ($process_queue.length === 1) {
    const p = $queue_waiter;
    $queue_waiter = $defer();
    p.resolve();
  }
}

function $mark_stuck_process(process: $Process, ctx: $HandleStack) {
  process.context = ctx;
  $stuck_set.add(process);
}

function $get_next_process_id() {
  if ($free_process_id.length !== 0) {
    return $free_process_id.pop()!;
  } else {
    return $next_process_id++;
  }
}

function $spawn_process(gen: MeowGen, name: string | null = null) {
  const id = $get_next_process_id();
  const process = new $Process(id, new $HandleStack(null, gen, {}, null));
  process._name = name;
  $processes.set(id, process);
  $push_process(process, null);
  return process;
}

function $resolve_process(process: $Process, value: $Value, ctx: $HandleStack) {
  process.resolver.resolve({ ok: true, value });
  process.alive = false;
  process.context = ctx;
  $free_process(process);
}

function $crash_process(process: $Process, reason: $Panic, ctx: $HandleStack) {
  process.resolver.resolve({ ok: false, reason });
  process.alive = false;
  process.context = ctx;
  $free_process(process);
}

function $free_process(process: $Process) {
  $processes.delete(process.id);
  $free_process_id.push(process.id);
  $stuck_set.delete(process);
}

function $with_default_handlers(gen: MeowGen) {
  return (function* () {
    for (const handler of $default_handlers) {
      const cases = yield* handler.fn();
      yield new $InstallHandlerCasesSignal(cases as any);
    }
    return yield* gen;
  })();
}

function $with_given_handlers(gen: MeowGen, handlers: $HandlerCases) {
  return (function* () {
    yield new $InstallHandlerCasesSignal(handlers);
    return yield* gen;
  })();
}

function $run(process: $Process, input: $Value) {
  if (!process.alive) {
    return true;
  }

  let ctx = process.context;
  try {
    let result = ctx.gen.next(input);
    while (true) {
      if (result.done) {
        if (ctx.parent == null) {
          $resolve_process(process, result.value, ctx);
          return true;
        } else {
          ctx = ctx.parent;
          result = ctx.gen.next(result.value);
        }
      } else {
        const signal = result.value;
        if (signal instanceof $PanicSignal) {
          $crash_process(process, signal.error, ctx);
          return false;
        } else if (signal instanceof $AwaitSignal) {
          $mark_stuck_process(process, ctx);
          signal.value.then(
            (value) => {
              $push_process(process, value);
            },
            (error) => {
              $crash_process(process, $meow_wrap_error(error), ctx);
            }
          );
          return false;
        } else if (signal instanceof $PerformSignal) {
          const { stack, handler } = ctx.find_handler(signal.name);
          const gen = handler(...signal.args);
          ctx = new $HandleStack(ctx, gen, {}, stack.parent);
          result = gen.next();
        } else if (signal instanceof $HandleSignal) {
          ctx = new $HandleStack(ctx, signal.gen, signal.cases, ctx.abort_to);
          result = ctx.gen.next();
        } else if (signal instanceof $ResumeSignal) {
          if (ctx.parent == null) {
            return signal.value;
          } else {
            ctx = ctx.parent;
            result = ctx.gen.next(signal.value);
          }
        } else if (signal instanceof $AbortSignal) {
          if (ctx.abort_to == null) {
            $resolve_process(process, signal.value, ctx);
            return true;
          } else {
            ctx = ctx.abort_to;
            result = ctx.gen.next(signal.value);
          }
        } else if (signal instanceof $InstallHandlerCasesSignal) {
          for (const [k, v] of Object.entries(signal.cases)) {
            if (Object.hasOwn(ctx.cases, k)) {
              const error = new $Panic(
                "duplicate-install-handler",
                `Scope already has a handler defined for ${k} (${ctx.cases[k].name}), but a new one (${v.name}) was installed.`
              );
              $crash_process(process, error, ctx);
              return true;
            }
            ctx.cases[k] = v;
          }
          result = ctx.gen.next(null);
        } else if (signal instanceof $YieldProcessSignal) {
          process.context = ctx;
          $push_process(process, null);
          return false;
        } else {
          const error = new $Panic("unknown-signal", `Unknown signal in execution`, { signal });
          $crash_process(process, error, ctx);
          return true;
        }
      }
    }
  } catch (error: any) {
    $crash_process(process, $meow_wrap_error(error), ctx);
    return true;
  }
}

async function $loop_run() {
  if ($main_loop_running) {
    throw new Error(`$loop_run() called twice`);
  }

  $main_loop_running = true;
  while (true) {
    // TODO: proper traces for the scheduler and stuff
    // console.debug(
    //   "tick:",
    //   $process_queue.map((x) => x.process.name),
    //   [...$stuck_set].map((x) => x.name)
    // );
    const next = await $next_process();
    // console.debug("next process:", next?.process.name, next?.input);
    if (next == null) {
      $main_loop_running = false;
      return;
    }
    $current_process = next.process;
    next.process.active = true;
    $run(next.process, next.input);
    next.process.active = false;
    $current_process = null;
  }
}

async function $run_throw(fn: MeowGen, name: string | null) {
  const process = $spawn_process(fn, name);
  return {
    process,
    result: process.resolver.promise.then((x) => {
      if (x.ok) {
        return x.value;
      } else {
        throw x.reason;
      }
    }),
  };
}

async function $run_wait(fn: MeowGen) {
  const process = $spawn_process(fn);
  return process.resolver.promise;
}

let $busy_id: any = null;
function $keep_alive(x: boolean) {
  clearInterval($busy_id);
  if (x) {
    $busy_id = setInterval(() => {}, 60_000);
  }
}
