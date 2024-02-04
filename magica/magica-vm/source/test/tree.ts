/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/
 */
import { describe, it } from "node:test";
import { TMany, TOne, TZero, Tree } from "../tree";
import { fresh } from "../values";
import { eq } from "./util";

const serialise = (t: Tree) => {
  const query = Array.from({ length: t.arity }, (_) => fresh);
  const result = new Array(query.length);
  return [...t.query(query, 0, result)];
};

describe("Tree insertion", () => {
  it("Should add the value if not there", () => {
    const t1 = new TOne(null, new TZero());
    eq(serialise(t1), []);
    eq(t1.insert([1], 0), true);
    eq(serialise(t1), [[1]]);

    const t2 = new TMany(new Map(), new TZero());
    eq(serialise(t2), []);
    eq(t2.insert([1], 0), true);
    eq(serialise(t2), [[1]]);
  });

  it("Should add the value in subtrees", () => {
    const t1 = new TOne(null, new TMany(new Map(), new TZero()));
    eq(t1.insert([1, 2], 0), true, "t1");
    eq([[1, 2]], serialise(t1), "t1");
    eq(t1.insert([1, 3], 0), true, "t1");
    eq(
      serialise(t1),
      [
        [1, 2],
        [1, 3],
      ],
      "t1"
    );

    const t2 = new TMany(new Map(), new TOne(null, new TZero()));
    eq(t2.insert([1, 2], 0), true, "t2");
    eq(serialise(t2), [[1, 2]], "t2");
    eq(t2.insert([2, 3], 0), true, "t2");
    eq(
      serialise(t2),
      [
        [1, 2],
        [2, 3],
      ],
      "t2"
    );
  });

  it("Should not add duplicates", () => {
    const t1 = new TOne(null, new TZero());
    eq(t1.insert([1], 0), true);
    eq(serialise(t1), [[1]]);
    eq(t1.insert([1], 0), false);
    eq(serialise(t1), [[1]]);

    const t2 = new TMany(new Map(), new TZero());
    eq(t2.insert([1], 0), true);
    eq(serialise(t2), [[1]]);
    eq(t2.insert([1], 0), false);
    eq(serialise(t2), [[1]]);
    eq(t2.insert([2], 0), true);
    eq(serialise(t2), [[1], [2]]);
  });

  it("Should replace <one> steps in the tree", () => {
    const t1 = new TOne(null, new TMany(new Map(), new TZero()));
    eq(t1.insert([1, 2], 0), true);
    eq(serialise(t1), [[1, 2]]);

    eq(t1.insert([1, 3], 0), true);
    eq(serialise(t1), [
      [1, 2],
      [1, 3],
    ]);

    eq(t1.insert([2, 2], 0), true);
    eq(serialise(t1), [[2, 2]]);
  });
});

describe("Tree removal", () => {
  it("Should remove paths if there (one)", () => {
    const t1 = new TOne(null, new TZero());
    eq(t1.remove([1], 0), false, "remove 1");
    eq(t1.insert([2], 0), true, "add 2");
    eq(serialise(t1), [[2]], "serialise.1");
    eq(t1.remove([2], 0), true, "remove 2");
    eq(serialise(t1), [], "serialise.2");
  });

  it("Should remove paths if there (many)", () => {
    const t1 = new TMany(new Map(), new TZero());
    eq(t1.remove([1], 0), false, "remove 1");
    eq(t1.insert([2], 0), true, "insert 2");
    eq(t1.insert([3], 0), true, "insert 3");
    eq(serialise(t1), [[2], [3]], "serialise.1");
    eq(t1.remove([2], 0), false, "remove 2");
    eq(serialise(t1), [[3]], "serialise.2");
    eq(t1.remove([2], 0), false, "remove 2.2");
    eq(serialise(t1), [[3]], "serialise.3");
    eq(t1.remove([3], 0), true, "remove 3");
    eq(serialise(t1), [], "serialise.4");
  });
});

describe("Tree querying", () => {
  const t1 = new TOne(null, new TZero());
  t1.insert([1], 0);
  const t2 = new TMany(new Map(), new TZero());
  t2.insert([1], 0);
  t2.insert([2], 0);
  const t3 = new TMany(new Map(), new TOne(null, new TZero()));
  t3.insert([1, 2], 0);
  t3.insert([2, 3], 0);

  it("Given a value, should return rows matching it", () => {
    eq([...t1.query([1], 0, [fresh])], [[1]], "t1.search 1");
    eq([...t1.query([2], 0, [fresh])], [], "t1.search 2");

    eq([...t2.query([1], 0, [fresh])], [[1]], "t2.search 1");
    eq([...t2.query([3], 0, [fresh])], [], "t2.search 3");

    eq([...t3.query([1, 2], 0, [fresh])], [[1, 2]], "t3.search 1,2");
    eq([...t3.query([2, 4], 0, [fresh])], [], "t3.search 2,4");
  });

  it("Given a fresh binding, should match it to all rows", () => {
    eq([...t1.query([fresh], 0, [fresh])], [[1]], "t1");
    eq([...t2.query([fresh], 0, [fresh])], [[1], [2]], "t2");

    eq(
      [...t3.query([fresh, fresh], 0, [fresh, fresh])],
      [
        [1, 2],
        [2, 3],
      ],
      "t3"
    );
    eq([...t3.query([1, fresh], 0, [fresh, fresh])], [[1, 2]], "t3.p1");
    eq([...t3.query([fresh, 3], 0, [fresh, fresh])], [[2, 3]], "t3.p2");
  });
});
