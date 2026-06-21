# Parsing source

Megalo source is plain text with element keywords (`engine_data`, `trigger`, `string_table`, and so on). The parser produces a `MegaloProgram` AST.

## `parse` and `tryParse`

`parse(source)` throws `MegaloError` on failure. `tryParse(source)` returns a result object suitable for IDEs and linters:

```ts
import { tryParse } from "@blamnetwork/megalo";

const result = tryParse(source);
if (!result.ok) {
  console.error(`${result.line}:${result.column} ${result.message}`);
  return;
}

const program = result.program;
```

## Includes

Source files can reference other files with `#include "path.txt"`. Expand includes before parsing or compiling:

```ts
import { expandMegaloIncludes, parse } from "@blamnetwork/megalo";
import { readFileSync } from "node:fs";

const expanded = expandMegaloIncludes(source, {
  readFile: (path) => readFileSync(path, "utf8"),
  baseDir: "/path/to/project",
});

const program = parse(expanded);
```

Pass `includes` to compile helpers (see [Compiling](/guide/compiling)) to expand automatically.

## Analysis helpers

`analyzeMegaloSource(source)` returns parse warnings and vocabulary metadata used by editors (syntax highlighting, reserved keywords).

See also: [Compiling](/guide/compiling), [Decompiling](/guide/decompiling).
