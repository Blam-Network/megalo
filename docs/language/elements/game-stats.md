# game_stats

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Declares which statistics appear on the scoreboard and in end-game summaries. Each line names one tracked stat:

```megalo
game_stats
	stat_caps number stat_caps_text none 1
	stat_carry_time timer stat_carry_time_text none 0
	stat_plants number stat_plants_text none 0
	stat_returns number stat_returns_text none 0
end
```

Line format:

```
<stat_name> <type> <label_string> <unit_string> <flags>
```

| Field | Purpose |
|-------|---------|
| `<stat_name>` | Internal stat identifier (e.g. `stat_caps`, `stat_carry_time`) |
| `<type>` | Value kind — `number` or `timer` in shipped scripts |
| `<label_string>` | String table symbol for the display name |
| `<unit_string>` | Unit label symbol, or `none` |
| `<flags>` | Visibility flags (`0` or `1` in shipped scripts) |

Stat values are updated at runtime through game logic — typically `set` actions on player stat members. See [Actions — Game statistics](/language/elements/trigger/action#game-statistics).

## Base-derived scripts

`game_stats` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## See also

- [Actions — Game statistics](/language/elements/trigger/action#game-statistics)
