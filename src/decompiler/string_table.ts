import type { c_game_engine_custom_variant } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { c_action } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { MegaloStringTableSection } from "../ast";
import {
  escapeReservedIdentifier,
  sanitizeIdentifier,
  sanitizeMessageName,
} from "../identifiers";
import { megaloLanguageName } from "../languages";

export const VARIANT_NAME_SYMBOL = "variant_name";
export const VARIANT_DESCRIPTION_SYMBOL = "variant_description";

function localizedCell(
  table: { strings: ((string | null)[] | undefined)[] },
  langIndex: number
): string {
  const cell = table.strings[langIndex]?.[0];
  return typeof cell === "string" ? cell : "";
}

function variantNameForLanguage(
  variant: c_game_engine_custom_variant,
  langIndex: number,
  scriptRow: string[]
): string {
  const localized = localizedCell(variant.m_localized_name, langIndex);
  if (localized) {
    return localized;
  }
  return scriptRow[0] ?? "";
}

function variantDescriptionForLanguage(
  variant: c_game_engine_custom_variant,
  langIndex: number
): string {
  return localizedCell(variant.m_localized_description, langIndex);
}

function addVariantStringTableEntries(
  table: Map<string, string>,
  variant: c_game_engine_custom_variant,
  langIndex: number,
  scriptRow: string[]
): void {
  const name = variantNameForLanguage(variant, langIndex, scriptRow);
  if (name) {
    table.set(VARIANT_NAME_SYMBOL, name);
  }

  const description = variantDescriptionForLanguage(variant, langIndex);
  if (description) {
    table.set(VARIANT_DESCRIPTION_SYMBOL, description);
  }
}

function assignSymbol(symbols: string[], index: number, desired: string): void {
  if (index < 0 || index >= symbols.length || !desired) {
    return;
  }
  if (symbols[index]) {
    return;
  }
  let sym = escapeReservedIdentifier(desired);
  const used = new Set(symbols.filter(Boolean));
  if (used.has(sym)) {
    sym = `${escapeReservedIdentifier(desired)}_${index}`;
  }
  symbols[index] = sym;
}

function collectStringIndices(value: unknown, out: Set<number>): void {
  if (value === null || typeof value !== "object") {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStringIndices(item, out);
    }
    return;
  }
  const record = value as Record<string, unknown>;
  const idx = record.m_string_index;
  if (typeof idx === "number" && idx >= 0) {
    out.add(idx);
  }
  for (const child of Object.values(record)) {
    if (child !== null && typeof child === "object") {
      collectStringIndices(child, out);
    }
  }
}

function scriptEnglishRow(variant: c_game_engine_custom_variant): string[] {
  const row = variant.m_script_strings.strings[0] ?? [];
  return row.map((cell: string | null) => (typeof cell === "string" ? cell : ""));
}

function optionIdentifier(
  variant: c_game_engine_custom_variant,
  englishRow: string[],
  index: number
): string {
  const option = variant.m_user_defined_options[index];
  if (!option) {
    return `option_${index}`;
  }
  const nameText = englishRow[option.m_name_string_index] ?? "";
  return sanitizeIdentifier(nameText) || `option_${index}`;
}

/**
 * One Megalo symbol per `m_script_strings` index (shared across language rows).
 */
