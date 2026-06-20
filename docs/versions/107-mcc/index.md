# 107 (MCC)

Current Halo: The Master Chief Collection Reach megalo build. This is the default megalo version for @blamnetwork/megalo compile and decompile.

| | |
|---|---|
| **Build** | 16th Aug 2025 (`v_untracked_25_08_16_1352`) |
| **BLF import** | `@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352` |
| **Megalo version** | `mcc` |
| **Library support** | Fully supported by @blamnetwork/megalo (default megalo version). |
| **Action count** | 106 (excluding `none`) |

Megalo encoding version **107**.

## Supported Halo builds

All Halo: Reach MCC builds.

## Supported by @blamnetwork/megalo

Fully supported by @blamnetwork/megalo (default megalo dialect).

## Changes from prior version

Compared to [107](/versions/107/).

### Actions added

- [`begin`](/language/actions/begin) (opcode 99)
- [`hs_function_call`](/language/actions/hs-function-call) (opcode 100)
- [`get_button_time`](/language/actions/get-button-time) (opcode 101)
- [`team_set_vehicle_spawning`](/language/actions/team-set-vehicle-spawning) (opcode 102)
- [`player_set_vehicle_spawning`](/language/actions/player-set-vehicle-spawning) (opcode 103)
- [`set_player_respawn_vehicle`](/language/actions/set-player-respawn-vehicle) (opcode 104)
- [`set_team_respawn_vehicle`](/language/actions/set-team-respawn-vehicle) (opcode 105)
- [`hide_object`](/language/actions/hide-object) (opcode 106)

### Language changes

Reach MCC also adds megalo language features beyond new action opcodes — bit-shift assignment operators, temporary explicit references, survival/firefight flags, and more. See [Megalo MCC changes](https://blam-network.github.io/blf/guide/megalo-mcc-changes) in the blf docs.


## Action opcodes

Action names match `e_action_type` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach_mcc/v_untracked_25_08_16_1352/game/megalogamengine/megalogamengine_actions.ts). Per-action documentation lives under [Actions](/language/actions/).

<LanguageActionTable version="mcc" />
