import type {
  MegaloProgram,
  MegaloSection,
  MegaloStatement,
  MegaloTrigger,
  MegaloTriggerBinding,
} from "../ast";
import type {
  c_game_engine_custom_variant,
  c_game_variant,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import {
  e_trigger_execution_mode,
  e_trigger_type,
  type c_trigger,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { e_action_type } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { sanitizeIdentifier } from "../identifiers";
import {
  DecompileContext,
  StringTable,
} from "../symbols";
import { decompileAction } from "./actions";
import { decompileCondition } from "./conditions";
import {
  buildScriptStringSymbols,
  decompileStringTableSections,
  scriptStringRows,
  VARIANT_DESCRIPTION_SYMBOL,
  VARIANT_NAME_SYMBOL,
} from "./string_table";
import { decompileConstantsPlaceholderSections } from "./constants";
import { decompileGameOptionsSection } from "./game_options";
import {
  buildVariableTable,
  decompileVariableSections,
  optionIdentifier,
} from "./variables";
import {
  buildMapObjectSymbols,
  mapObjectSymbolName,
  mapObjectSymbolsToSections,
} from "./map_objects";
import { megaloHudWidgetPositionName } from "../lookups";

const EXECUTION_MODE_NAMES: Partial<Record<e_trigger_execution_mode, string>> = {
  [e_trigger_execution_mode.normal]: "general",
  [e_trigger_execution_mode.for_each_player]: "player",
  [e_trigger_execution_mode.for_each_player_randomly]: "player",
  [e_trigger_execution_mode.for_each_team]: "team",
  [e_trigger_execution_mode.for_each_object]: "object",
  [e_trigger_execution_mode.for_each_object_with_label]: "object",
};

function sanitizeToken(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function nestedForEachTarget(
  ctx: DecompileContext,
  trigger: c_trigger
): string {
  if (
    trigger.m_execution_mode ===
    e_trigger_execution_mode.for_each_object_with_label
  ) {
    return ctx.mapObjectName(trigger.m_object_filter_index);
  }
  return EXECUTION_MODE_NAMES[trigger.m_execution_mode] ?? "general";
}

function triggerKind(trigger: c_trigger): string {
  switch (trigger.m_trigger_type) {
    case e_trigger_type.on_init:
      return "initialization";
    case e_trigger_type.on_local_init:
      return "local_initialization";
    case e_trigger_type.on_host_migration:
      return "host_migration";
    case e_trigger_type.on_object_death:
      return "object_death";
    case e_trigger_type.local:
      return "local";
    case e_trigger_type.pregame:
      return "pregame";
    default:
      return EXECUTION_MODE_NAMES[trigger.m_execution_mode] ?? "general";
  }
}

function buildTriggerStatements(
  ctx: DecompileContext,
  trigger: c_trigger,
  filterLabel: (index: number) => string
): MegaloStatement[] {
  const statements: MegaloStatement[] = [];
  const startCond = trigger.m_first_condition;
  const condCount = trigger.m_condition_count;
  const startAct = trigger.m_first_action;
  const actCount = trigger.m_action_count;
  const engine = (ctx as DecompileContext & { engine?: unknown }).engine as
    | c_game_engine_custom_variant["m_game_engine"]
    | undefined;

  if (!engine) {
    return statements;
  }

  for (let i = 0; i < condCount; i++) {
    const condition = engine.m_conditions[startCond + i];
    if (!condition) {
      continue;
    }
    const decompiled = decompileCondition(ctx, condition, filterLabel);
    if (decompiled) {
      statements.push({ type: "condition", condition: decompiled });
    }
  }

  for (let i = 0; i < actCount; i++) {
    const action = engine.m_actions[startAct + i];
    if (!action) {
      continue;
    }
    const decompiled = decompileAction(ctx, action);
    if (!decompiled) {
      continue;
    }
    if (
      decompiled.opcode === "for_each" &&
      decompiled.operands[0]?.kind === "number"
    ) {
      const nestedIndex = decompiled.operands[0].value;
      const nested = engine.m_triggers[nestedIndex];
      if (nested) {
        const nestedTrigger: MegaloTrigger = {
          name: nestedForEachTarget(ctx, nested),
          kind: nestedForEachTarget(ctx, nested),
          conditions: [],
          actions: [],
        };
        for (const stmt of buildTriggerStatements(ctx, nested, filterLabel)) {
          if (stmt.type === "condition") {
            nestedTrigger.conditions.push(stmt);
          } else if (stmt.type === "action") {
            nestedTrigger.actions.push(stmt);
          }
        }
        statements.push({ type: "trigger", trigger: nestedTrigger });
        continue;
      }
    }
    statements.push({ type: "action", action: decompiled });
  }

  return statements;
}

function isEntryTrigger(
  trigger: c_trigger,
  index: number,
  referenced: Set<number>
): boolean {
  if (
    trigger.m_trigger_type === e_trigger_type.pregame ||
    trigger.m_trigger_type === e_trigger_type.on_init
  ) {
    return true;
  }
  if (trigger.m_trigger_type === e_trigger_type.subroutine) {
    return false;
  }
  return !referenced.has(index);
}

export function decompileCustomVariant(
  variant: c_game_engine_custom_variant
): MegaloProgram {
  const stringSymbolOrder = buildScriptStringSymbols(variant);
  const strings = StringTable.fromSymbolOrder(stringSymbolOrder);
  const englishRow = scriptStringRows(variant)[0] ?? [];
  const optionNames = variant.m_user_defined_options.map((option, index) =>
    optionIdentifier(englishRow, index, option.m_name_string_index)
  );
  const mapObjectSymbols = buildMapObjectSymbols(variant, englishRow);
  const variables = buildVariableTable(variant);
  const ctx = new DecompileContext(
    strings,
    variables,
    optionNames,
    mapObjectSymbols
  );
  const engine = variant.m_game_engine;
  (ctx as DecompileContext & { engine: typeof engine }).engine = engine;

  const filterLabel = (index: number) => ctx.mapObjectName(index);

  const referencedTriggers = new Set<number>();
  for (const action of engine.m_actions) {
    if (action.m_type === e_action_type.for_each && action.m_for_each_parameters) {
      referencedTriggers.add(action.m_for_each_parameters.m_trigger_index);
    }
  }

  const flatConditions = engine.m_conditions
    .map((c) => decompileCondition(ctx, c, filterLabel))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const flatActions = engine.m_actions
    .map((a) => decompileAction(ctx, a))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  const triggerTable: MegaloTriggerBinding[] = engine.m_triggers.map(
    (trigger, index) => {
      let objectFilter: string | undefined;
      if (
        trigger.m_execution_mode ===
          e_trigger_execution_mode.for_each_object_with_label &&
        trigger.m_object_filter_index >= 0
      ) {
        objectFilter = mapObjectSymbolName(
          mapObjectSymbols,
          trigger.m_object_filter_index
        );
      }
      return {
        name: `trigger_${index}`,
        kind: triggerKind(trigger),
        executionMode: EXECUTION_MODE_NAMES[trigger.m_execution_mode] ?? "general",
        objectFilterIndex: trigger.m_object_filter_index,
        objectFilter,
        firstCondition: trigger.m_first_condition,
        conditionCount: trigger.m_condition_count,
        firstAction: trigger.m_first_action,
        actionCount: trigger.m_action_count,
        subroutine: trigger.m_trigger_type === e_trigger_type.subroutine,
      };
    }
  );

  const sections: MegaloSection[] = [];

  const stringTables = decompileStringTableSections(variant);
  if (stringTables.length > 0) {
    sections.push(...stringTables);
  }

  sections.push({
    type: "engine_data",
    data: {
      name: VARIANT_NAME_SYMBOL,
      description: VARIANT_DESCRIPTION_SYMBOL,
      icon: String(variant.m_engine_icon),
      category: String(variant.m_engine_category),
    },
  });

  const permissions = variant.m_map_permissions;
  sections.push({
    type: "map_permissions",
    defaultValue: permissions.m_allow_by_default,
    exceptions: permissions.m_except_map_ids.map((id) => String(id)),
  });

  const teamOptions = variant.m_base_variant.m_team_options;
  const modelOverride = teamOptions.m_model_override;
  const teams = teamOptions.m_teams
    .filter((t) => t.m_team_enabled)
    .map((t) => ({
      name: "",
      model:
        modelOverride === 4
          ? "by_designator"
          : t.m_model_override === 0
            ? "spartan"
            : "elite",
      designator: undefined,
      color: undefined,
      fireteamCount: t.m_fireteam_count > 1 ? t.m_fireteam_count : undefined,
    }));
  if (teams.length > 0) {
    sections.push({ type: "comment", text: "*********" });
    sections.push({ type: "comment", text: "* TEAMS *" });
    sections.push({ type: "comment", text: "*********" });
    sections.push({ type: "teams", teams });
  }

  const mapObjects = mapObjectSymbolsToSections(mapObjectSymbols);
  if (mapObjects.length > 0) {
    sections.push({ type: "comment", text: "***********" });
    sections.push({ type: "comment", text: "* LABELS  *" });
    sections.push({ type: "comment", text: "***********" });
    sections.push({ type: "map_object", objects: mapObjects });
  }

  sections.push(...decompileConstantsPlaceholderSections());

  const gameOptions = decompileGameOptionsSection(variant, englishRow);
  if (gameOptions) {
    sections.push({ type: "comment", text: "****************" });
    sections.push({ type: "comment", text: "* GAME OPTIONS *" });
    sections.push({ type: "comment", text: "****************" });
    sections.push(gameOptions);
  }

  sections.push(...decompileVariableSections(variant));

  if (engine.m_hud_widgets.length > 0) {
    const widgetNames = ["proximity_warning", "arming_warning"];
    sections.push({ type: "comment", text: "************" });
    sections.push({ type: "comment", text: "* WIDGETS  *" });
    sections.push({ type: "comment", text: "************" });
    sections.push({
      type: "hud_widgets",
      widgets: engine.m_hud_widgets.map((position, i) => ({
        kind: widgetNames[i] ?? `widget_${i}`,
        position: megaloHudWidgetPositionName(position),
      })),
    });
  }

  if (engine.m_statistics.length > 0) {
    sections.push({ type: "comment", text: "**************" });
    sections.push({ type: "comment", text: "* GAME STATS *" });
    sections.push({ type: "comment", text: "**************" });
    sections.push({
      type: "statistics",
      items: engine.m_statistics.map((stat) => ({
        kind: "number" as const,
        name: strings.lookup(stat.m_name_string_index),
        text: `${strings.lookup(stat.m_name_string_index)}_text`,
        team: "none",
        format: stat.m_format ?? 0,
      })),
    });
  }

  sections.push({ type: "comment", text: "************" });
  sections.push({ type: "comment", text: "* TRIGGERS  *" });
  sections.push({ type: "comment", text: "************" });

  for (let i = 0; i < engine.m_triggers.length; i++) {
    const trigger = engine.m_triggers[i]!;
    if (!isEntryTrigger(trigger, i, referencedTriggers)) {
      continue;
    }
    const binding = triggerTable[i]!;
    const megaloTrigger: MegaloTrigger = {
      name: binding.kind,
      kind: binding.kind,
      objectFilter: binding.objectFilter,
      conditions: [],
      actions: [],
    };
    for (const stmt of buildTriggerStatements(ctx, trigger, filterLabel)) {
      if (stmt.type === "condition") {
        megaloTrigger.conditions.push(stmt);
      } else if (stmt.type === "action") {
        megaloTrigger.actions.push(stmt);
      } else if (stmt.type === "trigger") {
        megaloTrigger.actions.push(stmt);
      }
    }
    sections.push({ type: "trigger", trigger: megaloTrigger });
  }

  return {
    sections,
    flatConditions,
    flatActions,
    triggerTable,
    stringSymbolOrder,
    specialTriggers: {
      initialization: engine.m_initialization_trigger_index,
      localInitialization: engine.m_local_initialization_trigger_index,
      hostMigration: engine.m_host_migration_trigger_index,
      doubleMigration: engine.m_double_migration_trigger_index,
      objectDeathEvent: engine.m_object_death_event_trigger_index,
      local: engine.m_local_trigger_index,
      pregame: engine.m_pregame_trigger_index,
    },
    encodingVersion: variant.m_encoding_version,
    buildNumber: variant.m_build_number,
  };
}

export function decompileGameVariant(variant: c_game_variant): MegaloProgram {
  if (!variant.m_custom_variant) {
    throw new Error("Expected custom game variant");
  }
  return decompileCustomVariant(variant.m_custom_variant);
}
