# Variable model

Megalo variables hold typed values used by conditions and actions. They come in several varieties: custom variables you declare, built-in read-only engine state, and member variables attached to players, teams, and objects.

## Custom variables

Custom variables are declared in `variables` blocks at the top level of a script.

### Declaration syntax

```megalo
variables <scope>
	<network_state> <type> <name> <initial_value>
	...
end
```

Each line has four parts:

| Part | Values |
|------|--------|
| **Scope** | `global`, `player`, `team`, `object` |
| **Network state** | `local`, `networked`, `networked_high` |
| **Type** | `number`, `timer`, `object`, `team`, `player` |
| **Initial value** | A literal or constant matching the type |

```megalo
variables global
	local player killing_player none
	local number special_death_type 0
end

variables player
	local number is_leader 0
	networked timer game_start_vo 5
	networked number heard_game_start 0
	networked object body none
end

variables object
	networked timer lifetime 1
end

variables team
	networked object goal none
	networked timer vehicle_refresh 30
end
```

The scope keyword appears on the `variables` line itself (`variables global`, `variables player`, etc.).

### Limits

Each scope has a fixed pool of custom variable slots per type:

| Scope | `number` | `object` | `player` | `team` | `timer` |
|-------|----------|----------|----------|--------|---------|
| `global` | 12 | 16 | 8 | 8 | 8 |
| `player` | 8 | 4 | 4 | 4 | 4 |
| `team` | 8 | 6 | 4 | 4 | 4 |
| `object` | 8 | 4 | 4 | 2 | 4 |

