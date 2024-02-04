/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/
 */
import { MagicaDb, dsl, query } from "../";
const { schema, one, many } = dsl;
const q = query.dsl;

// Create a minimal database
const db = MagicaDb.from_schema(
  schema({
    version: 1,
    relations: {
      at: { columns: [many("person", "text"), one("place", "text")] },
    },
    types: {},
  })
);

// Insert some data in it
const at = db.get_relation("at");
at.insert(["alice", "garden"]);
at.insert(["dorothy", "house"]);
at.insert(["cecilia", "garden"]);

// Query data from it
const wheres_alice = query.compile(q.search("at", [q.value("alice"), q.v("Where")]), db);
const whos_at_garden = query.compile(q.search("at", [q.v("Who"), q.value("garden")]), db);

console.log("Where's alice:", [...wheres_alice.reify_results(query.run(wheres_alice))]);
console.log("Who's at the garden:", [...whos_at_garden.reify_results(query.run(whos_at_garden))]);
