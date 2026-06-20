import type { MegaloAction, MegaloExpr } from "../ast";
import { enumValueName } from "../enum_utils";
import { MegaloError } from "../error";
import { parseMegaloEngineIconIndex, parseMegaloHudWidgetIconIndex } from "../lookups";
import type { CompileContext } from "../symbols";
import {
  e_chud_navpoint_icon_type,
  e_grenade_type,
  e_navpoint_priority,
  e_weapon_pickup_priority,
  e_biped_give_weapon_mode,
  e_scriptable_game_buttons,
  e_megalogamengine_hud_meter_input_type,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";

const BOUNDARY_SHAPES: Record<string, number> = {
  unused: 0,
  sphere: 1,
  cylinder: 2,
  box: 3,
};

export function exprIdentifier(expr: MegaloExpr | undefined): string {
  if (!expr) {
    return "";
  }
  if (expr.kind === "identifier") {
    return expr.name;
  }
  if (expr.kind === "number") {
    return String(expr.value);
  }
  if (expr.kind === "string") {
    return expr.value;
  }
  if (expr.kind === "member") {
    return `${exprIdentifier(expr.base)}.${expr.member}`;
  }
  return "";
}

export function parseIndexSuffix(name: string, prefix: string): number | undefined {
  const match = new RegExp(`^${prefix}_(\\d+)$`).exec(name);
  return match ? Number(match[1]) : undefined;
}

export function parseWidgetIndex(
  ctx: CompileContext,
  expr: MegaloExpr | undefined
): number {
  const name = exprIdentifier(expr);
  const named = ctx.widgetIndex(name);
  if (named !== undefined) {
    return named;
  }
  return parseIndexSuffix(name, "widget") ?? (Number(name) || 0);
}

export function parseSoundIndex(expr: MegaloExpr | undefined): number {
  const name = exprIdentifier(expr);
  const indexed = parseIndexSuffix(name, "sound");
  if (indexed !== undefined) {
    return indexed;
  }
  return Number(name) || 0;
}

export function parseIconIndex(expr: MegaloExpr | undefined, prefix = "icon"): number {
  const name = exprIdentifier(expr);
  const hudIcon = parseMegaloHudWidgetIconIndex(name);
  if (hudIcon !== undefined) {
    return hudIcon;
  }
  const engineIcon = parseMegaloEngineIconIndex(name);
  if (engineIcon !== undefined) {
    return engineIcon;
  }
  const indexed = parseIndexSuffix(name, prefix);
  if (indexed !== undefined) {
    return indexed;
  }
  return Number(name) || 0;
}

export function encodeMegaloTimerIndex(
  ctx: CompileContext,
  expr?: MegaloExpr
): number {
  if (!expr) {
    return 0;
  }
  const name = exprIdentifier(expr);
  if (name === "none") {
    return 0;
  }
  const timerConstant = ctx.constants.lookupTimer(name);
  if (timerConstant !== undefined) {
    return timerConstant;
  }
  const slot = ctx.variables.findByName(name);
  if (slot?.type === "timer") {
    return slot.index;
  }
  const indexed = parseIndexSuffix(name, "timer");
  if (indexed !== undefined) {
    return indexed;
  }
  return Number(name) || 0;
}

export function boundaryShapeValue(name: string): number {
  return BOUNDARY_SHAPES[name] ?? 0;
}

export function enumByName<T extends Record<string, string | number>>(
  enumObj: T,
  name: string,
  fallback: T[keyof T]
): T[keyof T] {
  const entry = Object.entries(enumObj).find(
    ([key, value]) => typeof value === "number" && key === name
  );
  return entry ? (Number(entry[1]) as T[keyof T]) : fallback;
}

export function navpointIconEnum(name: string): e_chud_navpoint_icon_type {
  const numeric = Number(name);
  if (!Number.isNaN(numeric) && enumValueName(e_chud_navpoint_icon_type, numeric)) {
    return numeric as e_chud_navpoint_icon_type;
  }
  return enumByName(
    e_chud_navpoint_icon_type,
    name,
    e_chud_navpoint_icon_type.speaker
  );
}

export function navpointPriorityEnum(name: string): e_navpoint_priority {
  return enumByName(e_navpoint_priority, name, e_navpoint_priority.normal);
}

export function weaponPickupPriorityEnum(name: string): e_weapon_pickup_priority {
  const numeric = Number(name);
  if (!Number.isNaN(numeric)) {
    return numeric as e_weapon_pickup_priority;
  }
  return enumByName(
    e_weapon_pickup_priority,
    name,
    e_weapon_pickup_priority.normal
  );
}

export function grenadeTypeEnum(name: string): e_grenade_type {
  return enumByName(e_grenade_type, name, e_grenade_type.frag_grenade);
}

export function bipedGiveWeaponModeEnum(name: string): e_biped_give_weapon_mode {
  return enumByName(
    e_biped_give_weapon_mode,
    name,
    e_biped_give_weapon_mode.primary
  );
}

export function bipedGiveWeaponModeName(mode: e_biped_give_weapon_mode): string {
  return enumValueName(e_biped_give_weapon_mode, mode) ?? "primary";
}

export function scriptableGameButtonsEnum(name: string): e_scriptable_game_buttons {
  return enumByName(e_scriptable_game_buttons, name, e_scriptable_game_buttons.jump);
}

export function scriptableGameButtonsName(button: e_scriptable_game_buttons): string {
  return enumValueName(e_scriptable_game_buttons, button) ?? "jump";
}

export function parseBipedDropPrimaryOperand(expr: MegaloExpr): boolean {
  const name = exprIdentifier(expr);
  if (name === "primary") {
    return true;
  }
  if (name === "secondary") {
    return false;
  }
  return name === "true";
}

export function boundaryPlayerColorIndex(name: string): number {
  if (name === "owner") {
    return 0;
  }
  const match = /^player_(\d+)$/.exec(name);
  if (match) {
    return Number(match[1]);
  }
  return Number(name) || 0;
}

export function boundaryPlayerColorName(index: number): string {
  if (index === 0) {
    return "owner";
  }
  return String(index);
}

export function parseDeleteOnDropOperand(expr: MegaloExpr): boolean {
  const name = exprIdentifier(expr);
  return name === "delete_on_drop" || name === "true";
}

export function hudMeterInputType(
  operandCount: number
): e_megalogamengine_hud_meter_input_type {
  if (operandCount <= 2) {
    return e_megalogamengine_hud_meter_input_type.timer;
  }
  return e_megalogamengine_hud_meter_input_type.number;
}

export function requireOperand(
  action: MegaloAction,
  index: number,
  actionIndex?: number
): MegaloExpr {
  const operand = action.operands[index];
  if (operand === undefined) {
    throw new MegaloError(
      `Action '${action.opcode}' is missing operand ${index + 1}`,
      undefined,
      { actionIndex, actionOpcode: action.opcode }
    );
  }
  return operand;
}
