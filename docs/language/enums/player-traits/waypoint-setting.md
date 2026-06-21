# Waypoint Setting

Value syntax for the `waypoint` and `gamertag_visibility` fields on the [Player traits](/language/enums/player-traits) enum. Both fields read from the same `e_waypoint_setting` string table (`waypoint_visibility_names`, four entries).

- **`waypoint`** — who can see a navpoint on the player
- **`gamertag_visibility`** — who can see the player's gamertag when aiming near them

## Values

| Value | Effect |
|-------|--------|
| `off` | Hidden from everyone |
| `all` | Visible to all players |
| `allies` | Visible to allies only |
| `unchanged` | Leave the previous setting unchanged |

```megalo
player_traits flag_carrier_traits
	waypoint allies
	gamertag_visibility off
end
```

Scripted waypoints can override the `waypoint` trait for specific players.

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
