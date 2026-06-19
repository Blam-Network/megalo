# Megalo language

**Megalo** is the scripting language Bungie built for Halo: Reach multiplayer rules. Authors edit human-readable `.txt` scripts with a Megalo-aware editor; Bungie shipped **MegaloEdit.exe** with Reach. We recommend **MegaCrow** as a free and open-source alternative. The engine compiles those scripts into binary data stored inside gametype and custom map variant files.

This section documents the language itself — how scripts are structured, what triggers and actions mean, and which Reach builds @blamnetwork/megalo models. For using the TypeScript library, see the [usage guide](/guide/quick-start).

## Executive summary

A Megalo program is a sequence of **sections** that describe a gametype or custom map variant:

| Concept | Role |
|---------|------|
| **Sections** | Top-level blocks: metadata, teams, variables, triggers, HUD widgets, string tables, and more. |
| **Triggers** | Event handlers. Each trigger runs when its **conditions** are satisfied, then executes its **actions**. |
| **Conditions** | Predicates such as `if`, `player_died`, `timer_expired`, or `object_in_area`. Conditions can be combined with `and` / `or` and negated. |
| **Actions** | Imperative statements — `set`, `create_object`, `hud_post_message`, `for_each`, and dozens of others. Each action maps to a compiled opcode (`e_action_type`). |
| **Variables** | Typed slots (`number`, `timer`, `object`, `team`, `player`) scoped to global, team, player, or object storage. |
| **References** | Symbolic operands that identify players, teams, objects, timers, and custom variables at runtime. |

Megalo is not a general-purpose language. It has no functions, loops, or arbitrary expressions — only the condition/action vocabulary the engine exposes, organized into triggers that fire on game events.

## Source files

Megalo editors store scripts as plain text. A typical gametype script begins with metadata and ends with triggers:

```txt
engine_data
begin
name "my_gametype"
description "An example"
end

variables
begin
global
number my_counter
end

trigger initialization
condition
action set my_counter set_to 0
end
```

Custom map variants use the same language but compile into a separate **MGLO** bitstream embedded in the map variant BLF.

Scripts can `#include` other files; the Reach editor merges includes before compile. @blamnetwork/megalo mirrors this with `expandMegaloIncludes`.

## Sections

Common section keywords:

| Section | Purpose |
|---------|---------|
| `engine_data` | Gametype name, description, icon, and category shown in the UI. |
| `teams` | Team names, colors, models, and fireteam counts. |
| `variables` | Declares global, team, player, and object variables (`number`, `timer`, `object`, `team`, `player`). |
| `constants` | Named numeric or timer constants. |
| `map_object` | Labels map objects for object-filter triggers and actions. `type` values come from [object lists](/language/object-lists) (`objects.txt`). |
| `map_permissions` | Forge placement permissions per object type. |
| `player_traits` | Reusable trait sets applied by the `apply_player_traits` action. |
| `game_options` | User-facing lobby options (`option`, `ranged_option`, `override`). |
| `hud_widgets` | On-screen HUD elements (text, meters, icons). |
| `string_table` | Localized UI strings referenced by symbol name. |
| `statistics` / `game_stats` | Scoreboard and end-game stat tracking. |
| `trigger` | Conditions and actions for one event handler. |

Sections use `begin` / `end` (or indented field lists for smaller blocks like `engine_data`).

## Triggers

A **trigger** is the core control-flow unit. Each trigger has:

1. A **name** — unique within the script.
2. A **kind** — controls which implicit context (player, team, object) is available when conditions and actions run.

| Kind | Typical use |
|------|-------------|
| `general` | Runs in a global context. |
| `player` | Per-player events (death, spawn, and so on). |
| `team` | Per-team events. |
| `object` | Per-object events. |
| `initialization` | Runs once when the variant loads. |
| `local_initialization` | Per-machine initialization. |
| `host_migration` | Runs after host migration. |
| `object_death` | Fires when a bound object is destroyed. |
| `local` | Local-only trigger scope. |
| `pregame` | Lobby / pre-game phase. |

Object triggers can specify an **object filter** label (from `map_object` sections) so the engine only evaluates the trigger for matching objects.

### Conditions

Conditions appear after a `condition` keyword inside a trigger. Examples:

- `if` — compare variables, globals, or references.
- `player_died` — a player death event with killer/victim context.
- `timer_expired` — a custom timer reached zero.
- `object_in_area` — an object entered a boundary.
- `team_is_active` — a team still has living players.

Conditions support `and` / `or` grouping and `not` negation. The engine evaluates them in order before running actions.

### Actions

Actions appear after an `action` keyword (or nested under `action for_each` for sub-triggers). Each line names an opcode followed by operands:

```txt
action set my_counter add 1
action hud_post_message everyone "Round started!"
action for_each player
	action set_score player add 10
end
```

The set of valid opcodes depends on the Reach build. See [Supported versions](/versions/) for per-build action tables.

`for_each` is special: it embeds a nested trigger body that runs once per player, team, or object depending on the target kind.

## Variables and references

**Variables** are declared in `variables` sections with a scope (`global`, `team`, `player`, `object`), storage (`networked` or `local`), and type.

The `set` action (and related math operators like `add`, `subtract`, `multiply_by`) modify variables. Comparison conditions use operators such as `equal_to`, `less_than`, and `greater_than_or_equal_to`.

**References** identify runtime entities in operands:

- Players — `player`, explicit player variables, or trigger context.
- Teams — `team`, team variables, or `by_designator`.
- Objects — map object labels, object variables, or `none`.
- Timers — `timer_1` … `timer_8` or timer variables.

Reach MCC adds temporary explicit references not present on Xbox 360; see [Megalo versions](/guide/megalo-versions).

## Built-in globals

Megalo scripts can read engine state through built-in global names (not declared in `variables`), including:

- Round flow — `round`, `round_count`, `round_time_limit`, `score_to_win_round`
- Lives and respawn — `lives_per_round`, `respawn_time`, `respawn_traits_duration`
- Match rules — `friendly_fire_enabled`, `teams_enabled`, `fire_teams_enabled`
- Powerups and equipment — `red_powerup_duration`, `grenades_on_map`

These appear in conditions and `set` operands like ordinary identifiers.

## Compiled representation

The editor compiles Megalo into engine structures:

- **Gametypes** — `gvar` / game variant chunks inside a `.blf` file.
- **Custom variants** — MGLO bitstreams inside map variant BLFs.

Opcodes, condition types, and operand layouts are version-specific. @blamnetwork/megalo uses [@blamnetwork/blf](https://blam-network.github.io/blf/) struct definitions for each supported build. Symbolic operand names (weapons, incidents, palette presets, and so on) resolve through Reach [object lists](/language/object-lists).

## Next steps

- [Object lists](/language/object-lists)
- [Supported versions & action tables](/versions/)
- [Parsing Megalo source](/guide/parsing) with @blamnetwork/megalo
- [MCC vs TU1 differences](/guide/megalo-versions)
