# About

<!-- autogen:language-version -->

Current Halo: The Master Chief Collection Reach megalo build. This is the default megalo version for @blamnetwork/megalo compile and decompile.

Megalo encoding version **107**.

## Supported Halo builds

All Halo: Reach MCC builds.

## Supported by @blamnetwork/megalo

Fully supported by @blamnetwork/megalo (default megalo dialect).

## Changes from prior version

Compared to [107](/versions/107/about).

### Actions added

- `begin` (opcode 99)
- `hs_function_call` (opcode 100)
- `get_button_time` (opcode 101)
- `team_set_vehicle_spawning` (opcode 102)
- `player_set_vehicle_spawning` (opcode 103)
- `set_player_respawn_vehicle` (opcode 104)
- `set_team_respawn_vehicle` (opcode 105)
- `hide_object` (opcode 106)

### Language changes

Reach MCC also adds megalo language features beyond new action opcodes — bit-shift assignment operators, temporary explicit references, survival/firefight flags, and more. See [Megalo MCC changes](https://blam-network.github.io/blf/guide/megalo-mcc-changes) in the blf docs.

See the [Actions](/versions/107-mcc/actions) page for the full opcode list on this build.
