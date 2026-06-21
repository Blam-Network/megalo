# Player traits

Field names for [`player_traits`](/language/elements/game-options/player-traits) blocks inside `game_options`. Values match the `PlayerTraitField` enum in ManagedMegalo (Reach).

Each line in a `player_traits` block sets one field. Unlisted fields keep their previous value (or engine defaults for the first application).

<EnumVersionTable enum="player-traits" />

## Notes

The **Type** column describes the value syntax for each field. Named enums link to their value pages; other types appear as plain text. Percentage fields may also accept alternate keywords in `code` (for example percentage or `invulnerable` on `damage_resistance`).

Reach availability uses megalo encoding version labels (for example **≤73**, **107+**). Most player trait fields are available on every tracked version from **49** onward on Reach, and on Halo 4 and Halo 2: Anniversary. Exceptions such as **`sprinting`** (Reach **≤73** only) are called out in the table.

Object-reference fields (`initial_primary_weapon`, `initial_secondary_weapon`, `initial_equipment`) resolve names against the gametype [object lists](/language/object-lists). `initial_grenades` uses the [Grenade Count](/language/enums/player-traits/grenade-count) syntax.

## Related

- [Grenade Count](/language/enums/player-traits/grenade-count) — `initial_grenades`
- [Vehicle Usage Setting](/language/enums/player-traits/vehicle-usage-setting) — `vehicle_usage`
- [Sprinting](/language/enums/player-traits/sprinting) — `sprinting`
- [Equipment Usage Setting](/language/enums/player-traits/equipment-usage-setting) — `equipment_usage`
- [Active Camo Setting](/language/enums/player-traits/active-camo-setting) — `active_camo`
- [Waypoint Setting](/language/enums/player-traits/waypoint-setting) — `waypoint`, `gamertag_visibility`
- [Forced Change Color Setting](/language/enums/player-traits/forced-change-color-setting) — `color`
- [Motion Tracker Setting](/language/enums/player-traits/motion-tracker-setting) — `tracker_mode`
