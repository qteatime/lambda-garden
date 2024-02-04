/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { QueryValue, Value, fresh } from "./values";

export type TreeJson =
  | null
  | { type: "one"; pair: null | { value: Value; next: TreeJson } }
  | { type: "many"; entries: { value: Value; next: TreeJson }[] };

export abstract class Tree {
  abstract clone(): Tree;
  abstract insert(values: Value[], index: number): boolean;
  abstract remove(values: Value[], index: number): boolean;
  abstract query(expected: QueryValue[], index: number, result: QueryValue[]): Generator<Value[]>;
  abstract arity: number;
}

export class TZero extends Tree {
  clone(): Tree {
    return this;
  }

  insert(values: Value[], index: number) {
    return false;
  }

  remove(values: Value[], index: number) {
    return true;
  }

  *query(expected: QueryValue[], index: number, result: Value[]) {
    yield result;
  }

  get arity(): number {
    return 0;
  }
}

class Pair {
  constructor(public value: Value, readonly tree: Tree) {}
}

export class TOne extends Tree {
  constructor(private value: Pair | null, private next: Tree) {
    super();
  }

  clone() {
    return new TOne(null, this.next.clone());
  }

  insert(values: Value[], index: number) {
    const value = values[index];
    if (this.value == null || this.value.value !== value) {
      this.value = new Pair(value, this.next.clone());
      this.value.tree.insert(values, index + 1);
      return true;
    } else {
      return this.value.tree.insert(values, index + 1);
    }
  }

  remove(values: Value[], index: number) {
    const value = values[index];
    if (this.value != null && this.value.value === value) {
      const removed = this.next.remove(values, index + 1);
      if (removed) {
        this.value = null;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  *query(expected: QueryValue[], index: number, result: QueryValue[]) {
    const query = expected[index];
    if (this.value != null) {
      const value = this.value.value;
      if (query === fresh || query === value) {
        const new_result = put_result(result, index, value);
        yield* this.value.tree.query(expected, index + 1, new_result);
      }
    }
  }

  get arity(): number {
    return 1 + this.next.arity;
  }
}

export class TMany extends Tree {
  constructor(private tree: Map<Value, Tree>, private next: Tree) {
    super();
  }

  clone() {
    return new TMany(new Map(), this.next.clone());
  }

  insert(values: Value[], index: number) {
    const value = values[index];
    const subtree = this.tree.get(value);
    if (subtree != null) {
      return subtree.insert(values, index + 1);
    } else {
      const subtree = this.next.clone();
      this.tree.set(value, subtree);
      subtree.insert(values, index + 1);
      return true;
    }
  }

  remove(values: Value[], index: number) {
    const value = values[index];
    const subtree = this.tree.get(value);
    if (subtree != null) {
      const removed = subtree.remove(values, index + 1);
      if (removed) {
        this.tree.delete(value);
        return this.tree.size === 0;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  *query(expected: QueryValue[], index: number, result: QueryValue[]) {
    const query = expected[index];
    if (query === fresh) {
      for (const [value, tree] of this.tree.entries()) {
        const new_result = put_result(result, index, value);
        yield* tree.query(expected, index + 1, new_result);
      }
    } else {
      const tree = this.tree.get(query as Value);
      const new_result = put_result(result, index, query);
      if (tree != null) {
        yield* tree.query(expected, index + 1, new_result);
      }
    }
  }

  get arity(): number {
    return 1 + this.next.arity;
  }
}

function put_result(output: QueryValue[], index: number, value: QueryValue) {
  if (output[index] !== value) {
    const new_output = output.slice();
    new_output[index] = value;
    return new_output;
  } else {
    return output;
  }
}
