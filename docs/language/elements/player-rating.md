# player_rating

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Configures the Arena-style per-player rating formula shown on the scoreboard and HUD. Included from `includes/arena_rating_v0.txt` in many Slayer variants, or overridden partially in derived scripts:

```megalo
player_rating
	kill_weight 1
	assist_weight 0.5
	betrayal_weight 1
	death_weight 0.5
	loss_scalar 1
	rating_scale 1
	normalize_by_max_kills 1
	base_value 1000
	range 1000
	custom_stat_0 0
	custom_stat_1 0
	custom_stat_2 0
	custom_stat_3 0
	show_in_scoreboard 0
end
```

| Field | Purpose |
|-------|---------|
| `kill_weight`, `assist_weight`, `betrayal_weight`, `death_weight` | Per-event contributions to the raw rating (deaths and betrayals are subtracted) |
| `loss_scalar` | Multiplier for players not in first place |
| `rating_scale`, `normalize_by_max_kills` | Scalars applied before the final rating curve |
| `base_value`, `range` | Center and maximum deviation of the displayed rating |
| `custom_stat_0` … `custom_stat_3` | Weights for Megalo custom stats (normally left at `0`) |
| `show_in_scoreboard` | Whether the rating column appears on the scoreboard |

Pair with a `rating_widget` in [`hud_widgets`](/language/elements/hud-widgets) and HUD actions referencing `local_player.rating`. See [Actions — Player rating](/language/elements/trigger/action#player-rating).

## Base-derived scripts

`player_rating` can appear in [base-derived scripts](/language/base-files) to override rating parameters.

## See also

- [Actions — Player rating](/language/elements/trigger/action#player-rating)
- [hud_widgets](/language/elements/hud-widgets)
