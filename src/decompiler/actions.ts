import type { MegaloAction, MegaloExpr } from "../ast";
import type { DecompileContext } from "../symbols";
import { mathOpToSymbol } from "../operators";
import { enumValueName } from "../enum_utils";
import {
  e_action_type,
  e_action_team_or_player_target,
  e_math_operation,
  e_player_filter_type,
  type c_action,
  type c_player_filter_modifier,
  type s_team_or_player_target,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  e_game_engine_timer_rate,
  e_weapon_pickup_priority,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { bipedGiveWeaponModeName, boundaryPlayerColorName } from "../compiler/action_helpers";
import {
  decodeCustomVariable,
  decodeObjectReference,
  decodePlayerReference,
  decodeTeamReference,
  decodeTimerReference,
  decodeVariantVariable,
} from "../references/decode";
import {
  megaloDeviceAnimationName,
  megaloEngineIconName,
  megaloIncidentName,
  megaloLoadoutPaletteSlotName,
  megaloObjectTypeName,
} from "../lookups";

const PLAYER_FILTER_NAMES: Record<number, string> = {
  [e_player_filter_type.no_one]: "no_one",
  [e_player_filter_type.everyone]: "everyone",
  [e_player_filter_type.allies]: "allies",
  [e_player_filter_type.enemies]: "enemies",
};

const NAVPOINT_PRIORITY = ["low", "normal", "high", "blink"] as const;
const BOUNDARY_SHAPE_NAMES = ["unused", "sphere", "cylinder", "box"] as const;

function vitalityOperands(
  ctx: DecompileContext,
  object: Parameters<typeof decodeObjectReference>[1],
  operation: e_math_operation,
  variable: Parameters<typeof decodeCustomVariable>[1]
): MegaloExpr[] {
  return [
    decodeObjectReference(ctx, object),
    id(mathOpName(operation)),
    decodeCustomVariable(ctx, variable),
  ];
}

function timerIndexOperand(index: number): MegaloExpr {
  return index === 0 ? id("none") : id(`timer_${index}`);
}

function id(name: string): MegaloExpr {
  return { kind: "identifier", name };
}

function str(value: string): MegaloExpr {
  return { kind: "string", value };
}

function num(value: number): MegaloExpr {
  return { kind: "number", value };
}

function mathOpName(op: e_math_operation): string {
  return mathOpToSymbol(op);
}

function playerFilterOperands(
  ctx: DecompileContext,
  modifier?: c_player_filter_modifier
): MegaloExpr[] {
  if (!modifier) {
    return [id("everyone")];
  }
  if (modifier.m_type === e_player_filter_type.specific_player) {
    const operands: MegaloExpr[] = [id("player")];
    if (modifier.m_player) {
      operands.push(decodePlayerReference(ctx, modifier.m_player));
    }
    if (modifier.m_variable) {
      operands.push(decodeCustomVariable(ctx, modifier.m_variable));
    }
    return operands;
  }
  return [
    id(enumValueName(e_player_filter_type, modifier.m_type) ?? "everyone"),
  ];
}

function navpointPriority(action: c_action, params?: { m_priority?: number }): string {
  if (params?.m_priority !== undefined) {
    return NAVPOINT_PRIORITY[params.m_priority] ?? String(params.m_priority);
  }
  return "normal";
}

export function decompileAction(
  ctx: DecompileContext,
  action: c_action
): MegaloAction | undefined {
  if (action.m_type === e_action_type.none) {
    return undefined;
  }

  const opcode =
    enumValueName(e_action_type, action.m_type) ?? `action_${action.m_type}`;

  switch (action.m_type) {
    case e_action_type.set: {
      const params = action.m_set_parameters!;
      return {
        opcode: "set",
        operands: [
          decodeVariantVariable(ctx, params.m_variable_1),
          id(mathOpName(params.m_operation)),
          decodeVariantVariable(ctx, params.m_variable_2),
        ],
      };
    }
    case e_action_type.set_score: {
      const params = action.m_set_score_parameters!;
      return {
        opcode: "set_score",
        operands: [
          id(mathOpName(params.m_operation)),
          decodeCustomVariable(ctx, params.m_variable),
          decodeScoreTarget(ctx, params.m_target),
        ],
      };
    }
    case e_action_type.timer_set_rate: {
      const params = action.m_timer_set_rate_parameters!;
      return {
        opcode: "timer_set_rate",
        operands: [
          decodeTimerReference(ctx, params.m_timer),
          id(
            enumValueName(e_game_engine_timer_rate, params.m_rate) ??
              String(params.m_rate)
          ),
        ],
      };
    }
    case e_action_type.timer_reset: {
      const params = action.m_timer_reset_parameters!;
      return {
        opcode: "timer_reset",
        operands: [decodeTimerReference(ctx, params.m_timer)],
      };
    }
    case e_action_type.for_each: {
      const params = action.m_for_each_parameters!;
      return {
        opcode: "for_each",
        operands: [num(params.m_trigger_index)],
      };
    }
    case e_action_type.create_object: {
      const params = action.m_create_object_parameters!;
      return {
        opcode: "create_object",
        operands: [
          str(megaloObjectTypeName(params.m_object_type.m_object_type_index)),
          decodeObjectReference(ctx, params.m_object_reference_2),
          decodeObjectReference(ctx, params.m_object_reference_1),
          num(params.m_offset),
        ],
      };
    }
    case e_action_type.delete_object: {
      const params = action.m_delete_object_parameters!;
      return {
        opcode: "delete_object",
        operands: [decodeObjectReference(ctx, params.m_object)],
      };
    }
    case e_action_type.navpoint_set_visible: {
      const params = action.m_navpoint_set_visible_parameters!;
      return {
        opcode: "navpoint_set_visible",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          ...playerFilterOperands(ctx, params.m_player_filter_modifier),
        ],
      };
    }
    case e_action_type.boundary_set_visible: {
      const params = action.m_boundary_set_visible_parameters!;
      return {
        opcode: "boundary_set_visible",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          ...playerFilterOperands(ctx, params.m_player_filter_modifier),
        ],
      };
    }
    case e_action_type.boundary_set_player_color: {
      const params = action.m_boundary_set_player_color_parameters!;
      return {
        opcode: "boundary_set_player_color",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          id(boundaryPlayerColorName(params.m_player_index)),
        ],
      };
    }
    case e_action_type.navpoint_set_icon: {
      const params = action.m_navpoint_set_icon_parameters!;
      return {
        opcode: "navpoint_set_icon",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          id(String(params.m_navpoint_icon)),
        ],
      };
    }
    case e_action_type.navpoint_set_priority: {
      const params = action.m_navpoint_set_priority_parameters!;
      return {
        opcode: "navpoint_set_priority",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          id(navpointPriority(action, params)),
        ],
      };
    }
    case e_action_type.set_respawn_filter: {
      const params = action.m_set_respawn_filter_parameters!;
      return {
        opcode: "set_respawn_filter",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          ...playerFilterOperands(ctx, params.m_player_filter_modifier),
        ],
      };
    }
    case e_action_type.set_fireteam_respawn_filter: {
      const params = action.m_set_fireteam_respawn_filter_parameters!;
      return {
        opcode: "set_fireteam_respawn_filter",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          num(params.m_fireteam_filter),
        ],
      };
    }
    case e_action_type.set_pickup_filter: {
      const params = action.m_set_pickup_filter_parameters!;
      return {
        opcode: "set_pickup_filter",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          ...playerFilterOperands(ctx, params.m_player_filter_modifier),
        ],
      };
    }
    case e_action_type.object_set_invincibility: {
      const params = action.m_object_set_invincibility_parameters!;
      return {
        opcode: "object_set_invincibility",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.team_set_coop_spawning: {
      const params = action.m_team_set_coop_spawning_parameters!;
      return {
        opcode: "team_set_coop_spawning",
        operands: [
          decodeTeamReference(ctx, params.m_team),
          id(params.m_enabled ? "true" : "false"),
        ],
      };
    }
    case e_action_type.player_set_primary_respawn_object: {
      const params = action.m_player_set_primary_respawn_object_parameters!;
      return {
        opcode: "player_set_primary_respawn_object",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeObjectReference(ctx, params.m_object),
        ],
      };
    }
    case e_action_type.player_get_fireteam_index: {
      const params = action.m_player_get_fireteam_index_parameters!;
      return {
        opcode: "player_get_fireteam_index",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.player_set_objective: {
      const params = action.m_player_set_objective_parameters!;
      const stringIndex = params.m_string?.m_string_index ?? -1;
      return {
        opcode: "player_set_objective",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          id(ctx.strings.lookup(stringIndex)),
        ],
      };
    }
    case e_action_type.player_set_objective_allegiance: {
      const params = action.m_player_set_objective_allegiance_parameters!;
      const stringIndex = params.m_string?.m_string_index ?? -1;
      return {
        opcode: "player_set_objective_allegiance",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          id(ctx.strings.lookup(stringIndex)),
        ],
      };
    }
    case e_action_type.player_set_objective_allegiance_icon: {
      const params = action.m_player_set_objective_allegiance_icon_parameters!;
      return {
        opcode: "player_set_objective_allegiance_icon",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          id(megaloEngineIconName(params.m_icon_index)),
        ],
      };
    }
    case e_action_type.device_get_position: {
      const params = action.m_device_get_position_parameters!;
      return {
        opcode: "device_get_position",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.device_set_power: {
      const params = action.m_device_set_power_parameters!;
      return {
        opcode: "device_set_power",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.device_set_position_track: {
      const params = action.m_device_set_position_track_parameters!;
      return {
        opcode: "device_set_position_track",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          id(megaloDeviceAnimationName(params.m_animation_name_index)),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.device_animate_position: {
      const params = action.m_device_animate_position_parameters!;
      return {
        opcode: "device_animate_position",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable_1),
          decodeCustomVariable(ctx, params.m_variable_2),
          decodeCustomVariable(ctx, params.m_variable_3),
          decodeCustomVariable(ctx, params.m_variable_4),
        ],
      };
    }
    case e_action_type.set_scenario_interpolator_state: {
      const params = action.m_set_scenario_interpolator_state_parameters!;
      return {
        opcode: "set_scenario_interpolator_state",
        operands: [
          decodeCustomVariable(ctx, params.m_variable_1),
          decodeCustomVariable(ctx, params.m_variable_2),
        ],
      };
    }
    case e_action_type.submit_incident: {
      const params = action.m_submit_incident_parameters!;
      const operands: MegaloExpr[] = [
        id(megaloIncidentName(params.m_incident_id)),
      ];
      operands.push(...incidentTargetOperands(ctx, params.m_target_1));
      operands.push(...incidentTargetOperands(ctx, params.m_target_2));
      return { opcode: "submit_incident", operands };
    }
    case e_action_type.set_progress_bar: {
      const params = action.m_set_progress_bar_parameters!;
      const operands: MegaloExpr[] = [
        decodeObjectReference(ctx, params.m_object),
        ...playerFilterOperands(ctx, params.m_player_filter_modifier),
      ];
      if (params.m_timer_index !== 0) {
        operands.push(timerIndexOperand(params.m_timer_index));
      }
      return { opcode: "set_progress_bar", operands };
    }
    case e_action_type.hud_widget_set_visibility: {
      const params = action.m_hud_widget_set_visibility_parameters!;
      return {
        opcode: "hud_widget_set_visibility",
        operands: [
          id(`widget_${params.m_widget_index}`),
          decodePlayerReference(ctx, params.m_player),
          id(params.m_visible ? "true" : "false"),
        ],
      };
    }
    case e_action_type.hud_widget_set_text: {
      const params = action.m_hud_widget_set_text_parameters!;
      const stringIndex = params.m_string?.m_string_index ?? -1;
      return {
        opcode: "hud_widget_set_text",
        operands: [
          id(`widget_${params.m_widget_index}`),
          id(ctx.strings.lookup(stringIndex)),
        ],
      };
    }
    case e_action_type.set_loadout_palette: {
      const params = action.m_set_loadout_palette_parameters!;
      const operands: MegaloExpr[] = [
        ...incidentTargetOperands(ctx, params.m_target),
        id(megaloLoadoutPaletteSlotName(params.m_loadout_palette_index)),
      ];
      return { opcode: "set_loadout_palette", operands };
    }
    case e_action_type.apply_player_traits: {
      const params = action.m_apply_player_traits_parameters!;
      return {
        opcode: "apply_player_traits",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          id(`traits_${params.m_trait_index}`),
        ],
      };
    }
    case e_action_type.weapon_set_pickup_priority: {
      const params = action.m_weapon_set_pickup_priority_parameters!;
      return {
        opcode: "weapon_set_pickup_priority",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          id(
            enumValueName(
              e_weapon_pickup_priority,
              params.m_weapon_pickup_priority
            ) ?? String(params.m_weapon_pickup_priority)
          ),
        ],
      };
    }
    case e_action_type.get_player_holding_object: {
      const params = action.m_get_player_holding_object_parameters!;
      return {
        opcode: "get_player_holding_object",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodePlayerReference(ctx, params.m_player),
        ],
      };
    }
    case e_action_type.get_random_object: {
      const params = action.m_get_random_object_parameters!;
      return {
        opcode: "get_random_object",
        operands: [
          decodeObjectReference(ctx, params.m_object_1),
          decodeObjectReference(ctx, params.m_object_2),
          id(ctx.mapObjectName(params.m_filter_index)),
        ],
      };
    }
    case e_action_type.device_set_position: {
      const params = action.m_device_set_position_parameters!;
      return {
        opcode: "device_set_position",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.play_sound: {
      const params = action.m_play_sound_parameters!;
      const operands: MegaloExpr[] = [
        ...incidentTargetOperands(ctx, params.m_target),
        id(`sound_${params.m_sound_index}`),
      ];
      if (params.m_immediate) {
        operands.unshift(id("immediate"));
      }
      return { opcode: "play_sound", operands };
    }
    case e_action_type.object_get_distance: {
      const params = action.m_object_get_distance_parameters!;
      return {
        opcode: "object_get_distance",
        operands: [
          decodeObjectReference(ctx, params.m_object_1),
          decodeObjectReference(ctx, params.m_object_2),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.player_death_get_killing_player: {
      const params = action.m_player_death_get_killing_player_parameters!;
      return {
        opcode: "player_death_get_killing_player",
        operands: [
          decodePlayerReference(ctx, params.m_player_1),
          decodePlayerReference(ctx, params.m_player_2),
        ],
      };
    }
    case e_action_type.player_death_get_damage_type: {
      const params = action.m_player_death_get_damage_type_parameters!;
      return {
        opcode: "player_death_get_damage_type",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.player_death_get_special_type: {
      const params = action.m_player_death_get_special_type_parameters!;
      return {
        opcode: "player_death_get_special_type",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.player_get_place: {
      const params = action.m_player_get_place_parameters!;
      return {
        opcode: "player_get_place",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.team_get_place: {
      const params = action.m_team_get_place_parameters!;
      return {
        opcode: "team_get_place",
        operands: [
          decodeTeamReference(ctx, params.m_team),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.player_get_killing_spree_count: {
      const params = action.m_player_get_killing_spree_count_parameters!;
      return {
        opcode: "player_get_killing_spree_count",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.player_get_vehicle: {
      const params = action.m_player_get_vehicle_parameters!;
      return {
        opcode: "player_get_vehicle",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeObjectReference(ctx, params.m_object),
        ],
      };
    }
    case e_action_type.player_get_equipment: {
      const params = action.m_player_get_equipment_parameters!;
      return {
        opcode: "player_get_equipment",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          decodeObjectReference(ctx, params.m_object),
        ],
      };
    }
    case e_action_type.player_get_weapon: {
      const params = action.m_player_get_weapon_parameters!;
      return {
        opcode: "player_get_weapon",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          id(params.m_primary ? "primary" : "secondary"),
          decodeObjectReference(ctx, params.m_object),
        ],
      };
    }
    case e_action_type.object_get_shield: {
      const params = action.m_object_get_shield_parameters!;
      return {
        opcode: "object_get_shield",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.submit_incident_with_custom_value: {
      const params = action.m_submit_incident_with_custom_value_parameters!;
      const operands: MegaloExpr[] = [
        id(megaloIncidentName(params.m_incident_id)),
      ];
      operands.push(...incidentTargetOperands(ctx, params.m_target_1));
      operands.push(...incidentTargetOperands(ctx, params.m_target_2));
      operands.push(decodeCustomVariable(ctx, params.m_variable));
      return { opcode: "submit_incident_with_custom_value", operands };
    }
    case e_action_type.random: {
      const params = action.m_random_parameters!;
      return {
        opcode: "random",
        operands: [
          decodeCustomVariable(ctx, params.m_variable_2),
          decodeCustomVariable(ctx, params.m_variable_1),
        ],
      };
    }
    case e_action_type.set_boundary: {
      const params = action.m_set_boundary_parameters!;
      const operands: MegaloExpr[] = [
        decodeObjectReference(ctx, params.m_object),
        id(BOUNDARY_SHAPE_NAMES[params.m_shape as number] ?? "unused"),
      ];
      if (params.m_variable_1) {
        operands.push(decodeCustomVariable(ctx, params.m_variable_1));
      }
      if (params.m_variable_2) {
        operands.push(decodeCustomVariable(ctx, params.m_variable_2));
      }
      if (params.m_variable_3) {
        operands.push(decodeCustomVariable(ctx, params.m_variable_3));
      }
      if (params.m_variable_4) {
        operands.push(decodeCustomVariable(ctx, params.m_variable_4));
      }
      return { opcode: "set_boundary", operands };
    }
    case e_action_type.navpoint_set_timer: {
      const params = action.m_navpoint_set_timer_parameters!;
      return {
        opcode: "navpoint_set_timer",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          timerIndexOperand(params.m_timer_index),
        ],
      };
    }
    case e_action_type.navpoint_set_visible_range: {
      const params = action.m_navpoint_set_visible_range_parameters!;
      return {
        opcode: "navpoint_set_visible_range",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable_1),
          decodeCustomVariable(ctx, params.m_variable_2),
        ],
      };
    }
    case e_action_type.navpoint_set_text: {
      const params = action.m_navpoint_set_text_parameters!;
      const stringIndex = params.m_string?.m_string_index ?? -1;
      return {
        opcode: "navpoint_set_text",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          id(ctx.strings.lookup(stringIndex)),
        ],
      };
    }
    case e_action_type.object_destroy: {
      const params = action.m_object_destroy_parameters!;
      const operands: MegaloExpr[] = [
        decodeObjectReference(ctx, params.m_object),
      ];
      if (params.m_no_statistics) {
        operands.push(id("true"));
      }
      return { opcode: "object_destroy", operands };
    }
    case e_action_type.object_bounce: {
      const params = action.m_object_bounce_parameters!;
      return {
        opcode: "object_bounce",
        operands: [decodeObjectReference(ctx, params.m_object)],
      };
    }
    case e_action_type.object_attach: {
      const params = action.m_object_attach_parameters!;
      return {
        opcode: "object_attach",
        operands: [
          decodeObjectReference(ctx, params.m_object_1),
          decodeObjectReference(ctx, params.m_object_2),
          num(params.m_offset),
          id(params.m_absolute_orientation ? "true" : "false"),
        ],
      };
    }
    case e_action_type.object_detach: {
      const params = action.m_object_detach_parameters!;
      return {
        opcode: "object_detach",
        operands: [decodeObjectReference(ctx, params.m_object)],
      };
    }
    case e_action_type.object_set_orientation: {
      const params = action.m_object_set_orientation_parameters!;
      return {
        opcode: "object_set_orientation",
        operands: [
          decodeObjectReference(ctx, params.m_object_1),
          decodeObjectReference(ctx, params.m_object_2),
          id(params.m_absolute_orientation ? "true" : "false"),
        ],
      };
    }
    case e_action_type.object_face_object: {
      const params = action.m_object_face_object_parameters!;
      return {
        opcode: "object_face_object",
        operands: [
          decodeObjectReference(ctx, params.m_object_1),
          decodeObjectReference(ctx, params.m_object_2),
          num(params.m_offset),
        ],
      };
    }
    case e_action_type.object_set_scale: {
      const params = action.m_object_set_scale_parameters!;
      return {
        opcode: "object_set_scale",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.object_set_never_garbage: {
      const params = action.m_object_set_never_garbage_parameters!;
      return {
        opcode: "object_set_never_garbage",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.object_get_health: {
      const params = action.m_object_get_health_parameters!;
      return {
        opcode: "object_get_health",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.object_get_orientation: {
      const params = action.m_object_get_orientation_parameters!;
      return {
        opcode: "object_get_orientation",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.object_get_velocity: {
      const params = action.m_object_get_velocity_parameters!;
      return {
        opcode: "object_get_velocity",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          decodeCustomVariable(ctx, params.m_variable),
        ],
      };
    }
    case e_action_type.object_adjust_shield: {
      const params = action.m_object_adjust_shield_parameters!;
      return {
        opcode: "object_adjust_shield",
        operands: vitalityOperands(
          ctx,
          params.m_object,
          params.m_operation,
          params.m_variable
        ),
      };
    }
    case e_action_type.object_adjust_health: {
      const params = action.m_object_adjust_health_parameters!;
      return {
        opcode: "object_adjust_health",
        operands: vitalityOperands(
          ctx,
          params.m_object,
          params.m_operation,
          params.m_variable
        ),
      };
    }
    case e_action_type.object_adjust_maximum_shield: {
      const params = action.m_object_adjust_maximum_shield_parameters!;
      return {
        opcode: "object_adjust_maximum_shield",
        operands: vitalityOperands(
          ctx,
          params.m_object,
          params.m_operation,
          params.m_variable
        ),
      };
    }
    case e_action_type.object_adjust_maximum_health: {
      const params = action.m_object_adjust_maximum_health_parameters!;
      return {
        opcode: "object_adjust_maximum_health",
        operands: vitalityOperands(
          ctx,
          params.m_object,
          params.m_operation,
          params.m_variable
        ),
      };
    }
    case e_action_type.biped_give_weapon: {
      const params = action.m_biped_give_weapon_parameters!;
      return {
        opcode: "biped_give_weapon",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          str(megaloObjectTypeName(params.m_object_type.m_object_type_index)),
          id(bipedGiveWeaponModeName(params.m_mode)),
        ],
      };
    }
    case e_action_type.biped_drop_weapon: {
      const params = action.m_biped_drop_weapon_parameters!;
      const operands: MegaloExpr[] = [
        decodeObjectReference(ctx, params.m_object),
        id(params.m_primary ? "primary" : "secondary"),
      ];
      if (params.m_delete_on_drop) {
        operands.push(id("delete_on_drop"));
      }
      return { opcode: "biped_drop_weapon", operands };
    }
    case e_action_type.end_round:
      return { opcode: "end_round", operands: [] };
  }

  return { opcode, operands: [] };
}

function decodeScoreTarget(
  ctx: DecompileContext,
  target: s_team_or_player_target
): MegaloExpr {
  if (target.m_target === e_action_team_or_player_target.player) {
    return decodePlayerReference(ctx, target.m_player!);
  }
  if (target.m_target === e_action_team_or_player_target.team) {
    return decodeTeamReference(ctx, target.m_team!);
  }
  return id(String(target.m_target));
}

function incidentTargetOperands(
  ctx: DecompileContext,
  target: s_team_or_player_target
): MegaloExpr[] {
  const kind =
    enumValueName(e_action_team_or_player_target, target.m_target) ?? "everyone";
  if (target.m_target === e_action_team_or_player_target.player && target.m_player) {
    return [id("player"), decodePlayerReference(ctx, target.m_player)];
  }
  if (target.m_target === e_action_team_or_player_target.team && target.m_team) {
    return [id("team"), decodeTeamReference(ctx, target.m_team)];
  }
  return [id(kind)];
}
