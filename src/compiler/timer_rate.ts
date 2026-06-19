import type { MegaloExpr } from "../ast";
import { e_game_engine_timer_rate } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { enumValueName } from "../enum_utils";
import { MegaloError } from "../error";
import { exprIdentifier } from "./action_helpers";

/** Megalo numeric literals for `timer_set_rate` (not raw enum member values). */
const MEGALO_TIMER_RATE_LITERAL: Record<number, e_game_engine_timer_rate> = {
  [-1]: e_game_engine_timer_rate.minus_10x,
  0: e_game_engine_timer_rate.zero,
  1: e_game_engine_timer_rate.minus_100x,
  10: e_game_engine_timer_rate.minus_1000x,
  100: e_game_engine_timer_rate._100x,
};

export function parseTimerRate(
  expr: MegaloExpr | undefined
): e_game_engine_timer_rate {
  if (!expr) {
    return e_game_engine_timer_rate.zero;
  }

  if (expr.kind === "number") {
    const mapped = MEGALO_TIMER_RATE_LITERAL[expr.value];
    if (mapped !== undefined) {
      return mapped;
    }
    if (enumValueName(e_game_engine_timer_rate, expr.value)) {
      return expr.value as e_game_engine_timer_rate;
    }
    throw new MegaloError(
      `Unknown timer_set_rate value '${expr.value}'`
    );
  }

  const name = exprIdentifier(expr);
  const numeric = Number(name);
  if (!Number.isNaN(numeric) && name !== "") {
    return parseTimerRate({ kind: "number", value: numeric });
  }

  const entry = Object.entries(e_game_engine_timer_rate).find(
    ([key, value]) => typeof value === "number" && key === name
  );
  if (entry) {
    return Number(entry[1]) as e_game_engine_timer_rate;
  }

  throw new MegaloError(`Unknown timer_set_rate value '${name}'`);
}
