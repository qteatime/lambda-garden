/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MagicaDb } from "./db";
import { Column, Index, Modality, Relation } from "./relation";
import { Schema } from "./schema";
import { enumerate, unreachable } from "./utils";
import { Int32, Value, fresh } from "./values";

type DbJson = {
  schema: Schema;
  relations: RelationJson[];
};

type RelationJson = {
  name: string;
  data: JsonValue[][];
  refs: JsonValue[];
};

type JsonValue = Int32 | number | boolean | null | string | { int: string } | { id: number };

// -- Parsing
export function from_json(json: DbJson): MagicaDb {
  const db = MagicaDb.from_schema(json.schema);
  for (const relation of json.relations) {
    const db_relation = db.get_relation(relation.name);
    for (const row of relation.data) {
      const values = row.map((x) => json_to_value(x, relation.refs));
      db_relation.insert(values);
    }
  }
  return db;
}

// -- Serialisation
export function to_json(db: MagicaDb): DbJson {
  return {
    schema: db.schema,
    relations: db.relations.flatMap((x) => (x.is_index ? [] : [serialise_relation(x)])),
  };
}

function serialise_relation(x: Relation): RelationJson {
  const refs = new RefBox();
  const data: JsonValue[][] = [];
  for (const row of x.query(x.columns.map((_) => fresh))) {
    const serialised_row = new Array<JsonValue>(x.columns.length);
    for (const [i, item] of enumerate(row)) {
      serialised_row[i] = refs.save(item as Value);
    }
    data.push(serialised_row);
  }

  return {
    name: x.name,
    data: data,
    refs: refs.all_refs,
  };
}

class RefBox {
  private ref_map = new Map<Value, number>();
  private refs: JsonValue[] = [];

  private is_fixed(x: Value): x is number | boolean | null {
    return typeof x === "number" || typeof x === "boolean" || x === null;
  }

  save(x: Value): JsonValue {
    if (this.is_fixed(x)) {
      return x;
    } else {
      const ref = this.ref_map.get(x);
      if (ref != null) {
        return { id: ref };
      } else {
        const id = this.refs.length;
        this.ref_map.set(x, id);
        const saved_value = value_to_json(x);
        this.refs.push(saved_value);
        return { id };
      }
    }
  }

  get all_refs() {
    return this.refs;
  }
}

function json_to_value(x: JsonValue, refs: JsonValue[]): Value {
  if (x != null && typeof x === "object") {
    if ("int" in x) {
      return BigInt(x.int);
    }
    if ("id" in x) {
      if (x.id < 0 || x.id >= refs.length) {
        throw new Error(`Invalid reference ${x.id}`);
      }
      return json_to_value(refs[x.id], refs);
    }
    throw unreachable(x, "Invalid json value");
  } else {
    return x;
  }
}

function value_to_json(x: Value): JsonValue {
  if (typeof x === "bigint") {
    return { int: x.toString() };
  } else {
    return x;
  }
}
