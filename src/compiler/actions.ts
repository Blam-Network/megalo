import type { MegaloAction, MegaloExpr } from "../ast";
import { parseMathOpName } from "../operators";
import { MegaloError } from "../error";
import {
  parseMegaloDeviceAnimationIndex,
  parseMegaloIncidentId,
  parseMegaloLoadoutPaletteSlotIndex,
  parseMegaloObjectTypeIndex,
  parseTraitsIndex,
} from "../lookups";
import type { CompileContext } from "../symbols";
import {
  c_action,
  c_megalogamengine_hud_meter_input,
  c_object_type_reference,
  c_custom_timer_reference,
  e_action_type,
  e_chud_navpoint_icon_type,
  e_grenade_type,
  e_math_operation,
  e_megalogamengine_hud_meter_input_type,
  s_action_adjust_grenades_parameters,
  s_action_apply_player_traits_parameters,
  s_action_biped_drop_weapon_parameters,
  s_action_biped_give_weapon_parameters,
  s_action_boundary_set_player_color_parameters,
  s_action_boundary_set_visible_parameters,
  s_action_break_into_debugger_parameters,
  s_action_create_object_parameters,
  s_action_create_tunnel_parameters,
  s_action_debug_force_player_view_count_parameters,
  s_action_debugging_enable_tracing_parameters,
  s_action_delete_object_parameters,
  s_action_device_animate_position_parameters,
  s_action_device_get_position_parameters,
  s_action_device_get_power_parameters,
  s_action_device_set_position_immediate_parameters,
  s_action_device_set_position_parameters,
  s_action_device_set_position_track_parameters,
  s_action_device_set_power_parameters,
  s_action_end_round_parameters,
  s_action_for_each_parameters,
  s_action_game_grief_record_custom_penalty_parameters,
  s_action_get_button_time_parameters,
  s_action_get_player_holding_object_parameters,
  s_action_get_random_object_parameters,
  s_action_hide_object_parameters,
  s_action_hs_function_call_parameters,
  s_action_hud_post_message_parameters,
  s_action_hud_widget_set_icon_parameters,
  s_action_hud_widget_set_meter_parameters,
  s_action_hud_widget_set_text_parameters,
  s_action_hud_widget_set_value_parameters,
  s_action_hud_widget_set_visibility_parameters,
  s_action_navpoint_set_icon_parameters,
  s_action_navpoint_set_priority_parameters,
  s_action_navpoint_set_text_parameters,
  s_action_navpoint_set_timer_parameters,
  s_action_navpoint_set_visible_parameters,
  s_action_navpoint_set_visible_range_parameters,
  s_action_object_adjust_health_parameters,
  s_action_object_adjust_maximum_health_parameters,
  s_action_object_adjust_maximum_shield_parameters,
  s_action_object_adjust_shield_parameters,
  s_action_object_attach_parameters,
  s_action_object_bounce_parameters,
  s_action_object_destroy_parameters,
  s_action_object_detach_parameters,
  s_action_object_face_object_parameters,
  s_action_object_get_distance_parameters,
  s_action_object_get_health_parameters,
  s_action_object_get_orientation_parameters,
  s_action_object_get_shield_parameters,
  s_action_object_get_velocity_parameters,
  s_action_object_set_invincibility_parameters,
  s_action_object_set_never_garbage_parameters,
  s_action_object_set_orientation_parameters,
  s_action_object_set_scale_parameters,
  s_action_player_adjust_money_parameters,
  s_action_player_death_get_damage_type_parameters,
  s_action_player_death_get_killing_player_parameters,
  s_action_player_death_get_special_type_parameters,
  s_action_player_enable_purchases_parameters,
  s_action_player_get_equipment_parameters,
  s_action_player_get_fireteam_index_parameters,
  s_action_player_get_killing_spree_count_parameters,
  s_action_player_get_place_parameters,
  s_action_player_get_target_object_parameters,
  s_action_player_get_vehicle_parameters,
  s_action_player_get_weapon_parameters,
  s_action_player_pick_up_weapon_parameters,
  s_action_player_set_coop_spawning_parameters,
  s_action_player_set_fireteam_index_parameters,
  s_action_player_set_objective_allegiance_icon_parameters,
  s_action_player_set_objective_allegiance_parameters,
  s_action_player_set_objective_parameters,
  s_action_player_set_primary_respawn_object_parameters,
  s_action_player_set_requisition_palette_parameters,
  s_action_player_set_unit_parameters,
  s_action_player_set_vehicle_parameters,
  s_action_player_set_vehicle_spawning_parameters,
  s_action_play_sound_parameters,
  s_action_print_variable_parameters,
  s_action_random_parameters,
  s_action_respawn_zone_enable_parameters,
  s_action_saved_film_insert_marker_parameters,
  s_action_set_boundary_parameters,
  s_action_set_fireteam_respawn_filter_parameters,
  s_action_set_loadout_palette_parameters,
  s_action_set_parameters,
  s_action_set_pickup_filter_parameters,
  s_action_set_player_respawn_vehicle_parameters,
  s_action_set_progress_bar_parameters,
  s_action_set_respawn_filter_parameters,
  s_action_set_scenario_interpolator_state_parameters,
  s_action_set_score_parameters,
  s_action_set_team_respawn_vehicle_parameters,
  s_action_submit_incident_parameters,
  s_action_submit_incident_with_custom_value_parameters,
  s_action_team_get_place_parameters,
  s_action_team_set_coop_spawning_parameters,
  s_action_team_set_primary_respawn_object_parameters,
  s_action_team_set_vehicle_spawning_parameters,
  s_action_timer_reset_parameters,
  s_action_timer_set_rate_parameters,
  s_action_weapon_set_pickup_priority_parameters,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  encodeCustomVariable,
  encodeObjectReference,
  encodePlayerReference,
  encodeTeamReference,
  encodeTimerReference,
  encodeVariantVariable,
} from "../references/encode";
import {
  encodeDynamicStringIndex,
  encodeIncidentTargetFromOperands,
  encodePlayerFilterFromOperands,
  encodePlayerFilterModifier,
  encodeTeamOrPlayerTarget,
  parseBoolOperand,
} from "../references/encode_targets";
import {
  bipedGiveWeaponModeEnum,
  boundaryShapeValue,
  encodeMegaloTimerIndex,
  enumByName,
  exprIdentifier,
  grenadeTypeEnum,
  hudMeterInputType,
  navpointIconEnum,
  navpointPriorityEnum,
  parseBipedDropPrimaryOperand,
  boundaryPlayerColorIndex,
  parseDeleteOnDropOperand,
  parseIconIndex,
  parseSoundIndex,
  parseWidgetIndex,
  requireOperand,
  weaponPickupPriorityEnum,
} from "./action_helpers";
import { parseTimerRate } from "./timer_rate";

