import type { MegaloExpr } from "../ast";
import type { CompileContext, VariableSlot } from "../symbols";
import {
  c_custom_timer_reference,
  c_custom_variable_reference,
  c_explicit_object,
  c_explicit_player,
  c_explicit_team,
  c_object_reference,
  c_player_reference,
  c_team_reference,
  e_custom_timer_type,
  e_custom_variable_type,
  e_explicit_object_type,
  e_explicit_player_type,
  e_explicit_team_type,
  e_object_reference_type,
  e_player_reference_type,
  e_team_reference_type,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  e_variable_type,
  s_variant_variable,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  parseExplicitObject,
  parseExplicitPlayer,
  parseExplicitTeam,
} from "./format";

const EXPLICIT_PLAYER_NAMES = new Set([
  "no_player",
  "player_0",
  "player_1",
  "player_2",
  "player_3",
  "player_4",
  "player_5",
  "player_6",
  "player_7",
  "player_8",
  "player_9",
  "player_10",
  "player_11",
  "player_12",
  "player_13",
  "player_14",
  "player_15",
  "current_player",
  "hud_player",
  "hud_target_player",
  "killer",
  "global_0",
  "global_1",
  "global_2",
  "global_3",
  "global_4",
  "global_5",
  "global_6",
  "global_7",
  "temporary_0",
  "temporary_1",
  "temporary_2",
]);

function isExplicitPlayerName(name: string): boolean {
  if (EXPLICIT_PLAYER_NAMES.has(name)) {
    return true;
  }
  try {
    parseExplicitPlayer(name);
    return true;
  } catch {
    return false;
  }
}

function isExplicitTeamName(name: string): boolean {
  if (name === "neutral" || name === "current_team" || name.startsWith("team_")) {
    return true;
  }
  try {
    parseExplicitTeam(name);
    return true;
  } catch {
    return false;
  }
}

function isGlobalObjectVariableName(name: string): boolean {
  return /^object_\d+$/.test(name);
}

function isExplicitObjectName(name: string): boolean {
  if (
    name === "none" ||
    name === "current_object" ||
    name.startsWith("global_object_") ||
    isGlobalObjectVariableName(name)
  ) {
    return false;
  }
  try {
    parseExplicitObject(name);
    return true;
  } catch {
    return false;
  }
}

function isObjectReferenceBase(ctx: CompileContext, base: string): boolean {
  if (
    base === "none" ||
    base === "current_object" ||
    base.startsWith("global_object_") ||
    isGlobalObjectVariableName(base)
  ) {
    return true;
  }
  if (ctx.variables.findByName(base)?.type === "object") {
    return true;
  }
  return isExplicitObjectName(base);
}

function isTeamReferenceBase(ctx: CompileContext, base: string): boolean {
  if (isExplicitTeamName(base)) {
    return true;
  }
  return ctx.variables.findByName(base)?.type === "team";
}

function encodeTeamExplicitForBase(
  ctx: CompileContext,
  base: string
): c_explicit_team {
  const team = new c_explicit_team();
  const slot = ctx.variables.findByName(base);
  if (slot?.type === "team") {
    if (slot.scope === "global") {
      team.m_explicit_team_type = enumSlotValue(
        e_explicit_team_type,
        "global",
        slot.index
      ) as e_explicit_team_type;
    } else {
      team.m_explicit_team_type = e_explicit_team_type.current;
    }
    return team;
  }
  team.m_explicit_team_type = parseExplicitTeam(base);
  return team;
}

function resolveScopedObjectMemberIndex(
  ctx: CompileContext,
  scope: VariableSlot["scope"],
  member: string
): number | undefined {
  const named = ctx.variables
    .all()
    .find((s) => s.scope === scope && s.type === "object" && s.name === member);
  if (named) {
    return named.index;
  }
  const numberMatch = /^number_(\d+)$/.exec(member);
  if (numberMatch) {
    const index = Number(numberMatch[1]);
    if (ctx.variables.findByIndex(scope, "object", index)) {
      return index;
    }
  }
  return undefined;
}

function enumSlotValue(
  enumObj: Record<string, string | number>,
  prefix: string,
  index: number
): number {
  const value = enumObj[`${prefix}_${index}`];
  if (typeof value !== "number") {
    throw new Error(`Unknown ${prefix} slot index ${index}`);
  }
  return value;
}

