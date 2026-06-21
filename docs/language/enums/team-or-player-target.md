# Team or player target

Operand syntax for actions that apply to a specific player, a specific team, or all players. In ManagedMegalo grammar this appears as `<team_or_player_target>`; on the wire it is stored as `s_team_or_player_target` with a two-bit kind field `e_action_team_or_player_target` in @blamnetwork/blf.

Used by [`set_score`](/language/actions/set-score), [`play_sound`](/language/actions/play-sound), and [`hud_post_message`](/language/actions/hud-post-message). [`submit_incident`](/language/actions/submit-incident) uses the same underlying type for its `<cause_team_or_player>` and `<effect_team_or_player>` operands.

## Kind keywords

| Keyword | blf enum | Meaning |
|---------|----------|---------|
| `team` | `team` | A specific team — followed by a [team reference](/language/references#team-designators) |
| `player` | `player` | A specific player — followed by a [player reference](/language/references#reference-types) |
| `everyone` | `all_players` | All players in the session |

Scripts spell the all-players kind as `everyone`. The blf enum name is `all_players`.

## Syntax

```megalo
team <team_ref>
player <player_ref>
everyone
```

Team and player kinds always include their reference on the next token(s). The `everyone` kind stands alone.

```megalo
action set_score add kill_points player killing_player
action set_score add 1 team attackers
action play_sound everyone ctf
action play_sound team defenders bone_cv_ph1_intro
action hud_post_message everyone none "Round started!"
action submit_incident game_start_slayer everyone everyone
```

## Not the same as audience operands

Several actions take an **audience** operand (`everyone`, `allies`, `enemies`, `player`, `team`, `no_one`) that filters who sees a navpoint, boundary, progress bar, or pickup rule. That is a different type (`c_player_filter_modifier`) even though some keywords overlap.

| Use case | Operand type | Example actions |
|----------|--------------|-----------------|
| Score, sound, HUD message, incidents | Team or player target | `set_score`, `play_sound`, `hud_post_message`, `submit_incident` |
| Visibility and pickup filters | Audience | `navpoint_set_visible`, `boundary_set_visible`, `set_pickup_filter` |

See [References — Audience references](/language/references#audience-references) for the audience list.

## Related operands

[`set_loadout`](/language/actions/set-loadout) grammar uses `<team_or_player>` with the same `team` / `player` prefix pattern but only those two kinds (no `everyone`).
