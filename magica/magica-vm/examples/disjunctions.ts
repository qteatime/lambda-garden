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
      job: { columns: [many("person", "text"), one("job", "text")] },
      at: { columns: [many("person", "text"), one("place", "text")] },
    },
    types: {},
  })
);

// Insert some data in it
const at = db.get_relation("at");
at.insert(["alice", "tavern"]);
at.insert(["dorothy", "square"]);
at.insert(["cecilia", "tavern"]);

const job = db.get_relation("job");
job.insert(["alice", "witch"]);
job.insert(["dorothy", "fighter"]);
job.insert(["cecilia", "thief"]);

// Query data from it
const prog = query.compile(
  q.conj(
    q.search("at", [q.v("Who"), q.value("tavern")]),
    q.disj(
      q.search("job", [q.v("Who"), q.value("witch")]),
      q.search("job", [q.v("Who"), q.value("healer")])
    )
  ),
  db
);

console.log("I need a healer for my party:", [...prog.reify_results(query.run(prog))]);
