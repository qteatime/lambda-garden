/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { primitives } from "./prim";
import { Op, Program } from "./program";

export function disasm(program: Program) {
  let ip = 0;
  while (ip < program.code.length) {
    ip = disasm_one(program, ip);
  }
}

export function disasm_one(program: Program, offset: number) {
  let ip = offset;
  const code = program.code;

  const print = (name: string, ...args: any[]) => {
    console.log(`0x${offset.toString(16).padStart(4, "0")}`, name, ...args);
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

  const op = program.code[ip++] as Op;
  switch (op) {
    case Op.GET_CONSTANT: {
      const i = read_u16();
      print("GET-CONSTANT", i, "   //", program.constants[i]);
      break;
    }

    case Op.GET_FRESH: {
      print("GET-FRESH");
      break;
    }

    case Op.GET_VARIABLE: {
      const i = read_u16();
      print("GET-VARIABLE", i, "    //", program.bindings[i]);
      break;
    }

    case Op.GET_CURRENT: {
      const i = read_u8();
      print("GET-CURRENT", i);
      break;
    }

    case Op.DUP: {
      print("DUP");
      break;
    }

    case Op.SEARCH_RELATION: {
      const i = read_u32();
      const n = read_u8();
      print("SEARCH-RELATION", i, n, "    //", program.db.relations[i].name);
      break;
    }

    case Op.UNIFY_VARIABLE: {
      const i = read_u16();
      print("UNIFY-VARIABLE", i, "    //", program.bindings[i]);
      break;
    }

    case Op.UNIFY_VALUE: {
      print("UNIFY-VALUE");
      break;
    }

    case Op.CALL_PRIMITIVE: {
      const i = read_u16();
      const a = read_u8();
      const fun = primitives.get_name(i);
      print("CALL-PRIMITIVE", i, a, "    //", fun);
      break;
    }

    case Op.ANCHOR: {
      const i = read_u32();
      print("ANCHOR", "0x" + i.toString(16).padStart(4, "0"));
      break;
    }

    case Op.JUMP: {
      const i = read_u32();
      print("JUMP", "0x" + i.toString(16).padStart(4, "0"));
      break;
    }

    case Op.NEGATE: {
      const i = read_u32();
      print("NEGATE", "0x" + i.toString(16).padStart(4, "0"));
      break;
    }

    case Op.CONTINUE: {
      print("CONTINUE");
      break;
    }

    case Op.FAIL: {
      print("FAIL");
      break;
    }

    case Op.YIELD: {
      print("YIELD");
      break;
    }

    case Op.HALT: {
      print("HALT");
      break;
    }

    default:
      print("unknown op", op);
  }

  return ip;
}