import { e_explicit_object_type } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { e_explicit_player_type } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { e_explicit_team_type } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { DecompileContext } from "../symbols";

const PLAYER_EXPLICIT_NAMES: Record<e_explicit_player_type, string> = {
  [e_explicit_player_type.no_player]: "no_player",
  [e_explicit_player_type.player_0]: "player_0",
  [e_explicit_player_type.player_1]: "player_1",
  [e_explicit_player_type.player_2]: "player_2",
  [e_explicit_player_type.player_3]: "player_3",
  [e_explicit_player_type.player_4]: "player_4",
  [e_explicit_player_type.player_5]: "player_5",
  [e_explicit_player_type.player_6]: "player_6",
  [e_explicit_player_type.player_7]: "player_7",
  [e_explicit_player_type.player_8]: "player_8",
  [e_explicit_player_type.player_9]: "player_9",
  [e_explicit_player_type.player_10]: "player_10",
  [e_explicit_player_type.player_11]: "player_11",
  [e_explicit_player_type.player_12]: "player_12",
  [e_explicit_player_type.player_13]: "player_13",
  [e_explicit_player_type.player_14]: "player_14",
  [e_explicit_player_type.player_15]: "player_15",
  [e_explicit_player_type.global_0]: "global_0",
  [e_explicit_player_type.global_1]: "global_1",
  [e_explicit_player_type.global_2]: "global_2",
  [e_explicit_player_type.global_3]: "global_3",
  [e_explicit_player_type.global_4]: "global_4",
  [e_explicit_player_type.global_5]: "global_5",
  [e_explicit_player_type.global_6]: "global_6",
  [e_explicit_player_type.global_7]: "global_7",
  [e_explicit_player_type.current]: "current_player",
  [e_explicit_player_type.hud]: "hud_player",
  [e_explicit_player_type.hud_target]: "hud_target_player",
  [e_explicit_player_type.killer]: "killer",
  [e_explicit_player_type.temporary_0]: "temporary_0",
  [e_explicit_player_type.temporary_1]: "temporary_1",
  [e_explicit_player_type.temporary_2]: "temporary_2",
};

const OBJECT_EXPLICIT_NAMES: Partial<Record<e_explicit_object_type, string>> = {
  [e_explicit_object_type.no_object]: "none",
  [e_explicit_object_type.global_0]: "global_0",
  [e_explicit_object_type.global_1]: "global_1",
  [e_explicit_object_type.global_2]: "global_2",
  [e_explicit_object_type.global_3]: "global_3",
  [e_explicit_object_type.global_4]: "global_4",
  [e_explicit_object_type.global_5]: "global_5",
  [e_explicit_object_type.global_6]: "global_6",
  [e_explicit_object_type.global_7]: "global_7",
  [e_explicit_object_type.global_8]: "global_8",
  [e_explicit_object_type.global_9]: "global_9",
  [e_explicit_object_type.global_10]: "global_10",
  [e_explicit_object_type.global_11]: "global_11",
  [e_explicit_object_type.global_12]: "global_12",
  [e_explicit_object_type.global_13]: "global_13",
  [e_explicit_object_type.global_14]: "global_14",
  [e_explicit_object_type.global_15]: "global_15",
  [e_explicit_object_type.current]: "current_object",
  [e_explicit_object_type.hud_target]: "hud_target_object",
  [e_explicit_object_type.killed]: "killed_object",
  [e_explicit_object_type.killer]: "killer_object",
  [e_explicit_object_type.temporary_0]: "temporary_0",
  [e_explicit_object_type.temporary_1]: "temporary_1",
  [e_explicit_object_type.temporary_2]: "temporary_2",
  [e_explicit_object_type.temporary_3]: "temporary_3",
  [e_explicit_object_type.temporary_4]: "temporary_4",
  [e_explicit_object_type.temporary_5]: "temporary_5",
  [e_explicit_object_type.temporary_6]: "temporary_6",
  [e_explicit_object_type.temporary_7]: "temporary_7",
};

const TEAM_EXPLICIT_NAMES: Record<e_explicit_team_type, string> = {
  [e_explicit_team_type.no_team]: "none",
  [e_explicit_team_type.team_0]: "team_0",
  [e_explicit_team_type.team_1]: "team_1",
  [e_explicit_team_type.team_2]: "team_2",
  [e_explicit_team_type.team_3]: "team_3",
  [e_explicit_team_type.team_4]: "team_4",
  [e_explicit_team_type.team_5]: "team_5",
  [e_explicit_team_type.team_6]: "team_6",
  [e_explicit_team_type.team_7]: "team_7",
  [e_explicit_team_type.neutral_team]: "neutral",
  [e_explicit_team_type.global_0]: "global_0",
  [e_explicit_team_type.global_1]: "global_1",
  [e_explicit_team_type.global_2]: "global_2",
  [e_explicit_team_type.global_3]: "global_3",
  [e_explicit_team_type.global_4]: "global_4",
  [e_explicit_team_type.global_5]: "global_5",
  [e_explicit_team_type.global_6]: "global_6",
  [e_explicit_team_type.global_7]: "global_7",
  [e_explicit_team_type.current]: "current_team",
  [e_explicit_team_type.hud_player_owner_team]: "hud_player_owner_team",
  [e_explicit_team_type.hud_target_player_owner_team]:
    "hud_target_player_owner_team",
  [e_explicit_team_type.temporary_0]: "temporary_0",
  [e_explicit_team_type.temporary_1]: "temporary_1",
  [e_explicit_team_type.temporary_2]: "temporary_2",
  [e_explicit_team_type.temporary_3]: "temporary_3",
  [e_explicit_team_type.temporary_4]: "temporary_4",
  [e_explicit_team_type.temporary_5]: "temporary_5",
};

export function formatExplicitPlayer(type: e_explicit_player_type): string {
  return PLAYER_EXPLICIT_NAMES[type] ?? `player_${type}`;
}

export function formatExplicitObject(type: e_explicit_object_type): string {
  return OBJECT_EXPLICIT_NAMES[type] ?? `object_${type}`;
}

export function formatExplicitTeam(type: e_explicit_team_type): string {
  return TEAM_EXPLICIT_NAMES[type] ?? `team_${type}`;
}

export function parseExplicitPlayer(name: string): e_explicit_player_type {
  const entry = Object.entries(PLAYER_EXPLICIT_NAMES).find(([, v]) => v === name);
  if (entry) {
    return Number(entry[0]) as e_explicit_player_type;
  }
  throw new Error(`Unknown explicit player '${name}'`);
}

export function parseExplicitObject(name: string): e_explicit_object_type {
  const entry = Object.entries(OBJECT_EXPLICIT_NAMES).find(([, v]) => v === name);
  if (entry) {
    return Number(entry[0]) as e_explicit_object_type;
  }
  if (name === "none") {
    return e_explicit_object_type.no_object;
  }
  throw new Error(`Unknown explicit object '${name}'`);
}

export function parseExplicitTeam(name: string): e_explicit_team_type {
  const entry = Object.entries(TEAM_EXPLICIT_NAMES).find(([, v]) => v === name);
  if (entry) {
    return Number(entry[0]) as e_explicit_team_type;
  }
  if (name === "none") {
    return e_explicit_team_type.no_team;
  }
  throw new Error(`Unknown explicit team '${name}'`);
}

export function formatStringIndex(
  ctx: DecompileContext,
  index: number
): string {
  return ctx.strings.lookup(index);
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function formatBool(value: boolean): string {
  return value ? "true" : "false";
}
