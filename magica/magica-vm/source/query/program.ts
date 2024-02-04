/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { MagicaDb } from "../db";
import { zip } from "../utils";
import { QueryValue, Value } from "../values";

// prettier-ignore
export enum Op {
  GET_CONSTANT,     // i:u16 :: [] -> [v]
  GET_FRESH,        // :: [] -> [v]
  GET_VARIABLE,     // i:u16 :: [] -> [v]
  GET_CURRENT,      // i:u8 :: [] -> [v]
  DUP,              // :: [v] -> [v, v]
  SEARCH_RELATION,  // i:u32 arity:u8 :: [] -> []
  UNIFY_VARIABLE,   // i:u16 :: [v] -> [v]
  UNIFY_VALUE,      // :: [v, v] -> [v]
  CALL_PRIMITIVE,   // i:u16 arity:u8 :: [...] -> [v]
  ANCHOR,           //.f:u32 :: [] -> []
  NEGATE,           // i:u32 :: [] -> []
  JUMP,             // i:u32 :: [] -> []
  FAIL,             // :: [] -> []
  CONTINUE,         // :: [] -> []
  YIELD,            // :: [] -> []
  HALT,             // :: [] -> []
}

export class Program {
  constructor(
    readonly code: Uint8Array,
    readonly constants: Value[],
    readonly bindings: string[],
    readonly db: MagicaDb
  ) {}

  reify_result(bindings: QueryValue[]) {
    return Object.fromEntries(zip(this.bindings, bindings));
  }

  *reify_results(results: Iterable<QueryValue[]>) {
    for (const result of results) {
      yield this.reify_result(result);
    }
  }
}
