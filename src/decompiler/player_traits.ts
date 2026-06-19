import type { MegaloExpr } from "../ast";
import type { c_player_traits } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { e_grenade_count_setting } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { traitObjectNameFromAbsoluteIndex } from "../compiler/object_indices";
import { decompileGrenadeCountFields } from "../grenade_count_setting";
import {
  decodeTraitToggleSetting,
  traitToggleIsEnabled,
} from "../trait_settings";

function id(name: string): MegaloExpr {
  return { kind: "identifier", name };
}

function num(value: number): MegaloExpr {
  return { kind: "number", value };
}

function traitObjectExpr(
  absolute: number,
  category: "weapon" | "equipment",
  objectsUsed: boolean[]
): MegaloExpr {
  return id(traitObjectNameFromAbsoluteIndex(absolute, category, objectsUsed));
}

function traitToggleExpr(value: number): MegaloExpr {
  if (traitToggleIsEnabled(value)) {
    return num(decodeTraitToggleSetting(value));
  }
  return num(0);
}

function pushWeaponTraitFields(
  fields: { key: string; value: MegaloExpr }[],
  weapons: c_player_traits["m_weapon_traits"],
  objectsUsed: boolean[]
): void {
  const w = weapons;
  if (w.m_initial_primary_weapon_absolute_index !== -3) {
    fields.push({
      key: "initial_primary_weapon",
      value: traitObjectExpr(
        w.m_initial_primary_weapon_absolute_index,
        "weapon",
        objectsUsed
      ),
    });
  }
  if (w.m_initial_secondary_weapon_absolute_index !== -3) {
    fields.push({
      key: "initial_secondary_weapon",
      value: traitObjectExpr(
        w.m_initial_secondary_weapon_absolute_index,
        "weapon",
        objectsUsed
      ),
    });
  }
  if (w.m_initial_equipment_absolute_index !== -3) {
    fields.push({
      key: "initial_equipment",
      value: traitObjectExpr(
        w.m_initial_equipment_absolute_index,
        "equipment",
        objectsUsed
      ),
    });
  }
  if (
    w.m_initial_grenade_count_setting !== e_grenade_count_setting.none &&
    w.m_initial_grenade_count_setting !== e_grenade_count_setting.map_default
  ) {
    fields.push(...decompileGrenadeCountFields(w.m_initial_grenade_count_setting));
  }
  if (traitToggleIsEnabled(w.m_infinite_ammo_setting)) {
    fields.push({
      key: "infinite_ammo",
      value: traitToggleExpr(w.m_infinite_ammo_setting),
    });
  }
  if (traitToggleIsEnabled(w.m_infinite_equipment_setting)) {
    fields.push({
      key: "infinite_equipment",
      value: traitToggleExpr(w.m_infinite_equipment_setting),
    });
  }
}

export function decompileBasePlayerTraitFields(
  traits: c_player_traits,
  objectsUsed: boolean[]
): { key: string; value: MegaloExpr }[] {
  const fields: { key: string; value: MegaloExpr }[] = [];
  pushWeaponTraitFields(fields, traits.m_weapon_traits, objectsUsed);
  return fields;
}

export function basePlayerTraitsDifferFromDefault(
  traits: c_player_traits
): boolean {
  const w = traits.m_weapon_traits;
  return (
    (w.m_initial_grenade_count_setting !== e_grenade_count_setting.none &&
      w.m_initial_grenade_count_setting !==
        e_grenade_count_setting.map_default) ||
    traitToggleIsEnabled(w.m_infinite_ammo_setting) ||
    traitToggleIsEnabled(w.m_infinite_equipment_setting) ||
    w.m_initial_primary_weapon_absolute_index !== -3 ||
    w.m_initial_secondary_weapon_absolute_index !== -3 ||
    w.m_initial_equipment_absolute_index !== -3
  );
}
