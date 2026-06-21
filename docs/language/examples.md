# Example scripts

The HREK ships a `simple/` folder of minimal, teaching-commented Megalo scripts. This page walks through three of them, explaining each line and linking back to the relevant language concepts.

Source location in a default HREK install:

```
data/multiplayer/megalo/simple/
```

## 1. Slayer — one point per kill

The simplest possible scoring script. From `simple/slayer/1.txt`:

```megalo
;this script gives one point for killing an enemy player

;loop over all players
trigger player
	;did this player die from an enemy this tick?
	condition player_died current_player enemy
	;create a temporary variable to store the killer in
	temporary player killer none

	;this gets the player who killed current_player and stores it in killer
	action player_death_get_killing_player current_player killer

	;increase killer's score by 1
	;score is a built-in numeric player member variable
	action set killer.score add 1
end
```

### Walkthrough

| Line | Explanation |
|------|-------------|
| `trigger player` | A [player trigger](/language/elements/trigger#trigger-kinds) — runs once per player, per tick. `current_player` is set to each player in turn. |
| `condition player_died current_player enemy` | A [condition](/language/elements/trigger/condition) that checks whether `current_player` was killed by an enemy this tick. If false, the trigger halts. |
| `temporary player killer none` | Declares a [temporary variable](/language/variable-model#temporary-variables) of type `player`, initialized to `none`. |
| `action player_death_get_killing_player current_player killer` | A [getter action](/language/elements/trigger/action#getter-actions) — writes the killing player into `killer`. |
| `action set killer.score add 1` | The [set action](/language/elements/trigger/action#the-set-action) — adds 1 to the killer's built-in `.score` member variable. |

This script has no `variables` block, no `engine_data`, and no includes. It relies entirely on built-in member variables and context references.

## 2. KOTH — scoring time in hills

A slightly richer script that uses object triggers, timers, and nested `for_each`. From `simple/koth/1.txt`:

```megalo
; simple version of KOTH - every hill object placed on the map can be scored in

variables player
	networked timer time_in_hill 1
end

;pause all players' timers
trigger player
	action timer_set_rate current_player.time_in_hill 0
end

;find all the hill objects
trigger object
	condition object_is_type current_object "area"
	
	; set up navpoint icon and boundary for the hill object
	action navpoint_set_visible current_object everyone
	action navpoint_set_icon current_object king
	action navpoint_set_priority current_object normal
	action boundary_set_visible current_object true
	
	;unpause timers for players in the hill
	action for_each player
		;note you can use a player reference as an object reference
		;note that we are using the current_object variable from the outer trigger
		condition object_in_area current_player current_object
		action timer_set_rate current_player.time_in_hill 1
		
		;if a guy is in here, let's make the icon blink
		action navpoint_set_priority current_object blink
	end
end

;when players' timers expire, they have spent 1 second in the hill
trigger player
	condition timer_expired current_player.time_in_hill
	action timer_reset current_player.time_in_hill
	action set current_player.score add 1
end
```

### Walkthrough

**Variables block:**

| Line | Explanation |
|------|-------------|
| `variables player` | Declares [player-scoped variables](/language/variable-model#scopes) — each player gets their own copy. |
| `networked timer time_in_hill 1` | A [networked timer](/language/variable-model#network-state) initialized to 1 second. |

**Trigger 1 — pause timers:**

| Line | Explanation |
|------|-------------|
| `trigger player` | Runs for every player, every tick. |
| `action timer_set_rate current_player.time_in_hill 0` | [Pauses](/language/elements/trigger/action#timer-actions) each player's hill timer. Rate `0` means stopped. |

**Trigger 2 — hill objects:**

| Line | Explanation |
|------|-------------|
| `trigger object` | An [object trigger](/language/elements/trigger#trigger-kinds) — runs for every object, with `current_object` set. |
| `condition object_is_type current_object "area"` | Only continues for KOTH hill objects (type `"area"` from [object lists](/language/object-lists)). |
| Navpoint actions | Sets up the hill's [navpoint and boundary](/language/elements/trigger/action#navpoint-actions) for all players. |
| `action for_each player` | A [nested sub-trigger](/language/elements/trigger#for_each-sub-triggers) iterating over all players. |
| `condition object_in_area current_player current_object` | Checks if the player is inside this hill. Uses a [player-as-object reference](/language/references#player-as-object-references). |
| `action timer_set_rate current_player.time_in_hill 1` | Unpauses the timer for players inside the hill. |
| `action navpoint_set_priority current_object blink` | Makes the hill icon blink when occupied. |

**Trigger 3 — award points:**

| Line | Explanation |
|------|-------------|
| `condition timer_expired current_player.time_in_hill` | Fires when a player's hill timer reaches zero (1 second elapsed). |
| `action timer_reset current_player.time_in_hill` | Restarts the timer for the next second. |
| `action set current_player.score add 1` | Awards one point. |

### How the three triggers work together

Every tick:
1. Trigger 1 pauses all hill timers.
2. Trigger 2 finds hill objects, and for each hill, unpauses timers for players inside it.
3. Trigger 3 awards a point whenever a player's timer expires (meaning they were in a hill for 1 full second).

The pause-unpause pattern ensures timers only count down while a player is physically inside a hill.

## 3. CTF — multi-flag capture the flag

A more complete gametype script with map objects, team variables, and multiple cooperating triggers. From `simple/ctf/1.txt`:

```megalo
;simple version of multi-flag CTF

game_options
	override teams_enabled true
	override score_to_win_round 3
		
	player_traits flag_carrier_traits
		"Flag Carrier Traits"
		"Traits applied to players carrying flags"
		speed 75
	end
end

map_object flag_spawn_point
	label "ctf_flag_spawn"
	team each
end

map_object flag_return_point
	label "ctf_flag_return"
	team each
end

variables team
	networked object flag_spawn none
	networked object flag none	
end
```

The trigger element (abbreviated):

```megalo
;set up flag spawns (only use one, even if more than one are on the map)
trigger team
	condition if current_team.flag_spawn equal_to none
	
	action for_each flag_spawn_point
		condition if current_object.team equal_to current_team
		action set current_team.flag_spawn set_to current_object
	end
end

;spawn flags
trigger team
	condition team_is_active current_team
	condition if current_team.flag equal_to none
	condition not if current_team.flag_spawn equal_to none
	
	action create_object "flag" at current_team.flag_spawn set current_team.flag never_garbage
	temporary object flag current_team.flag
	action set flag.team set_to current_team
	
	action navpoint_set_icon flag flag
	action navpoint_set_visible flag everyone
end

; did we score?
trigger team
	action for_each flag_return_point
		condition not if current_team.flag equal_to none
		condition if current_object.team equal_to carrier.team
		condition object_in_area carrier current_object
	
		action delete_object current_team.flag
		action set carrier.score add 1
	end
end
```

### Key concepts demonstrated

| Concept | Where |
|---------|-------|
| [game_options overrides](/language/elements/game-options) | `override teams_enabled true` |
| [player_traits](/language/elements/game-options/player-traits) | `flag_carrier_traits` with `speed 75` |
| [map_object labels](/language/elements/map-object) | `flag_spawn_point`, `flag_return_point` |
| [team-scoped variables](/language/variable-model#scopes) | `flag_spawn`, `flag` on `variables team` |
| [team triggers](/language/elements/trigger#trigger-kinds) | All four triggers use `trigger team` |
| [for_each with map object filter](/language/elements/trigger#for_each-sub-triggers) | `for_each flag_spawn_point` |
| [create_object](/language/elements/trigger/action#object-actions) | Spawns a flag at the team's spawn |
| [Getter + scoring pattern](/language/elements/trigger/action#getter-actions) | `get_player_holding_object` then score on capture |

## More examples

The `simple/` folder contains additional scripts for other gametypes:

| Folder | Scripts | Concepts |
|--------|---------|----------|
| `simple/slayer/` | 1.txt, 2.txt | Basic and team scoring |
| `simple/koth/` | 1.txt – 6.txt | Hill timers, territories, crazy king |
| `simple/ctf/` | 1.txt – 4.txt | Flag spawn, capture, return, neutral flag |
| `simple/juggernaut/` | 1.txt | Juggernaut assignment and traits |

For full-scale production scripts, see the main HREK `megalo/` folder (e.g. `slayer_gameplay_triggers.txt`, `3nvasion.txt`).

## See also

- [Introduction](/language/) — language overview
- [trigger](/language/elements/trigger) — trigger kinds and execution
- [condition](/language/elements/trigger/condition) — condition syntax
- [action](/language/elements/trigger/action) — action syntax
- [Variable model](/language/variable-model) — variable declarations
