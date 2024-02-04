# Lambda Garden

A set of programming languages for making story-rich games.

- [Meow](meow/) --- A computation language supporting functional and OOP idioms,
  capability security, effect handlers, multi-methods, and other modern
  niceties.

- [Lingua](lingua/) --- A parsing language based on [PEG][]. Supports composable
  grammars and language-agnostic semantic predicates.

- [Magica](magica/) --- A path-dependent logic database with a notion of
  discrete time. Designed for holding game state with predictable query and
  update performance.

- Ato --- A logic simulation language building on top of Magica and Meow.
  Designed for expressing game rules and classic symbolic AI.

- Finé --- A protocol language for defining contracts between different
  languages, processes, or locations. Similar to other data serialisation
  formats but supports capability security and can do zero-copy transfers
  or shares.

- LJT --- A versioned data serialisation language for long-lived data storage.
  LJT uses similar idioms found in database (e.g.: migrations) to move
  versioning and patching into the schema and away from target languages.

- Imagine --- A declarative UI language based on incremental nodes and
  reactive programming. Uses signals to make UIs target-language agnostic,
  and in that sense has a sort of algebraic effect basis.

- Novella --- A directing language for visual novels and similarly interactive
  story-telling in video games.

## Licence

Lambda Garden is part of the [Kate](https://github.com/qteatime/kate) project and is released under the [Mozilla Public Licence v2.0][mpl]. This means that you can use it for anything, commercial or not, but if you modify _the lambda garden code itself and distribute that modified version_, then you must make those changes public. This helps people audit trusted applications in the Kate platform.

Files under the MPLv2 licence will have the following header:

```
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
```

[mpl]: https://www.mozilla.org/en-US/MPL/
[PEG]: https://en.wikipedia.org/wiki/Parsing_expression_grammar
