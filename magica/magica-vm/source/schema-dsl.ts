/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  IndexColumnSchema,
  IndexSchema,
  RelationColumnSchema,
  RelationSchema,
  Schema,
  TypeSchema,
} from "./schema";

type DslRelation = { columns: RelationColumnSchema[]; indexes?: DslIndexes };
type DslType = string[];
type DslIndex = IndexColumnSchema[];
type DslIndexes = { [key: string]: DslIndex };

export function schema(x: {
  version: number;
  relations: { [key: string]: DslRelation };
  types: { [key: string]: DslType };
}): Schema {
  return {
    version: x.version,
    relations: Object.entries(x.relations).map(([name, data]) => make_relation(name, data)),
    types: Object.entries(x.types).map(([name, type]) => make_type(name, type)),
  };
}

function make_relation(name: string, { columns, indexes }: DslRelation): RelationSchema {
  return {
    name,
    columns,
    indexes: Object.entries(indexes ?? {}).map(([name, data]) => make_index(name, data)),
  };
}

function make_index(name: string, data: DslIndex): IndexSchema {
  if (Array.isArray(data)) {
    return {
      name,
      columns: data,
    };
  } else {
    throw new Error(`Invalid index definition ${name}`);
  }
}

function make_type(name: string, values: string[]): TypeSchema {
  return {
    tag: "enum",
    name,
    values,
  };
}

export function one(name: string): IndexColumnSchema;
export function one(name: string, type: string): RelationColumnSchema;
export function one(name: string, type?: string): RelationColumnSchema | IndexColumnSchema {
  return {
    name,
    type,
    modality: "one",
  };
}

export function many(name: string): IndexColumnSchema;
export function many(name: string, type: string): RelationColumnSchema;
export function many(name: string, type?: string): RelationColumnSchema | IndexColumnSchema {
  return {
    name,
    type,
    modality: "many",
  };
}
