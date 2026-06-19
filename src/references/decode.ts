import type { MegaloExpr } from "../ast";
import type { DecompileContext, VariableSlot } from "../symbols";
import { enumValueName } from "../enum_utils";
import {
  e_custom_timer_type,
  e_custom_variable_type,
  e_object_reference_type,
  e_player_reference_type,
  e_team_reference_type,
  type c_custom_timer_reference,
  type c_custom_variable_reference,
  type c_object_reference,
  type c_player_reference,
  type c_team_reference,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  e_variable_type,
  type s_variant_variable,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  e_explicit_object_type,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  e_explicit_player_type,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  e_explicit_team_type,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  formatExplicitObject,
  formatExplicitPlayer,
  formatExplicitTeam,
} from "./format";

function builtinGlobalName(type: e_custom_variable_type): string | undefined {
  if (
    type < e_custom_variable_type.round ||
    type > e_custom_variable_type.object_death_damage_type ||
    type === e_custom_variable_type.symmetry_unused
  ) {
    return undefined;
  }
  return enumValueName(e_custom_variable_type, type);
}

function id(name: string): MegaloExpr {
  return { kind: "identifier", name };
}

function member(base: MegaloExpr, name: string): MegaloExpr {
  return { kind: "member", base, member: name };
}

function scopedMember(baseName: string, memberName: string): MegaloExpr {
  return member(id(baseName), memberName);
}

function scopedName(
  ctx: DecompileContext,
  scope: VariableSlot["scope"],
  type: VariableSlot["type"],
  index: number,
  fallback: string
): string {
  return ctx.variables.findByIndex(scope, type, index)?.name ?? fallback;
}

function globalNumberName(_ctx: DecompileContext, index: number): string {
  return `global_number_${index}`;
}

function playerNumberName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "player", "number", index, `number_${index}`);
}

function teamObjectName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "team", "object", index, `number_${index}`);
}

function objectNumberName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "object", "number", index, `number_${index}`);
}

function teamNumberName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "team", "number", index, `number_${index}`);
}

function playerTimerName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "player", "timer", index, `timer_${index}`);
}

function objectTimerName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "object", "timer", index, `timer_${index}`);
}

function globalTimerName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "global", "timer", index, `global_timer_${index}`);
}

function globalObjectName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "global", "object", index, `global_object_${index}`);
}

function globalTeamName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "global", "team", index, `global_team_${index}`);
}

function globalPlayerName(ctx: DecompileContext, index: number): string {
  return scopedName(ctx, "global", "player", index, `global_player_${index}`);
}

function globalObjectIndex(type: e_explicit_object_type): number | undefined {
  const match = /^global_(\d+)$/.exec(formatExplicitObject(type));
  return match ? Number(match[1]) : undefined;
}

function globalTeamIndex(type: e_explicit_team_type): number | undefined {
  const match = /^global_(\d+)$/.exec(formatExplicitTeam(type));
  return match ? Number(match[1]) : undefined;
}

function globalPlayerIndex(type: e_explicit_player_type): number | undefined {
  const match = /^global_(\d+)$/.exec(formatExplicitPlayer(type));
  return match ? Number(match[1]) : undefined;
}

function resolveGlobalObject(ctx: DecompileContext, type: e_explicit_object_type): string {
  const index = globalObjectIndex(type);
  if (index !== undefined) {
    return globalObjectName(ctx, index);
  }
  return formatExplicitObject(type);
}

function resolveGlobalTeam(ctx: DecompileContext, type: e_explicit_team_type): string {
  const index = globalTeamIndex(type);
  if (index !== undefined) {
    return globalTeamName(ctx, index);
  }
  return formatExplicitTeam(type);
}

function resolveGlobalPlayer(ctx: DecompileContext, type: e_explicit_player_type): string {
  const index = globalPlayerIndex(type);
  if (index !== undefined) {
    return globalPlayerName(ctx, index);
  }
  return formatExplicitPlayer(type);
}

