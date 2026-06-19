import type { MegaloExpr } from "../ast";
import { MegaloError } from "../error";
import { enumValueName } from "../enum_utils";
import type { CompileContext } from "../symbols";
import {
  c_dynamic_string,
  c_player_filter_modifier,
  e_action_team_or_player_target,
  e_player_filter_type,
  s_team_or_player_target,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  encodeCustomVariable,
  encodePlayerReference,
  encodeTeamReference,
} from "./encode";

function exprIdentifier(expr: MegaloExpr | undefined): string {
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

export function encodePlayerFilterModifier(
  expr: MegaloExpr
): c_player_filter_modifier {
  const modifier = new c_player_filter_modifier();
  const name = exprIdentifier(expr);
  const entry = Object.entries(e_player_filter_type).find(
    ([key, value]) => typeof value === "number" && key === name
  );
  modifier.m_type = entry
    ? (Number(entry[1]) as e_player_filter_type)
    : e_player_filter_type.everyone;
  return modifier;
}

export function encodePlayerFilterFromOperands(
  ctx: CompileContext,
  operands: MegaloExpr[],
  startIndex: number
): { modifier: c_player_filter_modifier; nextIndex: number } {
  const expr = operands[startIndex];
  if (!expr) {
    return {
      modifier: encodePlayerFilterModifier({
        kind: "identifier",
        name: "everyone",
      }),
      nextIndex: startIndex + 1,
    };
  }
  const name = exprIdentifier(expr);
  if (name === "player") {
    const modifier = new c_player_filter_modifier();
    modifier.m_type = e_player_filter_type.specific_player;
    modifier.m_player = encodePlayerReference(ctx, operands[startIndex + 1]!);
    modifier.m_variable = encodeCustomVariable(ctx, operands[startIndex + 2]!);
    return { modifier, nextIndex: startIndex + 3 };
  }
  return {
    modifier: encodePlayerFilterModifier(expr),
    nextIndex: startIndex + 1,
  };
}

export function encodeTeamOrPlayerTarget(
  ctx: CompileContext,
  expr: MegaloExpr
): s_team_or_player_target {
  const target = new s_team_or_player_target();
  if (expr.kind === "identifier") {
    const name = expr.name;
    if (name === "all_players") {
      target.m_target = e_action_team_or_player_target.all_players;
      return target;
    }
    const kindEntry = Object.entries(e_action_team_or_player_target).find(
      ([key, value]) => typeof value === "number" && key === name
    );
    if (kindEntry) {
      target.m_target = Number(
        kindEntry[1]
      ) as e_action_team_or_player_target;
      return target;
    }
  }
  try {
    target.m_target = e_action_team_or_player_target.player;
    target.m_player = encodePlayerReference(ctx, expr);
    return target;
  } catch {
    target.m_target = e_action_team_or_player_target.team;
    target.m_team = encodeTeamReference(ctx, expr);
    return target;
  }
}

export function encodeIncidentTargetFromOperands(
  ctx: CompileContext,
  operands: MegaloExpr[],
  startIndex: number
): { target: s_team_or_player_target; nextIndex: number } {
  const kindExpr = operands[startIndex];
  if (!kindExpr || kindExpr.kind !== "identifier") {
    throw new MegaloError("Expected incident target kind");
  }
  const kind = kindExpr.name;
  if (kind === "player") {
    const playerExpr = operands[startIndex + 1];
    if (!playerExpr) {
      throw new MegaloError("Expected player reference for incident target");
    }
    const target = new s_team_or_player_target();
    target.m_target = e_action_team_or_player_target.player;
    target.m_player = encodePlayerReference(ctx, playerExpr);
    return { target, nextIndex: startIndex + 2 };
  }
  if (kind === "team") {
    const teamExpr = operands[startIndex + 1];
    if (!teamExpr) {
      throw new MegaloError("Expected team reference for incident target");
    }
    const target = new s_team_or_player_target();
    target.m_target = e_action_team_or_player_target.team;
    target.m_team = encodeTeamReference(ctx, teamExpr);
    return { target, nextIndex: startIndex + 2 };
  }
  return {
    target: encodeTeamOrPlayerTarget(ctx, kindExpr),
    nextIndex: startIndex + 1,
  };
}

export function encodeDynamicStringIndex(
  ctx: CompileContext,
  expr: MegaloExpr | undefined
): c_dynamic_string {
  const dynamic = new c_dynamic_string();
  if (!expr) {
    throw new MegaloError("Expected string operand");
  }
  if (expr.kind === "string") {
    dynamic.m_string_index = ctx.strings.internLiteral(expr.value);
    return dynamic;
  }
  const name = exprIdentifier(expr);
  let index = ctx.strings.lookupName(name);
  if (index === undefined) {
    const fallback = /^string_(\d+)$/.exec(name);
    if (fallback) {
      index = Number(fallback[1]);
    } else if (ctx.stringSections.length > 0) {
      index = ctx.internStringSymbol(name);
    } else {
      throw new MegaloError(`Unknown string symbol '${name}'`);
    }
  }
  dynamic.m_string_index = index;
  return dynamic;
}

export function parseBoolOperand(expr: MegaloExpr | undefined): boolean {
  if (!expr) {
    return false;
  }
  if (expr.kind === "identifier") {
    return expr.name === "true";
  }
  if (expr.kind === "number") {
    return expr.value !== 0;
  }
  return false;
}

export function playerFilterEnumName(value: number): string {
  return enumValueName(e_player_filter_type, value) ?? "everyone";
}