export function buildScriptStringSymbols(
  variant: c_game_engine_custom_variant
): string[] {
  const englishRow = scriptEnglishRow(variant);
  const stringCount = Math.max(
    englishRow.length,
    ...variant.m_script_strings.strings.map(
      (row: (string | null)[] | undefined) => row?.length ?? 0
    )
  );
  const symbols = Array.from({ length: stringCount }, () => "");

  assignSymbol(
    symbols,
    variant.m_base_name_string_index,
    sanitizeIdentifier(
      englishRow[variant.m_base_name_string_index] || "engine_title"
    )
  );

  for (let i = 0; i < variant.m_user_defined_options.length; i++) {
    const option = variant.m_user_defined_options[i]!;
    const optionName = optionIdentifier(variant, englishRow, i);
    assignSymbol(
      symbols,
      option.m_name_string_index,
      `option_name_${optionName}`
    );
    assignSymbol(
      symbols,
      option.m_description_string_index,
      `option_description_${optionName}`
    );

    for (const valueEntry of option.m_values ?? []) {
      const valueName = sanitizeIdentifier(
        englishRow[valueEntry.m_name_string_index ?? -1] ?? ""
      );
      if (valueName) {
        assignSymbol(symbols, valueEntry.m_name_string_index ?? -1, valueName);
      }
      const descIndex = valueEntry.m_description_string_index;
      if (typeof descIndex === "number" && descIndex >= 0) {
        const descText = englishRow[descIndex];
        if (descText) {
          assignSymbol(symbols, descIndex, sanitizeIdentifier(descText));
        }
      }
    }
  }

  const engine = variant.m_game_engine;
  for (const stat of engine.m_statistics) {
    const idx = stat.m_name_string_index;
    const name = englishRow[idx];
    if (name) {
      assignSymbol(symbols, idx, sanitizeIdentifier(name));
    }
  }

  const actionStringIndices = new Set<number>();
  for (const action of engine.m_actions as c_action[]) {
    collectStringIndices(action, actionStringIndices);
  }
  for (const idx of actionStringIndices) {
    const text = englishRow[idx];
    if (text) {
      assignSymbol(symbols, idx, sanitizeMessageName(text));
    }
  }

  for (let i = 0; i < symbols.length; i++) {
    if (symbols[i]) {
      continue;
    }
    const text = englishRow[i];
    if (!text) {
      symbols[i] = `string_${i}`;
      continue;
    }
    assignSymbol(
      symbols,
      i,
      sanitizeIdentifier(text) || sanitizeMessageName(text) || `string_${i}`
    );
  }

  return symbols;
}

/** Resolve a Megalo symbol for English text that already exists in `m_script_strings`. */
export function scriptStringSymbolForEnglishText(
  symbols: string[],
  englishRow: string[],
  englishText: string,
  fallback: string
): string {
  const normalized = englishText.trim();
  if (!normalized) {
    return fallback;
  }
  for (let i = 0; i < englishRow.length; i++) {
    if (englishRow[i] === normalized && symbols[i]) {
      return symbols[i]!;
    }
  }
  return sanitizeIdentifier(normalized) || fallback;
}

export function scriptStringSymbolAt(
  symbols: string[],
  index: number,
  fallback: string
): string {
  if (index < 0 || index >= symbols.length) {
    return fallback;
  }
  return symbols[index] || fallback;
}

export function scriptStringRows(
  variant: c_game_engine_custom_variant
): string[][] {
  return variant.m_script_strings.strings.map((row: (string | null)[] | undefined) =>
    (row ?? []).map((cell: string | null) => (typeof cell === "string" ? cell : ""))
  );
}

function languageRowHasContent(row: string[] | undefined): boolean {
  if (!row || row.length === 0) {
    return false;
  }
  return row.some((s) => s.length > 0);
}

export function collectStringTableForLanguage(
  variant: c_game_engine_custom_variant,
  langIndex: number,
  symbols: string[]
): Map<string, string> {
  const table = new Map<string, string>();
  const rows = scriptStringRows(variant);
  const row = rows[langIndex] ?? [];

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    if (!sym || table.has(sym)) {
      continue;
    }
    table.set(sym, row[i] ?? "");
  }

  addVariantStringTableEntries(table, variant, langIndex, row);

  return table;
}

export function decompileStringTableSections(
  variant: c_game_engine_custom_variant
): MegaloStringTableSection[] {
  const symbols = buildScriptStringSymbols(variant);
  const rows = scriptStringRows(variant);
  if (symbols.length === 0 && rows.length === 0) {
    return [];
  }

  const sections: MegaloStringTableSection[] = [];
  const langCount = Math.max(rows.length, symbols.length > 0 ? 12 : 0);

  for (let langIndex = 0; langIndex < langCount; langIndex++) {
    if (!languageRowHasContent(rows[langIndex])) {
      continue;
    }
    const entries = collectStringTableForLanguage(variant, langIndex, symbols);
    if (entries.size === 0) {
      continue;
    }

    const ordered = [...entries.entries()]
      .sort(([symbolA], [symbolB]) => symbolA.localeCompare(symbolB))
      .map(([symbol, value]) => ({ symbol, value }));

    sections.push({
      type: "string_table",
      language: megaloLanguageName(langIndex),
      entries: ordered,
    });
  }

  return sections;
}
