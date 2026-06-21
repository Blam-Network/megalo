# Game options

Built-in `override` tokens for [`game_options`](/language/elements/game-options).

Used with `override` and `lock override` inside `game_options`. Many options also appear as readable built-in globals in conditions — see [Built-in variables](/language/enums/built-in-variables).

<EnumVersionTable enum="game-options" />

## Notes

The **Type** column describes the override value syntax accepted by ManagedMegalo: `integer`, `boolean`, `float`, and named enums (linked to their value pages). Structured blocks (`player_traits`, `weapon_set`, `vehicle_set`, `loadout_palette`) link to their element or list documentation.

Some overrides accept structured values rather than a simple scalar — for example `base_player_traits`, `loadout_palette`, and trait references on powerup options. See [game_options](/language/elements/game-options) for declaration syntax.

## Related

- [Weapon Set](/language/enums/game-options/weapon-set) — `weapon_set`
- [Vehicle Set](/language/enums/game-options/vehicle-set) — `vehicle_set`
- [Team Scoring Method](/language/enums/game-options/team-scoring-method) — `team_scoring_mode`
