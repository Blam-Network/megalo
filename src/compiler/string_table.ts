import type {
  MegaloProgram,
  MegaloStringTableEntry,
  MegaloStringTableSection,
} from "../ast";
import {
  c_string_table,
  k_language_count,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { megaloLanguageIndex } from "../languages";
import { MegaloError } from "../error";
import { StringTable } from "../symbols";
import type { SourceLocation } from "../tokens";

function entryLocation(entry: MegaloStringTableEntry): SourceLocation {
  return {
    line: entry.line ?? 1,
    column: entry.column ?? 1,
    offset: entry.offset ?? 0,
    ...(entry.length !== undefined && entry.length > 0
      ? { length: entry.length }
      : {}),
  };
}

/** Fail when the same symbol appears more than once per language string table. */
export function assertNoDuplicateStringTableSymbols(program: MegaloProgram): void {
  const sections = mergeStringTableSections(stringTableSections(program));

  for (const section of sections) {
    const seen = new Set<string>();
    for (const entry of section.entries) {
      if (!seen.has(entry.symbol)) {
        seen.add(entry.symbol);
        continue;
      }
      const loc = entryLocation(entry);
      throw new MegaloError(
        `Duplicate string table symbol '${entry.symbol}' in ${section.language}`,
        loc
      );
    }
  }
}

export function stringTableSections(
  program: MegaloProgram
): MegaloStringTableSection[] {
  return program.sections.filter(
    (section): section is MegaloStringTableSection =>
      section.type === "string_table"
  );
}

/** Merge multiple `string_table` sections that share a language. */
export function mergeStringTableSections(
  sections: MegaloStringTableSection[]
): MegaloStringTableSection[] {
  const merged = new Map<string, MegaloStringTableEntry[]>();
  for (const section of sections) {
    const entries = merged.get(section.language) ?? [];
    entries.push(...section.entries);
    merged.set(section.language, entries);
  }
  return [...merged.entries()].map(([language, entries]) => ({
    type: "string_table" as const,
    language,
    entries,
  }));
}

function symbolOrderFromEntries(entries: MegaloStringTableEntry[]): string[] {
  const placements: { index: number; symbol: string }[] = [];
  const usedIndices = new Set<number>();
  let nextSequential = 0;

  for (const entry of entries) {
    const indexed = /^string_(\d+)$/.exec(entry.symbol);
    let index: number;
    if (indexed) {
      index = Number(indexed[1]);
    } else {
      while (usedIndices.has(nextSequential)) {
        nextSequential++;
      }
      index = nextSequential;
      nextSequential++;
    }
    usedIndices.add(index);
    placements.push({ index, symbol: entry.symbol });
  }

  if (placements.length === 0) {
    return [];
  }

  const maxIndex = Math.max(...placements.map((placement) => placement.index));
  const symbols = Array.from({ length: maxIndex + 1 }, () => "");
  for (const { index, symbol } of placements) {
    symbols[index] = symbol;
  }
  return symbols;
}

export function deriveSymbolOrder(program: MegaloProgram): string[] {
  if (program.stringSymbolOrder && program.stringSymbolOrder.length > 0) {
    return [...program.stringSymbolOrder];
  }

  const merged = mergeStringTableSections(stringTableSections(program));
  const english =
    merged.find((section) => section.language === "english") ?? merged[0];
  if (!english) {
    return [];
  }
  return symbolOrderFromEntries(english.entries);
}

export function deriveSymbolOrderFromStringSections(
  sections: MegaloStringTableSection[]
): string[] {
  const merged = mergeStringTableSections(sections);
  const english =
    merged.find((section) => section.language === "english") ?? merged[0];
  if (!english) {
    return [];
  }
  return symbolOrderFromEntries(english.entries);
}

/** Build compile-time symbol → index map from parsed string tables. */
export function buildStringTableFromProgram(program: MegaloProgram): StringTable {
  const table = new StringTable();
  for (const [index, symbol] of deriveSymbolOrder(program).entries()) {
    table.assign(index, symbol);
  }
  return table;
}

/** Rebuild `m_script_strings` from inlined `string_table` sections. */
export function compileScriptStrings(program: MegaloProgram): c_string_table {
  const sections = mergeStringTableSections(stringTableSections(program));
  const symbolOrder = deriveSymbolOrder(program);
  const result = new c_string_table(112, 0x4c00, 15, 15, 7);

  if (symbolOrder.length === 0) {
    return result;
  }

  result.strings = Array.from({ length: k_language_count }, () =>
    Array.from({ length: symbolOrder.length }, () => null as string | null)
  );

  const sectionByLang = new Map<number, MegaloStringTableSection>();
  for (const section of sections) {
    const langIndex = megaloLanguageIndex(section.language);
    if (langIndex >= 0) {
      sectionByLang.set(langIndex, section);
    }
  }

  for (let langIndex = 0; langIndex < k_language_count; langIndex++) {
    const section = sectionByLang.get(langIndex);
    const entryMap = new Map(
      section?.entries.map((entry) => [entry.symbol, entry.value]) ?? []
    );
    for (let i = 0; i < symbolOrder.length; i++) {
      const symbol = symbolOrder[i]!;
      const value = entryMap.get(symbol);
      result.strings[langIndex]![i] = value ?? null;
    }
  }

  return result;
}

/** Emit only string slots referenced during compile, with per-language text from includes. */
export function compileUsedScriptStrings(
  strings: StringTable,
  mergedSections: MegaloStringTableSection[]
): c_string_table {
  const result = new c_string_table(112, 0x4c00, 15, 15, 7);
  const used = strings.usedIndices().filter((index) => index > 0);
  if (used.length === 0) {
    return result;
  }

  const slotCount = Math.max(...used);
  result.strings = Array.from({ length: k_language_count }, () =>
    Array.from({ length: slotCount }, () => null as string | null)
  );

  const sectionByLang = new Map<number, Map<string, string>>();
  for (const section of mergedSections) {
    const langIndex = megaloLanguageIndex(section.language);
    if (langIndex < 0) {
      continue;
    }
    const map = sectionByLang.get(langIndex) ?? new Map<string, string>();
    for (const entry of section.entries) {
      map.set(entry.symbol, entry.value);
    }
    sectionByLang.set(langIndex, map);
  }

  const english = sectionByLang.get(0);

  for (const index of used) {
    const literal = strings.literalValue(index);
    const symbol = strings.lookup(index);
    const rowIndex = index - 1;
    for (let langIndex = 0; langIndex < k_language_count; langIndex++) {
      if (literal !== undefined) {
        result.strings[langIndex]![rowIndex] = literal;
        continue;
      }
      const langMap = sectionByLang.get(langIndex);
      result.strings[langIndex]![rowIndex] =
        langMap?.get(symbol) ?? english?.get(symbol) ?? null;
    }
  }

  return result;
}

export function programHasStringTables(program: MegaloProgram): boolean {
  return stringTableSections(program).length > 0;
}

/** Resolve a Megalo string-table symbol to its English (or first available) text. */
export function resolveStringSymbolFromProgram(
  program: MegaloProgram,
  symbol: string
): string | undefined {
  const merged = mergeStringTableSections(stringTableSections(program));
  const english =
    merged.find((section) => section.language === "english") ?? merged[0];
  if (!english) {
    return undefined;
  }
  return english.entries.find((entry) => entry.symbol === symbol)?.value;
}

export function programDefinesStringSymbol(
  program: MegaloProgram,
  symbol: string
): boolean {
  return resolveStringSymbolFromProgram(program, symbol) !== undefined;
}
