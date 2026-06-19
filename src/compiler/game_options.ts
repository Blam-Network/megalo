import type {
  MegaloExpr,
  MegaloGameOption,
  MegaloProgram,
} from "../ast";
import type { c_game_engine_custom_variant } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { MegaloError } from "../error";
import { ObjectIndexRegistry } from "./object_indices";
import { applyTraitFields } from "./player_traits";

/** Stock Reach MCC gametypes set all five base-trait override flag bits. */
const MAP_OVERRIDE_BASE_TRAITS_FLAGS = 31;

function gameOptionsSection(program: MegaloProgram) {
  const section = program.sections.find((entry) => entry.type === "game_options");
  return section?.type === "game_options" ? section : undefined;
}

export function programHasGameOptions(program: MegaloProgram): boolean {
  return gameOptionsSection(program) !== undefined;
}

function exprScalar(expr: MegaloExpr): number | boolean {
  if (expr.kind === "number") {
    return expr.value;
  }
  if (expr.kind === "bool") {
    return expr.value;
  }
  if (expr.kind === "identifier") {
    if (expr.name === "true") {
      return true;
    }
    if (expr.name === "false") {
      return false;
    }
  }
  throw new MegaloError(`Expected scalar override value, got '${expr.kind}'`);
}

function applyBuiltinOverride(
  variant: c_game_engine_custom_variant,
  option: MegaloGameOption
): void {
  if (option.kind !== "override" || option.overrideFields) {
    return;
  }
  const value = option.overrideValue;
  if (!value) {
    return;
  }
  const base = variant.m_base_variant;
  const misc = base.m_miscellaneous_options;

  switch (option.name) {
    case "teams_enabled": {
      const scalar = exprScalar(value);
      misc.m_teams_enabled = scalar === true || scalar === 1;
      return;
    }
    case "fire_teams_enabled": {
      const scalar = exprScalar(value);
      variant.m_fire_teams_enabled = scalar === true || scalar === 1;
      return;
    }
    case "round_time_limit": {
      misc.m_round_time_limit_minutes = Number(exprScalar(value));
      return;
    }
    case "round_count": {
      misc.m_round_limit = Number(exprScalar(value));
      return;
    }
    case "score_to_win_round": {
      variant.m_score_to_win_round = Number(exprScalar(value));
      return;
    }
    case "early_victory_win_count": {
      misc.m_early_victory_win_count = Number(exprScalar(value));
      return;
    }
    case "loadout_selection_time": {
      base.m_respawn_options.m_loadout_cam_time = Number(exprScalar(value));
      return;
    }
    default:
      return;
  }
}

/** Compile `game_options` into base-variant settings and player traits. */
export function applyGameOptionsToVariant(
  program: MegaloProgram,
  variant: c_game_engine_custom_variant,
  options?: { hotReload?: boolean }
): void {
  const section = gameOptionsSection(program);
  if (!section) {
    return;
  }

  const objects = new ObjectIndexRegistry(variant.m_game_engine.m_objects_used, {
    parentObjectsUsed: options?.hotReload
      ? variant.m_game_engine.m_objects_used
      : undefined,
  });

  for (const option of section.options) {
    if (
      option.kind === "override" &&
      option.name === "base_player_traits" &&
      option.overrideFields
    ) {
      applyTraitFields(
        variant.m_base_variant.m_map_override_options.m_base_player_traits,
        option.overrideFields,
        objects
      );
      variant.m_base_variant.m_map_override_options.m_flags =
        MAP_OVERRIDE_BASE_TRAITS_FLAGS;
      continue;
    }
    applyBuiltinOverride(variant, option);
  }

  for (const traits of section.traits) {
    if (traits.fields.length === 0) {
      continue;
    }
    const target =
      variant.m_player_traits[variant.m_player_traits.length - 1]
        ?.m_player_traits ??
      variant.m_base_variant.m_map_override_options.m_base_player_traits;
    applyTraitFields(target, traits.fields, objects);
  }
}
