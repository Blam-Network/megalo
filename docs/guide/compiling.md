# Compiling

Compile a `MegaloProgram` into Reach variant data.

## Custom variants (`.mglo`)

```ts
import { parse, compileCustomVariant, encodeCustomVariantMglo } from "@blamnetwork/megalo";
import { decodeCustomVariantMglo } from "@blamnetwork/megalo";

const program = parse(source);
const base = decodeCustomVariantMglo(existingMgloBytes); // optional template
const variant = compileCustomVariant(program, base);
const mglo = encodeCustomVariantMglo(variant);
```

When recompiling an edited script, pass the original variant as `base` so unchanged fields (map permissions, HUD layout, and so on) are preserved.

## Game variants (gametypes)

```ts
import { parse, compileGameVariant } from "@blamnetwork/megalo";

const program = parse(source);
const variant = compileGameVariant(program, baseGameVariant);
```

Use the appropriate megalo version when the target build differs from the default MCC layout — see [Megalo versions](/guide/megalo-versions).

## BLF output

For saving back to a `.blf` file, use the gametype helpers in [Gametypes & BLF](/guide/gametypes) (`compileGametypeForSave`, `patchGvarInBlf`, and related exports).
