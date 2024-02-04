/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Column, Index, Modality, Relation } from "./relation";
import { ModalitySchema, RelationColumnSchema, Schema, TypeSchema, is_schema } from "./schema";
import { Type } from "./type";
import * as types from "./type";
import { add_unique, check_type, unreachable } from "./utils";

export class MagicaDb {
  readonly relations: Relation[] = [];
  readonly relation_map = new Map<string, number>();
  readonly types = new Map<string, Type>();

  private constructor(readonly schema: Schema) {}

  static from_schema(schema: Schema) {
    check_type(is_schema, schema);
    const db = new MagicaDb(schema);
    const primitives = ["bool", "float64", "int", "int32", "none", "text"] as const;
    for (const name of primitives) {
      db.types.set(name, reify_type({ tag: name }));
    }

    for (const type of schema.types) {
      if (type.tag === "enum") {
        add_unique(db.types, type.name, new types.TEnum(type.name, type.values));
      }
    }
    for (const relation_schema of schema.relations) {
      const unique_columns = new Set(relation_schema.columns.map((x) => x.name));
      if (relation_schema.columns.length !== unique_columns.size) {
        throw new Error(`Non-unique column names.`);
      }
      const relation = new Relation(
        relation_schema.name,
        relation_schema.columns.map((x) => reify_column(x, db.types)),
        false
      );
      const id = db.relations.length;
      db.relations.push(relation);
      add_unique(db.relation_map, relation.name, id);
      for (const index of relation_schema.indexes) {
        const column_map = index.columns.map((x) => {
          const i = relation_schema.columns.findIndex((v) => x.name === v.name);
          if (i === -1) {
            throw new Error(`Invalid column ${x.name} in index ${index.name}`);
          }
          return i;
        });
        const index_table = new Relation(
          `${relation_schema.name}.${index.name}`,
          column_map.map((x, i) =>
            reify_column(
              { ...relation_schema.columns[x], modality: index.columns[i].modality },
              db.types
            )
          ),
          true
        );
        const index_id = db.relations.length;
        db.relations.push(index_table);
        add_unique(db.relation_map, index_table.name, index_id);
        relation.add_index(new Index(index.name, column_map, index_table));
      }
    }

    return db;
  }

  get_relation(name: string) {
    const id = this.relation_map.get(name);
    if (id == null) {
      throw new Error(`Unknown relation ${name}`);
    }
    return this.relations[id];
  }

  get_type(name: string) {
    const type = this.types.get(name);
    if (type == null) {
      throw new Error(`Unknown type ${name}`);
    }
    return type;
  }
}

function reify_column(column: RelationColumnSchema, type_map: Map<string, Type>) {
  const type = type_map.get(column.type);
  if (type == null) {
    throw new Error(`Undefined type ${column.type} in column ${column.name}`);
  }
  return new Column(column.name, type, reify_modality(column.modality));
}

function reify_modality(modality: ModalitySchema) {
  switch (modality) {
    case "many":
      return Modality.MANY;
    case "one":
      return Modality.ONE;
    default:
      throw unreachable(modality, "Invalid modality");
  }
}

function reify_type(type: TypeSchema) {
  switch (type.tag) {
    case "bool":
      return types.bool;
    case "float64":
      return types.float64;
    case "int":
      return types.int;
    case "int32":
      return types.int32;
    case "none":
      return types.none;
    case "text":
      return types.text;
    case "enum": {
      throw new Error("Cannot reify enums");
    }
    default:
      throw unreachable(type, "Invalid type tag");
  }
}
