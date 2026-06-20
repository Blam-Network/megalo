# include

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

The `include` directive merges another source file into the current script at compile time:

```megalo
include "strings/slayer_strings.txt"
include "includes/multiplayer_loadouts.txt"
include "includes/sudden_death_pre.txt"
```

Included files contribute their elements to the final script. This is how Bungie shared common logic (loadouts, sudden death, achievements) across many gametypes.

Paths are quoted and relative to the current file's directory. A missing include is a **hard compile error**.

## String table wrappers

String tables are often organized as a language-agnostic wrapper that includes per-language files:

```megalo
include "strings/common_strings.txt"
```

Where `strings/common_strings.txt` is itself a list of plain includes — one per language:

```megalo
include "english/common_strings.txt"
include "french/common_strings.txt"
include "german/common_strings.txt"
```

Each language file opens with [`string_table`](/language/elements/string-table) and defines the translated strings for that locale.

## Base-derived scripts

`include` can appear in [base-derived scripts](/language/base-files) to add localized strings or shared fragments.

## See also

- [`localized_include`](/language/elements/localized-include) — optional per-language includes
- [Syntax — Includes](/language/syntax#includes)
