# Megalo versions

Halo: Reach on MCC uses a newer megalo scripting build than Xbox 360 Title Update 1. @blamnetwork/megalo supports two **megalo dialects** for compile and decompile; older Reach builds are documented for opcode reference only.

| Megalo version | ID | Typical use |
|----------------|-----|-------------|
| Reach MCC | `mcc` | MCC Reach gametypes and custom variants (default) |
| Xbox 360 TU1 | `tu1` | Legacy Xbox 360 Reach content |

Retail launch (encoding version **106**) and TU1 (**107**) share the same action opcode table. See [106 - Halo: Reach Release](/versions/106/) and [107 - Halo: Reach TU 1](/versions/107/) for build-specific variant layout notes.

```ts
import { getDialect, mccDialect, tu1Dialect } from "@blamnetwork/megalo";

// getDialect selects a megalo version by id
const tu1 = getDialect("tu1");
const program = tu1.decompileGameVariant(variant);
const recompiled = tu1.compileGameVariant(program, variant);
```

`mccDialect` and `tu1Dialect` are the same handlers exposed as named exports. Per-version action opcode lists are in [Megalo Versions](/versions/).

## MCC vs TU1 differences

MCC adds megalo features that do not exist on Xbox 360 — extra math operators (`<<=`, `>>=`), temporary explicit references, survival/firefight flags, and additional action types. Scripts that use MCC-only features cannot be compiled for TU1 without changes.

For BLF-level conversion between builds, use [`convert_reach_gametype`](https://blam-network.github.io/blf/guide/converting-reach-gametypes) from `@blamnetwork/blf/helpers`.

See also the [Megalo MCC changes](https://blam-network.github.io/blf/guide/megalo-mcc-changes) page in the blf docs for a feature-level comparison.
