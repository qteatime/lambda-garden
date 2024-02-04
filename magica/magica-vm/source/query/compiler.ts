/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MagicaDb } from "../db";
import { Op, Program } from "./program";
import { Value } from "../values";
import {
  check_type,
  enumerate,
  is,
  is_array,
  is_object,
  is_string,
  is_value,
  unreachable,
} from "../utils";
import { primitives } from "./prim";

export type QueryExpr =
  | { op: "get-var"; name: string }
  | { op: "get-const"; value: Value }
  | { op: "get-fresh" }
  | { op: "search"; relation: string; args: QueryExpr[] }
  | { op: "unify"; left: QueryExpr; right: QueryExpr }
  | { op: "conj"; exprs: QueryExpr[] }
  | { op: "disj"; exprs: QueryExpr[] }
  | { op: "not"; expr: QueryExpr }
  | { op: "call-prim"; name: string; args: QueryExpr[] };

const is_expr: (a: unknown) => boolean = (a: unknown) =>
  is_object({ op: is("get-var"), name: is_string })(a) ||
  is_object({ op: is("get-const"), value: is_value })(a) ||
  is_object({ op: is("get-fresh") })(a) ||
  is_object({ op: is("search"), relation: is_string, args: is_array(is_expr) })(a) ||
  is_object({ op: is("unify"), left: is_expr, right: is_expr })(a) ||
  is_object({ op: is("conj"), exprs: is_array(is_expr) })(a) ||
  is_object({ op: is("disj"), exprs: is_array(is_expr) })(a) ||
  is_object({ op: is("not"), expr: is_expr })(a) ||
  is_object({ op: is("call-prim"), name: is_string, args: is_array(is_expr) })(a);

class CompileCtx {
  public contexts: number = 0;
  readonly code: Op[] = [];
  readonly constants: Value[] = [];
  readonly bindings: string[] = [];
  private constant_map = new Map<Value, number>();
  private variable_map = new Map<string, number>();

  private constructor(readonly db: MagicaDb) {}

  push_op(op: Op) {
    this.code.push(op);
  }

  push_u8(value: number) {
    if (value < 0 || value > 255) {
      throw new RangeError(`Invalid u8: ${value}`);
    }
    this.code.push(value);
  }

  push_u16(value: number) {
    if (value < 0 || value >= 2 ** 16) {
      throw new RangeError(`Invalid u16: ${value}`);
    }
    this.code.push(value & 0xff);
    this.code.push((value >> 8) & 0xff);
  }

  push_u32(value: number) {
    if (value < 0 || value >= 2 ** 32) {
      throw new RangeError(`Invalid u32: ${value}`);
    }
    this.code.push(value & 0xff);
    this.code.push((value >> 8) & 0xff);
    this.code.push((value >> 16) & 0xff);
    this.code.push((value >> 24) & 0xff);
  }

  patch_u32(offset: number, value: number) {
    if (value < 0 || value >= 2 ** 32) {
      throw new RangeError(`Invalid u32: ${value}`);
    }
    this.code[offset] = value & 0xff;
    this.code[offset + 1] = (value >> 8) & 0xff;
    this.code[offset + 2] = (value >> 16) & 0xff;
    this.code[offset + 3] = (value >> 24) & 0xff;
  }

  register_var(name: string) {
    const id = this.variable_map.get(name);
    if (id != null) {
      return id;
    } else {
      const id = this.bindings.length;
      this.bindings.push(name);
      this.variable_map.set(name, id);
      return id;
    }
  }

  register_const(value: Value) {
    const id = this.constant_map.get(value);
    if (id != null) {
      return id;
    } else {
      const id = this.constants.length;
      this.constants.push(value);
      this.constant_map.set(value, id);
      return id;
    }
  }

  resolve_relation(name: string) {
    const id = this.db.relation_map.get(name);
    if (id == null) {
      throw new Error(`Undefined relation ${name}`);
    }
    return id;
  }

  static from_db(db: MagicaDb) {
    return new CompileCtx(db);
  }
}

