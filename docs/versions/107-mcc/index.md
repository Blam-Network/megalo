# 107 (MCC)

Current Halo: The Master Chief Collection Reach megalo build. This is the default megalo version for @blamnetwork/megalo compile and decompile.

| | |
|---|---|
| **Game** | <ReachGameIcon /> |
| **Megalo Version** | 107 |
| **Supported Halo Versions** | All Halo: Reach MCC builds. |

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

Reach MCC also adds megalo language features beyond new action opcodes — [bit-shift math operators](/language/enums/math-operations), temporary explicit references, survival/firefight flags, and more. See [Megalo MCC changes](https://blam-network.github.io/blf/guide/megalo-mcc-changes) in the blf docs.

## Limits

<VersionLimits />

Per-action pages are listed under **Actions** in the sidebar.
