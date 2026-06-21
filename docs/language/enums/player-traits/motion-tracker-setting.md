# Motion Tracker Setting

Value syntax for the `tracker_mode` field on the [Player traits](/language/enums/player-traits) enum. Controls motion-tracker behavior for the player.

ManagedMegalo maps tokens to `e_motion_tracker_setting` (`motion_tracker_setting_names`, five entries). Pair with `tracker_range` (a percentage) to set radar reach.

## Values

| Value | Effect |
|-------|--------|
| `unchanged` | Leave the previous setting unchanged |
| `off` | No motion tracker |
| `allies` | Allies only on the motion tracker |
| `normal` | Standard motion tracker rules |
| `enhanced` | All players visible regardless of movement speed |

```megalo
player_traits slayer_traits
	tracker_mode off
end
```

```megalo
player_traits infected_traits
	tracker_mode enhanced
	tracker_range 150
end
```

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