function encodeGlobalObjectReference(index: number): c_object_reference {
  const ref = new c_object_reference();
  ref.m_type = e_object_reference_type.global_object;
  ref.m_object = new c_explicit_object();
  ref.m_object.m_explicit_object_type = enumSlotValue(
    e_explicit_object_type,
    "global",
    index
  ) as e_explicit_object_type;
  return ref;
}

function encodeGlobalPlayerReference(index: number): c_player_reference {
  const ref = new c_player_reference();
  ref.m_type = e_player_reference_type.global_player;
  ref.m_player = new c_explicit_player();
  ref.m_player.m_explicit_player_type = enumSlotValue(
    e_explicit_player_type,
    "global",
    index
  ) as e_explicit_player_type;
  return ref;
}

function encodeGlobalTeamReference(index: number): c_team_reference {
  const ref = new c_team_reference();
  ref.m_type = e_team_reference_type.global_team;
  ref.m_team = new c_explicit_team();
  ref.m_team.m_explicit_team_type = enumSlotValue(
    e_explicit_team_type,
    "global",
    index
  ) as e_explicit_team_type;
  return ref;
}

function encodeObjectVariableReference(slot: VariableSlot): c_object_reference {
  switch (slot.scope) {
    case "global":
      return encodeGlobalObjectReference(slot.index);
    case "object": {
      const ref = new c_object_reference();
      ref.m_type = e_object_reference_type.object_object;
      ref.m_object = new c_explicit_object();
      ref.m_object.m_explicit_object_type = e_explicit_object_type.current;
      ref.m_variable_index = slot.index;
      return ref;
    }
    case "player": {
      const ref = new c_object_reference();
      ref.m_type = e_object_reference_type.player_object;
      ref.m_player = new c_explicit_player();
      ref.m_player.m_explicit_player_type = e_explicit_player_type.current;
      ref.m_variable_index = slot.index;
      return ref;
    }
    case "team": {
      const ref = new c_object_reference();
      ref.m_type = e_object_reference_type.team_object;
      ref.m_team = new c_explicit_team();
      ref.m_team.m_explicit_team_type = e_explicit_team_type.current;
      ref.m_variable_index = slot.index;
      return ref;
    }
  }
}

function encodeNumberVariable(slot: VariableSlot): c_custom_variable_reference {
  const ref = new c_custom_variable_reference();
  switch (slot.scope) {
    case "global":
      ref.m_type = e_custom_variable_type.global_number;
      ref.m_variable_index = slot.index;
      return ref;
    case "object":
      ref.m_type = e_custom_variable_type.object_number;
      ref.m_object = new c_explicit_object();
      ref.m_object.m_explicit_object_type = e_explicit_object_type.current;
      ref.m_variable_index = slot.index;
      return ref;
    case "player":
      ref.m_type = e_custom_variable_type.player_number;
      ref.m_player = new c_explicit_player();
      ref.m_player.m_explicit_player_type = e_explicit_player_type.current;
      ref.m_variable_index = slot.index;
      return ref;
    case "team":
      ref.m_type = e_custom_variable_type.team_number;
      ref.m_team = new c_explicit_team();
      ref.m_team.m_explicit_team_type = e_explicit_team_type.current;
      ref.m_variable_index = slot.index;
      return ref;
  }
}

function encodeTimerVariable(slot: VariableSlot): c_custom_timer_reference {
  const ref = new c_custom_timer_reference();
  switch (slot.scope) {
    case "global":
      ref.m_type = e_custom_timer_type.global;
      ref.m_variable_index = slot.index;
      return ref;
    case "object":
      ref.m_type = e_custom_timer_type.object;
      ref.m_object = new c_explicit_object();
      ref.m_object.m_explicit_object_type = e_explicit_object_type.current;
      ref.m_variable_index = slot.index;
      return ref;
    case "player":
      ref.m_type = e_custom_timer_type.player;
      ref.m_player = new c_explicit_player();
      ref.m_player.m_explicit_player_type = e_explicit_player_type.current;
      ref.m_variable_index = slot.index;
      return ref;
    case "team":
      ref.m_type = e_custom_timer_type.team;
      ref.m_team = new c_explicit_team();
      ref.m_team.m_explicit_team_type = e_explicit_team_type.current;
      ref.m_variable_index = slot.index;
      return ref;
  }
}

