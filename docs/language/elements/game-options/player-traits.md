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

See [Player traits](/language/enums/player-traits) for the full field list and per-game availability.

A script may declare up to **16** player trait sets.

## See also

- [Player traits enum](/language/enums/player-traits)
- [Grenade Count](/language/enums/player-traits/grenade-count) — `initial_grenades`
- [Vehicle Usage Setting](/language/enums/player-traits/vehicle-usage-setting) — `vehicle_usage`
- [Sprinting](/language/enums/player-traits/sprinting) — `sprinting`
- [Equipment Usage Setting](/language/enums/player-traits/equipment-usage-setting) — `equipment_usage`
- [Active Camo Setting](/language/enums/player-traits/active-camo-setting) — `active_camo`
- [Waypoint Setting](/language/enums/player-traits/waypoint-setting) — `waypoint`, `gamertag_visibility`
- [Forced Change Color Setting](/language/enums/player-traits/forced-change-color-setting) — `color`
- [Motion Tracker Setting](/language/enums/player-traits/motion-tracker-setting) — `tracker_mode`
- [game_options](/language/elements/game-options)