export function decodeCustomVariable(
  ctx: DecompileContext,
  ref: c_custom_variable_reference | undefined
): MegaloExpr {
  if (!ref) {
    return id("none");
  }
  const builtin = builtinGlobalName(ref.m_type);
  if (builtin) {
    return id(builtin);
  }

  switch (ref.m_type) {
    case e_custom_variable_type.constant:
      return { kind: "number", value: ref.m_immediate_value ?? 0 };
    case e_custom_variable_type.player_number: {
      const player = formatExplicitPlayer(
        ref.m_player!.m_explicit_player_type
      );
      return scopedMember(
        player,
        playerNumberName(ctx, ref.m_variable_index ?? 0)
      );
    }
    case e_custom_variable_type.object_number: {
      const object = formatExplicitObject(
        ref.m_object!.m_explicit_object_type
      );
      return scopedMember(
        object,
        objectNumberName(ctx, ref.m_variable_index ?? 0)
      );
    }
    case e_custom_variable_type.team_number: {
      const team = formatExplicitTeam(ref.m_team!.m_explicit_team_type);
      return scopedMember(team, teamNumberName(ctx, ref.m_variable_index ?? 0));
    }
    case e_custom_variable_type.global_number:
      return id(globalNumberName(ctx, ref.m_variable_index ?? 0));
    case e_custom_variable_type.temporary_number:
      return id(`temporary_number_${ref.m_variable_index ?? 0}`);
    case e_custom_variable_type.option:
      return id(ctx.optionName(ref.m_option_index));
    case e_custom_variable_type.spawn_object:
      return id(
        resolveGlobalObject(ctx, ref.m_object!.m_explicit_object_type)
      );
    case e_custom_variable_type.team_score:
      return member(
        id(formatExplicitTeam(ref.m_team!.m_explicit_team_type)),
        "score"
      );
    case e_custom_variable_type.player_score:
    case e_custom_variable_type.player_money:
    case e_custom_variable_type.player_rating: {
      const player = formatExplicitPlayer(ref.m_player!.m_explicit_player_type);
      const metric = enumValueName(e_custom_variable_type, ref.m_type);
      return member(id(player), metric ?? "player_rating");
    }
    case e_custom_variable_type.player_stat: {
      const player = formatExplicitPlayer(ref.m_player!.m_explicit_player_type);
      const stat = ref.m_statistic_index ?? 0;
      return scopedMember(player, `stat_${stat}`);
    }
    case e_custom_variable_type.team_stat: {
      const team = formatExplicitTeam(ref.m_team!.m_explicit_team_type);
      const stat = ref.m_statistic_index ?? 0;
      return scopedMember(team, `stat_${stat}`);
    }
    default:
      return id(`builtin_${ref.m_type}`);
  }
}

export function decodeTimerReference(
  ctx: DecompileContext,
  ref: c_custom_timer_reference | undefined
): MegaloExpr {
  if (!ref) {
    return id("none");
  }
  const type = enumValueName(e_custom_timer_type, ref.m_type);
  if (!type) {
    return id("none");
  }
  if (
    type === "round" ||
    type === "sudden_death" ||
    type === "grace_period"
  ) {
    return id(`${type}_timer`);
  }
  if (type === "global") {
    return id(globalTimerName(ctx, ref.m_variable_index ?? 0));
  }
  if (type === "player") {
    const player = formatExplicitPlayer(ref.m_player!.m_explicit_player_type);
    return scopedMember(
      player,
      playerTimerName(ctx, ref.m_variable_index ?? 0)
    );
  }
  if (type === "team") {
    const team = formatExplicitTeam(ref.m_team!.m_explicit_team_type);
    return scopedMember(
      team,
      scopedName(ctx, "team", "timer", ref.m_variable_index ?? 0, `timer_${ref.m_variable_index ?? 0}`)
    );
  }
  if (type === "object") {
    const object = formatExplicitObject(ref.m_object!.m_explicit_object_type);
    return scopedMember(
      object,
      objectTimerName(ctx, ref.m_variable_index ?? 0)
    );
  }
  return id(type);
}

export function decodePlayerReference(
  ctx: DecompileContext,
  ref: c_player_reference | undefined
): MegaloExpr {
  if (!ref) {
    return id("none");
  }
  const explicit = ref.m_player?.m_explicit_player_type ?? (0 as never);
  const player = resolveGlobalPlayer(ctx, explicit);
  if (ref.m_type === e_player_reference_type.global_player) {
    return id(player);
  }
  if (ref.m_variable_index !== undefined) {
    return scopedMember(player, playerNumberName(ctx, ref.m_variable_index));
  }
  return id(player);
}

