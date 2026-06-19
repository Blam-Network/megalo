import type { MegaloProgram, MegaloStringTableSection } from "../ast";
import { mergeStringTableSections } from "./string_table";
import type { s_custom_game_engine_definition } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { c_game_engine_custom_variant } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { buildVariableTable } from "../decompiler/variables";
import {
  CompileContext,
  ConstantTable,
  StringTable,
  VariableTable,
} from "../symbols";
/** Build a variable lookup table from parsed `variables` sections. */
export function buildVariableTableFromProgram(
  program: MegaloProgram
): VariableTable {
  const table = new VariableTable();
  const typeCounters = new Map<string, number>();

  for (const section of program.sections) {
    if (section.type !== "variables") {
      continue;
    }
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

/** Merge variant metadata variables with parsed source variables (source wins by name). */
export function mergeVariableTables(
  fromVariant: VariableTable,
  fromProgram: VariableTable
): VariableTable {
  const merged = new VariableTable();
  for (const slot of fromVariant.all()) {
    merged.register(slot);
  }
  for (const slot of fromProgram.all()) {
    merged.register(slot);
  }
  return merged;
}

export function buildCompileVariableTable(
  program: MegaloProgram,
  baseVariant?: c_game_engine_custom_variant
): VariableTable {
  const fromProgram = buildVariableTableFromProgram(program);
  if (!baseVariant) {
    return fromProgram;
  }
  return mergeVariableTables(buildVariableTable(baseVariant), fromProgram);
}

function buildOptionIndexByName(program: MegaloProgram): Map<string, number> {
  const map = new Map<string, number>();
  const section = program.sections.find((item) => item.type === "game_options");
  if (!section || section.type !== "game_options") {
    return map;
  }
  let index = 0;
  for (const option of section.options) {
    if (option.kind === "option" || option.kind === "ranged_option") {
      map.set(option.name, index);
      index++;
    }
  }
  return map;
}

function buildWidgetIndexByName(program: MegaloProgram): Map<string, number> {
  const map = new Map<string, number>();
  const section = program.sections.find((item) => item.type === "hud_widgets");
  if (!section || section.type !== "hud_widgets") {
    return map;
  }
  for (const [index, widget] of section.widgets.entries()) {
    map.set(widget.kind, index);
    if (widget.name) {
      map.set(widget.name, index);
    }
  }
  return map;
}

/** Build compile-time symbol tables from a parsed Megalo program. */
export function buildCompileContext(
  program: MegaloProgram,
  strings: StringTable,
  variables: VariableTable = buildCompileVariableTable(program),
  baseEngine?: s_custom_game_engine_definition
): CompileContext {
  const constants = new ConstantTable();
  for (const section of program.sections) {
    if (section.type !== "constants") {
      continue;
    }
    for (const item of section.items) {
      constants.register(item);
    }
  }

  const mapObjectFilters = new Map<string, number>();
  let filterIndex = 0;
  for (const section of program.sections) {
    if (section.type !== "map_object") {
      continue;
    }
    for (const obj of section.objects) {
      mapObjectFilters.set(obj.filterName, filterIndex);
      if (obj.label) {
        mapObjectFilters.set(obj.label, filterIndex);
      }
      filterIndex++;
    }
  }
  if (baseEngine) {
    for (let i = 0; i < baseEngine.m_object_filters.length; i++) {
      const fallback = `map_object_${i}`;
      if (!mapObjectFilters.has(fallback)) {
        mapObjectFilters.set(fallback, i);
      }
    }
  }

  return new CompileContext(
    strings,
    variables,
    constants,
    mapObjectFilters,
    buildOptionIndexByName(program),
    buildWidgetIndexByName(program),
    mergeStringTableSections(
      program.sections.filter(
        (section): section is MegaloStringTableSection =>
          section.type === "string_table"
      )
    )
  );
}
