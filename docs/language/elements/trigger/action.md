# action

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

**Actions** are imperative statements inside triggers that change game state. They run in order, top to bottom, after all preceding conditions in the trigger have passed.

## Syntax

```megalo
action <name> [arg1] [arg2] ...
```

Each action line names an opcode followed by its operands. Operands can be variables, constants, references, literals, or string table symbols depending on the action.

```megalo
action set my_counter add 1
action set_score add kill_points player killing_player
action hud_post_message everyone "Round started!"
action create_object "warthog" at current_player never_garbage
action submit_incident game_start_slayer player current_player player none
```

## The set action

The `set` action modifies a variable. It takes a target, an operation, and a value:

```megalo
action set <target> <operation> <value>
```

### Math operations

| Operation | Description |
|-----------|-------------|
| `set_to` | Assign (replace) |
| `add` | Add to current value |
| `subtract` | Subtract from current value |
| `multiply_by` | Multiply current value |
| `divide_by` | Divide current value |
| `modulo` | Remainder |
| `=` | Shorthand for `set_to` (also accepts `==`) |

```megalo
action set my_counter set_to 0
action set my_counter add 1
action set current_player.is_leader set_to 0
action set temp modulo 5
action set current_player.heard_game_start = 1
action set round_timer set_to period_time
```

The target can be a custom variable, a member variable, or a built-in global:

```megalo
action set flag_state set_to k_flag_state_start
action set sudden_death_condition set_to true
action set current_object.team set_to defenders
```

## Getter actions

Some actions write their result into an **out-variable** rather than returning a value. The out-variable is typically a `temporary` declared in the same trigger:

```megalo
temporary player killer none
action player_death_get_killing_player current_player killer

temporary number temp 0
action player_get_place current_player temp

temporary number dist 0
action object_get_distance current_player.body killing_player.body dist

temporary player carrier none
action get_player_holding_object current_team.flag carrier
```

The out-variable is always the last operand.

## Scoring actions

Score-related actions modify player or team scores:

```megalo
action set_score add kill_points player killing_player
action set_score add death_points player current_player
action set_score add 1 team attackers
action set_score set_to 3 team defenders
```

`set_score` takes an operation, a value, and a target (`player` or `team` reference).

## Object actions

Actions that create, modify, or destroy map objects:

```megalo
action create_object "unsc_data_core" at current_object set one_flag never_garbage
action delete_object current_object
action object_destroy current_object
action object_set_invincibility current_object true
action object_attach one_flag package_cabinet 1 0 6
action object_get_distance current_object current_player distance_to_player
```

Object type names come from [object lists](/language/object-lists) (`objects.txt`).

## Timer actions

```megalo
action timer_set_rate current_player.game_start_vo 1
action timer_set_rate buy_zone.phase_1_timer 0
action timer_set_rate buy_zone.phase_1_timer -1
action timer_reset sudden_death_timer
```

Setting rate to `0` pauses the timer. Setting rate to `-1` counts down. Setting rate to `1` counts down at normal speed.

## HUD and messaging actions

```megalo
action hud_post_message player current_player none invasion_title_spartan
action hud_widget_set_text proximity_warning hud_proximity_warning
action hud_widget_set_visibility proximity_warning current_player false
action player_set_objective current_player slayer_objective score_to_win_round
```

## Navpoint actions

```megalo
action navpoint_set_visible current_object everyone
action navpoint_set_icon current_object neutralize
action navpoint_set_priority current_object high
action navpoint_set_timer current_object phase_1_timer
action navpoint_set_text current_object nav_weapon_drop
```

Navpoint priority values include `high`, `normal`, `low`, `blink`.

## Sound and incident actions

```megalo
action play_sound team attackers bone_sp_ph1_intro
action play_sound everyone immediate unsc_win1
action submit_incident inv_spartans_win_rd1 team attackers team defenders
action submit_incident dlc_achieve_5 player killing_player player current_player
```

Incident names come from [object lists](/language/object-lists) (`incidents.txt`).

## Trait, loadout, and requisition actions

```megalo
action apply_player_traits current_player leader_traits
action set_loadout_palette player current_player spartan_tier1
action set_respawn_loadout player current_player loadout_scout
```

### Requisition actions

These actions control the D-pad requisition menu. Pair them with [`requisition_palette`](/language/elements/requisition-palette) elements, which filter which scenario-defined items a player can purchase.

```megalo
action player_set_requisition_palette current_player covy_palette_bronze
action player_enable_purchases current_player alive weapons false
action player_enable_purchases current_player alive vehicles false
action player_enable_purchases current_player alive equipment false
action player_enable_purchases current_player dead weapons true
```

| Action | Arguments | Purpose |
|--------|-----------|---------|
| `player_set_requisition_palette` | `<player>` `<palette>` | Assign a named requisition palette to a player |
| `player_enable_purchases` | `<player>` `<state>` `<category>` `<enabled>` | Enable or disable purchasing. `state` is `alive` or `dead`. `category` is `weapons`, `vehicles`, `equipment`, or `all`. |

Prototype scripts swap palettes as fireteam tiers increase:

