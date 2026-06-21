# Active Camo Setting

Value syntax for the `active_camo` field on the [Player traits](/language/enums/player-traits) enum. Sets passive active camouflage quality for the player.

ManagedMegalo maps tokens to `e_active_camo_setting` (`active_camo_setting_names`, six entries).

## Values

| Value | Effect |
|-------|--------|
| `off` | No active camo |
| `on` | Active camo enabled at default quality |
| `poor` | Low-quality active camo |
| `good` | Medium-quality active camo |
| `excellent` | High-quality active camo |
| `invisible` | Maximum active camo (effectively invisible) |

```megalo
player_traits stealth_traits
	active_camo invisible
end
```

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