function exprName(expr: MegaloExpr): string {
  switch (expr.kind) {
    case "identifier":
      return expr.name;
    case "member":
      return `${exprName(expr.base)}.${expr.member}`;
    case "number":
      return String(expr.value);
    case "bool":
      return expr.value ? "true" : "false";
    case "string":
      return expr.value;
    case "grenade_count_setting":
      return String(expr.value);
  }
}

function splitMember(expr: MegaloExpr): { base: string; member?: string } {
  if (expr.kind === "member") {
    return { base: exprName(expr.base), member: expr.member };
  }
  return { base: exprName(expr) };
}

function builtinGlobalType(name: string): e_custom_variable_type | undefined {
  const value = (e_custom_variable_type as Record<string, string | number>)[name];
  if (typeof value !== "number") {
    return undefined;
  }
  if (
    value < e_custom_variable_type.round ||
    value > e_custom_variable_type.object_death_damage_type ||
    value === e_custom_variable_type.symmetry_unused
  ) {
    return undefined;
  }
  return value;
}

function parseIndexSuffix(name: string, prefix: string): number | undefined {
  if (name === prefix) {
    return 0;
  }
  if (name.startsWith(`${prefix}_`)) {
    return Number(name.slice(prefix.length + 1));
  }
  return undefined;
}

export function encodeCustomVariable(
  ctx: CompileContext,
  expr: MegaloExpr
): c_custom_variable_reference {
  const ref = new c_custom_variable_reference();
  const name = exprName(expr);

  const globalIndex = parseIndexSuffix(name, "global_number");
  if (globalIndex !== undefined) {
    ref.m_type = e_custom_variable_type.global_number;
    ref.m_variable_index = globalIndex;
    return ref;
  }

  const tempIndex = parseIndexSuffix(name, "temporary_number");
  if (tempIndex !== undefined) {
    ref.m_type = e_custom_variable_type.temporary_number;
    ref.m_variable_index = tempIndex;
    return ref;
  }

  const { base, member } = splitMember(expr);
  const slot = ctx.variables.findByName(name);
  if (slot?.type === "number" && !member) {
    return encodeNumberVariable(slot);
  }
  if (slot?.type === "timer" && !member) {
    return encodeTimerVariable(slot) as unknown as c_custom_variable_reference;
  }

  const builtin = builtinGlobalType(name);
  if (builtin !== undefined) {
    ref.m_type = builtin;
    return ref;
  }

  const numberConstant = ctx.constants.lookupNumber(name);
  if (numberConstant !== undefined) {
    ref.m_type = e_custom_variable_type.constant;
    ref.m_immediate_value = numberConstant;
    return ref;
  }

  const timerConstant = ctx.constants.lookupTimer(name);
  if (timerConstant !== undefined) {
    ref.m_type = e_custom_variable_type.constant;
    ref.m_immediate_value = timerConstant;
    return ref;
  }

  if (expr.kind === "number") {
    ref.m_type = e_custom_variable_type.constant;
    ref.m_immediate_value = expr.value;
    return ref;
  }

  if (member?.startsWith("number_") || member?.startsWith("stat_")) {
    const index = Number(member.replace(/^(number_|stat_)/, ""));
    if (base.startsWith("player_") || base === "current_player") {
      ref.m_type = e_custom_variable_type.player_number;
      ref.m_player = new c_explicit_player();
      ref.m_player.m_explicit_player_type = parseExplicitPlayer(base);
      ref.m_variable_index = index;
      return ref;
    }
    if (base.startsWith("team_") || base === "neutral" || base === "current_team") {
      ref.m_type = e_custom_variable_type.team_number;
      ref.m_team = new c_explicit_team();
      ref.m_team.m_explicit_team_type = parseExplicitTeam(base);
      ref.m_variable_index = index;
      return ref;
    }
    if (isObjectReferenceBase(ctx, base)) {
      ref.m_type = e_custom_variable_type.object_number;
      ref.m_object = new c_explicit_object();
      ref.m_object.m_explicit_object_type = explicitObjectTypeForBase(ctx, base);
      ref.m_variable_index = index;
      return ref;
    }
  }

  if (member === "score") {
    ref.m_type = e_custom_variable_type.team_score;
    ref.m_team = new c_explicit_team();
    ref.m_team.m_explicit_team_type = parseExplicitTeam(base);
    return ref;
  }

  if (
    member === "player_score" ||
    member === "player_money" ||
    member === "player_rating"
  ) {
    const metric = (e_custom_variable_type as Record<string, string | number>)[
      member
    ];
    if (typeof metric === "number") {
      ref.m_type = metric as e_custom_variable_type;
      ref.m_player = new c_explicit_player();
      ref.m_player.m_explicit_player_type = parseExplicitPlayer(base);
      return ref;
    }
  }

  const optionByName = ctx.optionIndexByName.get(name);
  if (optionByName !== undefined) {
    ref.m_type = e_custom_variable_type.option;
    ref.m_option_index = optionByName;
    return ref;
  }

  const optionIndex = parseIndexSuffix(name, "option");
  if (optionIndex !== undefined) {
    ref.m_type = e_custom_variable_type.option;
    ref.m_option_index = optionIndex;
    return ref;
  }

  ref.m_type = e_custom_variable_type.constant;
  ref.m_immediate_value = Number(name) || 0;
  return ref;
}