```megalo
trigger player
	condition if current_player.ft_tier equal_to 1
	action player_set_requisition_palette current_player covy_palette_silver
end

trigger player
	condition if current_player.ft_tier equal_to 2
	action player_set_requisition_palette current_player covy_palette_gold
end
```

## Device actions

For animated map objects (doors, lifts, cinematic devices):

```megalo
action device_set_position current_object 100
action device_set_position_immediate current_object 0
action device_set_power current_object 0
action device_animate_position current_object 10 30 0 5
action device_set_position_track current_object mp_boneyard_a 0
action device_get_position current_object progress
```

Animation track names come from [object lists](/language/object-lists) (`strings.txt`).

## Filter and respawn actions

```megalo
action set_pickup_filter current_object no_one
action set_respawn_filter current_object allies
action set_fireteam_respawn_filter current_object all
action player_set_primary_respawn_object current_player current_object
action team_set_coop_spawning current_team true
```

Filter values include `all`, `allies`, `enemies`, `no_one`, `none`.

## Round flow actions

```megalo
action end_round
```

## for_each

`for_each` is both an action and a sub-trigger. See [trigger — for_each](/language/elements/trigger#for_each-sub-triggers) for the full explanation.

```megalo
action for_each player
	condition if current_player.team equal_to attackers
	action set current_player.fireteam set_to 0
end
```

## Game statistics

Stats declared in [`game_stats`](/language/elements/game-stats) are updated through **player member variables** using the normal `set` action. There is no separate "increment stat" opcode — the stat name from `game_stats` becomes a field on each player.

```megalo
; One-time events
action set player_holding_flag.stat_caps add 1
action set player_holding_bomb.stat_plants add 1
action set current_player.stat_defuses add 1
action set killing_player.stat_infections add 1

; Timer stats — incremented every tick while a condition holds
action set player_holding_flag.stat_carry_time add 1
action set current_player.stat_objective_time add 1
action set current_player.stat_survival_time add 1
```

Typical pattern: a `trigger player` or per-frame trigger adds `1` to a timer stat while the player is performing an action (carrying a flag, holding a bomb, standing on an objective). Number stats increment on discrete events (cap, plant, defuse, return).

## Player rating

Arena rating is configured declaratively in [`player_rating`](/language/elements/player-rating). The engine computes **`current_player.rating`** automatically from kills, deaths, assists, and the weights in that block. There is no action to recalculate or assign rating manually — scripts only **read** it.

To surface rating in the UI, shipped Slayer variants combine three pieces:

1. A `rating_stat` line in `game_stats` (registers the scoreboard column)
2. A `rating_widget` in `hud_widgets`
3. Per-frame trigger actions that copy the live value and refresh the widget

```megalo
game_stats
	rating_stat number rating_stat_text none 0
end

hud_widgets
	rating_widget top_left
end

trigger player
	action set current_player.rating_stat set_to current_player.rating
	action hud_widget_set_text rating_widget player_rating_widget_text local_player.rating
	action hud_widget_set_visibility rating_widget current_player true
end
```

Set `show_in_scoreboard 1` in `player_rating` (or override it in a derived script like `arena_slayer.txt`) to show the rating column without extra trigger logic.

## Action families summary

| Family | Example opcodes |
|--------|----------------|
| Variables | `set`, `random` |
| Scoring | `set_score` |
| Statistics | `set` on `player.<stat_name>` members |
| Rating | read `player.rating`; copy to `player.rating_stat` via `set` |
| Objects | `create_object`, `delete_object`, `object_destroy`, `object_set_invincibility`, `object_attach` |
| Timers | `timer_set_rate`, `timer_reset` |
| HUD | `hud_post_message`, `hud_widget_set_text`, `hud_widget_set_visibility` |
| Navpoints | `navpoint_set_visible`, `navpoint_set_icon`, `navpoint_set_priority`, `navpoint_set_timer` |
| Sound | `play_sound` |
| Incidents | `submit_incident`, `submit_incident_with_custom_value` |
| Traits | `apply_player_traits`, `set_loadout_palette` |
| Requisition | `player_set_requisition_palette`, `player_enable_purchases` |
| Devices | `device_set_position`, `device_animate_position`, `device_set_power` |
| Filters | `set_pickup_filter`, `set_respawn_filter`, `set_fireteam_respawn_filter` |
| Players | `player_set_objective`, `player_set_primary_respawn_object`, `player_enable_purchases` |
| Getters | `player_death_get_killing_player`, `get_player_holding_object`, `object_get_distance`, `player_get_place` |
| Round flow | `end_round` |
| Iteration | `for_each` |

## Version-specific actions

The exact set of action opcodes available depends on the Reach build. See [Megalo Versions](/versions/) for per-build action tables. This page describes how actions are written; the catalog of valid action names is version-specific.

## See also

- [trigger](/language/elements/trigger) — when actions run
- [condition](/language/elements/trigger/condition) — gating actions
- [References](/language/references) — operand types
- [Variable model](/language/variable-model) — targets for `set`
- [Object lists](/language/object-lists) — symbolic names for objects, incidents, and more
