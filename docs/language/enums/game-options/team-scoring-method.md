# Team Scoring Method

Value syntax for the `team_scoring_mode` override in [`game_options`](/language/elements/game-options). Selects how team scores are combined when multiple players on a team can score.

ManagedMegalo maps tokens to `e_team_scoring_method` on the game variant (`set_team_scoring_method`).

## Values

| Value | Effect |
|-------|--------|
| `sum` | Add each team member's contribution |
| `minimum` | Use the lowest contributing score on the team |
| `maximum` | Use the highest contributing score on the team |
| `default` | Leave the map default unchanged |

```megalo
override team_scoring_mode sum
```

## See also

- [Game options](/language/enums/game-options)
- [game_options](/language/elements/game-options)
