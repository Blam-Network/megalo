# Built-in variables

Read-only engine globals that appear in conditions and [`set`](/language/actions/set) operands without a [`variables`](/language/elements/variables) declaration. Writable overrides for the game-option entries use the same names inside [`game_options`](/language/elements/game-options) `override` lines.

Names match `e_custom_variable_type` indices **13–43** in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach/v08516_10_02_19_1607_omaha_alpha/game/megalogamengine/megalogamengine_custom_variable_reference.ts). ManagedMegalo resolves them in `c_custom_variable_reference` (Reach).

<EnumVersionTable enum="built-in-variables" />

## Notes

The **Type** column describes the numeric or boolean value read from each global. Entries from `score_to_win_round` through `yellow_powerup_duration` mirror [Game options](/language/enums/game-options) overrides — the same name can be read in conditions and written with `override`.

## Example

```megalo
condition if score_to_win_round not_equal_to 0
condition if teams_enabled equal_to 1
condition if round_time_limit greater_than 0
condition timer_expired round_timer
condition if current_player.team equal_to attackers
action set symmetric_gametype set_to 0
action play_sound team defenders bone_cv_ph1_intro
```

```megalo
trigger object_death
	condition if object_death_damage_type greater_than 34
	condition if object_death_damage_type less_than 56
end
```

## See also

- [Variable model — Built-in variables](/language/variable-model#built-in-variables)
- [Team designators](/language/references#team-designators)
- [Game options](/language/enums/game-options)
- [game_options](/language/elements/game-options)
