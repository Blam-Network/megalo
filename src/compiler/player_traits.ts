import type { MegaloExpr } from "../ast";
import type { c_player_traits } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { e_grenade_count_setting } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { MegaloError } from "../error";
import { encodeTraitToggleSetting } from "../trait_settings";
import {
  grenadeCountSettingValue,
  mergeGrenadeWireValues,
  type MegaloGrenadeCountSettingExpr,
} from "../grenade_count_setting";
import type { ObjectIndexRegistry, TraitObjectCategory } from "./object_indices";

const VEHICLE_USAGE: Record<string, number> = {
  none: 0,
  full: 1,
  passenger: 2,
  not_passenger: 3,
  driver: 4,
  gunner: 5,
};

function exprNumber(expr: MegaloExpr): number {
  if (expr.kind === "number") {
    return expr.value;
  }
  if (expr.kind === "bool") {
    return expr.value ? 1 : 0;
  }
  if (expr.kind === "identifier") {
    if (expr.name === "true") {
      return 1;
    }
    if (expr.name === "false") {
      return 0;
    }
    const vehicle = VEHICLE_USAGE[expr.name];
    if (vehicle !== undefined) {
      return vehicle;
    }
  }
  throw new MegaloError(`Expected numeric trait value, got '${expr.kind}'`);
}

function exprObjectAbsoluteIndex(
  expr: MegaloExpr,
  objects: ObjectIndexRegistry,
  category: TraitObjectCategory
): number {
  if (expr.kind === "identifier") {
    return objects.resolveTraitObjectName(expr.name, category);
  }
  if (expr.kind === "number") {
    return expr.value;
  }
  throw new MegaloError("Expected object name for trait object reference");
}

function applyTraitField(
  traits: c_player_traits,
  key: string,
  value: MegaloExpr,
  objects: ObjectIndexRegistry
): void {
  const sv = traits.m_shield_vitality_traits;
  const w = traits.m_weapon_traits;
  const m = traits.m_movement_traits;
  const a = traits.m_appearance_traits;
  const s = traits.m_sensor_traits;

  switch (key) {
    case "damage_resistance":
      sv.m_damage_resistance_percentage_setting = exprNumber(value);
      return;
    case "body_multiplier":
      sv.m_body_multiplier = exprNumber(value);
      return;
    case "body_recharge_rate":
      sv.m_body_recharge_rate = exprNumber(value);
      return;
    case "shield_multiplier":
      sv.m_shield_multiplier = exprNumber(value);
      return;
    case "shield_recharge_rate":
      sv.m_shield_recharge_rate = exprNumber(value);
      return;
    case "overshield_recharge_rate":
      sv.m_overshield_recharge_rate = exprNumber(value);
      return;
    case "headshot_immunity":
      sv.m_headshot_immunity_setting = exprNumber(value);
      return;
    case "vampirism":
      sv.m_vampirism_percentage_setting = exprNumber(value);
      return;
    case "assassination_immunity":
      sv.m_assasination_immunity = exprNumber(value);
      return;
    case "cannot_die_from_damage":
      sv.m_cannot_die_from_damage = exprNumber(value);
      return;
    case "damage_modifier":
      w.m_damage_modifier_percentage_setting = exprNumber(value);
      return;
    case "melee_damage_modifier":
      w.m_melee_damage_modifier_percentage_setting = exprNumber(value);
      return;
    case "initial_primary_weapon":
      w.m_initial_primary_weapon_absolute_index = exprObjectAbsoluteIndex(
        value,
        objects,
        "weapon"
      );
      return;
    case "initial_secondary_weapon":
      w.m_initial_secondary_weapon_absolute_index = exprObjectAbsoluteIndex(
        value,
        objects,
        "weapon"
      );
      return;
    case "initial_grenades":
      if (value.kind !== "grenade_count_setting") {
        throw new MegaloError("Expected grenade count setting for initial_grenades");
      }
      w.m_initial_grenade_count_setting = mergeGrenadeWireValues(
        w.m_initial_grenade_count_setting as number,
        grenadeCountSettingValue(value as MegaloGrenadeCountSettingExpr)
      ) as e_grenade_count_setting;
      return;
    case "infinite_ammo":
      w.m_infinite_ammo_setting = encodeTraitToggleSetting(exprNumber(value));
      return;
    case "recharging_grenades":
      w.m_recharging_grenades_setting = exprNumber(value);
      return;
    case "weapon_pickup":
      w.m_weapon_pickup_setting = exprNumber(value);
      return;
    case "equipment_usage":
      w.m_equipment_usage_setting = exprNumber(value);
      return;
    case "equipment_drop_on_death":
      w.m_equipment_drop_on_death_setting = exprNumber(value);
      return;
    case "infinite_equipment":
      w.m_infinite_equipment_setting = encodeTraitToggleSetting(exprNumber(value));
      return;
    case "initial_equipment":
      w.m_initial_equipment_absolute_index = exprObjectAbsoluteIndex(
        value,
        objects,
        "equipment"
      );
      return;
    case "speed":
      m.m_speed_setting = exprNumber(value);
      return;
    case "gravity":
      m.m_gravity_setting = exprNumber(value);
      return;
    case "vehicle_usage":
      m.m_vehicle_usage_setting = exprNumber(value);
      return;
    case "double_jump":
      m.m_double_jump_setting = exprNumber(value);
      return;
    case "jump_modifier":
      m.m_jump_modifier = exprNumber(value);
      return;
    case "active_camo":
      a.m_active_camo_setting = exprNumber(value);
      return;
    case "waypoint":
      a.m_waypoint_setting = exprNumber(value);
      return;
    case "gamertag":
      a.m_gamertag_setting = exprNumber(value);
      return;
    case "aura":
      a.m_aura_setting = exprNumber(value);
      return;
    case "forced_change_color":
      a.m_forced_change_color_setting = exprNumber(value);
      return;
    case "motion_tracker":
      s.m_motion_tracker_setting = exprNumber(value);
      return;
    case "motion_tracker_range":
      s.m_motion_tracker_range_setting = exprNumber(value);
      return;
    case "directional_damage":
      s.m_directional_damage_setting = exprNumber(value);
      return;
    default:
      throw new MegaloError(`Unknown player trait field '${key}'`);
  }
}

export function applyTraitFields(
  traits: c_player_traits,
  fields: { key: string; value: MegaloExpr }[],
  objects: ObjectIndexRegistry
): void {
  for (const field of fields) {
    applyTraitField(traits, field.key, field.value, objects);
  }
}
