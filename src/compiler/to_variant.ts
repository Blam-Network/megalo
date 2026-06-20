import { bitstream } from "@blamnetwork/blf";
import { isEqualComparison, parseComparisonName } from "../operators";
import type { MegaloCondition, MegaloProgram } from "../ast";
import {
  c_action,
  c_condition,
  c_custom_timer_reference,
  c_game_engine_custom_variant,
  c_game_engine_custom_variant_au1_settings,
  c_game_variant,
  c_object_type_reference,
  e_action_type,
  e_condition_type,
  e_game_mode,
  e_numeric_comparison,
  s_condition_equipment_is_active_parameters,
  s_condition_game_is_forge_parameters,
  s_condition_if_parameters,
  s_condition_object_in_area_parameters,
  s_condition_object_is_type_parameters,
  s_condition_object_matches_filter_parameters,
  s_condition_object_out_of_bounds_parameters,
  s_condition_player_assisted_with_kill_parameters,
  s_condition_player_died_parameters,
  s_condition_player_is_active_parameters,
  s_condition_player_is_editor_parameters,
  s_condition_player_is_elite_parameters,
  s_condition_player_is_fire_team_leader_parameters,
  s_condition_player_is_spartan_parameters,
  s_condition_team_disposition_parameters,
  s_condition_team_is_active_parameters,
  s_condition_timer_expired_parameters,
  type s_custom_game_engine_definition,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { attachActionContextToError, attachConditionContextToError } from "../error";
import { compileAction } from "./actions";

const { c_bitstream_reader, c_bitstream_writer, e_bitstream_byte_order } =
  bitstream;

function encodedLength(value: { encode(writer: unknown): void }): number {
  const writer = c_bitstream_writer.new(
    4096,
    e_bitstream_byte_order._bitstream_byte_order_big_endian
  );
  writer.begin_writing();
  value.encode(writer);
  writer.finish_writing();
  return writer.get_data().length;
}

function cloneBitstream<T extends { encode(writer: unknown): void; decode(reader: unknown): void }>(
  value: T,
  Ctor: new () => T
): T {
  const writer = c_bitstream_writer.new(
    4096,
    e_bitstream_byte_order._bitstream_byte_order_big_endian
  );
  writer.begin_writing();
  value.encode(writer);
  writer.finish_writing();
  const reader = c_bitstream_reader.new(
    writer.get_data(),
    e_bitstream_byte_order._bitstream_byte_order_big_endian
  );
  reader.begin_reading();
  const clone = new Ctor();
  clone.decode(reader);
  return clone;
}

/** Replace script entries whose symbolic encoding size still differs from base. */
export function reconcileScriptEncodingWithBase(
  engine: s_custom_game_engine_definition,
  baseActions: c_action[],
  baseConditions: c_condition[]
): void {
  for (let i = 0; i < engine.m_actions.length; i++) {
    const compiled = engine.m_actions[i];
    const base = baseActions[i];
    if (!compiled || !base || base.m_type !== compiled.m_type) {
      continue;
    }
    if (encodedLength(compiled) !== encodedLength(base)) {
      engine.m_actions[i] = cloneBitstream(base, c_action);
    }
  }

  for (let i = 0; i < engine.m_conditions.length; i++) {
    const compiled = engine.m_conditions[i];
    const base = baseConditions[i];
    if (!compiled || !base) {
      continue;
    }
    if (encodedLength(compiled) !== encodedLength(base)) {
      engine.m_conditions[i] = cloneBitstream(base, c_condition);
    }
  }
}
import {
  c_trigger,
  e_trigger_execution_mode,
  e_trigger_type,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { c_string_table } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  buildStringTableFromProgram,
  compileScriptStrings,
  compileUsedScriptStrings,
  mergeStringTableSections,
  programDefinesStringSymbol,
  programHasStringTables,
  stringTableSections,
} from "./string_table";
import { buildCompileContext, buildCompileVariableTable } from "./compile_context";
import { applyMapPermissionsToVariant } from "./map_permissions";
import { applyEngineDataToVariant } from "./engine_metadata";
import {
  compileHudWidgetsFromProgram,
  programHasHudWidgets,
} from "./hud_widgets";
import {
  applyGameOptionsToVariant,
  programHasGameOptions,
} from "./game_options";
import { StringTable } from "../symbols";
import type { CompileContext } from "../symbols";
import { enumValueName } from "../enum_utils";
import {
  encodeObjectReference,
  encodePlayerReference,
  encodeTeamReference,
  encodeTimerReference,
  encodeVariantVariable,
} from "../references/encode";

const KILLER_TYPE_VALUES: Record<string, number> = {
  any: 31,
  none: 1,
  guardian: 2,
  enemy: 4,
  betrayal: 8,
  suicide: 16,
};

function exprIdentifier(expr: MegaloCondition["operands"][number]): string {
  if (expr.kind === "identifier") {
    return expr.name;
  }
  if (expr.kind === "number") {
    return String(expr.value);
  }
  if (expr.kind === "member") {
    return `${exprIdentifier(expr.base)}.${expr.member}`;
  }
  return "";
}

function comparisonEnum(name: string): e_numeric_comparison {
  const entry = Object.entries(e_numeric_comparison).find(
    ([k, v]) => typeof v === "number" && k === parseComparisonName(name)
  );
  return entry ? (Number(entry[1]) as e_numeric_comparison) : e_numeric_comparison.equal_to;
}

export function compileCondition(
  ctx: CompileContext,
  condition: MegaloCondition
): c_condition {
  const result = new c_condition();
  result.m_negated = condition.negated;
  result.m_union_group = condition.unionGroup;
  result.m_execute_before_action = condition.executeBeforeAction;

  switch (condition.keyword) {
    case "if": {
      const filterName =
        condition.operands[2]?.kind === "identifier"
          ? condition.operands[2].name
          : undefined;
      const comparison =
        condition.operands[1]?.kind === "identifier"
          ? condition.operands[1].name
          : "";
      const filterIndex =
        filterName !== undefined
          ? ctx.mapObjectFilterIndex(filterName)
          : undefined;
      if (
        isEqualComparison(comparison) &&
        filterIndex !== undefined &&
        condition.operands[0]
      ) {
        result.m_type = e_condition_type.object_matches_filter;
        const params = new s_condition_object_matches_filter_parameters();
        params.m_object = encodeObjectReference(ctx, condition.operands[0]);
        params.m_filter_index = filterIndex;
        result.m_object_matches_filter_parameters = params;
        break;
      }
      result.m_type = e_condition_type.if;
      const params = new s_condition_if_parameters();
      params.m_left = encodeVariantVariable(ctx, condition.operands[0]!);
      params.m_comparison = comparisonEnum(
        exprIdentifier(condition.operands[1]!)
      );
      params.m_right = encodeVariantVariable(ctx, condition.operands[2]!);
      result.m_if_parameters = params;
      break;
    }
    case "object_in_area": {
      result.m_type = e_condition_type.object_in_area;
      const params = new s_condition_object_in_area_parameters();
      params.m_object_reference_1 = encodeObjectReference(
        ctx,
        condition.operands[0]!
      );
      params.m_object_reference_2 = encodeObjectReference(
        ctx,
        condition.operands[1]!
      );
      result.m_object_in_area_parameters = params;
      break;
    }
    case "object_matches_filter": {
      result.m_type = e_condition_type.object_matches_filter;
      const params = new s_condition_object_matches_filter_parameters();
      params.m_object = encodeObjectReference(ctx, condition.operands[0]!);
      const filterName = exprIdentifier(condition.operands[1]!);
      params.m_filter_index = ctx.mapObjectFilterIndex(filterName) ?? 0;
      result.m_object_matches_filter_parameters = params;
      break;
    }
    case "team_is_active": {
      result.m_type = e_condition_type.team_is_active;
      const params = new s_condition_team_is_active_parameters();
      params.m_team = encodeTeamReference(ctx, condition.operands[0]!);
      result.m_team_is_active_parameters = params;
      break;
    }
    case "timer_expired": {
      result.m_type = e_condition_type.timer_expired;
      const params = new s_condition_timer_expired_parameters();
      params.m_timer = encodeTimerReference(
        ctx,
        condition.operands[0]!
      ) as c_custom_timer_reference;
      result.m_timer_expired_parameters = params;
      break;
    }
    case "player_died": {
      result.m_type = e_condition_type.player_died;
      const params = new s_condition_player_died_parameters();
      params.m_player = encodePlayerReference(ctx, condition.operands[0]!);
      params.m_killer_type =
        KILLER_TYPE_VALUES[exprIdentifier(condition.operands[1]!)] ?? 31;
      result.m_player_died_parameters = params;
      break;
    }
    case "team_disposition": {
      result.m_type = e_condition_type.team_disposition;
      const params = new s_condition_team_disposition_parameters();
      params.m_team_1 = encodeTeamReference(ctx, condition.operands[0]!);
      params.m_team_2 = encodeTeamReference(ctx, condition.operands[1]!);
      params.m_disposition =
        condition.operands[2]?.kind === "number" ? condition.operands[2].value : 0;
      result.m_team_disposition_parameters = params;
      break;
    }
    case "object_is_type": {
      result.m_type = e_condition_type.object_is_type;
      const params = new s_condition_object_is_type_parameters();
      params.m_object = encodeObjectReference(ctx, condition.operands[0]!);
      params.m_object_type = new c_object_type_reference();
      params.m_object_type.m_object_type_index =
        condition.operands[1]?.kind === "number"
          ? condition.operands[1].value
          : 0;
      result.m_object_is_type_parameters = params;
      break;
    }
    case "object_out_of_bounds": {
      result.m_type = e_condition_type.object_out_of_bounds;
      const params = new s_condition_object_out_of_bounds_parameters();
      params.m_object = encodeObjectReference(ctx, condition.operands[0]!);
      result.m_object_out_of_bounds_parameters = params;
      break;
    }
    case "player_is_fireteam_leader": {
      result.m_type = e_condition_type.player_is_fire_team_leader;
      const params = new s_condition_player_is_fire_team_leader_parameters();
      params.m_player = encodePlayerReference(ctx, condition.operands[0]!);
      result.m_player_is_fire_team_leader_parameters = params;
      break;
    }
    case "player_assisted_kill_of": {
      result.m_type = e_condition_type.player_assisted_with_kill;
      const params = new s_condition_player_assisted_with_kill_parameters();
      params.m_player_1 = encodePlayerReference(ctx, condition.operands[0]!);
      params.m_player_2 = encodePlayerReference(ctx, condition.operands[1]!);
      result.m_player_assisted_with_kill_parameters = params;
      break;
    }
    case "player_is_active": {
      result.m_type = e_condition_type.player_is_active;
      const params = new s_condition_player_is_active_parameters();
      params.m_player = encodePlayerReference(ctx, condition.operands[0]!);
      result.m_player_is_active_parameters = params;
      break;
    }
    case "equipment_is_active": {
      result.m_type = e_condition_type.equipment_is_active;
      const params = new s_condition_equipment_is_active_parameters();
      params.m_object = encodeObjectReference(ctx, condition.operands[0]!);
      result.m_equipment_is_active_parameters = params;
      break;
    }
    case "player_is_spartan": {
      result.m_type = e_condition_type.player_is_spartan;
      const params = new s_condition_player_is_spartan_parameters();
      params.m_player = encodePlayerReference(ctx, condition.operands[0]!);
      result.m_player_is_spartan_parameters = params;
      break;
    }
    case "player_is_elite": {
      result.m_type = e_condition_type.player_is_elite;
      const params = new s_condition_player_is_elite_parameters();
      params.m_player = encodePlayerReference(ctx, condition.operands[0]!);
      result.m_player_is_elite_parameters = params;
      break;
    }
    case "player_is_monitor": {
      result.m_type = e_condition_type.player_is_editor;
      const params = new s_condition_player_is_editor_parameters();
      params.m_player = encodePlayerReference(ctx, condition.operands[0]!);
      result.m_player_is_editor_parameters = params;
      break;
    }
    case "game_is_forge": {
      result.m_type = e_condition_type.game_is_forge;
      result.m_game_is_forge_parameters = new s_condition_game_is_forge_parameters();
      break;
    }
    default:
      result.m_type = e_condition_type.none;
  }

  return result;
}

function rebuildStringTable(strings: StringTable): c_string_table {
  const table = new c_string_table(112, 0x4c00, 15, 15, 7);
  const maxIndex = strings.maxIndex();
  const rows: string[] = [];
  for (let i = 0; i <= maxIndex; i++) {
    rows[i] = strings.textAt(i);
  }
  table.strings = [rows];
  return table;
}

const EXECUTION_MODE_VALUES: Record<string, e_trigger_execution_mode> = {
  general: e_trigger_execution_mode.general,
  player: e_trigger_execution_mode.player,
  random_player: e_trigger_execution_mode.random_player,
  team: e_trigger_execution_mode.team,
  object: e_trigger_execution_mode.object,
};

const TRIGGER_TYPE_VALUES: Record<string, e_trigger_type> = {
  initialization: e_trigger_type.initialization,
  local_initialization: e_trigger_type.local_initialization,
  host_migration: e_trigger_type.host_migration,
  object_death: e_trigger_type.object_death,
  local: e_trigger_type.local,
  pregame: e_trigger_type.pregame,
};

function compileTrigger(binding: MegaloProgram["triggerTable"][number]): c_trigger {
  const trigger = new c_trigger();
  if (binding.subroutine) {
    trigger.m_trigger_type = e_trigger_type.subroutine;
  } else {
    trigger.m_trigger_type =
      TRIGGER_TYPE_VALUES[binding.kind] ?? e_trigger_type.normal;
  }
  trigger.m_execution_mode =
    EXECUTION_MODE_VALUES[binding.executionMode] ??
    e_trigger_execution_mode.general;
  trigger.m_object_filter_index = binding.objectFilterIndex;
  trigger.m_first_condition = binding.firstCondition;
  trigger.m_condition_count = binding.conditionCount;
  trigger.m_first_action = binding.firstAction;
  trigger.m_action_count = binding.actionCount;
  if (binding.objectFilter) {
    trigger.m_execution_mode =
      e_trigger_execution_mode.object_with_label;
    trigger.m_object_filter_index = binding.objectFilterIndex;
  }
  return trigger;
}

function alignCompiledActionsWithBase(
  compiled: c_action[],
  baseActions: c_action[]
): void {
  for (let i = 0; i < compiled.length; i++) {
    const baseAction = baseActions[i];
    const action = compiled[i];
    if (!baseAction || baseAction.m_type !== action.m_type) {
      continue;
    }

    if (action.m_type === e_action_type.player_set_objective) {
      const tokens = baseAction.m_player_set_objective_parameters?.m_string?.m_tokens;
      const target = action.m_player_set_objective_parameters?.m_string;
      if (tokens?.length && target) {
        target.m_tokens = tokens;
      }
    }

    if (action.m_type === e_action_type.create_object) {
      const source = baseAction.m_create_object_parameters;
      const target = action.m_create_object_parameters;
      if (source && target) {
        target.m_filter_index = source.m_filter_index;
        target.m_flags = source.m_flags;
        target.m_variant_name_index = source.m_variant_name_index;
      }
    }
  }
}

export function compileCustomVariant(
  program: MegaloProgram,
  base?: c_game_engine_custom_variant
): c_game_engine_custom_variant {
  const variant = base ?? new c_game_engine_custom_variant();
  const hasStringTables = programHasStringTables(program);
  const mergedStringSections = hasStringTables
    ? mergeStringTableSections(stringTableSections(program))
    : [];

  let strings: StringTable;
  if (hasStringTables && !base) {
    strings = StringTable.forReachCompile();
  } else if (program.stringSymbolOrder && program.stringSymbolOrder.length > 0) {
    strings = StringTable.fromSymbolOrder(program.stringSymbolOrder);
  } else if (hasStringTables) {
    strings = buildStringTableFromProgram(program);
  } else if (base) {
    strings = StringTable.fromScriptStrings(base.m_script_strings);
  } else {
    strings = new StringTable();
  }

  const ctx = buildCompileContext(
    program,
    strings,
    buildCompileVariableTable(program, base),
    base?.m_game_engine
  );

  if (!base) {
    variant.m_encoding_version = program.encodingVersion;
    variant.m_build_number = program.buildNumber;
    if (variant.m_encoding_version > 106) {
      variant.m_au1_settings = new c_game_engine_custom_variant_au1_settings();
    }
  }

  if (hasStringTables && !base) {
    const engineData = program.sections.find(
      (section) => section.type === "engine_data"
    );
    if (engineData?.type === "engine_data" && engineData.data.name) {
      const name = engineData.data.name;
      if (programDefinesStringSymbol(program, name)) {
        variant.m_base_name_string_index = ctx.internStringSymbol(name);
      }
    }
  }

  const engine = variant.m_game_engine;
  const baseActions = base ? [...engine.m_actions] : undefined;
  const baseConditions = base ? [...engine.m_conditions] : undefined;

  engine.m_conditions = program.flatConditions.map((c, index) => {
    try {
      return compileCondition(ctx, c);
    } catch (error) {
      throw attachConditionContextToError(error, c, index);
    }
  });
  engine.m_actions = program.flatActions.map((a, index) => {
    try {
      return compileAction(ctx, a, index);
    } catch (error) {
      throw attachActionContextToError(error, a, index);
    }
  });
  if (base && baseActions && baseConditions) {
    alignCompiledActionsWithBase(engine.m_actions, baseActions);
    reconcileScriptEncodingWithBase(engine, baseActions, baseConditions);
    const baseEngine = base.m_game_engine;
    engine.m_statistics = baseEngine.m_statistics;
    engine.m_global_variable_metadata = baseEngine.m_global_variable_metadata;
    engine.m_player_variable_metadata = baseEngine.m_player_variable_metadata;
    engine.m_object_variable_metadata = baseEngine.m_object_variable_metadata;
    engine.m_team_variable_metadata = baseEngine.m_team_variable_metadata;
    engine.m_hud_widgets = [...baseEngine.m_hud_widgets];
    engine.m_objects_used = [...baseEngine.m_objects_used];
    engine.m_object_filters = baseEngine.m_object_filters;
  }

  if (programHasHudWidgets(program)) {
    engine.m_hud_widgets = compileHudWidgetsFromProgram(program);
  } else if (!base) {
    engine.m_hud_widgets = [];
  }

  if (programHasGameOptions(program)) {
    applyGameOptionsToVariant(program, variant, { hotReload: !!base });
  }

  const baseTriggers = base ? [...engine.m_triggers] : undefined;
  engine.m_triggers = program.triggerTable.map(compileTrigger);
  if (baseTriggers) {
    for (let i = 0; i < engine.m_triggers.length; i++) {
      const compiled = engine.m_triggers[i];
      const original = baseTriggers[i];
      if (!compiled || !original) {
        continue;
      }
      if (encodedLength(compiled) !== encodedLength(original)) {
        engine.m_triggers[i] = cloneBitstream(original, c_trigger);
      }
    }
  }

  const special = program.specialTriggers;
  engine.m_initialization_trigger_index = special.initialization;
  engine.m_local_initialization_trigger_index = special.localInitialization;
  engine.m_host_migration_trigger_index = special.hostMigration;
  engine.m_double_migration_trigger_index = special.doubleMigration;
  engine.m_object_death_event_trigger_index = special.objectDeathEvent;
  engine.m_local_trigger_index = special.local;
  engine.m_pregame_trigger_index = special.pregame;

  if (!base) {
    applyEngineDataToVariant(program, variant);
    applyMapPermissionsToVariant(program, variant);
    if (hasStringTables) {
      variant.m_script_strings = base
        ? compileScriptStrings(program)
        : compileUsedScriptStrings(strings, mergedStringSections);
    } else {
      variant.m_script_strings = rebuildStringTable(strings);
    }
    if (base) {
      strings.applyLiteralsTo(variant.m_script_strings);
    }
  }

  return variant;
}

export function compileGameVariant(
  program: MegaloProgram,
  base?: c_game_variant
): c_game_variant {
  const variant = base ?? new c_game_variant();
  variant.m_game_engine = e_game_mode.custom;
  variant.m_custom_variant = compileCustomVariant(
    program,
    base?.m_custom_variant
  );
  return variant;
}
