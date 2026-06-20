# 73

Public Beta (Omaha Delta) megalo build. Action tables are available in @blamnetwork/blf for historical comparison.

| | |
|---|---|
| **Build** | Public Beta (`v09730_10_04_09_1309_omaha_delta`) |
| **BLF import** | `@blamnetwork/blf/haloreach/v09730_10_04_09_1309_omaha_delta` |
| **Library support** | Action tables only — not wired as a @blamnetwork/megalo dialect. |
| **Action count** | 92 (excluding `none`) |

Megalo encoding version **73**.

## Supported Halo builds

- `09730.10.04.09.1309.omaha_delta`
- `09664.10.04.06.2121.omaha_beta`

## Supported by @blamnetwork/megalo

Not supported for compile or decompile in @blamnetwork/megalo.

## Changes from prior version

Compared to [49](/versions/49/).

### Actions added

- [`player_set_unit`](/language/actions/player-set-unit) (opcode 42)
- [`object_get_health`](/language/actions/object-get-health) (opcode 55)
- [`player_get_weapon`](/language/actions/player-get-weapon) (opcode 84)
- [`player_get_equipment`](/language/actions/player-get-equipment) (opcode 85)
- [`object_set_never_garbage`](/language/actions/object-set-never-garbage) (opcode 86)
- [`player_get_target_object`](/language/actions/player-get-target-object) (opcode 87)
- [`create_tunnel`](/language/actions/create-tunnel) (opcode 88)
- [`debug_force_player_view_count`](/language/actions/debug-force-player-view-count) (opcode 89)
- [`player_pick_up_weapon`](/language/actions/player-pick-up-weapon) (opcode 90)
- [`player_set_coop_spawning`](/language/actions/player-set-coop-spawning) (opcode 91)
- [`object_set_orientation`](/language/actions/object-set-orientation) (opcode 92)

### Actions removed

- `object_set_minimap_visibility` (opcode 56)
- `object_set_minimap_priority` (opcode 57)
- `object_set_minimap_icon` (opcode 58)


## Action opcodes

Action names match `e_action_type` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach/v09730_10_04_09_1309_omaha_delta/game/megalogamengine/megalogamengine_actions.ts). Per-action documentation lives under [Actions](/language/actions/).

<LanguageActionTable version="omaha-delta" />
