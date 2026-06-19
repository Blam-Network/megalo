import { e_action_type } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  MEGALO_COMPARISON_OP_SYMBOLS,
  MEGALO_MATH_OP_SYMBOLS,
} from "./operators";
import { MEGALO_KEYWORDS } from "./tokens";

/** Megalo `action` opcode names from `e_action_type`. */
export const MEGALO_ACTIONS: string[] = Object.entries(e_action_type)
  .filter(([key, value]) => typeof value === "number" && key !== "none")
  .map(([key]) => key)
  .sort();

/** Megalo `condition` keywords used in source scripts. */
export const MEGALO_CONDITIONS: string[] = [
  "if",
  "player_died",
  "team_is_active",
  "timer_expired",
  "team_disposition",
  "object_is_type",
  "object_out_of_bounds",
  "object_in_area",
  "player_is_fireteam_leader",
  "player_assisted_kill_of",
  "object_matches_filter",
  "player_is_active",
  "equipment_is_active",
  "player_is_spartan",
  "player_is_elite",
  "player_is_monitor",
  "game_is_forge",
].sort();

/** Block/section keywords plus common modifiers. */
export const MEGALO_SECTION_KEYWORDS: string[] = [
  ...MEGALO_KEYWORDS,
].sort();

export const MEGALO_MATH_OPS: string[] = [
  ...MEGALO_MATH_OP_SYMBOLS,
  "add",
  "subtract",
  "multiply_by",
  "divide_by",
  "set_to",
  "modulo_by",
];

export const MEGALO_COMPARISON_OPS: string[] = [
  ...MEGALO_COMPARISON_OP_SYMBOLS,
  "equal_to",
  "not_equal_to",
  "less_than",
  "greater_than",
  "less_than_or_equal_to",
  "greater_than_or_equal_to",
];

export const MEGALO_TRIGGER_KINDS: string[] = [
  "general",
  "player",
  "team",
  "object",
  "initialization",
  "local_initialization",
  "host_migration",
  "object_death",
  "local",
  "pregame",
];