export function compile(expr: QueryExpr, db: MagicaDb) {
  check_type(is_expr, expr);
  const ctx = CompileCtx.from_db(db);
  ctx.push_op(Op.HALT);
  compile_expr(ctx, expr, new Set());
  ctx.push_op(Op.YIELD);
  ctx.push_op(Op.HALT);
  return new Program(new Uint8Array(ctx.code), ctx.constants, ctx.bindings, db);
}

function compile_expr(ctx: CompileCtx, expr: QueryExpr, bound: Set<string>) {
  switch (expr.op) {
    case "get-const": {
      const id = ctx.register_const(expr.value);
      ctx.push_op(Op.GET_CONSTANT);
      ctx.push_u16(id);
      break;
    }

    case "get-fresh": {
      ctx.push_op(Op.GET_FRESH);
      break;
    }

    case "get-var": {
      const id = ctx.register_var(expr.name);
      ctx.push_op(Op.GET_VARIABLE);
      ctx.push_u16(id);
      break;
    }

    case "search": {
      for (const arg of expr.args) {
        compile_expr(ctx, arg, bound);
      }
      const id = ctx.resolve_relation(expr.relation);
      const relation = ctx.db.relations[id];
      ctx.push_op(Op.SEARCH_RELATION);
      ctx.push_u32(id);
      ctx.push_u8(relation.columns.length);
      ctx.contexts += 1;
      for (const [i, arg] of enumerate(expr.args)) {
        if (arg.op === "get-var") {
          ctx.push_op(Op.GET_CURRENT);
          ctx.push_u8(i);
          ctx.push_op(Op.UNIFY_VARIABLE);
          const vid = ctx.register_var(arg.name);
          ctx.push_u16(vid);
          bound.add(arg.name);
        }
      }
      break;
    }

    case "conj": {
      for (const op of expr.exprs) {
        compile_expr(ctx, op, bound);
      }
      break;
    }

    case "disj": {
      const pointers: number[] = [];
      const head = expr.exprs.slice(0, -1);
      const tail = expr.exprs.at(-1)!;
      for (const op of head) {
        ctx.push_op(Op.ANCHOR);
        const offset = ctx.code.length;
        ctx.push_u32(0);
        compile_expr(ctx, op, bound);
        ctx.push_op(Op.JUMP);
        pointers.push(ctx.code.length);
        ctx.push_u32(0);
        ctx.patch_u32(offset, ctx.code.length);
      }
      compile_expr(ctx, tail, bound);
      for (const pointer of pointers) {
        ctx.patch_u32(pointer, ctx.code.length);
      }
      break;
    }

    case "not": {
      ctx.push_op(Op.NEGATE);
      const offset = ctx.code.length;
      ctx.push_u32(0);
      compile_expr(ctx, expr.expr, bound);
      ctx.push_op(Op.CONTINUE);
      ctx.patch_u32(offset, ctx.code.length);
      break;
    }

    case "unify": {
      if (expr.left.op === "get-var") {
        compile_expr(ctx, expr.right, bound);
        const id = ctx.register_var(expr.left.name);
        ctx.push_op(Op.UNIFY_VARIABLE);
        ctx.push_u16(id);
        ctx.push_op(Op.GET_VARIABLE);
        ctx.push_u16(id);
      } else if (expr.right.op === "get-var") {
        compile_expr(ctx, expr.left, bound);
        const id = ctx.register_var(expr.right.name);
        ctx.push_op(Op.UNIFY_VARIABLE);
        ctx.push_u16(id);
        ctx.push_op(Op.GET_VARIABLE);
        ctx.push_u16(id);
      } else {
        compile_expr(ctx, expr.left, bound);
        ctx.push_op(Op.DUP);
        compile_expr(ctx, expr.right, bound);
        ctx.push_op(Op.UNIFY_VALUE);
      }
      break;
    }

    case "call-prim": {
      const id = primitives.mapping.get(expr.name);
      if (id == null) {
        throw new Error(`Unknown primitive ${id}`);
      }
      for (const arg of expr.args) {
        compile_expr(ctx, arg, bound);
      }
      ctx.push_op(Op.CALL_PRIMITIVE);
      ctx.push_u16(id);
      ctx.push_u8(expr.args.length);
      break;
    }

    default:
      throw unreachable(expr, JSON.stringify(expr, null, 2));
  }
}
