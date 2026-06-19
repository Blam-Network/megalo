import type {
  MegaloExpr,
  MegaloSection,
  MegaloVariable,
} from "../ast";
import type { c_game_engine_custom_variant } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { s_variable_metadata } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { c_custom_variable_reference } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { sanitizeIdentifier } from "../identifiers";
import { VariableTable } from "../symbols";

const GLOBAL_NUMBER_NAMES: string[] = [];
const GLOBAL_OBJECT_NAMES: string[] = [];
const GLOBAL_TIMER_NAMES: string[] = [];
const GLOBAL_TEAM_NAMES: string[] = [];
const GLOBAL_PLAYER_NAMES: string[] = [];

const OBJECT_NUMBER_NAMES: string[] = [
  "allies_present",
  "enemies_present",
];
const OBJECT_TIMER_NAMES: string[] = [];

const PLAYER_NUMBER_NAMES: string[] = [];
const PLAYER_TIMER_NAMES: string[] = [];

/** Known variable slot names per scope — shared with reference decode. */
export const MEGALO_KNOWN_VARIABLE_NAMES: Record<
  MegaloVariable["scope"],
  Partial<Record<MegaloVariable["type"], string[]>>
> = {
  global: {
    number: GLOBAL_NUMBER_NAMES,
    object: GLOBAL_OBJECT_NAMES,
    timer: GLOBAL_TIMER_NAMES,
    team: GLOBAL_TEAM_NAMES,
    player: GLOBAL_PLAYER_NAMES,
  },
  object: {
    number: OBJECT_NUMBER_NAMES,
    timer: OBJECT_TIMER_NAMES,
  },
  player: {
    number: PLAYER_NUMBER_NAMES,
    timer: PLAYER_TIMER_NAMES,
  },
  team: {},
};

function num(value: number): MegaloExpr {
  return { kind: "number", value };
}

function id(name: string): MegaloExpr {
  return { kind: "identifier", name };
}

function timerDefault(ref: c_custom_variable_reference): MegaloExpr {
  return num(ref.m_immediate_value ?? ref.m_option_index ?? 0);
}

function appendNumbers(
  items: MegaloVariable[],
  scope: MegaloVariable["scope"],
  metadata: s_variable_metadata,
  knownNames: string[]
): void {
  metadata.m_numeric_variables.forEach(([ref, networkState], index) => {
    items.push({
      scope,
      storage: networkState !== 0 ? "networked" : "local",
      type: "number",
      name:
        knownNames[index] ??
        (scope === "global"
          ? `global_number_${index}`
          : `number_${index + 1}`),
      initial: num(ref.m_immediate_value ?? 0),
    });
  });
}

function appendTimers(
  items: MegaloVariable[],
  scope: MegaloVariable["scope"],
  metadata: s_variable_metadata,
  knownNames: string[]
): void {
  metadata.m_timer_variables.forEach((ref, index) => {
    items.push({
      scope,
      storage: "networked",
      type: "timer",
      name: knownNames[index] ?? `timer_${index + 1}`,
      initial: timerDefault(ref),
    });
  });
}

function appendObjects(
  items: MegaloVariable[],
  scope: MegaloVariable["scope"],
  metadata: s_variable_metadata,
  knownNames: string[]
): void {
  metadata.m_object_variables.forEach((networkState, index) => {
    items.push({
      scope,
      storage: networkState !== 0 ? "networked" : "local",
      type: "object",
      name: knownNames[index] ?? `object_${index + 1}`,
      initial: id("none"),
    });
  });
}

function appendTeams(
  items: MegaloVariable[],
  scope: MegaloVariable["scope"],
  metadata: s_variable_metadata,
  knownNames: string[]
): void {
  metadata.m_team_variables.forEach(([value, networkState], index) => {
    items.push({
      scope,
      storage: networkState !== 0 ? "networked" : "local",
      type: "team",
      name: knownNames[index] ?? `team_${index + 1}`,
      initial: id("none"),
    });
    void value;
  });
}

function appendPlayers(
  items: MegaloVariable[],
  scope: MegaloVariable["scope"],
  metadata: s_variable_metadata,
  knownNames: string[]
): void {
  metadata.m_player_variables.forEach((networkState, index) => {
    items.push({
      scope,
      storage: networkState !== 0 ? "networked" : "local",
      type: "player",
      name: knownNames[index] ?? `player_${index + 1}`,
      initial: id("none"),
    });
  });
}

function decompileScope(
  scope: MegaloVariable["scope"],
  metadata: s_variable_metadata
): MegaloSection | null {
  const items: MegaloVariable[] = [];
  const known = MEGALO_KNOWN_VARIABLE_NAMES[scope];

  appendNumbers(items, scope, metadata, known.number ?? []);
  appendObjects(items, scope, metadata, known.object ?? []);
  appendTimers(items, scope, metadata, known.timer ?? []);
  appendTeams(items, scope, metadata, known.team ?? []);
  appendPlayers(items, scope, metadata, known.player ?? []);

  if (items.length === 0 && scope !== "team") {
    return null;
  }

  return { type: "variables", scope, items };
}

/** Build a variable lookup table matching emitted `variables` section names. */
export function buildVariableTable(
  variant: c_game_engine_custom_variant
): VariableTable {
  const table = new VariableTable();
  const sections = decompileVariableSections(variant).filter(
    (section): section is Extract<MegaloSection, { type: "variables" }> =>
      section.type === "variables"
  );

  const typeCounters = new Map<string, number>();

  for (const section of sections) {
    for (const variable of section.items) {
      const key = `${section.scope}:${variable.type}`;
      const index = typeCounters.get(key) ?? 0;
      typeCounters.set(key, index + 1);
      table.register({
        scope: section.scope,
        type: variable.type,
        storage: variable.storage,
        name: variable.name,
        index,
      });
    }
  }

  return table;
}

/** Decompile `variables` blocks from engine metadata. */
export function decompileVariableSections(
  variant: c_game_engine_custom_variant
): MegaloSection[] {
  const engine = variant.m_game_engine;
  const sections: MegaloSection[] = [];

  sections.push({ type: "comment", text: "*************" });
  sections.push({ type: "comment", text: "* VARIABLES *" });
  sections.push({ type: "comment", text: "*************" });

  for (const scope of ["global", "object", "player", "team"] as const) {
    const metadata =
      scope === "global"
        ? engine.m_global_variable_metadata
        : scope === "object"
          ? engine.m_object_variable_metadata
          : scope === "player"
            ? engine.m_player_variable_metadata
            : engine.m_team_variable_metadata;

    const section = decompileScope(scope, metadata);
    if (section) {
      sections.push(section);
    }
  }

  return sections;
}

export function optionIdentifier(
  strings: string[],
  index: number,
  nameStringIndex: number
): string {
  const name = strings[nameStringIndex] ?? `option_${index}`;
  return sanitizeIdentifier(name) || `option_${index}`;
}
