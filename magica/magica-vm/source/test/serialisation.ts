/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/
 */

import { describe, it } from "node:test";
import { MagicaDb } from "../db";
import { Schema } from "../schema";
import { TEnum } from "../type";
import { from_json, to_json } from "../json-serialiser";
import { eq } from "./util";

describe("JSON serialisation", () => {
  const schema: Schema = {
    version: 1,
    relations: [
      {
        name: "at",
        columns: [
          { name: "person", type: "person", modality: "many" },
          { name: "room", type: "text", modality: "one" },
        ],
        indexes: [
          {
            columns: [
              { name: "room", modality: "many" },
              { name: "person", modality: "many" },
            ],
            name: "rev",
          },
        ],
      },
    ],
    types: [{ tag: "enum", name: "person", values: ["alice", "dorothy", "cecilia"] }],
  };

  it("Should serialise the whole database", () => {
    const db = MagicaDb.from_schema(schema);
    const at = db.get_relation("at");
    const person = db.get_type("person") as TEnum;
    at.insert([person.intern("alice"), "garden"]);
    at.insert([person.intern("dorothy"), "garden"]);
    at.insert([person.intern("cecilia"), "house"]);

    const json = to_json(db);
    eq(json, {
      schema: schema,
      relations: [
        {
          name: "at",
          data: [
            [0, { id: 0 }],
            [1, { id: 0 }],
            [2, { id: 1 }],
          ],
          refs: ["garden", "house"],
        },
      ],
    });
  });

  it("Should load a database from JSON", () => {
    const json = {
      schema: schema,
      relations: [
        {
          name: "at",
          data: [
            [0, { id: 0 }],
            [1, { id: 0 }],
            [2, { id: 1 }],
          ],
          refs: ["garden", "house"],
        },
      ],
    };
    const db = from_json(json);
    const at = db.get_relation("at");
    eq(at.debug_values(), [
      { person: "alice", room: "garden" },
      { person: "dorothy", room: "garden" },
      { person: "cecilia", room: "house" },
    ]);
    const at_rev = db.get_relation("at.rev");
    eq(at_rev.debug_values(), [
      { room: "garden", person: "alice" },
      { room: "garden", person: "dorothy" },
      { room: "house", person: "cecilia" },
    ]);
  });
});
