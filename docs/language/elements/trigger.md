# trigger

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

The core executable element. Each trigger is an event handler: the engine evaluates its conditions, and if they all pass, it executes the trigger's actions. When any condition fails, execution **halts** for the current evaluation — subsequent conditions and actions in the same trigger are skipped.

Compile-time limits including trigger count are listed under **Limits** on each [megalo version page](/versions/) — for example [49](/versions/49/#limits), [73](/versions/73/#limits), [107](/versions/107/#limits), or [107 (MCC)](/versions/107-mcc/#limits). `trigger` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## Syntax

```megalo
trigger <kind> [<name>]
	[<conditions and actions>]
end
```

- **kind** — determines the execution context (see [Trigger kinds](#trigger-kinds))
- **name** — optional; unique within the script. When omitted, the trigger is anonymous.

```megalo
trigger initialization
	; runs once when the variant loads
end

trigger player
	condition player_died current_player enemy
	action set_score add 1 player killing_player
end

trigger bro_spawn_location
	action object_set_invincibility current_object true
end
```

## Trigger kinds

The kind controls which implicit context variables are available and how often the trigger runs.

| Kind | Context variable | Runs… |
|------|-----------------|-------|
| `general` | (none) | Once per tick, globally |
| `player` | `current_player` | Once per player, per tick |
| `random_player` | `current_player` | Once per tick, for a random player |
| `team` | `current_team` | Once per team, per tick |
| `object` | `current_object` | Once per object, per tick |
| `initialization` | (none) | Once when the variant loads |
| `local_initialization` | (none) | Once per machine at load |
| `host_migration` | (none) | After host migration |
| `double_migration` | (none) | After double host migration |
| `object_death` | `current_object` | When a bound object is destroyed |
| `local` | (none) | Local-only scope |
| `pregame` | (none) | During lobby / pre-game phase |

### Object-filter triggers

When the trigger kind is a [`map_object`](/language/elements/map-object) label name, the trigger runs once per matching object on the map, with `current_object` set to that object:

```megalo
map_object invasion_respawn_phase_1
	label "inv_res_p1"
end

trigger invasion_respawn_phase_1
	action set_respawn_filter current_object no_one
	action object_set_invincibility current_object true
end
```

This is equivalent to an `object`-kind trigger filtered to objects matching that label or type.

## Action scope

Inside `trigger` blocks and `action for_each` sub-triggers, the body is an **action scope**. Only these keywords are valid:

| Element | Purpose |
|---------|---------|
| `condition` | A predicate; halts the block if false |
| `or` | Chains the previous and next condition with logical OR |
| `action` | An imperative statement |
| `temporary` | Declares a temporary variable for this block |
| [`begin`](/language/elements/begin) | Opens an explicit sub-block (rare) |
| `end` | Closes the current scope or sub-block |

```megalo
trigger player
	condition player_died current_player enemy or
	condition if current_player.is_leader equal_to true
	action set_score add 1 player killing_player
end
```

**`or` chaining** — `or` must appear immediately after a `condition`, and must be followed by another `condition`. Only conditions can follow `or`; actions or other keywords produce a compile error.

**Capacity** — A script may contain at most **512** conditions and **1024** actions across all triggers.

**`temporary` in pregame** — `temporary` declarations are not allowed inside `pregame` triggers.

**`begin` / `end`** — Explicit sub-blocks implement if/elseif-style branching. See [begin](/language/elements/begin).

## Execution model

Triggers execute in the order they are defined in the script, on the same tick. For `player`, `team`, and `object` triggers, the engine iterates over every instance and runs the trigger body once per instance.

Within a trigger, conditions and actions are evaluated **top to bottom**:

1. Each `condition` is tested in order.
2. If a condition evaluates to **false**, the trigger **halts** — remaining conditions and actions are skipped for this evaluation.
3. If all conditions pass (or there are no conditions), actions run in order.

Actions can appear before conditions. Conditions after an action still halt the trigger if they fail — actions that already ran are not undone.

```megalo
trigger player
	action timer_set_rate current_player.game_start_vo 1

	condition if current_player.heard_game_start == 0
	condition timer_expired current_player.game_start_vo

	action submit_incident game_start_slayer player current_player player none
	action set current_player.heard_game_start = 1
end
```

## Interval

By default, triggers run every tick. An `interval` line limits execution frequency:

```megalo
trigger general
	interval 5
	; runs once every 5 seconds instead of every tick
end
```

## for_each sub-triggers

The `action for_each` statement embeds a nested trigger body that runs once per target:

```megalo
action for_each player
	condition if current_player.team equal_to attackers
	action set current_player.fireteam set_to 0
end

action for_each invasion_objective
	condition if current_object.user_data equal_to k_territory_id_main_switch
	action navpoint_set_visible current_object everyone
end
```

| Target | Iterates over… |
|--------|---------------|
| `player` | Every player |
| `team` | Every team |
| `object` | Every object |
| `general` | Runs once (no iteration) |
| `<map_object label>` | Every object matching that filter |

Inside a `for_each` block, conditions that evaluate to false **skip the current iteration** (like `continue` in C) rather than halting the entire trigger.

```megalo
action for_each invasion_objective
	temporary object buy_zone current_object

	action for_each player
		condition object_in_area current_player current_object
		action set total_in_area add 1
	end
end
```

## Temporary variables

Temporary variables can be declared at the top of a trigger or inside a `for_each` or `begin` block:

```megalo
trigger player
	temporary number temp 0
	temporary object my_body current_player

	condition player_died current_player enemy
	temporary player killer none
	action player_death_get_killing_player current_player killer
end
```

See [Variable model — Temporary variables](/language/variable-model#temporary-variables).

## Special triggers

- **`initialization`** — runs once when the gametype loads. Used for setup before gameplay (objectives, timers, intro sounds).
- **`host_migration`** — runs after the host changes mid-game. Used to restore state lost during migration.
- **`pregame`** — runs during the lobby phase. Only a whitelisted subset of conditions and actions is valid; `temporary` is not allowed.

```megalo
trigger initialization
	action play_sound team defenders bone_cv_ph1_intro
	action timer_set_rate buy_zone_timer 1
end

trigger host_migration
	action for_each invasion_gates
		condition if current_object.user_data equal_to buy_zone.user_data
		action delete_object current_object
	end
end
```

## See also

- [condition](/language/elements/trigger/condition) — condition syntax and operators
- [action](/language/elements/trigger/action) — action syntax and families
- [begin](/language/elements/begin) — explicit sub-blocks
- [Example scripts](/language/examples) — annotated trigger walkthroughs