Exceeding these limits fails the compile. On MCC Reach, [`temporary`](/language/elements/trigger#action-scope) variables may spill into unused global slots when overflow is enabled — see [Temporary variables — Limits (MCC Reach)](#limits-mcc-reach) and [Compiler settings](/language/compiler-settings#temporary-variable-overflow).

### Types

| Type | Holds | Example initial value |
|------|-------|----------------------|
| `number` | Integer | `0`, `25`, `k_hidden_slayer` |
| `timer` | Countdown timer | `5`, `flag_return_time` |
| `object` | Map object reference | `none` |
| `team` | Team reference | `none`, `attackers` |
| `player` | Player reference | `none` |

Megalo is type-safe: a variable's declared type is checked when it is used as an argument. Mismatched types produce a compile-time error.

### Network state

| State | Behavior |
|-------|----------|
| `local` | Not synchronized over the network. Reset to its initial value at the start of every tick to prevent misuse. |
| `networked` | Synchronized across all machines. Carries a bandwidth cost. |
| `networked_high` | Synchronized with higher priority. |

Timers are always networked — declaring a `local timer` is a compile-time error.

### Scopes

Each scope gives every instance of that kind its own copy of the variables:

| Scope | One copy per… | Accessed as… |
|-------|---------------|--------------|
| `global` | Match | `my_counter` |
| `player` | Player | `current_player.is_leader` |
| `team` | Team | `current_team.goal` |
| `object` | Object | `current_object.lifetime` |

## Member variables

Object-scoped variables (and built-in properties) are accessed with dot notation:

```megalo
action set current_player.score add 1
action set current_player.is_leader set_to 0
action set buy_zone.phase_1_timer set_to haxoring_time_phase_1
```

Common built-in member variables (not declared in `variables` blocks):

| Member | On | Type | Description |
|--------|----|------|-------------|
| `.score` | player | number | Player's current score |
| `.team` | player, object | team | Owning team |
| `.rating` | player | number | Arena rating |
| `.body` | player | object | Player's physical object |
| `.user_data` | object | number | Forge user data field |

## Constants

Constants are named numeric values declared in a `constants` block. They cannot change at runtime and incur no variable storage cost.

```megalo
constants
	number k_special_death_type_none 0
	number k_special_death_type_melee 1
	number k_special_death_type_headshot 5
	number k_cross_map_distance 400
end
```

Constants are referenced by name in conditions and actions like any other numeric value:

```megalo
condition if special_death_type equal_to k_special_death_type_headshot
action set_score add headshot_bonus player killing_player
```

## Built-in globals

Megalo scripts can read engine state through built-in global names that are not declared in `variables` blocks. These appear in conditions and `set` operands like ordinary identifiers.

Common built-in globals:

| Global | Description |
|--------|-------------|
| `round` | Current round number |
| `round_count` | Total rounds configured |
| `round_time_limit` | Round time limit (minutes) |
| `round_timer` | Elapsed round timer |
| `score_to_win_round` | Score needed to win |
| `teams_enabled` | Whether teams are active |
| `fire_teams_enabled` | Whether fireteams are active |
| `friendly_fire_enabled` | Friendly fire setting |
| `lives_per_round` | Lives per player per round |
| `respawn_time` | Respawn delay (seconds) |
| `respawn_traits_duration` | Duration of respawn traits |
| `sudden_death_timer` | Sudden death countdown |
| `grace_period_timer` | Grace period countdown |
| `grenades_on_map` | Whether grenades spawn on map |

Game options declared in `game_options` blocks also become readable constants (e.g. `kill_points`, `hidden_gametype`, `flag_return_time`).

Built-in globals can be overridden in `game_options` using `override`:

```megalo
game_options
	override score_to_win_round 25
	override round_count 1
	override round_time_limit 10
end
```

See the `OverridableGameOption` enum for the full list of overridable engine options.

## Temporary variables

Temporary variables are declared inside an [action scope](/language/elements/trigger#action-scope) — a trigger body, `for_each` sub-block, or [`begin`](/language/elements/begin) sub-block — and exist only for the duration of that scope:

```megalo
trigger player
	condition player_died current_player enemy
	temporary player killer none
	action player_death_get_killing_player current_player killer
	action set killer.score add 1
end
```

Syntax: `temporary <type> <name> <initial_value>`

Valid types are `number`, `object`, `team`, and `player`. There is no `timer` temporary.

Temporaries are useful for storing getter action results or intermediate values without declaring a permanent [`variables`](#custom-variables) slot. Each `temporary` line also counts as one **action** toward the script's 1024-action limit, because the compiler emits an internal `set` for the initial value.

### Limits (MCC Reach)

On MCC Reach, each action scope has its own dedicated temporary pool per type. Nested scopes (for example a `for_each` inside a trigger) get separate pools; leaving a scope frees temporaries declared inside it.

| Type | Dedicated temporaries | Max overflow into globals |
|------|----------------------|---------------------------|
| `number` | 10 | 12 |
| `object` | 8 | 16 |
| `team` | 6 | 8 |
| `player` | 3 | 8 |

When the dedicated pool is full, behavior depends on [compiler settings](/language/compiler-settings#temporary-variable-overflow):

- **Overflow enabled** (MegaloEdit default) — excess temporaries spill into unused **global** slots of the same type, up to the overflow cap (which matches the [global variable limits](#limits) for that type).
- **Overflow disabled** — the compile fails with *Too many temporary variables of this type*.

On **Xbox 360 TU1**, there is no separate temporary pool — temporaries map directly to globals, so the relevant cap is the global variable table above.

## Special literals

Three special built-in values appear throughout Megalo:

| Literal | Meaning |
|---------|---------|
| `true` | Boolean true (evaluates as 1) |
| `false` | Boolean false (evaluates as 0) |
| `none` | Null / empty reference for objects, players, teams |

```megalo
condition if current_team.flag equal_to none
action set current_player.body = my_body
```

## See also

- [Elements — variables](/language/elements/variables) and [constants](/language/elements/constants)
- [References](/language/references) — how variables appear as operands
- [action](/language/elements/trigger/action) — the `set` action and math operations
- [trigger](/language/elements/trigger) — `temporary` variables inside triggers
