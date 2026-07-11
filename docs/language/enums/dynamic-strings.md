# Dynamic strings

Operand type for actions that show text with optional runtime substitutions. In ManagedMegalo grammar this appears as `<dynamic_string>`; on the wire it is stored as `c_dynamic_string` — a string-table index plus up to two replaceable tokens.

A dynamic string is always a [string table](/language/elements/string-table) symbol or an [inline literal](/language/syntax#string-table-symbols-vs-inline-literals), followed by zero, one, or two reference operands that fill `%` placeholders in that text.

## Placeholders

Scan the string left to right for `%` followed by a known letter. Each match consumes the next action operand after the string. At most **two** placeholders are allowed; a third is a compile error (`Too many replacement tokens!`). Unknown `%X` sequences are ignored and do not consume an operand.

| Specifier | Operand type | Example operand |
|-----------|--------------|-----------------|
| `%n` | [Number](/language/references#reference-types) (custom variable) | `score_to_win_round`, `1`, `global.my_counter` |
| `%p` | [Player](/language/references#reference-types) | `current_player`, `killing_player` |
| `%t` | [Team](/language/references#team-designators) | `attackers`, `current_player.team` |
| `%o` | [Object](/language/references#reference-types) | `current_object`, `global.flag` |
| `%s` | [Timer](/language/references#reference-types) | `global.round_timer`, `sudden_death_timer` |

`%s` is **not** a string (unlike C `printf`). It inserts a timer — likely “**s**econds”, since `%t` already means team. The engine formats the timer’s remaining time into the slot.

Operand order matches placeholder order in the string — not the order of letters in the table above.

```megalo
action player_set_objective current_player "+%n" score_to_win_round
action hud_post_message everyone none "%p scored!" scoring_player
action navpoint_set_text current_object "%n s" global.countdown
```

At runtime the engine substitutes each token into the corresponding `%` slot (for example `"+%n"` with `score_to_win_round` → `+25`).

## Persistent vs transient

Some actions treat the dynamic string as **persistent** — the text must remain valid after the trigger finishes. Those actions reject **transient** variable references in the token operands (`Can't use transient variables when reading a persistent string`).

| Mode | Actions | Transient tokens |
|------|---------|------------------|
| Persistent | [`hud_widget_set_text`](/language/actions/hud-widget-set-text), [`hud_widget_set_value`](/language/actions/hud-widget-set-value), [`navpoint_set_text`](/language/actions/navpoint-set-text), [`player_set_objective`](/language/actions/player-set-objective), [`player_set_objective_allegiance`](/language/actions/player-set-objective-allegiance), [`player_set_objective_allegiance_icon`](/language/actions/player-set-objective-allegiance-icon) | Forbidden |
| Transient | [`hud_post_message`](/language/actions/hud-post-message), [`print_variable`](/language/actions/print-variable), [`saved_film_insert_marker`](/language/actions/saved-film-insert-marker) | Allowed |

## Used by

| Action | Grammar |
|--------|---------|
| [`hud_post_message`](/language/actions/hud-post-message) | `<team_or_player_target> <sound> <dynamic_string>` |
| [`print_variable`](/language/actions/print-variable) | `<dynamic_string>` |
| [`hud_widget_set_text`](/language/actions/hud-widget-set-text) | `<hud_widget_name> <dynamic_string>` |
| [`hud_widget_set_value`](/language/actions/hud-widget-set-value) | `<hud_widget_name> <dynamic_string>` |
| [`navpoint_set_text`](/language/actions/navpoint-set-text) | `<object> <dynamic_string>` |
| [`player_set_objective`](/language/actions/player-set-objective) | `<player> <dynamic_string>` |
| [`player_set_objective_allegiance`](/language/actions/player-set-objective-allegiance) | `<player> <dynamic_string> <engine_icon_index>` |
| [`player_set_objective_allegiance_icon`](/language/actions/player-set-objective-allegiance-icon) | `<player> <dynamic_string> <engine_icon_index>` |
| [`saved_film_insert_marker`](/language/actions/saved-film-insert-marker) | `<offset (s)> <label>` — `<label>` is parsed as a dynamic string |

## Localization

When the string is a string-table symbol, every language translation must declare the **same** placeholder types in the **same** order. Mismatched `%` tokens across languages produce a compile error. Prefer symbols over inline literals for shipped text — see [String literal strictness](/language/compiler-settings#string-literal-strictness).

## Example

```megalo
string_table english
	obj_score "+%n"
	msg_scored "%p scored!"
end

trigger player_scored
	action player_set_objective current_player obj_score score_to_win_round
	action hud_post_message everyone none msg_scored scoring_player
end
```

## See also

- [Syntax — Format placeholders](/language/syntax#format-placeholders)
- [String table](/language/elements/string-table)
- [References](/language/references)