export function encodeTimerReference(
  ctx: CompileContext,
  expr: MegaloExpr
): c_custom_timer_reference {
  const ref = new c_custom_timer_reference();
  const name = exprName(expr);
  const slot = ctx.variables.findByName(name);
  if (slot?.type === "timer") {
    return encodeTimerVariable(slot);
  }

  if (name === "round_timer") {
    ref.m_type = e_custom_timer_type.round;
    return ref;
  }

  const globalIndex = parseIndexSuffix(name, "global_timer");
  if (globalIndex !== undefined) {
    ref.m_type = e_custom_timer_type.global;
    ref.m_variable_index = globalIndex;
    return ref;
  }

  const { base, member } = splitMember(expr);
  if (member?.startsWith("timer_")) {
    const index = Number(member.replace("timer_", ""));
    if (base.startsWith("player_") || base === "current_player") {
      ref.m_type = e_custom_timer_type.player;
      ref.m_player = new c_explicit_player();
      ref.m_player.m_explicit_player_type = parseExplicitPlayer(base);
      ref.m_variable_index = index;
      return ref;
    }
    if (
      base.startsWith("team_") ||
      base === "neutral" ||
      base === "current_team"
    ) {
      ref.m_type = e_custom_timer_type.team;
      ref.m_team = new c_explicit_team();
      ref.m_team.m_explicit_team_type = parseExplicitTeam(base);
      ref.m_variable_index = index;
      return ref;
    }
    ref.m_type = e_custom_timer_type.object;
    ref.m_object = new c_explicit_object();
    ref.m_object.m_explicit_object_type = explicitObjectTypeForBase(ctx, base);
    ref.m_variable_index = index;
    return ref;
  }

  ref.m_type = e_custom_timer_type.global;
  ref.m_variable_index = 0;
  return ref;
}

export function encodePlayerReference(
  ctx: CompileContext,
  expr: MegaloExpr
): c_player_reference {
  const { base, member } = splitMember(expr);
  const slot = ctx.variables.findByName(base);
  if (slot?.type === "player" && !member) {
    if (slot.scope === "global") {
      return encodeGlobalPlayerReference(slot.index);
    }
    const ref = new c_player_reference();
    ref.m_type = e_player_reference_type.player_player;
    ref.m_player = new c_explicit_player();
    ref.m_player.m_explicit_player_type = e_explicit_player_type.current;
    ref.m_variable_index = slot.index;
    return ref;
  }

  const ref = new c_player_reference();
  ref.m_player = new c_explicit_player();
  ref.m_player.m_explicit_player_type = parseExplicitPlayer(base);
  if (member) {
    ref.m_type = e_player_reference_type.player_player;
    ref.m_variable_index = Number(member.replace("number_", "")) || 0;
  } else {
    ref.m_type = e_player_reference_type.global_player;
  }
  return ref;
}

