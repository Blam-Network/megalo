import type { MegaloCondition } from "../ast";
import type { DecompileContext } from "../symbols";
import {
  comparisonToSymbol,
} from "../operators";
import {
  e_condition_type,
  type c_condition,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  decodeObjectReference,
  decodePlayerReference,
  decodeTeamReference,
  decodeTimerReference,
  decodeVariantVariable,
} from "../references/decode";

const KILLER_TYPE_NAMES: Record<number, string> = {
  0: "any",
  1: "none",
  2: "guardian",
  4: "enemy",
  8: "betrayal",
  16: "suicide",
  31: "any",
};

export function decompileCondition(
  ctx: DecompileContext,
  condition: c_condition,
  filterLabel: (index: number) => string
): MegaloCondition | undefined {
  if (condition.m_type === e_condition_type.none) {
    return undefined;
  }

  const base = {
    negated: condition.m_negated,
    unionOr: false,
    unionGroup: condition.m_union_group,
    executeBeforeAction: condition.m_execute_before_action,
    operands: [] as MegaloCondition["operands"],
  };

  switch (condition.m_type) {
    case e_condition_type.if: {
      const params = condition.m_if_parameters!;
      return {
        ...base,
        keyword: "if",
        operands: [
          decodeVariantVariable(ctx, params.m_left),
          {
            kind: "identifier",
            name: comparisonToSymbol(params.m_comparison),
          },
          decodeVariantVariable(ctx, params.m_right),
        ],
      };
    }
    case e_condition_type.object_in_area: {
      const params = condition.m_object_in_area_parameters!;
      return {
        ...base,
        keyword: "object_in_area",
        operands: [
          decodeObjectReference(ctx, params.m_object_reference_1),
          decodeObjectReference(ctx, params.m_object_reference_2),
        ],
      };
    }
    case e_condition_type.player_died: {
      const params = condition.m_player_died_parameters!;
      return {
        ...base,
        keyword: "player_died",
        operands: [
          decodePlayerReference(ctx, params.m_player),
          {
            kind: "identifier",
            name: KILLER_TYPE_NAMES[params.m_killer_type] ?? "any",
          },
        ],
      };
    }
    case e_condition_type.team_disposition: {
      const params = condition.m_team_disposition_parameters!;
      return {
        ...base,
        keyword: "team_disposition",
        operands: [
          decodeTeamReference(ctx, params.m_team_1),
          decodeTeamReference(ctx, params.m_team_2),
          { kind: "number", value: params.m_disposition },
        ],
      };
    }
    case e_condition_type.timer_expired: {
      const params = condition.m_timer_expired_parameters!;
      return {
        ...base,
        keyword: "timer_expired",
        operands: [decodeTimerReference(ctx, params.m_timer)],
      };
    }
    case e_condition_type.object_is_type: {
      const params = condition.m_object_is_type_parameters!;
      return {
        ...base,
        keyword: "object_is_type",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          {
            kind: "number",
            value: params.m_object_type.m_object_type_index,
          },
        ],
      };
    }
    case e_condition_type.team_is_active: {
      const params = condition.m_team_is_active_parameters!;
      return {
        ...base,
        keyword: "team_is_active",
        operands: [decodeTeamReference(ctx, params.m_team)],
      };
    }
    case e_condition_type.object_out_of_bounds: {
      const params = condition.m_object_out_of_bounds_parameters!;
      return {
        ...base,
        keyword: "object_out_of_bounds",
        operands: [decodeObjectReference(ctx, params.m_object)],
      };
    }
    case e_condition_type.player_is_fire_team_leader: {
      const params = condition.m_player_is_fire_team_leader_parameters!;
      return {
        ...base,
        keyword: "player_is_fireteam_leader",
        operands: [decodePlayerReference(ctx, params.m_player)],
      };
    }
    case e_condition_type.player_assisted_with_kill: {
      const params = condition.m_player_assisted_with_kill_parameters!;
      return {
        ...base,
        keyword: "player_assisted_kill_of",
        operands: [
          decodePlayerReference(ctx, params.m_player_1),
          decodePlayerReference(ctx, params.m_player_2),
        ],
      };
    }
    case e_condition_type.object_matches_filter: {
      const params = condition.m_object_matches_filter_parameters!;
      return {
        ...base,
        keyword: "if",
        operands: [
          decodeObjectReference(ctx, params.m_object),
          { kind: "identifier", name: "==" },
          {
            kind: "identifier",
            name: filterLabel(params.m_filter_index),
          },
        ],
      };
    }
    case e_condition_type.player_is_active: {
      const params = condition.m_player_is_active_parameters!;
      return {
        ...base,
        keyword: "player_is_active",
        operands: [decodePlayerReference(ctx, params.m_player)],
      };
    }
    case e_condition_type.equipment_is_active: {
      const params = condition.m_equipment_is_active_parameters!;
      return {
        ...base,
        keyword: "equipment_is_active",
        operands: [decodeObjectReference(ctx, params.m_object)],
      };
    }
    case e_condition_type.player_is_spartan: {
      const params = condition.m_player_is_spartan_parameters!;
      return {
        ...base,
        keyword: "player_is_spartan",
        operands: [decodePlayerReference(ctx, params.m_player)],
      };
    }
    case e_condition_type.player_is_elite: {
      const params = condition.m_player_is_elite_parameters!;
      return {
        ...base,
        keyword: "player_is_elite",
        operands: [decodePlayerReference(ctx, params.m_player)],
      };
    }
    case e_condition_type.player_is_editor: {
      const params = condition.m_player_is_editor_parameters!;
      return {
        ...base,
        keyword: "player_is_monitor",
        operands: [decodePlayerReference(ctx, params.m_player)],
      };
    }
    case e_condition_type.game_is_forge:
      return { ...base, keyword: "game_is_forge", operands: [] };
    default:
      return {
        ...base,
        keyword: `unknown_condition_${condition.m_type}`,
        operands: [],
      };
  }
}
