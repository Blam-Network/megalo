import type {
  MegaloExpr,
  MegaloGameOption,
  MegaloGameOptionValue,
  MegaloSection,
} from "../ast";
import type { c_game_engine_custom_variant } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { s_user_defined_option } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { sanitizeIdentifier } from "../identifiers";
import { optionIdentifier } from "./variables";
import {
  basePlayerTraitsDifferFromDefault,
  decompileBasePlayerTraitFields,
} from "./player_traits";

function num(value: number): MegaloExpr {
  return { kind: "number", value };
}

function id(name: string): MegaloExpr {
  return { kind: "identifier", name };
}

function vehicleSetName(index: number): string {
  if (index === -2) {
    return "map_default";
  }
  if (index === -1) {
    return "none";
  }
  return `vehicle_set_${index}`;
}

function decompileUserOption(
  option: s_user_defined_option,
  index: number,
  strings: string[],
  hidden: boolean
): MegaloGameOption {
  const name = optionIdentifier(strings, index, option.m_name_string_index);

  if (option.m_range_default_value !== undefined) {
    return {
      kind: "ranged_option",
      name,
      description: `${name}_text`,
      rangeDefault: option.m_range_current_value ?? 0,
      rangeMin: option.m_range_min_value?.m_value ?? 0,
      rangeMax: option.m_range_max_value?.m_value ?? 0,
      ...(hidden ? { overrideKeyword: "hide" } : {}),
    };
  }

  const values: MegaloGameOptionValue[] = (option.m_values ?? []).map(
    (entry, vi) => ({
      value: entry.m_value,
      name: sanitizeIdentifier(
        strings[entry.m_name_string_index ?? -1] ?? `value_${vi}`
      ),
      description: "",
    })
  );

  return {
    kind: "option",
    name,
    defaultValue:
      values[option.m_default_value_index ?? 0]?.value ?? values[0]?.value ?? 0,
    values,
    ...(hidden ? { overrideKeyword: "hide" } : {}),
  };
}

/** Decompile built-in overrides and user-defined options into a `game_options` section. */
export function decompileGameOptionsSection(
  variant: c_game_engine_custom_variant,
  strings: string[]
): MegaloSection | null {
  const options: MegaloGameOption[] = [];
  const base = variant.m_base_variant;
  const misc = base.m_miscellaneous_options;
  const respawn = base.m_respawn_options;
  const mapOverride = base.m_map_override_options;

  if (variant.m_base_variant_parameters_locked[30]) {
    options.push({
      kind: "override",
      name: "teams_enabled",
      overrideKeyword: "lock",
      overrideValue: id("true"),
    });
  }

  if (variant.m_fire_teams_enabled) {
    options.push({
      kind: "override",
      name: "fire_teams_enabled",
      overrideKeyword: "override",
      overrideValue: id("true"),
    });
  }

  if (variant.m_score_to_win_round !== 0) {
    options.push({
      kind: "override",
      name: "score_to_win_round",
      overrideKeyword: "override",
      overrideValue: num(variant.m_score_to_win_round),
    });
  }

  options.push({
    kind: "override",
    name: "round_time_limit",
    overrideKeyword: "override",
    overrideValue: num(misc.m_round_time_limit_minutes),
  });

  options.push({
    kind: "override",
    name: "round_count",
    overrideKeyword: "override",
    overrideValue: num(misc.m_round_limit),
  });

  options.push({
    kind: "override",
    name: "early_victory_win_count",
    overrideKeyword: "override",
    overrideValue: num(misc.m_early_victory_win_count),
  });

  options.push({
    kind: "override",
    name: "vehicle_set",
    overrideKeyword: "override",
    overrideValue: id(
      vehicleSetName(mapOverride.m_vehicle_set_absolute_index)
    ),
  });

  options.push({
    kind: "override",
    name: "loadout_selection_time",
    overrideKeyword: "override",
    overrideValue: num(respawn.m_loadout_cam_time),
  });

  if (basePlayerTraitsDifferFromDefault(mapOverride.m_base_player_traits)) {
    options.push({
      kind: "override",
      name: "base_player_traits",
      overrideKeyword: "override",
      overrideFields: decompileBasePlayerTraitFields(
        mapOverride.m_base_player_traits,
        variant.m_game_engine.m_objects_used
      ),
    });
  }

  for (let i = 0; i < variant.m_user_defined_options.length; i++) {
    const option = variant.m_user_defined_options[i]!;
    const hidden = variant.m_user_defined_options_hidden[i] ?? false;
    options.push(decompileUserOption(option, i, strings, hidden));
  }

  if (options.length === 0 && variant.m_user_defined_options.length === 0) {
    return null;
  }

  return {
    type: "game_options",
    options,
    traits: [],
  };
}