function encodeNamedGlobalObjectReference(
  ctx: CompileContext,
  base: string
): c_object_reference | undefined {
  const objectSlot = /^object_(\d+)$/.exec(base);
  if (objectSlot) {
    const slotIndex = Number(objectSlot[1]) - 1;
    if (slotIndex >= 0) {
      const byIndex = ctx.variables.findByIndex(
        "global",
        "object",
        slotIndex
      );
      if (byIndex) {
        return encodeObjectVariableReference(byIndex);
      }
      return encodeGlobalObjectReference(slotIndex);
    }
  }

  const slot = ctx.variables.findByName(base);
  if (slot?.type === "object") {
    return encodeObjectVariableReference(slot);
  }

  const globalObjectIndex = parseIndexSuffix(base, "global_object");
  if (globalObjectIndex !== undefined) {
    const byIndex = ctx.variables.findByIndex(
      "global",
      "object",
      globalObjectIndex
    );
    if (byIndex) {
      return encodeObjectVariableReference(byIndex);
    }
    return encodeGlobalObjectReference(globalObjectIndex);
  }

  return undefined;
}

function explicitObjectTypeForBase(
  ctx: CompileContext,
  base: string
): e_explicit_object_type {
  const named = encodeNamedGlobalObjectReference(ctx, base);
  if (named?.m_object) {
    return named.m_object.m_explicit_object_type;
  }
  const objectSlot = /^object_(\d+)$/.exec(base);
  if (objectSlot) {
    const slotIndex = Number(objectSlot[1]) - 1;
    if (slotIndex >= 0) {
      return enumSlotValue(
        e_explicit_object_type,
        "global",
        slotIndex
      ) as e_explicit_object_type;
    }
  }
  return parseExplicitObject(base);
}

export function encodeObjectReference(
  ctx: CompileContext,
  expr: MegaloExpr
): c_object_reference {
  const { base, member } = splitMember(expr);
  if (!member) {
    const named = encodeNamedGlobalObjectReference(ctx, base);
    if (named) {
      return named;
    }
  }

  const slot = ctx.variables.findByName(base);
  if (slot?.type === "object" && !member) {
    return encodeObjectVariableReference(slot);
  }

  if (isExplicitPlayerName(base)) {
    const ref = new c_object_reference();
    ref.m_player = new c_explicit_player();
    ref.m_player.m_explicit_player_type = parseExplicitPlayer(base);
    if (member) {
      ref.m_type = e_object_reference_type.player_object;
      ref.m_variable_index =
        resolveScopedObjectMemberIndex(ctx, "player", member) ??
        (Number(member.replace("number_", "")) || 0);
    } else {
      ref.m_type = e_object_reference_type.player_biped;
    }
    return ref;
  }

  if (member) {
    const teamObjectIndex = resolveScopedObjectMemberIndex(ctx, "team", member);
    if (teamObjectIndex !== undefined && isTeamReferenceBase(ctx, base)) {
      const ref = new c_object_reference();
      ref.m_type = e_object_reference_type.team_object;
      ref.m_team = encodeTeamExplicitForBase(ctx, base);
      ref.m_variable_index = teamObjectIndex;
      return ref;
    }

    const objectObjectIndex = resolveScopedObjectMemberIndex(ctx, "object", member);
    if (objectObjectIndex !== undefined && isObjectReferenceBase(ctx, base)) {
      const ref = new c_object_reference();
      ref.m_type = e_object_reference_type.object_object;
      ref.m_object = new c_explicit_object();
      ref.m_object.m_explicit_object_type = explicitObjectTypeForBase(ctx, base);
      ref.m_variable_index = objectObjectIndex;
      return ref;
    }
  }

  const ref = new c_object_reference();
  ref.m_object = new c_explicit_object();
  ref.m_object.m_explicit_object_type = explicitObjectTypeForBase(ctx, base);
  if (member) {
    ref.m_type = e_object_reference_type.object_object;
    ref.m_variable_index = Number(member.replace("number_", "")) || 0;
  } else {
    ref.m_type = e_object_reference_type.global_object;
  }
  return ref;
}

