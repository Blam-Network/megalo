# game_options

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Lobby-facing options and engine overrides. Child elements control built-in engine settings, custom lobby options, and player trait presets.

```megalo
game_options
	override score_to_win_round 25
	override teams_enabled true
	override loadout_palette spartan_tier1 slayer_loadouts
end
```

## override

Sets a built-in engine option to a new default. Built-in options can vary by megalo version — see [Game options](/language/enums/game-options) for the full list.

```megalo
game_options
	override score_to_win_round 25
	override teams_enabled true
end
```

## lock override

Sets a default and prevents the lobby from changing it:

```megalo
game_options
	lock override teams_enabled true
end
```

## option

Declares a custom discrete-choice lobby option. After the option name come name/description string symbols, the default value, then value/label pairs:

```megalo
game_options
	option kill_points
		option_name_kill_points
		option_description_kill_points
		1
		-1 neg_points_1 ""
		0 points_0 ""
		1 points_1 ""
	end
end
```

## ranged_option

Declares a numeric lobby option with min/max bounds. It can use a block or a single-line form:

```megalo
game_options
	ranged_option float_time
		option_name_float_time
		option_description_float_time
		7
		3
		16
	end

	ranged_option kill_points option_name_kill_points option_description_kill_points 1 -10 10 end
end
```

## lock option and hide option

Pin or conceal an option while still declaring its full definition (used heavily in Invasion map variants):

```megalo
game_options
	lock option phase_2_objective
		option_name_phase_2_objective
		option_description_objective
		k_gametype_territories
		k_gametype_ctf option_ctf ""
	end

	hide option hidden_gametype
		option_hidden_gametype
		""
		0
		0 hidden_slayer ""
		1 hidden_classic ""
	end
end
```

## player_traits

Defines a named trait set selectable in the lobby. See [player_traits](/language/elements/game-options/player-traits).

## Limits

A script may declare at most **16** custom lobby options (`option` / `ranged_option`) and **16** player trait sets.

## Base-derived scripts

`game_options` can appear in [base-derived scripts](/language/base-files) to override inherited options. See [Base files — Retuning options](/language/base-files#retuning-options).

## See also

- [player_traits](/language/elements/game-options/player-traits)
