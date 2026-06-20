# 49

<!-- autogen:language-version -->

Earliest Reach megalo action table in @blamnetwork/blf — the Private Alpha (Omaha) build.

| | |
|---|---|
| **Build** | Private Alpha (`v08516_10_02_19_1607_omaha_alpha`) |
| **BLF import** | `@blamnetwork/blf/haloreach/v08516_10_02_19_1607_omaha_alpha` |
| **Library support** | Action tables only — not wired as a @blamnetwork/megalo dialect. |
| **Action count** | 84 (excluding `none`) |

Megalo encoding version **49**.

## Supported Halo builds

- `08516.10.02.19.1607.omaha_alpha`

## Supported by @blamnetwork/megalo

Not supported for compile or decompile in @blamnetwork/megalo.

## Changes from prior version

Baseline megalo action table for **Private Alpha**. No earlier Reach build with an `e_action_type` enum is tracked in @blamnetwork/blf.

## Action opcodes

Action names match `e_action_type` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach/v08516_10_02_19_1607_omaha_alpha/game/megalogamengine/megalogamengine_actions.ts). Per-action documentation lives under [Actions](/language/actions/).

<LanguageActionTable version="omaha-alpha" />
