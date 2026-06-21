# Syntax & file format

Megalo scripts are plain-text files (`.txt`) composed of a sequence of **elements**. This page covers the lexical rules — how tokens are formed, how comments work, and how files are composed.

## File structure

A Megalo file is a top-to-bottom sequence of elements. There is no required order, but shipped scripts typically follow a convention:

1. `include` directives (and optionally a `base` declaration)
2. `string_table` / string includes
3. `engine_data`, `teams`, `map_permissions`
4. `map_object` labels
5. `game_options`, `constants`
6. `variables`
7. `hud_widgets`, loadouts, statistics
8. `trigger` blocks

Individual element pages are listed under **Elements** in the sidebar.

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

## Comments

Megalo has **line comments only**. A semicolon starts a comment that runs to the end of the line:

```megalo
; This is a comment.
action set my_counter add 1  ; inline comment
```

## Tokens

Megalo source is tokenized into a small set of kinds:

| Token | Example |
|-------|---------|
| Identifier | `my_counter`, `player_died`, `set_to` |
| Member separator | `.` in `current_player.score` |
| Quoted string | `"ctf_flag_spawn"`, `"Slayer"` |
| Integer | `0`, `25`, `-1` |
| Floating point | `1.5` |
| Comment | `; ...` |

### Quoted strings

Double-quoted strings support these escape sequences:

| Escape | Meaning |
|--------|---------|
| `\n` | Newline |
| `\r` | Carriage return |
| `\t` | Tab |
| `\"` | Literal quote |
| `\\` | Literal backslash |

Any other `\x` sequence passes through the backslash and the character literally.

Keywords such as `trigger`, `condition`, `action`, `end`, and element names like `engine_data` are recognized as identifiers with special meaning in context.

## Identifiers and naming

Variable, constant, trigger, and element names:

- May contain alphanumeric characters and underscores
- Must **not** start with a digit
- Must be **unique** across the shared namespace (variables, constants, triggers, game options, and other named elements cannot collide)

```megalo
variables global
	local number red_score 0       ; valid
	local number team3_score 0     ; valid
	local number 4team_score 0     ; invalid — starts with a digit
end
```

## Includes

The `include` directive merges another source file into the current script at compile time:

```megalo
include "strings/slayer_strings.txt"
include "includes/multiplayer_loadouts.txt"
include "includes/sudden_death_pre.txt"
```

Included files contribute their elements to the final script. This is how Bungie shared common logic (loadouts, sudden death, achievements) across many gametypes.

String tables are often organized as a language-agnostic wrapper that includes per-language files:

```megalo
include "strings/common_strings.txt"
```

Where `strings/common_strings.txt` is itself a list of plain includes — one per language:

```megalo
include "english/common_strings.txt"
include "french/common_strings.txt"
include "german/common_strings.txt"
```

Each language file opens with `string_table <language>` and defines the translated strings for that locale.

### localized_include

MegaloEdit recognizes a second include keyword:

```megalo
localized_include "strings/english/slayer_strings.txt"
```

Syntax mirrors `include` — a quoted path relative to the current file.

Localized includes are just like regular includes, except they are **optional when the file is missing** in lenient compile mode. If the compiler cannot find the path, it emits a warning and skips the include instead of failing the compile. Plain `include` of a missing file is always a hard error.

In strict compile mode, missing localized includes error the same way. MegaloEdit always uses lenient mode — see [Compiler settings](/language/compiler-settings).

When the file **does** exist, `localized_include` loads and parses it the same as `include`. The keyword does not survive into compiled variant data; it is resolved entirely at compile time.

**No shipped HREK script uses it.** Bungie used wrapper files and plain `include` instead (see above). For Reach scripting, that wrapper pattern is the authoritative approach.

## Base files

Some scripts begin with a `base` directive instead of (or in addition to) includes:

```megalo
base "ctf.mglo"
```

This inherits a compiled parent variant rather than merging source text. See [Base files](/language/base-files) for the full explanation.

## Indentation

Megalo uses tabs for indentation inside block elements. Indentation is cosmetic — the parser uses keywords (`end`, element names) to determine structure, not whitespace. Shipped scripts consistently use tabs.

## See also

- [Compiler settings](/language/compiler-settings) — MegaloEdit compile flags (`enforceLocalizedIncludes`, etc.)
- [Base files](/language/base-files) — inheritance from compiled variants
- [Example scripts](/language/examples) — annotated minimal scripts
