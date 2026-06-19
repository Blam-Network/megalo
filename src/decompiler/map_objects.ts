import type { c_game_engine_custom_variant } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { c_object_filter } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { MegaloMapObject } from "../ast";
import { sanitizeIdentifier } from "../identifiers";
import { typeFilterMapObjectName } from "../lookups";
import { optionIdentifier } from "./variables";

export function filterHasObjectType(
  validParameters: c_object_filter["m_valid_parameters"]
): boolean {
  return validParameters.object_type === true;
}

const LABEL_TO_MAP_OBJECT: Record<string, string> = {
  none: "impure_filth",
};

const INVASION_LABEL_NAMES: Record<string, string> = {
  invasion: "invasion_stuff",
  inv_weapon: "invasion_weapon",
  inv_vehicle: "invasion_vehicle",
  inv_gates: "invasion_gates",
  inv_objective: "invasion_objective",
  inv_obj_flag: "invasion_objective_flag",
  inv_res_p1: "invasion_respawn_phase_1",
  inv_res_p2: "invasion_respawn_phase_2",
  inv_res_p3: "invasion_respawn_phase_3",
  inv_res_zone: "invasion_respawn_zone",
  inv_platform: "invasion_platform",
  inv_cinematic: "invasion_cinematic",
  inv_mancannon: "invasion_mancannon",
  inv_no_core_zone: "no_core_drop_zone",
};

function isSpuriousLabelFilter(label: string, optionNames: Set<string>): boolean {
  if (!label || label.includes(" ")) {
    return true;
  }
  if (optionNames.has(label.toLowerCase())) {
    return true;
  }
  if (label.startsWith("option_")) {
    return true;
  }
  return false;
}

function mapObjectNameFromLabel(label: string): string {
  if (LABEL_TO_MAP_OBJECT[label]) {
    return LABEL_TO_MAP_OBJECT[label]!;
  }
  if (INVASION_LABEL_NAMES[label]) {
    return INVASION_LABEL_NAMES[label]!;
  }
  if (label.startsWith("inv_")) {
    return label.replace(/^inv_/, "invasion_");
  }
  return sanitizeIdentifier(label);
}

function inferOrphanMapObjectName(
  orphanLabel: string,
  filterLabels: string[]
): string {
  if (orphanLabel === "invasion") {
    return "invasion_stuff";
  }
  const sibling = filterLabels.find((label) =>
    label.startsWith(`${orphanLabel}_`)
  );
  if (sibling) {
    const expanded = mapObjectNameFromLabel(sibling);
    return expanded.replace(/_[^_]+$/, "_stuff");
  }
  return `${sanitizeIdentifier(orphanLabel)}_stuff`;
}

function findOrphanMapLabels(
  strings: string[],
  filterLabels: string[],
  optionNames: Set<string>
): string[] {
  const filterLabelSet = new Set(filterLabels);
  const candidates: string[] = [];

  for (const label of strings) {
    if (!label || filterLabelSet.has(label)) {
      continue;
    }
    if (isSpuriousLabelFilter(label, optionNames)) {
      continue;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(label)) {
      continue;
    }
    if (filterLabels.some((filterLabel) => filterLabel.startsWith(`${label}_`))) {
      candidates.push(label);
    }
  }

  return candidates.sort((a, b) => strings.indexOf(a) - strings.indexOf(b));
}

function findMaxMapObjectSymbolIndex(
  variant: c_game_engine_custom_variant,
  filters: c_object_filter[]
): number {
  const engine = variant.m_game_engine;
  let maxIndex = -1;

  for (const trigger of engine.m_triggers) {
    if (trigger.m_object_filter_index >= 0) {
      maxIndex = Math.max(maxIndex, trigger.m_object_filter_index);
    }
  }

  for (const action of engine.m_actions) {
    const create = action.m_create_object_parameters;
    if (create?.m_filter_index !== undefined && create.m_filter_index >= 0) {
      maxIndex = Math.max(maxIndex, create.m_filter_index);
    }
  }

  for (let i = 0; i < filters.length; i++) {
    if (filterHasObjectType(filters[i]!.m_valid_parameters)) {
      maxIndex = Math.max(maxIndex, i);
    }
  }

  return maxIndex;
}