export function decodeObjectReference(
  ctx: DecompileContext,
  ref: c_object_reference | undefined
): MegaloExpr {
  if (!ref) {
    return id("none");
  }
  switch (ref.m_type) {
    case e_object_reference_type.global_object: {
      const explicit = ref.m_object?.m_explicit_object_type ?? (0 as never);
      return id(resolveGlobalObject(ctx, explicit));
    }
    case e_object_reference_type.player_object: {
      const player = formatExplicitPlayer(ref.m_player!.m_explicit_player_type);
      return scopedMember(player, objectNumberName(ctx, ref.m_variable_index ?? 0));
    }
    case e_object_reference_type.object_object: {
      const explicit = ref.m_object?.m_explicit_object_type ?? (0 as never);
      const object = resolveGlobalObject(ctx, explicit);
      return scopedMember(object, objectNumberName(ctx, ref.m_variable_index ?? 0));
    }
    case e_object_reference_type.team_object: {
      const team = formatExplicitTeam(ref.m_team!.m_explicit_team_type);
      return scopedMember(team, teamObjectName(ctx, ref.m_variable_index ?? 0));
    }
    case e_object_reference_type.player_biped:
    case e_object_reference_type.player_player_biped: {
      const player = formatExplicitPlayer(ref.m_player!.m_explicit_player_type);
      if (ref.m_variable_index !== undefined) {
        return scopedMember(player, objectNumberName(ctx, ref.m_variable_index));
      }
      return id(resolveGlobalPlayer(ctx, ref.m_player!.m_explicit_player_type));
    }
    case e_object_reference_type.object_player_biped: {
      const object = resolveGlobalObject(
        ctx,
        ref.m_object!.m_explicit_object_type
      );
      return scopedMember(object, objectNumberName(ctx, ref.m_variable_index ?? 0));
    }
    case e_object_reference_type.team_player_biped: {
      const team = formatExplicitTeam(ref.m_team!.m_explicit_team_type);
      return scopedMember(team, teamObjectName(ctx, ref.m_variable_index ?? 0));
    }
    default:
      return id("none");
  }
}

export function decodeTeamReference(
  ctx: DecompileContext,
  ref: c_team_reference | undefined
): MegaloExpr {
  if (!ref) {
    return id("none");
  }
  switch (ref.m_type) {
    case e_team_reference_type.global_team: {
      const explicit = ref.m_team?.m_explicit_team_type ?? (0 as never);
      return id(resolveGlobalTeam(ctx, explicit));
    }
    case e_team_reference_type.player_team: {
      const player = formatExplicitPlayer(ref.m_player!.m_explicit_player_type);
      return scopedMember(player, teamNumberName(ctx, ref.m_variable_index ?? 0));
    }
    case e_team_reference_type.object_team: {
      const object = resolveGlobalObject(
        ctx,
        ref.m_object!.m_explicit_object_type
      );
      return scopedMember(object, teamNumberName(ctx, ref.m_variable_index ?? 0));
    }
    case e_team_reference_type.team_team: {
      const team = formatExplicitTeam(ref.m_team!.m_explicit_team_type);
      return scopedMember(team, teamNumberName(ctx, ref.m_variable_index ?? 0));
    }
    case e_team_reference_type.player_owner_team: {
      const player = resolveGlobalPlayer(ctx, ref.m_player!.m_explicit_player_type);
      return member(id(player), "team");
    }
    case e_team_reference_type.object_owner_team: {
      const object = resolveGlobalObject(
        ctx,
        ref.m_object!.m_explicit_object_type
      );
      return member(id(object), "team");
    }
    default:
      return id("none");
  }
}

export function decodeVariantVariable(
  ctx: DecompileContext,
  variable: s_variant_variable
): MegaloExpr {
  switch (variable.m_type) {
    case e_variable_type.custom_variable:
      return decodeCustomVariable(ctx, variable.m_custom_variable!);
    case e_variable_type.player:
      return decodePlayerReference(ctx, variable.m_player!);
    case e_variable_type.object:
      return decodeObjectReference(ctx, variable.m_object!);
    case e_variable_type.team:
      return decodeTeamReference(ctx, variable.m_team!);
    case e_variable_type.custom_timer:
      return decodeTimerReference(ctx, variable.m_custom_timer!);
    default:
      return id("none");
  }
}

export function decodeStringIndex(
  ctx: DecompileContext,
  index: number
): MegaloExpr {
  return id(ctx.strings.lookup(index));
}
