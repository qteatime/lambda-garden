/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TMany, TOne, TZero, Tree, TreeJson } from "./tree";
import { Type } from "./type";
import { unreachable, zip } from "./utils";
import { Fresh, QueryValue, Value, fresh } from "./values";

export const enum Modality {
  ONE,
  MANY,
}

export class Column {
  constructor(readonly name: string, readonly type: Type, readonly modality: Modality) {}
}

export class Index {
  constructor(readonly name: string, readonly mapping: number[], readonly relation: Relation) {}
}

export class Relation {
  private tree: Tree;
  readonly indexes: Index[] = [];
  constructor(readonly name: string, readonly columns: Column[], readonly is_index: boolean) {
    this.tree = this.columns.reduceRight(make_tree, new TZero());
  }

  add_index(index: Index) {
    this.indexes.push(index);
  }

  insert(values: Value[]) {
    this.check_values(values);
    for (const index of this.indexes) {
      index.relation.insert_unchecked(index.mapping.map((i) => values[i]));
    }
    return this.insert_unchecked(values);
  }

  insert_unchecked(values: Value[]) {
    return this.tree.insert(values, 0);
  }

  remove(values: Value[]) {
    this.check_values(values);
    for (const index of this.indexes) {
      index.relation.remove_unchecked(index.mapping.map((i) => values[i]));
    }
    return this.remove_unchecked(values);
  }

  remove_unchecked(values: Value[]) {
    return this.tree.remove(values, 0);
  }

  debug_values() {
    const columns = this.columns.map((x) => x.name);
    const query = columns.map((_) => fresh);
    const result = [];
    for (const row of this.tree.query(query, 0, query)) {
      result.push(
        Object.fromEntries(
          zip(
            columns,
            row.map((x, i) => this.columns[i].type.reify_unchecked(x))
          )
        )
      );
    }
    return result;
  }

  *query(expected: QueryValue[]) {
    if (expected.length !== this.columns.length) {
      throw new Error(`Invalid arity for querying ${this.name}`);
    }
    yield* this.tree.query(expected, 0, expected);
  }

  private check_values(values: Value[]) {
    if (values.length !== this.columns.length) {
      throw new Error(`Invalid arity: ${this.name} has ${this.columns.length} columns`);
    }
    for (const [value, column] of zip(values, this.columns)) {
      if (!column.type.check(value)) {
        throw new Error(
          `${this.name} expects a value of type ${column.type.name} at column ${column.name}`
        );
      }
    }
  }
}

function make_tree(prev: Tree, column: Column) {
  switch (column.modality) {
    case Modality.ONE:
      return new TOne(null, prev);
    case Modality.MANY:
      return new TMany(new Map(), prev);
    default:
      throw unreachable(column.modality, "column modality");
  }
}
