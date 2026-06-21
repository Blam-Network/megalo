# Forced Change Color Setting

Value syntax for the `color` field on the [Player traits](/language/enums/player-traits) enum. Forces the player's armor tint to a preset color.

ManagedMegalo maps named tokens to `e_forced_change_color_setting` (`forced_change_color_names`, fourteen entries). Scripts can also set an explicit RGB triple (`color R G B`) outside the named enum table.

## Named values

| Value | Effect |
|-------|--------|
| `off` | No forced color |
| `default` | Map default color |
| `red` | Red tint |
| `blue` | Blue tint |
| `green` | Green tint |
| `yellow` | Yellow tint |
| `purple` | Purple tint |
| `orange` | Orange tint |
| `brown` | Brown tint |
| `pink` | Pink tint |
| `white` | White tint |
| `black` | Black tint |
| `zombie` | Infection zombie tint |
| `extra4` | Extra palette slot 4 |

## RGB form

Any three integers **0–255** set a custom tint directly:

```megalo
player_traits team_red
	color 255 10 10
end
```

RGB lines bypass the named enum and write the raw color components.

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
