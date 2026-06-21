# Weapon Set

Value syntax for the `weapon_set` override in [`game_options`](/language/elements/game-options). Restricts which weapons can appear on the map according to a named preset from [`weapon_sets.txt`](/language/object-lists#weapon_sets).

ManagedMegalo stores the resolved value in `m_weapon_set_absolute_index` on the game variant's map override options.

## Sentinel values

These tokens are **not** entries in `weapon_sets.txt`. They use reserved negative indices:

| Token | Index | Effect |
|-------|------:|--------|
| `none` | -1 | Do not apply a weapon-set filter. Use when weapons are controlled elsewhere (loadouts, `player_traits`, scripted spawns). |
| `default` | -2 | Use the **map's default** weapon restriction. Stock gametypes ship with this value when no override is written. |
| `random` | -3 | Pick a random named preset from `weapon_sets.txt`. |

```megalo
override weapon_set none
override weapon_set default
override weapon_set random
```

## Named presets

Any other identifier must match a line in [`weapon_sets.txt`](/language/object-lists#weapon_sets). Line order is the preset index (**zero-based**; first line = `0`).

```megalo
override weapon_set slayer_pro
override weapon_set no_weapons
```

<DocsBlock type="info" title="none vs no_weapons">

`none` disables the weapon-set system entirely. `no_weapons` is a named preset that actively restricts weapons through the set table. Infection and Grifball typically use `none` because traits/loadouts define the actual weapons.

</DocsBlock>

## See also

- [Vehicle Set](/language/enums/game-options/vehicle-set)
- [Game options](/language/enums/game-options)
- [Object lists — weapon_sets.txt](/language/object-lists#weapon_sets)
