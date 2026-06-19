# Object lists

Reach ships a folder of plain-text **object lists** beside the Megalo scripts. In a default Halo Reach Editing Kit (HREK) install they live at:

```
data/multiplayer/megalo/object_lists/
```

(for example `…/HREK/data/multiplayer/megalo/object_lists/` under Steam).

Bungie's Megalo editor (**MegaloEdit**) loads these files for autocomplete, syntax help, and the **Help** menu reference lists. The game engine uses the same tables to turn symbolic names in scripts into numeric indices when a gametype or custom variant is compiled.

## Format

Each file is a simple lookup table:

- **One entry per line** — a snake_case identifier with no punctuation.
- **Line order is the index** — the first line is index `0` (or id `1` where noted below). Blank lines in some lists (notably `incidents.txt`) still consume an index slot in the engine.
- **Names are stable vocabulary** — you type them literally in Megalo source (`action create_object warthog …`, `submit_incident kill`, and so on).

These lists are **not** Megalo script sections. They are engine data that scripts reference by name.

## What each file is for

| File | Entries | Used for |
|------|---------|----------|
| [`objects.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/objects.txt) | ~220 | **Master object type table.** Weapons, vehicles, equipment, scenery, spawn points, Forge objects, and special markers. Referenced by `create_object`, `set_pickup_filter`, `set_respawn_filter`, `object_matches_filter`, respawn/vehicle actions, and `map_object` `type` fields. |
| [`weapons.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/weapons.txt) | 24 | **Player trait primary/secondary weapons.** Subset of `objects.txt` in a fixed order. Used in `player_traits` blocks (`primary_weapon`, `secondary_weapon`). Indices are resolved against which object types the gametype actually uses. |
| [`equipment.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/equipment.txt) | 10 | **Player trait equipment slot.** Armor abilities and equipment (`sprint_equipment`, `jet_pack_equipment`, …). Same absolute-index rules as weapons. |
| [`vehicles.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/vehicles.txt) | 34 | **Vehicle names** for trait and filter operands where the editor offers a vehicle picker (subset of entries from `objects.txt`). |
| [`grenades.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/grenades.txt) | 4 | **Grenade types** in `player_traits` `initial_grenades` (`frag_grenade`, `plasma_grenade`, `spike_grenade`, `firebomb_grenade`). |
| [`incidents.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/incidents.txt) | ~470 | **Game incidents** for `submit_incident` and `submit_incident_with_custom_value`. Covers kills, medals, mode events (CTF, KOTH, Infection, …), survival, achievements, and announcer triggers. Incident ids are **1-based** (first line = incident `1`). |
| [`loadout_palettes.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/loadout_palettes.txt) | 15 | **Loadout palette presets** for `set_loadout_palette` and `override loadout_palette` (`slayer_loadouts`, `objective_loadouts`, firefight palettes, …). |
| [`loadouts.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/loadouts.txt) | ~80 | **Loadout display names** (`loadout_name_carter`, `loadout_name_ninja`, …). Used by the editor and UI when presenting loadout choices, not as action opcodes. |
| [`weapon_sets.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/weapon_sets.txt) | 16 | **Weapon restriction presets** (`rifles_only`, `no_snipers`, `melee`, …). MegaloEdit exposes these for built-in weapon-set game options. |
| [`vehicle_sets.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/vehicle_sets.txt) | 14 | **Vehicle restriction presets** for the `vehicle_set` game option (`mongoose_only`, `no_aircraft`, `all_vehicles`, …). |
| [`hud_widget_icons.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/hud_widget_icons.txt) | 33 | **HUD widget icons** for `hud_widget_set_icon` (`slayer`, `ctf`, `koth`, `generic_icon_2`, …). |
| [`strings.txt`](https://github.com/Blam-Network/megalo/blob/main/src/object_lists/strings.txt) | ~58 | **Device animation / string tokens** for `device_animate_position` and related device actions (map-specific animation names like `mp_boneyard_a_fly_in`, plus generic entries such as `default` and `none`). |

## Relationship to `objects.txt`

Most specialized lists are **subsets or views** of the master `objects.txt` table:

- `weapons.txt` and `equipment.txt` list names that also appear in `objects.txt`, but player traits encode them using a compressed **absolute index** that depends on which object types the gametype marks as used.
- `vehicles.txt` is a convenience list for vehicle pickers; vehicle types still resolve through `objects.txt` indices in compiled data.

When in doubt, check whether a name exists in `objects.txt` — that is the authoritative object-type namespace for spawn and filter actions.

## In @blamnetwork/megalo

The library vendors copies of these files under [`src/object_lists/`](https://github.com/Blam-Network/megalo/tree/main/src/object_lists) and exposes the parsed tables from [`src/lookups_data.ts`](https://github.com/Blam-Network/megalo/blob/main/src/lookups_data.ts) (for example `MEGALO_OBJECTS`, `MEGALO_INCIDENTS`, `MEGALO_LOADOUT_PALETTES`). Decompile and compile use these names when turning binary operands back into source and vice versa.

If 343 Industries or mod tools ship an updated HREK build with changed lists, sync `src/object_lists/` and regenerate `lookups_data.ts` to stay aligned with the editor.

## See also

- [Megalo language overview](/language/) — `map_object`, `player_traits`, and actions that consume these names
- [Supported megalo versions](/versions/) — action opcodes per Reach build