export interface MapObjectSymbol {
  name: string;
  label?: string;
  type?: string;
  min?: number;
}

export function buildMapObjectSymbols(
  variant: c_game_engine_custom_variant,
  englishRow: string[]
): MapObjectSymbol[] {
  const filters = variant.m_game_engine.m_object_filters;
  const optionNames = new Set(
    variant.m_user_defined_options.map((option, index) =>
      optionIdentifier(englishRow, index, option.m_name_string_index).toLowerCase()
    )
  );

  const labelFilters: { label: string; min: number }[] = [];
  const typeFilterByIndex = new Map<number, { typeIndex: number; min: number }>();

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i]!;
    const label = englishRow[filter.m_label_string_index] ?? "";

    if (filterHasObjectType(filter.m_valid_parameters)) {
      typeFilterByIndex.set(i, {
        typeIndex: filter.m_object_type?.m_object_type_index ?? 0,
        min: filter.m_min ?? 0,
      });
      continue;
    }

    if (isSpuriousLabelFilter(label, optionNames)) {
      continue;
    }

    labelFilters.push({ label, min: filter.m_min ?? 0 });
  }

  const maxSymbolIndex = findMaxMapObjectSymbolIndex(variant, filters);
  if (maxSymbolIndex < 0) {
    return [];
  }

  const filterLabels = labelFilters.map((entry) => entry.label);
  const orphans = findOrphanMapLabels(englishRow, filterLabels, optionNames);
  const gapCount =
    maxSymbolIndex + 1 - labelFilters.length - typeFilterByIndex.size;
  const orphanLabels = orphans.slice(0, Math.max(0, gapCount));

  const symbols: (MapObjectSymbol | undefined)[] = new Array(maxSymbolIndex + 1);

  for (const [index, typeFilter] of typeFilterByIndex) {
    const { name, type } = typeFilterMapObjectName(typeFilter.typeIndex);
    symbols[index] = {
      name,
      type,
      min: typeFilter.min > 0 ? typeFilter.min : undefined,
    };
  }

  let labelIndex = 0;
  let orphanIndex = 0;
  for (let symbolIndex = 0; symbolIndex <= maxSymbolIndex; symbolIndex++) {
    if (symbols[symbolIndex]) {
      continue;
    }

    if (orphanIndex < orphanLabels.length) {
      const orphanLabel = orphanLabels[orphanIndex++]!;
      symbols[symbolIndex] = {
        name: inferOrphanMapObjectName(orphanLabel, filterLabels),
        label: orphanLabel,
      };
      continue;
    }

    if (labelIndex < labelFilters.length) {
      const labelFilter = labelFilters[labelIndex++]!;
      symbols[symbolIndex] = {
        name: mapObjectNameFromLabel(labelFilter.label),
        label: labelFilter.label,
        min: labelFilter.min > 0 ? labelFilter.min : undefined,
      };
    }
  }

  return symbols.filter((symbol): symbol is MapObjectSymbol => symbol !== undefined);
}

export function mapObjectSymbolsToSections(
  symbols: MapObjectSymbol[]
): MegaloMapObject[] {
  const emitted = new Set<string>();
  const objects: MegaloMapObject[] = [];

  for (const symbol of symbols) {
    if (emitted.has(symbol.name)) {
      continue;
    }
    emitted.add(symbol.name);
    objects.push({
      filterName: symbol.name,
      label: symbol.label ?? symbol.name,
      type: symbol.type,
      min: symbol.min,
    });
  }

  return objects;
}

export function mapObjectSymbolName(
  symbols: (MapObjectSymbol | undefined)[],
  symbolIndex: number
): string {
  if (symbolIndex < 0) {
    return "general";
  }
  return symbols[symbolIndex]?.name ?? `map_object_${symbolIndex}`;
}
