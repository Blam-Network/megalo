import { MEGALO_KEYWORDS } from "./tokens";

/** Built-in global variable names (engine settings readable in scripts). */
export const MEGALO_BUILTIN_GLOBALS: string[] = [
  "round",
  "symmetric_gametype",
  "score_to_win_round",
  "fire_teams_enabled",
  "teams_enabled",
  "round_time_limit",
  "round_count",
  "perfection_enabled",
  "early_victory_win_count",
  "sudden_death_time_limit",
  "grace_period_time_limit",
  "lives_per_round",
  "team_lives_per_round",
  "respawn_time",
  "suicide_respawn_penalty",
  "betrayal_respawn_penalty",
  "respawn_time_growth",
  "loadout_selection_time",
  "respawn_traits_duration",
  "friendly_fire_enabled",
  "betrayal_booting_enabled",
  "enemy_voice_enabled",
  "open_channel_voice_enabled",
  "dead_player_voice_enabled",
  "grenades_on_map",
  "indestructible_vehicles",
  "red_powerup_duration",
  "blue_powerup_duration",
  "yellow_powerup_duration",
  "object_death_damage_type",
].sort();

/** Reserved words highlighted as blue `Keyword` tokens in the legacy editor. */
export const MEGALO_HIGHLIGHT_RESERVED_KEYWORDS: string[] = [
  ...[...MEGALO_KEYWORDS].filter(
    (word) =>
      ![
        "if",
        "number",
        "timer",
        "object",
        "player",
        "team",
        "networked",
        "local",
        "none",
      ].includes(word)
  ),
  "hide",
  "lock",
  "statistic",
  "fireteam_count",
  "model",
  "by_designator",
  "text",
  "proximity_warning",
].sort();

/** Variable type keywords (`number`, `timer`) — gold in variables/constants blocks. */
export const MEGALO_VARIABLE_TYPES: string[] = ["number", "timer"];

/** Variable scope keywords in `variables <scope>` headers — default foreground. */
export const MEGALO_VARIABLE_SCOPES: string[] = [
  "global",
  "object",
  "player",
  "team",
];

/** Property names inside `map_object` filter blocks — cyan in the legacy editor. */
export const MEGALO_MAP_OBJECT_FILTER_PROPERTIES: string[] = [
  "type",
  "label",
  "min",
];

/** Built-in game option identifiers used with `override`. */
export const MEGALO_BUILTIN_OVERRIDE_OPTIONS: string[] = [
  "teams_enabled",
  "fire_teams_enabled",
  "score_to_win_round",
  "round_time_limit",
  "round_count",
  "early_victory_win_count",
  "vehicle_set",
  "loadout_selection_time",
  "loadout_palette",
].sort();
