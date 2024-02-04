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
      likes: { columns: [many("who", "text"), many("whom", "text")] },
    },
    types: {},
  })
);

// Insert some data in it
const at = db.get_relation("at");
at.insert(["alice", "garden"]);
at.insert(["dorothy", "house"]);
at.insert(["cecilia", "garden"]);

const likes = db.get_relation("likes");
likes.insert(["alice", "dorothy"]);
likes.insert(["alice", "cecilia"]);
likes.insert(["cecilia", "dorothy"]);
likes.insert(["cecilia", "alice"]); // try taking this fact out

// Query data from it
const prog = query.compile(
  q.conj(
    q.search("at", [q.v("X"), q.v("Where")]),
    q.search("at", [q.v("Y"), q.v("Where")]),
    q.search("likes", [q.v("X"), q.v("Y")]),
    q.search("likes", [q.v("Y"), q.v("X")])
  ),
  db
);

console.log("At the same place, with the same feelings:", [...prog.reify_results(query.run(prog))]);
