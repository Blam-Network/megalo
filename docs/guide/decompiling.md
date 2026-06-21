# Decompiling

Recover Megalo source from compiled variant data.

<DocsBlock type="warning" title="Lossy decompilation">

Decompilation is **not** a perfect round-trip. The compiled binary does not store everything from the original source, so recovered scripts are incomplete:

- **Variable names** — slots are emitted with generated names (for example `global_number_0`, `object_1`) instead of the names authors chose.
- **Constants** — named constants are not stored in the binary; decompiled output includes an empty `constants` placeholder block.
- **Comments** — `;` comments and element banner comments from the original file are not preserved (aside from structural headers added by the decompiler).

Logic, triggers, and actions can still be recovered, but you should expect to rename variables and re-add constants and comments by hand before treating output as authoritative source.

</DocsBlock>

## Custom variants

```ts
import {
  decodeCustomVariantMglo,
  decompileCustomVariant,
  emitSource,
} from "@blamnetwork/megalo";

const variant = decodeCustomVariantMglo(mgloBytes);
const program = decompileCustomVariant(variant);
const source = emitSource(program);
```

`emitSource` formats elements, triggers, string tables, and identifiers in the style Reach tools expect.

## Game variants

```ts
import { decompileGameVariant } from "@blamnetwork/megalo";

const program = decompileGameVariant(gameVariant);
```

## From BLF

Extract gametype data from a BLF buffer first, then decompile:

```ts
import { extractGametypeFromBlf, decompileGvarFromBlf } from "@blamnetwork/megalo";

const source = decompileGvarFromBlf(blfBytes);
```

See [Gametypes & BLF](/guide/gametypes) for chunk detection and round-trip workflows.