export function encodeTeamReference(
  ctx: CompileContext,
  expr: MegaloExpr
): c_team_reference {
  const { base, member } = splitMember(expr);
  if (member === "team" && isExplicitPlayerName(base)) {
    const ref = new c_team_reference();
    ref.m_type = e_team_reference_type.player_owner_team;
    ref.m_player = new c_explicit_player();
    ref.m_player.m_explicit_player_type = parseExplicitPlayer(base);
    return ref;
  }
  if (member === "team" && isObjectReferenceBase(ctx, base)) {
    const ref = new c_team_reference();
    ref.m_type = e_team_reference_type.object_owner_team;
    ref.m_object = new c_explicit_object();
    ref.m_object.m_explicit_object_type = explicitObjectTypeForBase(ctx, base);
    return ref;
  }

  const name = exprName(expr);
  const slot = ctx.variables.findByName(name);
  if (slot?.type === "team") {
    if (slot.scope === "global") {
      return encodeGlobalTeamReference(slot.index);
    }
    const ref = new c_team_reference();
    ref.m_type = e_team_reference_type.team_team;
    ref.m_team = new c_explicit_team();
    ref.m_team.m_explicit_team_type = e_explicit_team_type.current;
    ref.m_variable_index = slot.index;
    return ref;
  }

  const ref = new c_team_reference();
  ref.m_team = new c_explicit_team();
  ref.m_team.m_explicit_team_type = parseExplicitTeam(exprName(expr));
  ref.m_type = e_team_reference_type.global_team;
  return ref;
}

export function encodeVariantVariable(
  ctx: CompileContext,
  expr: MegaloExpr,
  preferredType?: e_variable_type
): s_variant_variable {
  const variable = new s_variant_variable();
  const name = exprName(expr);

  if (
    preferredType === e_variable_type.custom_timer ||
    name.includes("timer")
  ) {
    variable.m_type = e_variable_type.custom_timer;
    variable.m_custom_timer = encodeTimerReference(ctx, expr);
    return variable;
  }

  if (preferredType === e_variable_type.player) {
    variable.m_type = e_variable_type.player;
    variable.m_player = encodePlayerReference(ctx, expr);
    return variable;
  }

  if (preferredType === e_variable_type.object) {
    variable.m_type = e_variable_type.object;
    variable.m_object = encodeObjectReference(ctx, expr);
    return variable;
  }

  if (preferredType === e_variable_type.team) {
    variable.m_type = e_variable_type.team;
    variable.m_team = encodeTeamReference(ctx, expr);
    return variable;
  }

  const { member } = splitMember(expr);
  const metricMember =
    member === "player_score" ||
    member === "player_money" ||
    member === "player_rating" ||
    member?.startsWith("number_") ||
    member?.startsWith("stat_") ||
    member === "score";

  if (!metricMember) {
    const { base, member } = splitMember(expr);
    if (member === "team" && isExplicitPlayerName(base)) {
      variable.m_type = e_variable_type.team;
      variable.m_team = encodeTeamReference(ctx, expr);
      return variable;
    }
    if (member === "team" && isObjectReferenceBase(ctx, base)) {
      variable.m_type = e_variable_type.team;
      variable.m_team = encodeTeamReference(ctx, expr);
      return variable;
    }

    if (expr.kind === "identifier" && isExplicitPlayerName(name)) {
      variable.m_type = e_variable_type.player;
      variable.m_player = encodePlayerReference(ctx, expr);
      return variable;
    }

    if (expr.kind === "identifier" && isExplicitTeamName(name)) {
      variable.m_type = e_variable_type.team;
      variable.m_team = encodeTeamReference(ctx, expr);
      return variable;
    }

    const slot = ctx.variables.findByName(name);
    if (expr.kind === "identifier" && slot?.type === "object") {
      variable.m_type = e_variable_type.object;
      variable.m_object = encodeObjectReference(ctx, expr);
      return variable;
    }

    if (expr.kind === "identifier" && slot?.type === "player") {
      variable.m_type = e_variable_type.player;
      variable.m_player = encodePlayerReference(ctx, expr);
      return variable;
    }

    if (expr.kind === "identifier" && slot?.type === "team") {
      variable.m_type = e_variable_type.team;
      variable.m_team = encodeTeamReference(ctx, expr);
      return variable;
    }

    if (
      expr.kind === "identifier" &&
      (isExplicitObjectName(name) || isGlobalObjectVariableName(name))
    ) {
      variable.m_type = e_variable_type.object;
      variable.m_object = encodeObjectReference(ctx, expr);
      return variable;
    }
  }

  variable.m_type = e_variable_type.custom_variable;
  variable.m_custom_variable = encodeCustomVariable(ctx, expr);
  return variable;
}

export function encodeStringIndex(
  ctx: CompileContext,
  expr: MegaloExpr
): number {
  const name = exprName(expr);
  return ctx.strings.intern(name);
}
