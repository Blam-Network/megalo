# About

<!-- autogen:language-version -->

Original Xbox 360 Reach launch megalo build (encoding version 106). Action opcodes match Title Update 1; the custom variant layout omits AU1 settings added in TU1.

Megalo encoding version **106**.

## Supported Halo builds

- `12065.11.08.24.1738.tu1actual` (read only)
- `11860.10.07.24.0147.omaha_release`

## Supported by @blamnetwork/megalo

Not supported for compile or decompile in @blamnetwork/megalo.

## Changes from prior version

Compared to [73](/versions/73/about).

### Actions added

- `player_set_objective_allegiance` (opcode 57)
- `player_set_objective_allegiance_icon` (opcode 58)
- `object_face_object` (opcode 92)
- `biped_give_weapon` (opcode 93)
- `biped_drop_weapon` (opcode 94)
- `set_scenario_interpolator_state` (opcode 95)
- `get_random_object` (opcode 96)
- `game_grief_record_custom_penalty` (opcode 97)
- `boundary_set_player_color` (opcode 98)

### Actions removed

- `player_set_fireteam_tier` (opcode 68)
- `give_weapon` (opcode 73)
- `set_loadout` (opcode 77)

See the [Actions](/versions/106/actions) page for the full opcode list on this build.
