001 — Path-dependent Databases
==============================

:Author: Niini
:Started: 2024-01-09
:Last updated: 2024-01-09
:Status: Design in progress


Timeline
--------

=========== ================ =====================
First draft Proof of Concept Stable implementation
=========== ================ =====================
2024-01-09  —                —
=========== ================ =====================


Summary
-------

Video games and simulations often need to keep a set of facts and make
queries to these facts, however facts are always rapidly changing as
time progresses. Another very specific aspect of these types of programs
is that they tend to have some kind of real-time component, and thus
querying or updating those facts *must complete within known deadlines
and known resource bounds*, otherwise we risk making the simulation or
game entirely unusable.

While logic-based languages and databases are useful for exact this
purpose of keeping and querying facts in a flexible manner, these harsh
restrictions make it difficult to pick an off-the-shelf logic database
and use it within a video game.

Magica is a logic-based database and language designed to give its users
a way of reasoning about time and resource usage complexity statically,
from looking at the source of a query. It's primarily designed for
story-rich games which need a way of describing *flexible* simulations
of their worlds, while reconciling that with the performance requirements
of a video game.


Typed and path-dependent databases
----------------------------------

The following are the major obstacles in this context:

* Knowing how much space a database will use and how it will be laid out
  in memory --- this is because developers need to be able to "budget"
  those resources along with the rest of their game.

* Knowing how much time a query will take to complete, and offering ways
  of optimising it in a deterministic fashion --- this is because changes
  to Magica or a query should *never* cause ripple effects in performance
  in a game; they're too complex to automatically benchmark, and QAs cannot
  be expected to replay the entire game every time a change to a small
  section is made.

We solve these two problems by using a *typed database*, this means that
both we and the user know upfront how the database will be laid out in
memory and we both are bound by that contract. And we use a
*path-dependent tree* storage to address runtime bounds, this means that
it's possible to know how much an update or query will cost by looking
at the table definition and the query itself; and neither of these affect
other portions of the game.

Magica also provides automatic derivations of indexes from the relations
defined by the user, which aim to improve on the weaknesses of its
path-dependent formulation for some queries.


Magica's type system
""""""""""""""""""""

Types are not a new concept in databases; most high-performance databases
will have typed storage, and they will rely on these types both as a
contract of how much space users should be expect to "pay for", as well
as having a rough notion of performance characteristics.

Magica uses a very simple type system, supporting:

* Booleans;
* 32-bit and 64-bit integers;
* 64-bit floating point numbers (stored in IEEE-754 form without NaN support);
* Interned text literals of varying size (stored off-table);
* User-defined enumerations (stored as 32-bit integers);

Columns also come in two modes: ``one`` and ``many``.

An ``one`` mode column stores only one value at any given point in time,
and thus we guarantee that its storage is bound by the size of the type it
holds, as well as that insertions, deletions, and queries on it require
one equality operation and one read/store operation.

A ``many`` mode column stores a set of possible values for the given type.
In the case of booleans and user-defined enumerations, we guarantee that
the storage is fixed at the number of possibilities within that type, and
insertions, deletions, and queries require a single equality and read/store
operation.

For larger integer values and interned text we use a hashed set, so operations
in it require first hashing the value to find its bucket, then some number
of equality operations to find its specific memory location within the bucket.
In general we can consider it amortised constant time.

While interned text has similar complexity as integer values, note that a
text that has not been interned before will need to be during comparison,
and for particularly large text this operation may take longer --- we can
only rule out values that are not equal if their hashes diverge, but not
prove that they are equal if their hashes are equal.


Path-dependent trees
""""""""""""""""""""

Magica's database is stored in a tree-based format. This gives us worse
memory layouts if these trees cannot be fully allocated close in memory,
or cannot be *merged* for tables with fully known bounds. However, the
tree-based storage gives us nicer properties for querying the database.

Magica stores all facts in a "path-dependent tree". That is, if we have
a relation such as ``at(cecilia, garden)``, then the values in this
relation form a *path* through the trees. The path, in turn, gives us 
important information about the memory location of the values we're
looking at --- indeed, for steps in this path with known bounds, such
as user-defined enumerations, this gives us the exact location of
each value in memory. We can prove that this value exists in the
tree by checking if ``at[cecilia_index][garden_index]`` is a bound value.

This also means that we can guarantee that a query in the form of
``at(cecilia, Location)`` completes in bounded time by yielding all
values of ``Location`` that are under ``cecilia`` (a known memory location).

