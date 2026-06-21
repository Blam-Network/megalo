# Base files

Some Megalo scripts inherit from a compiled parent variant using the `base` directive. This is how Bungie built **variant families** — one full gametype script serves as the base, and shorter derived scripts retune only metadata, teams, and options.

## Syntax

A derived script starts with a single `base` line referencing a compiled `.mglo` file:

```megalo
base "ctf.mglo"
```

The `.mglo` extension refers to a compiled Megalo variant, not a source `.txt` file. The editor resolves the base at compile time and merges the derived script's elements on top.

The base file is read from the compile **output folder** — `maps/megalo` when using MegaloEdit.exe. Compile the parent script to produce its `.mglo` before building derived variants that reference it.

<DocsBlock type="warning" title="Same megalo version">

A derived script and its base `.mglo` must target the **same megalo encoding version**. Mixing builds (for example a TU1 base with an MCC-only derived script, or bases from different [Megalo versions](/versions/)) is not supported — compile the base and derived scripts against the same Reach build.

</DocsBlock>

## What gets inherited

A base file contributes its **entire compiled script** to the derived variant:

- All triggers, conditions, and actions
- All variable declarations and initial values
- HUD widgets, map object filters, and statistics
- Loadout definitions and requisition palettes

The derived script only re-specifies a **restricted subset** of top-level elements. Derived files can declare:

| Element | Purpose |
|---------|---------|
| `engine_data` | Override gametype name, description, icon, category |
| `teams` | Retune team models, colors, designators |
| `game_options` | Override built-in options, add or lock custom options |
| `constants` | Add or replace constants |
| `string_table` / `include` | Add localized strings |
| `loadout` / `loadout_palette` | Override loadout definitions |
| `map_permissions` | Change forge placement rules |
| `player_rating` | Override rating parameters |

Derived files **cannot** add:

- `variables`
- `trigger`
- `hud_widgets`
- `map_object`
- `requisition_palette`
- `game_stats`

To change game logic, edit the base script (or create a new full script without a `base` line).

## Retuning options

Derived scripts override inherited game options using the same `game_options` element:

```megalo
base "headhunter.mglo"

engine_data
	name team_headhunter_title
end

game_options
	override teams_enabled 1
	override score_to_win_round 50
end
```

Common patterns in derived scripts:

- **`override`** — set a built-in engine option to a new default
- **`lock override`** — set a default and prevent the lobby from changing it
- **`option "Name" value`** — re-declare a custom option with a new default (shorthand form used in some derived scripts)

## Real examples

Bungie shipped many variant families. Each base `.mglo` has several derived `.txt` scripts:

| Base | Derived variants |
|------|-----------------|
| `ctf.mglo` | `ctf_1flag.txt`, `ctf_multiteam.txt`, `ctf_neutralflag.txt` |
| `headhunter.mglo` | `headhunter_team.txt`, `headhunter_pro.txt`, `headhunter_pro_team.txt` |
| `assault.mglo` | `assault_one_bomb.txt`, `assault_neutral_bomb.txt`, `grifball.txt` |
| `koth.mglo` | `koth_team.txt`, `koth_pro.txt`, `koth_crazyking.txt` |
| `infection.mglo` | `infection_safehavens.txt`, `infection_newhavens.txt` |
| `slayer.mglo` | `slayer_team.txt`, `slayer_pro.txt`, `slayer_classic.txt`, `SWAT.txt` |

A typical derived script is very short:

```megalo
base "ctf.mglo"
include "strings/ctf_strings.txt"

engine_data
	name ctf_1flag_title
end

game_options
	lock override teams_enabled true
	override round_count 4
	override score_to_win_round 1
end
```

## Base vs include

These are two different composition mechanisms:

| | `base "x.mglo"` | `include "x.txt"` |
|--|-----------------|-------------------|
| **What it merges** | A compiled variant (binary) | Source text |
| **Inherits logic** | Yes — triggers, variables, everything | Only the included elements |
| **Can add triggers** | No | Yes |
| **Typical use** | Variant families (1-Flag CTF from CTF) | Shared strings, loadouts, common logic |

A script can use both — a derived script might `base` a compiled parent and `include` additional string tables or helper logic.

## See also

- [Syntax & file format](/language/syntax) — includes, file structure, and [element model](/language/syntax#the-element-model)
- [Example scripts](/language/examples) — full scripts without a base line
