# Vehicle Set

Value syntax for the `vehicle_set` override in [`game_options`](/language/elements/game-options). Restricts which vehicles can appear on the map according to a named preset from [`vehicle_sets.txt`](/language/object-lists#vehicle_sets).

ManagedMegalo stores the resolved value in `m_vehicle_set_absolute_index` on the game variant's map override options.

## Sentinel values

These tokens are **not** entries in `vehicle_sets.txt`. They use reserved negative indices:

| Token | Index | Effect |
|-------|------:|--------|
| `none` | -1 | Do not apply a vehicle-set filter. |
| `default` | -2 | Use the **map's default** vehicle restriction. Stock gametypes ship with this value when no override is written. |
| `random` | -3 | Pick a random named preset from `vehicle_sets.txt`. |

```megalo
override vehicle_set none
override vehicle_set default
override vehicle_set random
```

## Named presets

Any other identifier must match a line in [`vehicle_sets.txt`](/language/object-lists#vehicle_sets). Line order is the preset index (**zero-based**; first line = `0`).

```megalo
override vehicle_set mongoose_only
override vehicle_set no_vehicles
```

<DocsBlock type="info" title="none vs no_vehicles">

`none` disables the vehicle-set filter. `no_vehicles` is a named preset that removes vehicles through the set table. Invasion variants often use `no_vehicles`; Grifball may use `none` when vehicles are irrelevant to the mode.

</DocsBlock>

## See also

- [Weapon Set](/language/enums/game-options/weapon-set)
- [Game options](/language/enums/game-options)
- [Object lists — vehicle_sets.txt](/language/object-lists#vehicle_sets)
