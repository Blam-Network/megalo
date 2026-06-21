# Compiler settings

Megalo source does not declare these options — they are **compile-time switches** that change how strictly the compiler interprets your script. The same `.txt` file can produce errors, warnings, or different variable allocation depending on which mode the editor uses.

HREK **MegaloEdit** always compiles in **lenient mode** (permissive defaults). Bungie's internal build farm probably used stricter settings. The switches live in **ManagedMegalo.dll** (`ParsingHelper`, `MegaloCompiler`); MegaloEdit wires them in but does not expose them in the UI.

MegaloEdit also exposes **input** and **output directory** settings (File → Settings). These paths control where the compiler looks for external files:

| Setting | Used when resolving |
|---------|---------------------|
| **Input directory** | [`include`](/language/elements/include) and [`localized_include`](/language/elements/localized-include) paths |
| **Output directory** | [`base`](/language/elements/base) references to compiled `.mglo` files |

Include paths in source are relative to the input directory (and the including file). Base paths name a compiled variant in the output directory — by default `maps/megalo` under the HREK install when using MegaloEdit.exe. Compile the parent script first so its `.mglo` exists before building a derived script that references it. See [Base files](/language/base-files).

## localized_include strictness

Controls whether a missing [`localized_include`](/language/elements/localized-include) is optional or fatal.

| Mode | Missing file behavior |
|------|----------------------|
| **Lenient** (MegaloEdit) | Warning, include skipped — compile continues |
| **Strict** | Hard error, same as a missing plain [`include`](/language/elements/include) |

When the file exists, behavior is identical in both modes.

MegaloEdit always uses lenient mode. See [`localized_include`](/language/elements/localized-include).

*ManagedMegalo.dll: `enforceLocalizedIncludes` on `ParsingHelper`.*

## String literal strictness

Controls whether **quoted literal strings** in places that expect a string-table symbol are allowed.

Many elements require string table tokens — `engine_data name slayer_title`, not `engine_data name "Slayer"`. In lenient mode, a literal still compiles but produces a warning:

> *You used a literal string '…'. Fix this before you submit. The build farm enforces localization.*

In strict mode, the same literal is a **hard error**. Strict mode also blocks quoted strings anywhere the parser is enforcing localization.

MegaloEdit always uses lenient mode. Shipped Reach scripts use string-table symbols throughout.

*ManagedMegalo.dll: `enforceLocalization` on `ParsingHelper`.*

## Temporary variable overflow

A **`temporary`** is a scratch variable declared inside a trigger or `for_each` block with the `temporary` keyword. It exists only for the duration of that block's execution — useful for holding getter results or intermediate values without declaring a permanent [`variables`](/language/elements/variables) slot. See [Variable model — Temporary variables](/language/variable-model#temporary-variables).

Temporary allocation has changed across Megalo versions:

- **Originally** — when `temporary` was introduced, the compiler treated temporaries as **global variables**, allocating them directly from the global variable pool.
- **Halo 4** — added a **dedicated temporaries pool**, effectively increasing how many scratch variables a trigger could use without consuming globals.
- **Reach MCC** — that separate pool was **backported** from Halo 4. Xbox 360 TU1 Reach still uses the original global-mapping behavior.

This overflow setting only applies to Megalo versions **after Xbox 360 TU1** (Reach MCC and later). On TU1, temporaries already map to globals — there is no separate pool to overflow from.

On MCC Reach, each [action scope](/language/elements/trigger#action-scope) has a fixed dedicated temporary pool per type. Per scope:

| Type | Dedicated pool | Max overflow into globals |
|------|----------------|----------------------------|
| `number` | 10 | 12 |
| `object` | 8 | 16 |
| `team` | 6 | 8 |
| `player` | 3 | 8 |

When overflow is **enabled** (MegaloEdit default), the compiler may spill excess temporaries into **unused global variable slots** of the same type once the dedicated pool is full, up to the overflow cap. When overflow is **disabled**, running out of temporary slots fails the compile.

This affects how much logic you can pack into a single scope — not syntax, but whether deeply nested `temporary` declarations are accepted. See [107 (MCC) — Limits](/versions/107-mcc/#limits) and [107 — Limits](/versions/107/#limits) for scope nesting and TU1 behavior.

*ManagedMegalo.dll: `TemporaryVariablesCanOverflowIntoUnusedGlobalVariables` on `MegaloCompiler`.*

See also [Megalo versions](/guide/megalo-versions) (MCC vs TU1).

## Summary

| Setting | Lenient (MegaloEdit) | Strict | Language feature |
|---------|---------------------|---------------------|------------------|
| Input directory | — | — | [`include`](/language/elements/include), [`localized_include`](/language/elements/localized-include) |
| Output directory | — | — | [`base`](/language/elements/base) (`.mglo` lookup) |
| Localized includes | Missing file → warning | Missing file → error | [`localized_include`](/language/elements/localized-include) |
| String literals | Warning | Error | String-table symbols vs `"quoted"` text |
| Temporary overflow (MCC+) | Spill into free globals | Compile fails when pool full | [`temporary`](/language/elements/trigger#action-scope) in triggers |

## See also

- [Base files](/language/base-files) — derived scripts and `.mglo` lookup
- [`localized_include`](/language/elements/localized-include)
- [Syntax — Includes](/language/syntax#includes)
- [trigger — Action scope](/language/elements/trigger#action-scope)
- [Variable model — Temporary variables](/language/variable-model#temporary-variables)
- [Megalo versions](/guide/megalo-versions) — MCC vs Xbox 360 TU1