However, since all queries are evaluated "as a path" (left-to-right),
this means that a query of the form ``at(Who, garden)``, where ``Who`` is
unbound, cannot be made efficient in Magica, and the entire table must be
scanned in order to answer the query --- though this is still bounded at
the number of types in the first step, since we know the exact memory
location in the second step. We don't know the memory location in the second
step until after we figured out the value in the first step.

Since evaluation rules are simple and guaranteed, users can avoid these
cases and instead design their relations to take advantage of path-dependent
semantics.


Automatic indexes
"""""""""""""""""

Sometimes it's not entirely possible to remove queries that have unbound
variables in the earlier steps of the path. For these cases Magica offers
"automatic indexes". An automatic index is just a separate table where
we insert and delete the exact same values every time the main table is
updated. This means that indexes increase the insertion/deletion costs
by ``O(columns)`` for each index.

Note that since indexes store *copies* of the value, they also increase
storage needs linearly.

For example, the previous issues with ``at`` queries could be solved with:

.. code-block:: haskell

  relation (who*: person) at(room: location)
    with rev(room*, who*);

This means we have a relation ``at(many who, one room)`` and a relation
``at.rev(many room, many who)`` which are updated at the same time. We
can run queries on ``at`` when we have a bound ``Who`` component, and
we can run queries on ``at.rev`` when we have a bound ``Room`` component,
and queries at those first steps will always take constant time.


Formal semantics
----------------

We can capture the nature of Magica's databases in the following language,
where ``Sized`` and ``One`` steps allow a user to bound memory and resource
usage to a known fixed constant:

.. code-block:: haskell

  Tree t :: Zero t
          | One (v, t) t
          | OneEmpty t
          | Sized index n [(v, t), ...] t
          | Many [(v, t), ...] t

  Value v :: i32 | i64 | f64 | string | enum (as i32)

This storage then offers the following three primitive operations:

.. code-block:: haskell

  Op :: insert t [v, ...]
      | remove t [v, ...]
      | query t [q, ...]

  Query q :: v | null   -- i.e.: values may also be unbound/fresh

Operational semantics for these is given as follows:

Insertion
"""""""""

.. code-block:: haskell

  insert (Zero t) [] = (Zero t)

  insert (One (v, t) tz) [v1, ...] =
    if v == v1 => One (v, insert t [...]) tz
    else       => One (v1, tz) tz

  insert (OneEmpty t) [v1, ...] =
    One (v1, insert t [...]) t

  insert (Sized index n vs tz) [mv1, ..., vN] =
    let (v, t) = vs[index(mv1)] in
    let n2 = n + 1 if v == null else n in
    let vs2 = vs[index(mv1)] <- (mv1, insert t [..., vN]) in
    Sized index n2 vs2 tz

  insert (Many [(mv1, t1), ..., (mvN, tN)] tz) [mv1, ..., vN] =
    Many [(mv1, insert t1 [..., vN]), ..., (mvN, tN)] tz

  insert (Many [(mv1, t1), ..., (mvN, tN)] tz) [v1, ..., vN] =
    Many [(v1, insert tz [..., vN]), (mv1, t1), ..., (mvN, tN)] tz

So we proceed down the tree one link at a time. We update values in One
steps where they diverge from the current one, and we add values in Many
steps where they don't fit any of the ones we already know about.

Note that there are no new allocations in ``Sized`` steps: we update the
known memory location of the value.


Deletion
""""""""

.. code-block:: haskell

  remove (Zero t) [] = (Zero t)

  remove (One (v, t) tz) [v1, ...] =
    if v == v1 => One (v, remove t [...])
    else       => One (v, t) tz

  remove (OneEmpty t) [v1, ...] =
    OneEmpty t

  remove (Sized index n vs tz) [mv1, ...] =
    let (v, t) = vs[index(mv1)] in
    if v == null => Sized index n vs tz
    else =>
      let t2 = remove t [..., vN] in
      let (n2, vs2) = if is_empty t2 => (n - 1, vs[index(mv1)] <- (null, t2))
                      else           => (n, vs[index(mv1)] <- (v, t2))
      in Sized index n2 vs2 tz

  remove (Many [(mv1, t1), ..., (mvN, tN)] tz) [mv1, ..., vN] =
    let t1_2 = remove t1 [..., vN] in
    if is_empty t1_2 => Many [..., (mvN, tN)] tz
    else             => Many [(mv1, t1_2), ..., (mvN, tN)] tz

  remove (Many [(mv1, t1), ..., (mvN, tN)] tz) [v1, ..., vN] =
    Many [(mv1, t1), ..., (mvN, tN)] tz


  where is_empty (Zero t) = true
        is_empty (One (_, t)) = is_empty t
        is_empty (OneEmpty _) = true 
        is_empty (Sized _ n _ _) = n == 0
        is_empty (Many []) = true
        is_empty (Many [...]) = false


