# About

<!-- autogen:language-version -->

Public Beta (Omaha Delta) megalo build. Action tables are available in @blamnetwork/blf for historical comparison.

Megalo encoding version **73**.

## Supported Halo builds

- `09730.10.04.09.1309.omaha_delta`
- `09664.10.04.06.2121.omaha_beta`

## Supported by @blamnetwork/megalo

Not supported for compile or decompile in @blamnetwork/megalo.

## Changes from prior version

Compared to [49](/versions/49/about).

### Actions added

- `player_set_unit` (opcode 42)
- `object_get_health` (opcode 55)
- `player_get_weapon` (opcode 84)
- `player_get_equipment` (opcode 85)
- `object_set_never_garbage` (opcode 86)
- `player_get_target_object` (opcode 87)
- `create_tunnel` (opcode 88)
- `debug_force_player_view_count` (opcode 89)
- `player_pick_up_weapon` (opcode 90)
- `player_set_coop_spawning` (opcode 91)
- `object_set_orientation` (opcode 92)

### Actions removed

- `object_set_minimap_visibility` (opcode 56)
- `object_set_minimap_priority` (opcode 57)
- `object_set_minimap_icon` (opcode 58)

See the [Actions](/versions/73/actions) page for the full opcode list on this build.
