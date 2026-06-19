import {
  e_file_type,
  k_language_count,
  s_content_item_game_variant_metadata,
  type c_game_engine_custom_variant,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { MegaloEngineData, MegaloProgram } from "../ast";
import {
  VARIANT_DESCRIPTION_SYMBOL,
  VARIANT_NAME_SYMBOL,
} from "../decompiler/string_table";
import { resolveStringSymbolFromProgram } from "./string_table";
import { megaloEngineIconWireIndex } from "../lookups";

function engineDataSection(program: MegaloProgram): MegaloEngineData | undefined {
  const section = program.sections.find((entry) => entry.type === "engine_data");
  return section?.type === "engine_data" ? section.data : undefined;
}

function lookupStringSymbol(
  program: MegaloProgram,
  symbol: string
): string | undefined {
  return resolveStringSymbolFromProgram(program, symbol);
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function resolveEngineField(
  program: MegaloProgram,
  value: string,
  symbol: string
): string {
  const fromSymbol = lookupStringSymbol(program, value);
  if (fromSymbol !== undefined) {
    return fromSymbol;
  }
  if (value === symbol) {
    return lookupStringSymbol(program, symbol) ?? symbol;
  }
  return stripQuotes(value);
}

/** Reach stock megalo scripts use this epoch in variant metadata. */
const MCC_SOURCE_COMPILE_EPOCH = new Date("2010-09-14T00:00:00.000Z");

function setLocalizedDescription(
  variant: c_game_engine_custom_variant,
  description: string
): void {
  if (!description) {
    return;
  }
  variant.m_localized_description.strings = Array.from(
    { length: k_language_count },
    () => [description]
  );
}

function lookupConstantNumber(
  program: MegaloProgram,
  name: string
): number | undefined {
  for (const section of program.sections) {
    if (section.type !== "constants") {
      continue;
    }
    for (const item of section.items) {
      if (item.type === "number" && item.name === name) {
        return item.value;
      }
    }
  }
  return undefined;
}

function parseIconIndex(program: MegaloProgram, icon: string | undefined): number {
  if (icon === undefined) {
    return 0;
  }
  const wireFromName = megaloEngineIconWireIndex(icon);
  if (wireFromName !== undefined) {
    return wireFromName;
  }
  const constant = lookupConstantNumber(program, icon);
  if (constant !== undefined) {
    return constant + 1;
  }
  const parsed = Number(icon);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Initialize base-variant metadata when compiling Megalo source without a base gametype. */
export function applyEngineDataToVariant(
  program: MegaloProgram,
  variant: c_game_engine_custom_variant
): void {
  const data = engineDataSection(program);
  const metadata = variant.m_base_variant.m_metadata;
  const general = metadata.general;
  const now = MCC_SOURCE_COMPILE_EPOCH;

  general.file_type = e_file_type.GameVariant;
  general.size_in_bytes = 0;
  general.unique_id = 0n;
  general.parent_unique_id = 0n;
  general.root_unique_id = 0n;
  general.game_id = 0n;
  general.activity = 0;
  general.game_mode = 0;
  general.game_engine_type = 0;
  general.map_id = 0;

  metadata.creation_history.timestamp = now;
  metadata.creation_history.xuid = 0n;
  metadata.creation_history.name = "";
  metadata.creation_history.is_online = false;
  metadata.modification_history.timestamp = now;
  metadata.modification_history.xuid = 0n;
  metadata.modification_history.name = "";
  metadata.modification_history.is_online = false;
  metadata.display.megalo_category_index = 0;

  if (data) {
    metadata.name = resolveEngineField(
      program,
      data.name,
      VARIANT_NAME_SYMBOL
    );
    metadata.description = resolveEngineField(
      program,
      data.description,
      VARIANT_DESCRIPTION_SYMBOL
    );
    setLocalizedDescription(variant, metadata.description);
    const iconIndex = parseIconIndex(program, data.icon);
    variant.m_engine_icon = iconIndex;
    if (data.category !== undefined) {
      const category = parseIconIndex(program, data.category);
      variant.m_engine_category = category;
      metadata.display.megalo_category_index = category;
    }
    const gameVariantMeta = new s_content_item_game_variant_metadata();
    gameVariantMeta.icon_index = iconIndex;
    metadata.file_type_data = gameVariantMeta;
  } else {
    metadata.name = "Custom Game";
    metadata.description = "";
    const gameVariantMeta = new s_content_item_game_variant_metadata();
    gameVariantMeta.icon_index = 0;
    metadata.file_type_data = gameVariantMeta;
  }
}
