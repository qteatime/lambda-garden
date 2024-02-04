/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Value } from "../../values";
import * as i32 from "./int32";
import * as bool from "./bool";
import * as text from "./text";

type Fun = (...args: any[]) => Value;

class Primitives {
  readonly functions: Fun[] = [];
  readonly mapping = new Map<string, number>();

  defun(name: string, fun: Fun) {
    const id = this.functions.length;
    this.functions.push(fun);
    this.mapping.set(name, id);
    return this;
  }

  get_name(id: number) {
    for (const [name, fid] of this.mapping.entries()) {
      if (id === fid) {
        return name;
      }
    }
  }
}

export const primitives = new Primitives();

primitives
  .defun("text.eq", text.eq)
  .defun("text.neq", text.neq)
  // booleans
  .defun("bool.and", bool.and)
  .defun("bool.or", bool.or)
  .defun("bool.not", bool.not)
  // integers
  .defun("int32.eq", i32.eq)
  .defun("int32.neq", i32.neq)
  .defun("int32.gt", i32.gt)
  .defun("int32.gte", i32.gte)
  .defun("int32.lt", i32.lt)
  .defun("int32.lte", i32.lte)
  .defun("int32.add", i32.add)
  .defun("int32.sub", i32.sub)
  .defun("int32.mul", i32.mul)
  .defun("int32.div", i32.div)
  .defun("int32.pow", i32.pow);
