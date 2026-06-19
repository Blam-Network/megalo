# Gametypes & BLF

Megalo scripts in shipped content live inside BLF files as `gvar` (game variant) or custom-variant chunks. This package wraps [@blamnetwork/blf](https://blam-network.github.io/blf/) chunk I/O with Megalo-aware helpers.

## Extract and decompile

```ts
import { readFileSync } from "node:fs";
import { decompileGvarFromBlf } from "@blamnetwork/megalo";

const blf = new Uint8Array(readFileSync("gametype.blf"));
const source = decompileGvarFromBlf(blf);
```

`extractGametypeFromBlf` and `detectGametypeChunkInBlf` expose the underlying variant object and chunk kind without decompiling.

## Export custom variant MGLO

Pull the custom-variant megalo bitstream out of a map variant BLF:

```ts
import { exportMgloFromBlf } from "@blamnetwork/megalo";

const mglo = exportMgloFromBlf(blfBytes);
```

## Round-trip and patch

| Function | Purpose |
|----------|---------|
| `roundtripGvarSource` | Decompile → recompile → BLF, returning updated bytes |
| `roundtripGvarProgram` | Re-encode an edited AST into the original BLF |
| `patchGvarInBlf` | Replace gametype script data in place |
| `compileGvarFromMegaloSource` | Parse and compile source into a BLF buffer |
| `compileGametypeForSave` | Build a save-ready BLF for a given format |

`mergeEditedProgram` combines a decompiled base program with user edits while keeping compiler context consistent.

## Dependencies

BLF chunk types and version bundles come from `@blamnetwork/blf`. Pick the import path that matches your title and build — see the [blf version guide](https://blam-network.github.io/blf/guide/versions/).