function mathEnum(name: string): e_math_operation {
  return enumByName(e_math_operation, parseMathOpName(name), e_math_operation.set_to);
}

function actionTypeEnum(opcode: string): e_action_type {
  const entry = Object.entries(e_action_type).find(
    ([key, value]) => typeof value === "number" && key === opcode
  );
  if (!entry) {
    throw new MegaloError(`Unknown action opcode '${opcode}'`);
  }
  return Number(entry[1]) as e_action_type;
}

function encodeVitalityAdjustment(
  ctx: CompileContext,
  action: MegaloAction,
  actionIndex: number | undefined,
  params: {
    m_object: ReturnType<typeof encodeObjectReference>;
    m_operation: e_math_operation;
    m_variable: ReturnType<typeof encodeCustomVariable>;
  }
): void {
  params.m_object = encodeObjectReference(ctx, requireOperand(action, 0, actionIndex));
  params.m_operation = mathEnum(exprIdentifier(requireOperand(action, 1, actionIndex)));
  params.m_variable = encodeCustomVariable(ctx, requireOperand(action, 2, actionIndex));
}

function encodeDeviceObjectVariable(
  ctx: CompileContext,
  action: MegaloAction,
  actionIndex: number | undefined,
  params: {
    m_object: ReturnType<typeof encodeObjectReference>;
    m_variable: ReturnType<typeof encodeCustomVariable>;
  }
): void {
  params.m_object = encodeObjectReference(ctx, requireOperand(action, 0, actionIndex));
  params.m_variable = encodeCustomVariable(ctx, requireOperand(action, 1, actionIndex));
}

function encodePlaySoundTarget(
  ctx: CompileContext,
  operands: MegaloExpr[]
): ReturnType<typeof encodeTeamOrPlayerTarget> {
  if (operands.length === 0) {
    return encodeTeamOrPlayerTarget(ctx, { kind: "identifier", name: "all_players" });
  }
  if (operands.length === 1) {
    return encodeTeamOrPlayerTarget(ctx, operands[0]!);
  }
  const kind = operands[0]!;
  if (kind.kind === "identifier" && (kind.name === "team" || kind.name === "player")) {
    const target = encodeIncidentTargetFromOperands(ctx, operands, 0);
    return target.target;
  }
  return encodeTeamOrPlayerTarget(ctx, operands[0]!);
}

function throwUnsupported(
  action: MegaloAction,
  actionIndex?: number
): never {
  throw new MegaloError(`Unsupported action opcode '${action.opcode}'`, undefined, {
    actionIndex,
    actionOpcode: action.opcode,
  });
}

