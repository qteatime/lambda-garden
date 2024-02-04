# meow.template

A text templating language in similar veins to HTML-ish templating languages
designed for arbitrary string generation without knowing the semantics of the
target language upfront. We do this by reifying the structure of the template
itself as a free structure (in other words: we have a proper AST _at runtime_).

## Template language

    expr ::
      | text | bool | int | null | map | array | byte
      | var
      | fn(expr...)
      | if (expr) { expr } else { expr }
      | for (pattern in expr) { expr }
