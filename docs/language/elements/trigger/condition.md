# condition

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

**Conditions** are predicates inside triggers that control when actions run. When a condition evaluates to false, the trigger **halts** — subsequent conditions and actions in that trigger are skipped for the current evaluation.

Condition names match `e_condition_type` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach_mcc/v_untracked_25_08_16_1352/game/megalogamengine/megalogamengine_conditions.ts) (`none` is a wire sentinel and is not written in source).

<EnumVersionTable enum="condition-types" />

## Syntax

```megalo
condition [not] <name> [arg1] [arg2] ... [or]
```

- **`not`** — optional prefix that negates the result
- **`name`** — the condition type (e.g. `if`, `player_died`, `timer_expired`)
- **args** — operands specific to the condition type
- **`or`** — optional suffix that joins this condition with the next using logical OR

```megalo
condition if score_to_win_round != 0
condition if teams_enabled == 1
condition player_died current_player enemy
condition not if current_player.heard_game_start == 0
condition timer_expired current_player.game_start_vo
```

## Comparison conditions (`if`)

The `if` condition compares two values. It supports several operator spellings:

| Operator | Alternatives |
|----------|-------------|
| `equal_to` | `==` |
| `not equal_to` | `!=` |
| `less_than` | `<` |
| `greater_than` | `>` |
| `less_than_or_equal_to` | `<=` |
| `greater_than_or_equal_to` | `>=` |

```megalo
condition if hidden_gametype equal_to k_hidden_swat
condition if score_to_win_round != 0
condition if round_time_limit > 0
condition if current_player.is_leader equal_to true
condition if shields > 100
condition not if current_player.score == 0
```

Both sides of a comparison can be variables, constants, built-in globals, game options, or member variables.

## Event conditions

Event conditions test game state rather than comparing values. The table above lists every condition type; common examples:

```megalo
condition player_died current_player enemy
condition timer_expired round_timer
condition object_in_area current_player current_object
condition object_out_of_bounds current_team.flag
condition team_is_active current_team
condition object_is_type current_object "area"
```

### player_died killer types

```megalo
condition player_died current_player environment
condition player_died current_player suicide
condition player_died current_player enemy
condition player_died current_player betrayal
condition player_died current_player quit_game
condition not player_died current_player enemy
```

## Combining conditions

### AND (implicit)

Separate condition lines act as a logical **AND**. All must be true for subsequent actions to run:

```megalo
trigger player
	condition player_died current_player enemy
	condition if current_player.is_leader equal_to true
	action set_score add leader_kill_bonus player killing_player
end
```

### OR

Append `or` to a condition line to join it with the next condition using logical **OR**:

```megalo
trigger general
	condition if hidden_gametype equal_to k_hidden_covy or
	condition if hidden_gametype equal_to k_hidden_swat
	action for_each health_packs
		action delete_object current_object
	end
end
```

Multiple `or`-joined conditions can span several lines:

```megalo
condition if current_player.team equal_to attackers or
condition if current_player.team equal_to fourth_party or
condition if current_player.team equal_to third_party
```

If the combined OR group evaluates to false, the trigger halts.

### NOT

Prefix a condition with `not` to invert its result:

```megalo
condition not if current_player.heard_game_start == 0
condition not player_died current_player enemy
condition not if one_flag equal_to none
```

## Conditions inside for_each

Inside an `action for_each` sub-trigger, a false condition **skips the current iteration** rather than halting the entire trigger. This is equivalent to a `continue` statement:

```megalo
action for_each player
	condition if current_player.team equal_to attackers
	action set current_player.fireteam set_to 0
end
```

Only players on the attacking team have their fireteam set; other players are skipped.

## Condition placement

Conditions can appear anywhere in a trigger — before actions, between actions, or after actions. Actions that appear before a failing condition have already executed:

```megalo
trigger team
	; this action always runs
	action set_pickup_filter current_team.flag enemies

	temporary player carrier none
	action get_player_holding_object current_team.flag carrier

	; this condition gates what follows
	condition not if carrier equal_to none
	action apply_player_traits carrier flag_carrier_traits
end
```

## See also

- [trigger](/language/elements/trigger) — trigger execution model and halt-on-false
- [action](/language/elements/trigger/action) — actions that follow conditions
- [Variable model](/language/variable-model) — operands in comparisons
- [References](/language/references) — player, team, object operands