Similarly to insertion, we proceed one link at a time, but we short-circuit
if we can't find the value in that step. If we can find the value, then
we remove the next value from the next step, too.

Note that there's no deallocation for ``Sized`` steps: we update the known memory
location of the value.


Querying
""""""""

.. code-block:: haskell

  query (Zero t) [] = [[]];

  query (One (v1, t) _) [q1, ...] =
    if v1 == q1    => (query t [...]) map: {vs in [v1, ...vs]}
    if q1 == fresh => (query t [...]) map: {vs in [v1, ...vs]}
    else           => [];

  query (OneEmpty _) [...] = [];

  query (Sized index n vs _) [mv1, ...] =
    let (v, t) = vs[index(mv1)] in
    if v /= null => (query t [...]) map: {vs in [v, ...vs]}
    else         => [];

  query (Sized index n vs _) [fresh, ...] =
    vs flat-map: {(v, t) in if v == null => []
                            else         => (query t [...]) map: {vs in [v, ...vs]}};

  query (Many [(mv1, t1), ..., (mvN, tN)] _) [v1, ...] =
    (query t1 [...]) map: {vs in [mv1, ...vs]};
  
  query (Many vs _) [fresh, ...] =
    vs flat-map: {(v, t) in (query t [...]) map: {vs in [v, ...vs]}};

  query (Many [(mv1, t1), ..., (mvN, tN)] _) [v1, ...] =
    [];

Querying a tree is reasonably straightforward. Either we know the concrete
value we're looking for, and so we can look it up in the memory location we
expect for it; or the value is not bound (fresh), so we return all values
at that step.


Database semantics
------------------

Given the path-dependent tree primitives we can derive reasonable semantics
for the database itself. So a database can be thought of as follows:

.. code-block:: haskell

  Database db :: [r1, ..., rN];
  Relation r :: {arity, t, [i1, ..., iN]};
  Index i :: {[n0, ..., nN], t};

So a database is a collection of relations. A relation holds a tree and its
indexes. And an index holds a mapping table along with its own data tree.

Operations on these objects can be derived as follows:


Insertion
"""""""""

.. code-block::

  insert r{arity, t, ixs} [v1, ..., vN] when length([v1, ..., vN]) == arity =
    r{ arity
     , insert t [v1, ..., vN]
     , ixs map: {ix in insert ix [v1, ..., vN]}
     };

  insert i{mapping, t} vs0 =
    let vs = mapping map: {i in vs0[i]} in
    i{mapping, insert t vs};

That is, to insert a value in a relation we insert the tuple in the relation's
tree, but also insert that same tuple on every index the relation holds. This
means that more indexes raises the cost of insertion.

The indexes themselves hold a mapping table of which value from the original
relation they will move to which of its own steps in the tree. This allows
indexes to move steps around or even elide some of them if they're unnecessary.

It's the implementer's responsibility to offer an API where users are unlikely
to insert items from the indexes directly, since those are not sync'd with the
relation.


Deletion
""""""""

.. code-block::

  remove r{arity, t, ixs} [v1, ..., vN] when length([v1, ..., vN]) == arity =
    r{ arity
     , remove t [v1, ..., vN]
     , ixs map: {ix in remove ix [v1, ..., vN]}
     };

  remove i{mapping, t} vs0 =
    let vs = mapping map: {i in vs0[i]} in
    i{mapping, insert t vs};

Same as insertion, we just remove the same tuple of values from all trees.
Note that this is still safe for the remapped indexes because Magica only
supports *sets* at each step, so duplicates are not allowed.

It's the implementer's responsibility to offer an API where users are unlikely
to remove items from the indexes directly, since those are not sync'd with the
relation.


Query
"""""

.. code-block::

  query r{arity, t, _} [q1, ..., qN] when length([q1, ..., qN]) == arity =
    query t [q1, ..., qN];

  query i{_, t} [q1, ..., qN] when length([q1, ..., qN]) == length(mapping) =
    query t [q1, ..., qN];

Queries are performed directly on the index or relation, and we expec the
user to choose which one (so they can make sure it falls within their expected
resource budget). There's no mapping performed in the index queries for this
reason --- users are expected to provide a query tuple *for the index* already.