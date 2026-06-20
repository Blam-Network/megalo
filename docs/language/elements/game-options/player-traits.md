# player_traits

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Inside [`game_options`](/language/elements/game-options), `player_traits` defines a named trait set selectable in the lobby.

```megalo
player_traits flag_carrier_traits
	traits_name_flag_carrier_traits
	traits_description_flag_carrier_traits
	speed 75
	vehicle_usage passenger
end
```

Each block starts with a trait set name, followed by `traits_name` and `traits_description` string symbols, then trait field lines. Unlisted traits remain unchanged.

| Field | Category |
|-------|----------|
| `damage_resistance` | Defense |
| `body_recharge` | Defense |
| `shield_recharge` | Defense |
| `vampirism` | Defense |
| `headshot_immunity` | Defense |
| `body_multiplier` | Defense |
| `shield_multiplier` | Defense |
| `assassination_immunity` | Defense |
| `damage_modifier` | Offense |
| `melee_damage_modifier` | Offense |
| `initial_primary_weapon` | Weapons |
| `initial_secondary_weapon` | Weapons |
| `initial_equipment` | Weapons |
| `initial_grenades` | Weapons |
| `recharging_grenades` | Weapons |
| `infinite_ammo` | Weapons |
| `bottomless_clip` | Weapons |
| `weapon_pickup` | Weapons |
| `drop_equipment` | Weapons |
| `infinite_equipment` | Weapons |
| `speed` | Movement |
| `gravity` | Movement |
| `vehicle_usage` | Movement |
| `jump_modifier` | Movement |
| `sprinting` | Movement |
| `equipment_usage` | Movement |
| `active_camo` | Visibility |
| `waypoint` | Visibility |
| `gamertag_visibility` | Visibility |
| `color` | Visibility |
| `tracker_mode` | Visibility |
| `tracker_range` | Visibility |

A script may declare up to **16** player trait sets.

## See also

- [game_options](/language/elements/game-options)
