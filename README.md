# @blamnetwork/megalo

[![npm](https://img.shields.io/npm/v/@blamnetwork/megalo)](https://www.npmjs.com/package/@blamnetwork/megalo)

TypeScript library for parsing, compiling, and decompiling Halo: Reach **Megalo** scripts — gametypes and custom map variants.

Built on [@blamnetwork/blf](https://blam-network.github.io/blf/) for BLF chunk I/O and game variant layouts. We recommend **[MegaCrow](https://github.com/craftycodie/MegaCrow)** as a free and open-source Megalo editor.

## Features

- **Parser** — Megalo source (`.txt`) to AST (`parse`, `tryParse`)
- **Compiler** — programs to game variant or custom variant data (`compileGameVariant`, `compileCustomVariant`)
- **Decompiler** — compiled variant data back to source (`decompileGameVariant`, `decompileCustomVariant`, `emitSource`)
- **MGLO** — encode/decode custom-variant megalo bitstreams (`encodeCustomVariantMglo`, `decodeCustomVariantMglo`, `exportMgloFromBlf`)
- **BLF helpers** — extract, patch, and round-trip gametypes in BLF files (`decompileGvarFromBlf`, `patchGvarInBlf`, `roundtripGvarSource`, …)
- **Megalo versions** — Reach MCC (default) and Xbox 360 TU1 (`getDialect`, `mccDialect`, `tu1Dialect`)
- **Includes** — `#include` expansion for multi-file scripts (`expandMegaloIncludes`)

## Install

```bash
npm install @blamnetwork/megalo
```

`@blamnetwork/blf` and `@craftycodie/cstruct` are installed automatically as dependencies.

## Usage

### Parse Megalo source

```ts
import { parse } from "@blamnetwork/megalo";

const source = `engine_data
begin
name "my_gametype"
end
`;

const program = parse(source);
```

### Decompile a custom variant

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

### Gametype from BLF

```ts
import { readFileSync } from "node:fs";
import { decompileGvarFromBlf } from "@blamnetwork/megalo";

const blf = new Uint8Array(readFileSync("gametype.blf"));
const source = decompileGvarFromBlf(blf);
```

Decompilation is lossy — original variable names, constants, and comments are not recovered from compiled data.

### Supported megalo versions

| ID | Build | Library support |
|----|--------|-----------------|
| `mcc` | Halo: Reach MCC (`haloreach_mcc/v_untracked_25_08_16_1352`) | Full (default) |
| `tu1` | Halo: Reach Xbox 360 TU1 (`haloreach/v12065_11_08_24_1738_tu1actual`) | Stub |

Per-version action opcode tables: [Supported versions](https://blam-network.github.io/megalo/versions/). BLF-level TU1 ↔ MCC conversion: [`@blamnetwork/blf/helpers`](https://blam-network.github.io/blf/guide/converting-reach-gametypes).

## Documentation

Full guide, Megalo language reference, and changelog: **[blam-network.github.io/megalo](https://blam-network.github.io/megalo/)**

From the repo root: `npm run docs` (dev), `npm run docs:build`.

## Development

```bash
npm install
npm run validate   # test, typecheck, docs build
npm run build
npm run test:local # integration tests (fixtures, local game installs)
```

Link a local `@blamnetwork/blf` build while developing:

```bash
npm run link:blf
# ...
npm run unlink:blf
```

## License

MIT
