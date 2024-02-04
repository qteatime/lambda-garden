# Magica 🔮

Magica is a database designed for turn-based games and simulations, particularly suited as a basis for storing and querying the state of simulation rules and NPC AI.

Under the hood, Magica is a path-dependent and in-memory logical database, and in that sense working with it is similar to working with [Prolog][] or [Datalog][]. You insert facts in the database, and use a logic-based language to query those facts later.

The "path-dependent" portion is where it diverges from tools like Prolog. Magica is designed for values that are expected to vary over time, and so _facts can change_ at different timesteps. Other than that, the path-dependent property also gives queries cost bound which can be reasoned about. This is important for games and simulations.

## Example

See the `examples/` folders for different examples of using Magica. But in general you'll have three steps:

1. Defining your database (from a Magica schema). Magica uses typed trees to store and query facts.

   ```
   % magica.schema/1

   version 1;

   type person = alice, dorothy, cecilia;
   type room = tavern, square;

   relation (who*: person) at(where: room);
   relation (who*: person) likes(whom*: person);
   ```

2. Populating your database with facts.

   ```
   fact alice at(tavern);
   fact dorothy at(square);
   fact cecilia at(tavern);

   fact alice likes(dorothy);
   fact cecilia likes(alice);
   fact dorothy likes(cecilia);
   ```

3. Querying your facts.

   ```
   Who at(tavern),
   Who likes(Whom)
   ```

   Which of course results in: `Who = alice, Whom = dorothy` and `Who = cecilia, Whom  = alice` as answers.

## Path-dependent semantics

Facts in Magica are stored in a tree. Tuple values are _paths in this tree_. For example, consider:

```
relation (who*: person) at(where: location);
```

This relation defines a tree made of values of type `(person, location)`. If we give it the values `(alice, tavern)`, then it inserts the data by first fetching the known location of `alice` in that tree, then moving to the tree pointed by that location and fetching the known location of `tavern` in that tree. This makes insertion an amortised `O(n)` operation where `n` is the number of columns in the tree (we _might_ need to allocate more memory if the types involved do not have statically known bounds, or the bounds are not reasonable for static pre-allocation).

Likewise, when looking up a tuple `(alice, tavern)` we know exactly which memory location to look at. We start with `alice` and look its memory location in the first tree, then take `tavern` and look for its memory location in the new tree. The lookup succeeds if we succeed the two checks. It fails if any of the known memory locations involved are unbound. Lookups with a fully defined tuple are always `O(n)` where `n` is the number of columns in the tree. Lookups with _partially defined_ tuples (i.e.: some values are unbound and match everything) are `O(B(c1) * ... * B(cN))`, where `B(c)` is always 1 if the column has `one` modality or the value is _defined_. It's the number of places in the tree if it has `many` modality and the value is _not defined_.

Modality specifies how many values a step in this tree path can hold. When you declare a relation like `(who*: person) at(where: location)`, you're specifyin that the `who` column has modality `many` (that's what the `*` suffix means), and therefore holds a set of persons (but never duplicate values). On the other hand the `where` column has modality `one` --- it can only ever hold a single value.

If you insert two facts at a `one` modality column, like: `alice at(tavern); alice at(garden)`, then the database will only have one fact afterwards: `alice at(garden)`. Since `where` has `one` modality, any new fact inserted in that step replaces the old fact, because it can only hold one value at any point in time. This makes Magica suitable for game and simulation logic where this is _almost always what you want_, and relying on this property gives us some very nice optimisation possibilities.

## Project organisation

Magica is made out of many sub-components:

- `magica-vm/` --- The reference runtime for Magica, meant to be a library embedded in another application. The host application interacts with the database through structured queries using the host language's data structures.

- `magica-schema/` --- The compiler for the Magica schema language. Outputs JSON that can be fed into a `magica-vm` instance to prepare a database.

- `magica-editor/` --- A structural editor for Magica with built-in visualisation, testing, and debugging for query execution. Runs on Kate.

- `docs/` --- Documentation for Magica.

## Licence

Magica is part of the [Kate](https://github.com/qteatime/kate) project and is released under the [Mozilla Public Licence v2.0][mpl]. This means that you can use it for anything, commercial or not, but if you modify _the magica code itself and distribute that modified version_, then you must make those changes public. This helps people audit trusted applications in the Kate platform.

Files under the MPLv2 licence will have the following header:

```
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
```

[mpl]: https://www.mozilla.org/en-US/MPL/
[Prolog]: https://en.wikipedia.org/wiki/Prolog
[Datalog]: https://en.wikipedia.org/wiki/Datalog
