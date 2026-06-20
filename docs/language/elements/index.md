# Elements

Everything in a Megalo script is an **element**. **Elements** are the block and leaf keywords that may appear at the root of a script (or inside an included file). Nested keywords — such as `player_traits` inside `game_options`, or `condition` / `action` inside `trigger` — are documented on their own pages.

## The element model

Megalo source is structured as nested elements:

- **Block elements** open with a keyword and close with `end`. The keyword determines which child elements are legal inside.
- **Field elements** are single lines inside a block (indented under their parent).
- **Leaf elements** like `include` appear at the top level as standalone lines.

The set of legal child elements is always determined by the parent. For example, inside a `game_options` block you may write `option`, `override`, `player_traits`, `lock`, or `hide` — but not `trigger` or `variables`.

```megalo
game_options                          ; block element opens
	override teams_enabled false      ; field element
	override score_to_win_round 25    ; field element

	option kill_points                ; nested block element
		option_name_kill_points
		option_description_kill_points
		1
		0 points_0 ""
		1 points_1 ""
	end                               ; closes option

	player_traits leader_traits       ; nested block element
		leader_traits_name leader_traits_description
		waypoint unchanged
	end                               ; closes player_traits
end                                   ; closes game_options
```

Some smaller blocks use a flat indented field list rather than nested `begin`/`end` pairs:

```megalo
engine_data
	name slayer_title
	description slayer_description
	icon k_engine_icon_slayer
	category slayer
end
```

## Top level element catalog

These match the compiler's `TopLevelElement` enumeration. Elements marked with † can also appear in [base-derived scripts](/language/base-files).

| Element | Purpose |
|---------|---------|
| [`string_table`](/language/elements/string-table) † | Localized UI strings |
| [`game_options`](/language/elements/game-options) † | Lobby options, overrides, player trait sets |
| [`constants`](/language/elements/constants) † | Named numeric constants |
| [`loadout`](/language/elements/loadout) † | Player loadout definitions |
| [`loadout_palette`](/language/elements/loadout-palette) † | Loadout palette presets |
| [`include`](/language/elements/include) † | Merge another source file |
| [`localized_include`](/language/elements/localized-include) † | Optional include for missing per-language files (unused in shipped scripts) |
| [`teams`](/language/elements/teams) † | Team names, colors, models, fireteam counts |
| [`engine_data`](/language/elements/engine-data) † | Gametype name, description, icon, category |
| [`player_rating`](/language/elements/player-rating) † | Arena rating parameters |
| [`map_permissions`](/language/elements/map-permissions) † | Forge placement permissions per object type |
| [`variables`](/language/elements/variables) | Declare custom variables |
| [`trigger`](/language/elements/trigger) | Conditions and actions for one event handler |
| [`requisition_palette`](/language/elements/requisition-palette) | Filter scenario requisition items for the D-pad buy menu |
| [`hud_widgets`](/language/elements/hud-widgets) | On-screen HUD elements |
| [`map_object`](/language/elements/map-object) | Label map objects for triggers and actions |
| [`game_stats`](/language/elements/game-stats) | Scoreboard and end-game stat tracking |

The [`base`](/language/elements/base) directive is separate — it is not a `TopLevelElement`, but a compile-time hook for derived scripts. See [Base files](/language/base-files).

## Nested element families

These element types only appear inside a parent block:

| Family | Parent | Page |
|--------|--------|------|
| `team` fields | `teams` | [teams](/language/elements/teams) |
| `option`, `ranged_option`, `override`, `lock`, `hide` | `game_options` | [game_options](/language/elements/game-options) |
| `player_traits` | `game_options` | [player_traits](/language/elements/game-options/player-traits) |
| `condition`, `action`, `or`, `temporary`, `end` | `trigger` | [trigger — Action scope](/language/elements/trigger#action-scope) |
| [`begin`](/language/elements/begin) / `end` sub-blocks | action scope | [begin](/language/elements/begin) (see [trigger](/language/elements/trigger#action-scope)) |

## Limits

Megalo scripts have hard capacity caps enforced at compile time:

| Resource | Maximum |
|----------|---------|
| Triggers | 320 |
| Conditions (total) | 512 |
| Actions (total) | 1024 |
| String entries | 112 |
| String bytes | 19,456 |
| Loadouts | 32 |
| Loadout palettes | 16 |
| Map object filters | 16 |
| Custom lobby options | 16 |
| Player trait sets | 16 |
| HUD widgets | 4 |
| Requisition palettes | 8 |
| Encoded variant size | 20,480 bytes |

Per-scope custom variable limits are in [Variable model — Limits](/language/variable-model#limits).

Individual element pages note the cap where it applies.

## See also

- [Syntax & file format](/language/syntax) — comments, tokens, includes
- [Base files](/language/base-files) — inheritance from compiled variants
- [Variable model](/language/variable-model) — variable declarations and temporaries
- [trigger](/language/elements/trigger) — trigger execution and kinds
