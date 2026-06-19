# Install & quick start

## Install

```bash
npm install @blamnetwork/megalo
```

`@blamnetwork/blf` and `@craftycodie/cstruct` are installed automatically as dependencies.

## Parse Megalo source

Parse a minimal engine data section into an AST:

```ts
import { parse } from "@blamnetwork/megalo";

const source = `engine_data
begin
name "my_gametype"
end
`;

const program = parse(source);
```

For editor-style error reporting, use `tryParse` instead of `parse` — it returns `{ ok: true, program }` or `{ ok: false, message, line, column }` without throwing.

## Decompile a custom variant

Read a compiled `.mglo` bitstream and emit Megalo source:

```ts
import { readFileSync, writeFileSync } from "node:fs";
import {
  decodeCustomVariantMglo,
  decompileCustomVariant,
  emitSource,
} from "@blamnetwork/megalo";

const mglo = new Uint8Array(readFileSync("variant.mglo"));
const variant = decodeCustomVariantMglo(mglo);
const program = decompileCustomVariant(variant);
const source = emitSource(program);

writeFileSync("variant.txt", source, "utf8");
```

Next: [Parsing source](/guide/parsing), [Compiling](/guide/compiling), or [Gametypes & BLF](/guide/gametypes) for full BLF round-trips.
