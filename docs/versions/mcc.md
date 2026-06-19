# Halo: Reach MCC

<!-- autogen:language-version -->

Current Halo: The Master Chief Collection Reach megalo build. This is the default megalo version for @blamnetwork/megalo compile and decompile.

| | |
|---|---|
| **Build** | 16th Aug 2025 (`v_untracked_25_08_16_1352`) |
| **BLF import** | `@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352` |
| **Megalo version** | `mcc` |
| **Library support** | Fully supported by @blamnetwork/megalo (default megalo version). |
| **Action count** | 106 (excluding `none`) |

Action names match `e_action_type` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach_mcc/v_untracked_25_08_16_1352/game/megalogamengine/megalogamengine_actions.ts).

<LanguageActionTable version="mcc" />

## MCC-only actions

These opcodes exist in Reach MCC but not in Xbox 360 TU1. Scripts that use them cannot be converted to TU1 without changes.

- `begin`
- `get_button_time`
- `hide_object`
- `hs_function_call`
- `player_set_vehicle_spawning`
- `set_player_respawn_vehicle`
- `set_team_respawn_vehicle`
- `team_set_vehicle_spawning`

