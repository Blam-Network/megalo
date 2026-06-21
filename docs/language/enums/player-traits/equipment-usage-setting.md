# Equipment Usage Setting

Value syntax for the `equipment_usage` field on the [Player traits](/language/enums/player-traits) enum. Controls whether the player can activate their equipped armor ability.

ManagedMegalo maps tokens to `e_equipment_usage_setting` (`equipment_usage_setting_names`, four entries).

## Values

| Value | Effect |
|-------|--------|
| `off` | Armor abilities cannot be used |
| `on` | Armor abilities can be used |
| `disabled` | Same as `off` |
| `enabled` | Same as `on` |

```megalo
player_traits slayer_traits
	equipment_usage off
end
```

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