export function compileAction(
  ctx: CompileContext,
  action: MegaloAction,
  actionIndex?: number
): c_action {
  const result = new c_action();
  result.m_type = actionTypeEnum(action.opcode);
  const at = (index: number) => requireOperand(action, index, actionIndex);

  switch (action.opcode) {
    case "set": {
      const params = new s_action_set_parameters();
      params.m_variable_1 = encodeVariantVariable(ctx, at(0));
      params.m_operation = mathEnum(exprIdentifier(at(1)));
      params.m_variable_2 = encodeVariantVariable(ctx, at(2));
      result.m_set_parameters = params;
      break;
    }
    case "set_score": {
      const params = new s_action_set_score_parameters();
      params.m_operation = mathEnum(exprIdentifier(at(0)));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      params.m_target = encodeTeamOrPlayerTarget(ctx, at(2));
      result.m_set_score_parameters = params;
      break;
    }
    case "timer_reset": {
      const params = new s_action_timer_reset_parameters();
      params.m_timer = encodeTimerReference(ctx, at(0));
      result.m_timer_reset_parameters = params;
      break;
    }
    case "timer_set_rate": {
      const params = new s_action_timer_set_rate_parameters();
      params.m_timer = encodeTimerReference(
        ctx,
        at(0)
      ) as c_custom_timer_reference;
      params.m_rate = parseTimerRate(at(1));
      result.m_timer_set_rate_parameters = params;
      break;
    }
    case "for_each": {
      const params = new s_action_for_each_parameters();
      params.m_trigger_index =
        action.operands[0]?.kind === "number" ? action.operands[0].value : 0;
      result.m_for_each_parameters = params;
      break;
    }
    case "create_object": {
      const params = new s_action_create_object_parameters();
      params.m_object_type = new c_object_type_reference();
      if (action.operands[0]?.kind === "string") {
        params.m_object_type.m_object_type_index = parseMegaloObjectTypeIndex(
          action.operands[0].value
        );
      } else {
        params.m_object_type.m_object_type_index = parseMegaloObjectTypeIndex(
          exprIdentifier(at(0))
        );
      }
      params.m_object_reference_2 = encodeObjectReference(
        ctx,
        at(1)
      );
      params.m_object_reference_1 = encodeObjectReference(
        ctx,
        at(2)
      );
      params.m_offset =
        action.operands[3]?.kind === "number" ? action.operands[3].value : 0;
      result.m_create_object_parameters = params;
      break;
    }
    case "delete_object": {
      const params = new s_action_delete_object_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      result.m_delete_object_parameters = params;
      break;
    }
    case "navpoint_set_visible": {
      const params = new s_action_navpoint_set_visible_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      const filter = encodePlayerFilterFromOperands(ctx, action.operands, 1);
      params.m_player_filter_modifier = filter.modifier;
      result.m_navpoint_set_visible_parameters = params;
      break;
    }
    case "navpoint_set_icon": {
      const params = new s_action_navpoint_set_icon_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_navpoint_icon = navpointIconEnum(
        exprIdentifier(at(1))
      );
      if (params.m_navpoint_icon === e_chud_navpoint_icon_type.num && action.operands[2]) {
        params.m_navpoint_number = encodeCustomVariable(ctx, at(2));
      }
      result.m_navpoint_set_icon_parameters = params;
      break;
    }
    case "navpoint_set_priority": {
      const params = new s_action_navpoint_set_priority_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_priority = navpointPriorityEnum(
        exprIdentifier(at(1))
      );
      result.m_navpoint_set_priority_parameters = params;
      break;
    }
    case "navpoint_set_timer": {
      const params = new s_action_navpoint_set_timer_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_timer_index = encodeMegaloTimerIndex(ctx, action.operands[1]);
      result.m_navpoint_set_timer_parameters = params;
      break;
    }
    case "navpoint_set_visible_range": {
      const params = new s_action_navpoint_set_visible_range_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable_1 = encodeCustomVariable(ctx, at(1));
      params.m_variable_2 = encodeCustomVariable(ctx, at(2));
      result.m_navpoint_set_visible_range_parameters = params;
      break;
    }
    case "navpoint_set_text": {
      const params = new s_action_navpoint_set_text_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_string = encodeDynamicStringIndex(ctx, at(1));
      result.m_navpoint_set_text_parameters = params;
      break;
    }
    case "set_boundary": {
      const params = new s_action_set_boundary_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_shape = boundaryShapeValue(
        exprIdentifier(at(1))
      ) as typeof params.m_shape;
      const vars = action.operands.slice(2).map((operand) =>
        encodeCustomVariable(ctx, operand)
      );
      if (vars[0]) params.m_variable_1 = vars[0];
      if (vars[1]) params.m_variable_2 = vars[1];
      if (vars[2]) params.m_variable_3 = vars[2];
      if (vars[3]) params.m_variable_4 = vars[3];
      result.m_set_boundary_parameters = params;
      break;
    }
    case "set_fireteam_respawn_filter": {
      const params = new s_action_set_fireteam_respawn_filter_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_fireteam_filter =
        action.operands[1]?.kind === "number" ? action.operands[1].value : 0;
      result.m_set_fireteam_respawn_filter_parameters = params;
      break;
    }
    case "set_respawn_filter": {
      const params = new s_action_set_respawn_filter_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      const filter = encodePlayerFilterFromOperands(ctx, action.operands, 1);
      params.m_player_filter_modifier = filter.modifier;
      result.m_set_respawn_filter_parameters = params;
      break;
    }
    case "set_pickup_filter": {
      const params = new s_action_set_pickup_filter_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      const filter = encodePlayerFilterFromOperands(ctx, action.operands, 1);
      params.m_player_filter_modifier = filter.modifier;
      result.m_set_pickup_filter_parameters = params;
      break;
    }
    case "set_progress_bar": {
      const params = new s_action_set_progress_bar_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      const filter = encodePlayerFilterFromOperands(ctx, action.operands, 1);
      params.m_player_filter_modifier = filter.modifier;
      params.m_timer_index = encodeMegaloTimerIndex(
        ctx,
        action.operands[filter.nextIndex]
      );
      result.m_set_progress_bar_parameters = params;
      break;
    }
    case "object_set_invincibility": {
      const params = new s_action_object_set_invincibility_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_object_set_invincibility_parameters = params;
      break;
    }
    case "object_destroy": {
      const params = new s_action_object_destroy_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      if (action.operands[1]) {
        params.m_no_statistics = parseBoolOperand(at(1));
      }
      result.m_object_destroy_parameters = params;
      break;
    }
    case "object_bounce": {
      const params = new s_action_object_bounce_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      result.m_object_bounce_parameters = params;
      break;
    }
    case "object_attach": {
      const params = new s_action_object_attach_parameters();
      params.m_object_1 = encodeObjectReference(ctx, at(0));
      params.m_object_2 = encodeObjectReference(ctx, at(1));
      params.m_offset =
        action.operands[2]?.kind === "number" ? action.operands[2].value : 0;
      params.m_absolute_orientation = action.operands[3]
        ? parseBoolOperand(at(3))
        : false;
      result.m_object_attach_parameters = params;
      break;
    }
    case "object_detach": {
      const params = new s_action_object_detach_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      result.m_object_detach_parameters = params;
      break;
    }
    case "object_set_orientation": {
      const params = new s_action_object_set_orientation_parameters();
      params.m_object_1 = encodeObjectReference(ctx, at(0));
      params.m_object_2 = encodeObjectReference(ctx, at(1));
      params.m_absolute_orientation = action.operands[2]
        ? parseBoolOperand(at(2))
        : false;
      result.m_object_set_orientation_parameters = params;
      break;
    }
    case "object_face_object": {
      const params = new s_action_object_face_object_parameters();
      params.m_object_1 = encodeObjectReference(ctx, at(0));
      params.m_object_2 = encodeObjectReference(ctx, at(1));
      params.m_offset =
        action.operands[2]?.kind === "number" ? action.operands[2].value : 0;
      result.m_object_face_object_parameters = params;
      break;
    }
    case "object_set_scale": {
      const params = new s_action_object_set_scale_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_object_set_scale_parameters = params;
      break;
    }
    case "object_set_never_garbage": {
      const params = new s_action_object_set_never_garbage_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_object_set_never_garbage_parameters = params;
      break;
    }
    case "object_get_orientation": {
      const params = new s_action_object_get_orientation_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_object_get_orientation_parameters = params;
      break;
    }
    case "object_get_velocity": {
      const params = new s_action_object_get_velocity_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_object_get_velocity_parameters = params;
      break;
    }
    case "object_get_distance": {
      const params = new s_action_object_get_distance_parameters();
      params.m_object_1 = encodeObjectReference(ctx, at(0));
      params.m_object_2 = encodeObjectReference(ctx, at(1));
      params.m_variable = encodeCustomVariable(ctx, at(2));
      result.m_object_get_distance_parameters = params;
      break;
    }
    case "object_get_shield": {
      const params = new s_action_object_get_shield_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_object_get_shield_parameters = params;
      break;
    }
    case "object_get_health": {
      const params = new s_action_object_get_health_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_object_get_health_parameters = params;
      break;
    }
    case "object_adjust_shield": {
      const params = new s_action_object_adjust_shield_parameters();
      encodeVitalityAdjustment(ctx, action, actionIndex, params);
      result.m_object_adjust_shield_parameters = params;
      break;
    }
    case "object_adjust_health": {
      const params = new s_action_object_adjust_health_parameters();
      encodeVitalityAdjustment(ctx, action, actionIndex, params);
      result.m_object_adjust_health_parameters = params;
      break;
    }
    case "object_adjust_maximum_shield": {
      const params = new s_action_object_adjust_maximum_shield_parameters();
      encodeVitalityAdjustment(ctx, action, actionIndex, params);
      result.m_object_adjust_maximum_shield_parameters = params;
      break;
    }
    case "object_adjust_maximum_health": {
      const params = new s_action_object_adjust_maximum_health_parameters();
      encodeVitalityAdjustment(ctx, action, actionIndex, params);
      result.m_object_adjust_maximum_health_parameters = params;
      break;
    }
    case "boundary_set_visible": {
      const params = new s_action_boundary_set_visible_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      const filter = encodePlayerFilterFromOperands(ctx, action.operands, 1);
      params.m_player_filter_modifier = filter.modifier;
      result.m_boundary_set_visible_parameters = params;
      break;
    }
    case "boundary_set_player_color": {
      const params = new s_action_boundary_set_player_color_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_player_index =
        action.operands[1]?.kind === "number"
          ? action.operands[1].value
          : boundaryPlayerColorIndex(exprIdentifier(at(1)));
      result.m_boundary_set_player_color_parameters = params;
      break;
    }
    case "team_set_coop_spawning": {
      const params = new s_action_team_set_coop_spawning_parameters();
      params.m_team = encodeTeamReference(ctx, at(0));
      params.m_enabled = parseBoolOperand(at(1));
      result.m_team_set_coop_spawning_parameters = params;
      break;
    }
    case "team_set_primary_respawn_object": {
      const params = new s_action_team_set_primary_respawn_object_parameters();
      params.m_team = encodeTeamReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_team_set_primary_respawn_object_parameters = params;
      break;
    }
    case "team_set_vehicle_spawning": {
      const params = new s_action_team_set_vehicle_spawning_parameters();
      params.m_team = encodeTeamReference(ctx, at(0));
      params.m_enabled = parseBoolOperand(at(1));
      result.m_team_set_vehicle_spawning_parameters = params;
      break;
    }
    case "player_set_primary_respawn_object": {
      const params = new s_action_player_set_primary_respawn_object_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_player_set_primary_respawn_object_parameters = params;
      break;
    }
    case "player_set_objective": {
      const params = new s_action_player_set_objective_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_string = encodeDynamicStringIndex(ctx, at(1));
      result.m_player_set_objective_parameters = params;
      break;
    }
    case "player_set_objective_allegiance": {
      const params = new s_action_player_set_objective_allegiance_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_string = encodeDynamicStringIndex(ctx, at(1));
      result.m_player_set_objective_allegiance_parameters = params;
      break;
    }
    case "player_set_objective_allegiance_icon": {
      const params = new s_action_player_set_objective_allegiance_icon_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_icon_index = parseIconIndex(at(1));
      result.m_player_set_objective_allegiance_icon_parameters = params;
      break;
    }
    case "player_set_coop_spawning": {
      const params = new s_action_player_set_coop_spawning_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_enabled = parseBoolOperand(at(1));
      result.m_player_set_coop_spawning_parameters = params;
      break;
    }
    case "player_set_vehicle": {
      const params = new s_action_player_set_vehicle_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_player_set_vehicle_parameters = params;
      break;
    }
    case "player_set_unit": {
      const params = new s_action_player_set_unit_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_player_set_unit_parameters = params;
      break;
    }
    case "player_set_vehicle_spawning": {
      const params = new s_action_player_set_vehicle_spawning_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_enabled = parseBoolOperand(at(1));
      result.m_player_set_vehicle_spawning_parameters = params;
      break;
    }
    case "player_set_fireteam_index": {
      const params = new s_action_player_set_fireteam_index_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_player_set_fireteam_index_parameters = params;
      break;
    }
    case "player_set_requisition_palette": {
      const params = new s_action_player_set_requisition_palette_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_new_palette =
        action.operands[1]?.kind === "number"
          ? action.operands[1].value
          : Number(exprIdentifier(at(1))) || 0;
      result.m_player_set_requisition_palette_parameters = params;
      break;
    }
    case "player_adjust_money": {
      const params = new s_action_player_adjust_money_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_math_operation = mathEnum(exprIdentifier(at(1)));
      params.m_variable = encodeCustomVariable(ctx, at(2));
      result.m_player_adjust_money_parameters = params;
      break;
    }
    case "player_enable_purchases": {
      const params = new s_action_player_enable_purchases_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      params.m_mode =
        action.operands[2]?.kind === "number"
          ? action.operands[2].value
          : Number(exprIdentifier(at(2))) || 0;
      result.m_player_enable_purchases_parameters = params;
      break;
    }
    case "player_pick_up_weapon": {
      const params = new s_action_player_pick_up_weapon_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_player_pick_up_weapon_parameters = params;
      break;
    }
    case "submit_incident": {
      const params = new s_action_submit_incident_parameters();
      params.m_incident_id = parseMegaloIncidentId(
        exprIdentifier(at(0))
      );
      let index = 1;
      const target1 = encodeIncidentTargetFromOperands(ctx, action.operands, index);
      params.m_target_1 = target1.target;
      index = target1.nextIndex;
      const target2 = encodeIncidentTargetFromOperands(ctx, action.operands, index);
      params.m_target_2 = target2.target;
      result.m_submit_incident_parameters = params;
      break;
    }
    case "submit_incident_with_custom_value": {
      const params = new s_action_submit_incident_with_custom_value_parameters();
      params.m_incident_id = parseMegaloIncidentId(
        exprIdentifier(at(0))
      );
      let index = 1;
      const target1 = encodeIncidentTargetFromOperands(ctx, action.operands, index);
      params.m_target_1 = target1.target;
      index = target1.nextIndex;
      const target2 = encodeIncidentTargetFromOperands(ctx, action.operands, index);
      params.m_target_2 = target2.target;
      index = target2.nextIndex;
      params.m_variable = encodeCustomVariable(ctx, at(index));
      result.m_submit_incident_with_custom_value_parameters = params;
      break;
    }
    case "set_loadout_palette": {
      const params = new s_action_set_loadout_palette_parameters();
      const target = encodeIncidentTargetFromOperands(ctx, action.operands, 0);
      params.m_target = target.target;
      params.m_loadout_palette_index = parseMegaloLoadoutPaletteSlotIndex(
        exprIdentifier(at(target.nextIndex))
      );
      result.m_set_loadout_palette_parameters = params;
      break;
    }
    case "apply_player_traits": {
      const params = new s_action_apply_player_traits_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_trait_index = parseTraitsIndex(
        exprIdentifier(at(1))
      );
      result.m_apply_player_traits_parameters = params;
      break;
    }
    case "weapon_set_pickup_priority": {
      const params = new s_action_weapon_set_pickup_priority_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_weapon_pickup_priority = weaponPickupPriorityEnum(
        exprIdentifier(at(1))
      );
      result.m_weapon_set_pickup_priority_parameters = params;
      break;
    }
    case "get_player_holding_object": {
      const params = new s_action_get_player_holding_object_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_player = encodePlayerReference(ctx, at(1));
      result.m_get_player_holding_object_parameters = params;
      break;
    }
    case "get_random_object": {
      const params = new s_action_get_random_object_parameters();
      params.m_object_1 = encodeObjectReference(ctx, at(0));
      params.m_object_2 = encodeObjectReference(ctx, at(1));
      const filterName = exprIdentifier(at(2));
      params.m_filter_index =
        ctx.mapObjectFilterIndex(filterName) ??
        (Number(filterName.replace(/^map_object_/, "")) || 0);
      result.m_get_random_object_parameters = params;
      break;
    }
    case "device_set_position": {
      const params = new s_action_device_set_position_parameters();
      encodeDeviceObjectVariable(ctx, action, actionIndex, params);
      result.m_device_set_position_parameters = params;
      break;
    }
    case "device_get_position": {
      const params = new s_action_device_get_position_parameters();
      encodeDeviceObjectVariable(ctx, action, actionIndex, params);
      result.m_device_get_position_parameters = params;
      break;
    }
    case "device_set_position_immediate": {
      const params = new s_action_device_set_position_immediate_parameters();
      encodeDeviceObjectVariable(ctx, action, actionIndex, params);
      result.m_device_set_position_immediate_parameters = params;
      break;
    }
    case "device_set_power": {
      const params = new s_action_device_set_power_parameters();
      encodeDeviceObjectVariable(ctx, action, actionIndex, params);
      result.m_device_set_power_parameters = params;
      break;
    }
    case "device_get_power": {
      const params = new s_action_device_get_power_parameters();
      encodeDeviceObjectVariable(ctx, action, actionIndex, params);
      result.m_device_get_power_parameters = params;
      break;
    }
    case "device_set_position_track": {
      const params = new s_action_device_set_position_track_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_animation_name_index =
        action.operands[1]?.kind === "number"
          ? action.operands[1].value
          : parseMegaloDeviceAnimationIndex(exprIdentifier(at(1)));
      params.m_variable = encodeCustomVariable(ctx, at(2));
      result.m_device_set_position_track_parameters = params;
      break;
    }
    case "device_animate_position": {
      const params = new s_action_device_animate_position_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable_1 = encodeCustomVariable(ctx, at(1));
      params.m_variable_2 = encodeCustomVariable(ctx, at(2));
      params.m_variable_3 = encodeCustomVariable(ctx, at(3));
      params.m_variable_4 = encodeCustomVariable(ctx, at(4));
      result.m_device_animate_position_parameters = params;
      break;
    }
    case "adjust_grenades": {
      const params = new s_action_adjust_grenades_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_grenade_type = grenadeTypeEnum(
        exprIdentifier(at(1))
      );
      params.m_math_operation = mathEnum(exprIdentifier(at(2)));
      params.m_variable = encodeCustomVariable(ctx, at(3));
      result.m_adjust_grenades_parameters = params;
      break;
    }
    case "hud_post_message": {
      const params = new s_action_hud_post_message_parameters();
      let index = 0;
      const target = encodeIncidentTargetFromOperands(ctx, action.operands, index);
      params.m_target = target.target;
      index = target.nextIndex;
      params.m_sound_index = parseSoundIndex(at(index));
      index++;
      params.m_string = encodeDynamicStringIndex(ctx, at(index));
      result.m_hud_post_message_parameters = params;
      break;
    }
    case "hud_widget_set_text": {
      const params = new s_action_hud_widget_set_text_parameters();
      params.m_widget_index = parseWidgetIndex(ctx, at(0));
      params.m_string = encodeDynamicStringIndex(ctx, at(1));
      result.m_hud_widget_set_text_parameters = params;
      break;
    }
    case "hud_widget_set_value": {
      const params = new s_action_hud_widget_set_value_parameters();
      params.m_widget_index = parseWidgetIndex(ctx, at(0));
      params.m_string = encodeDynamicStringIndex(ctx, at(1));
      result.m_hud_widget_set_value_parameters = params;
      break;
    }
    case "hud_widget_set_icon": {
      const params = new s_action_hud_widget_set_icon_parameters();
      params.m_widget_index = parseWidgetIndex(ctx, at(0));
      params.m_icon_index = parseIconIndex(at(1));
      result.m_hud_widget_set_icon_parameters = params;
      break;
    }
    case "hud_widget_set_visibility": {
      const params = new s_action_hud_widget_set_visibility_parameters();
      params.m_widget_index = parseWidgetIndex(ctx, at(0));
      params.m_player = encodePlayerReference(ctx, at(1));
      params.m_visible = parseBoolOperand(at(2));
      result.m_hud_widget_set_visibility_parameters = params;
      break;
    }
    case "hud_widget_set_meter": {
      const params = new s_action_hud_widget_set_meter_parameters();
      params.m_widget_index = parseWidgetIndex(ctx, at(0));
      const meterInput = new c_megalogamengine_hud_meter_input();
      meterInput.m_type = hudMeterInputType(action.operands.length);
      if (meterInput.m_type === e_megalogamengine_hud_meter_input_type.timer) {
        meterInput.m_timer = encodeTimerReference(ctx, at(1));
      } else {
        meterInput.m_variable_1 = encodeCustomVariable(ctx, at(1));
        meterInput.m_variable_2 = encodeCustomVariable(ctx, at(2));
      }
      params.m_meter_input = meterInput;
      result.m_hud_widget_set_meter_parameters = params;
      break;
    }
    case "play_sound": {
      const params = new s_action_play_sound_parameters();
      if (action.operands.length === 0) {
        params.m_sound_index = 0;
        params.m_immediate = false;
        params.m_target = encodePlaySoundTarget(ctx, []);
      } else {
        const soundOperand = at(action.operands.length - 1);
        params.m_sound_index = parseSoundIndex(soundOperand);
        params.m_immediate =
          action.operands.length > 2 &&
          action.operands[0]?.kind === "identifier" &&
          action.operands[0].name === "immediate";
        const targetOperands = params.m_immediate
          ? action.operands.slice(1, -1)
          : action.operands.slice(0, -1);
        params.m_target = encodePlaySoundTarget(ctx, targetOperands);
      }
      result.m_play_sound_parameters = params;
      break;
    }
    case "print_variable": {
      const params = new s_action_print_variable_parameters();
      params.m_string = encodeDynamicStringIndex(ctx, at(0));
      result.m_print_variable_parameters = params;
      break;
    }
    case "player_death_get_killing_player": {
      const params = new s_action_player_death_get_killing_player_parameters();
      params.m_player_1 = encodePlayerReference(ctx, at(0));
      params.m_player_2 = encodePlayerReference(ctx, at(1));
      result.m_player_death_get_killing_player_parameters = params;
      break;
    }
    case "player_death_get_damage_type": {
      const params = new s_action_player_death_get_damage_type_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_player_death_get_damage_type_parameters = params;
      break;
    }
    case "player_death_get_special_type": {
      const params = new s_action_player_death_get_special_type_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_player_death_get_special_type_parameters = params;
      break;
    }
    case "player_get_place": {
      const params = new s_action_player_get_place_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_player_get_place_parameters = params;
      break;
    }
    case "team_get_place": {
      const params = new s_action_team_get_place_parameters();
      params.m_team = encodeTeamReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_team_get_place_parameters = params;
      break;
    }
    case "player_get_killing_spree_count": {
      const params = new s_action_player_get_killing_spree_count_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_player_get_killing_spree_count_parameters = params;
      break;
    }
    case "player_get_vehicle": {
      const params = new s_action_player_get_vehicle_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_player_get_vehicle_parameters = params;
      break;
    }
    case "player_get_equipment": {
      const params = new s_action_player_get_equipment_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_player_get_equipment_parameters = params;
      break;
    }
    case "player_get_weapon": {
      const params = new s_action_player_get_weapon_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_primary = parseBipedDropPrimaryOperand(at(1));
      params.m_object = encodeObjectReference(ctx, at(2));
      result.m_player_get_weapon_parameters = params;
      break;
    }
    case "player_get_target_object": {
      const params = new s_action_player_get_target_object_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_object = encodeObjectReference(ctx, at(1));
      result.m_player_get_target_object_parameters = params;
      break;
    }
    case "player_get_fireteam_index": {
      const params = new s_action_player_get_fireteam_index_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_player_get_fireteam_index_parameters = params;
      break;
    }
    case "random": {
      const params = new s_action_random_parameters();
      params.m_variable_2 = encodeCustomVariable(ctx, at(0));
      params.m_variable_1 = encodeCustomVariable(ctx, at(1));
      result.m_random_parameters = params;
      break;
    }
    case "respawn_zone_enable": {
      const params = new s_action_respawn_zone_enable_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_respawn_zone_enable_parameters = params;
      break;
    }
    case "saved_film_insert_marker": {
      const params = new s_action_saved_film_insert_marker_parameters();
      params.m_variable = encodeCustomVariable(ctx, at(0));
      params.m_string = encodeDynamicStringIndex(ctx, at(1));
      result.m_saved_film_insert_marker_parameters = params;
      break;
    }
    case "set_scenario_interpolator_state": {
      const params = new s_action_set_scenario_interpolator_state_parameters();
      params.m_variable_1 = encodeCustomVariable(ctx, at(0));
      params.m_variable_2 = encodeCustomVariable(ctx, at(1));
      result.m_set_scenario_interpolator_state_parameters = params;
      break;
    }
    case "set_player_respawn_vehicle": {
      const params = new s_action_set_player_respawn_vehicle_parameters();
      params.m_object_type = new c_object_type_reference();
      if (action.operands[0]?.kind === "string") {
        params.m_object_type.m_object_type_index = parseMegaloObjectTypeIndex(
          action.operands[0].value
        );
      } else {
        params.m_object_type.m_object_type_index = parseMegaloObjectTypeIndex(
          exprIdentifier(at(0))
        );
      }
      params.m_player = encodePlayerReference(ctx, at(1));
      result.m_set_player_respawn_vehicle_parameters = params;
      break;
    }
    case "set_team_respawn_vehicle": {
      const params = new s_action_set_team_respawn_vehicle_parameters();
      params.m_object_type = new c_object_type_reference();
      if (action.operands[0]?.kind === "string") {
        params.m_object_type.m_object_type_index = parseMegaloObjectTypeIndex(
          action.operands[0].value
        );
      } else {
        params.m_object_type.m_object_type_index = parseMegaloObjectTypeIndex(
          exprIdentifier(at(0))
        );
      }
      params.m_team = encodeTeamReference(ctx, at(1));
      result.m_set_team_respawn_vehicle_parameters = params;
      break;
    }
    case "biped_give_weapon": {
      const params = new s_action_biped_give_weapon_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_object_type = new c_object_type_reference();
      const weaponType = at(1);
      params.m_object_type.m_object_type_index = parseMegaloObjectTypeIndex(
        weaponType.kind === "string"
          ? weaponType.value
          : exprIdentifier(weaponType)
      );
      params.m_mode = bipedGiveWeaponModeEnum(
        exprIdentifier(at(2))
      );
      result.m_biped_give_weapon_parameters = params;
      break;
    }
    case "biped_drop_weapon": {
      const params = new s_action_biped_drop_weapon_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_primary = parseBipedDropPrimaryOperand(at(1));
      params.m_delete_on_drop = action.operands[2]
        ? parseDeleteOnDropOperand(at(2))
        : false;
      result.m_biped_drop_weapon_parameters = params;
      break;
    }
    case "create_tunnel": {
      const params = new s_action_create_tunnel_parameters();
      params.m_object_1 = encodePlayerReference(ctx, at(0));
      params.m_object_2 = encodePlayerReference(ctx, at(1));
      params.m_object_type = encodeObjectReference(ctx, at(2));
      params.m_variable = encodeCustomVariable(ctx, at(3));
      params.m_object_3 = encodePlayerReference(ctx, at(4));
      result.m_create_tunnel_parameters = params;
      break;
    }
    case "hide_object": {
      const params = new s_action_hide_object_parameters();
      params.m_object = encodeObjectReference(ctx, at(0));
      params.m_should_hide = action.operands[1]
        ? parseBoolOperand(at(1))
        : true;
      result.m_hide_object_parameters = params;
      break;
    }
    case "get_button_time": {
      const params = new s_action_get_button_time_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_buttons =
        action.operands[1]?.kind === "number"
          ? action.operands[1].value
          : Number(exprIdentifier(at(1))) || 0;
      params.m_variable = encodeCustomVariable(ctx, at(2));
      result.m_get_button_time_parameters = params;
      break;
    }
    case "hs_function_call": {
      const params = new s_action_hs_function_call_parameters();
      params.m_function_name_index =
        action.operands[0]?.kind === "number"
          ? action.operands[0].value
          : Number(exprIdentifier(at(0))) || 0;
      result.m_hs_function_call_parameters = params;
      break;
    }
    case "game_grief_record_custom_penalty": {
      const params = new s_action_game_grief_record_custom_penalty_parameters();
      params.m_player = encodePlayerReference(ctx, at(0));
      params.m_variable = encodeCustomVariable(ctx, at(1));
      result.m_game_grief_record_custom_penalty_parameters = params;
      break;
    }
    case "debug_force_player_view_count": {
      const params = new s_action_debug_force_player_view_count_parameters();
      params.m_variable = encodeCustomVariable(ctx, at(0));
      result.m_debug_force_player_view_count_parameters = params;
      break;
    }
    case "debugging_enable_tracing": {
      const params = new s_action_debugging_enable_tracing_parameters();
      params.m_tracing_enabled = parseBoolOperand(at(0));
      result.m_debugging_enable_tracing_parameters = params;
      break;
    }
    case "end_round":
      result.m_end_round_parameters = new s_action_end_round_parameters();
      break;
    case "break_into_debugger":
      result.m_break_into_debugger_parameters =
        new s_action_break_into_debugger_parameters();
      break;
    case "begin":
      break;
    default:
      throwUnsupported(action, actionIndex);
  }

  return result;
}
