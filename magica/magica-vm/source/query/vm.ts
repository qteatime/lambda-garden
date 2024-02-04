/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { unreachable } from "../utils";
import { QueryValue, Value, fresh } from "../values";
import { disasm_one } from "./disasm";
import { primitives } from "./prim";
import { Op, Program } from "./program";

enum ContTag {
  JUMP,
  SEARCH,
  OR,
  NOT,
}

type Continuation = CSearch | COr | CNot | CJump;

class CSearch {
  readonly tag = ContTag.SEARCH;
  constructor(readonly ip: number, readonly generator: Generator<Value[]>) {}
}

class COr {
  readonly tag = ContTag.OR;
  constructor(readonly next_ip: number, readonly current: Value[]) {}
}

class CNot {
  readonly tag = ContTag.NOT;
  constructor(readonly next_ip: number, readonly current: Value[]) {}
}

class CJump {
  readonly tag = ContTag.JUMP;
  constructor(readonly ip: number) {}
}

class Frame {
  constructor(
    readonly parent: Frame | null,
    readonly name: string,
    readonly trail: Map<number, QueryValue>,
    readonly continuation: Continuation
  ) {}
}

class VM {
  constructor(readonly program: Program, readonly stack: QueryValue[], public ip: number) {}
}

export function* run(program: Program) {
  const vm = new VM(program, [], 1);
  yield* do_run(vm);
}

function* do_run(vm: VM) {
  let ip = vm.ip | 0;
  let current: Value[] = [];
  let trail: Map<number, QueryValue> = new Map();
  let context: Frame = new Frame(null, "(root)", new Map(), new CJump(0));

  const code = vm.program.code;
  const stack = vm.stack;
  const constants = vm.program.constants;

  const relations = vm.program.db.relations;
  const bindings: QueryValue[] = vm.program.bindings.map((_) => fresh);

  if (stack.length !== 0) {
    throw new Error(`Unexpected non-empty stack`);
  }

  const pop_many = (n: number) => {
    if (stack.length < n) {
      throw new Error(`Popping more values than the stack has.`);
    }
    const values = stack.slice(-n);
    stack.length = stack.length - n;
    return values;
  };

  const read_u8 = () => {
    return code[ip++];
  };

  const read_u16 = () => {
    const a = code[ip++] | 0;
    const b = code[ip++] << 8;
    return a | b;
  };

  const read_u32 = () => {
    const a = code[ip++] | 0;
    const b = code[ip++] << 8;
    const c = code[ip++] << 16;
    const d = code[ip++] << 24;
    return a | b | c | d;
  };

  function next_value(failed: boolean, return_to: number, generator: Generator<Value[]>) {
    const next = generator.next();
    if (next.done) {
      current = [];
      trail = context.trail;
      if (context.parent != null) {
        context = context.parent;
        do_continue(failed);
      }
    } else {
      current = next.value;
      ip = return_to;
    }
  }

  function do_continue(failed: boolean) {
    const cont = context.continuation;
    switch (cont.tag) {
      case ContTag.JUMP: {
        if (failed) {
          undo();
        }
        ip = cont.ip;
        context = context.parent!;
        break;
      }

      case ContTag.SEARCH: {
        if (failed) {
          undo();
        }
        next_value(failed, cont.ip, cont.generator);
        break;
      }

      case ContTag.NOT: {
        if (failed) {
          ip = cont.next_ip;
          current = cont.current;
          context = context.parent!;
        } else {
          undo();
          context = context.parent!;
          do_continue(true);
        }
        break;
      }

      case ContTag.OR: {
        if (failed) {
          undo();
        }
        ip = cont.next_ip;
        current = cont.current;
        context = context.parent!;
        break;
      }

      default:
        throw unreachable(cont);
    }
  }

  const undo = () => {
    for (const [index, value] of trail) {
      bindings[index] = value;
    }
    trail = new Map();
  };

  while (true) {
    const op = (code[ip++] | 0) as Op;

    switch (op) {
      case Op.GET_CONSTANT: {
        const index = read_u16();
        stack.push(constants[index]);
        break;
      }

      case Op.GET_FRESH: {
        stack.push(fresh);
        break;
      }

      case Op.GET_VARIABLE: {
        const index = read_u16();
        stack.push(bindings[index]);
        break;
      }

      case Op.GET_CURRENT: {
        const index = read_u8();
        stack.push(current[index]);
        break;
      }

      case Op.DUP: {
        const value = stack[stack.length - 1];
        stack.push(value);
        break;
      }

      case Op.SEARCH_RELATION: {
        const index = read_u32();
        const arity = read_u8();
        const relation = relations[index];
        const values = pop_many(arity);
        const results = relation.query(values);
        context = new Frame(context, relation.name, trail, new CSearch(ip, results));
        trail = new Map();
        const next = results.next();
        if (next.done) {
          current = [];
          do_continue(true);
        } else {
          current = next.value;
        }
        break;
      }

      case Op.UNIFY_VARIABLE: {
        const index = read_u16();
        const a = bindings[index];
        const b = stack.pop()!;
        if (a === fresh) {
          trail.set(index, bindings[index]);
          bindings[index] = b;
          break;
        }
        if (a !== b) {
          do_continue(true);
          break;
        }
        break;
      }

      case Op.UNIFY_VALUE: {
        const a = stack.pop();
        const b = stack.pop();
        if (a === fresh || b === fresh) {
          break;
        }
        if (a !== b) {
          do_continue(true);
          break;
        }
        break;
      }

      case Op.CALL_PRIMITIVE: {
        const index = read_u16();
        const arity = read_u8();
        const fun = primitives.functions[index];
        const args = pop_many(arity);
        stack.push(fun(...args));
        break;
      }

      case Op.YIELD: {
        yield bindings.slice();
        undo();
        do_continue(false);
        break;
      }

      case Op.CONTINUE: {
        undo();
        do_continue(false);
        break;
      }

      case Op.FAIL: {
        do_continue(true);
        break;
      }

      case Op.ANCHOR: {
        const offset = read_u32();
        context = new Frame(context, "(try)", new Map(), new COr(offset, current));
        break;
      }

      case Op.NEGATE: {
        const offset = read_u32();
        context = new Frame(context, "(negate)", new Map(), new CNot(offset, current));
        break;
      }

      case Op.JUMP: {
        const offset = read_u32();
        ip = offset;
        break;
      }

      case Op.HALT: {
        return;
      }

      default:
        throw unreachable(op, "Invalid operation");
    }
  }
}
