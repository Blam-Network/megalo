import { k_language_count } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";

export { k_language_count as kLanguageCount };

/** Megalo `string_table` language identifiers in engine row order. */
export const MEGALO_STRING_TABLE_LANGUAGES = [
  "english",
  "japanese",
  "german",
  "french",
  "spanish",
  "mexican_spanish",
  "italian",
  "korean",
  "traditional_chinese",
  "simplified_chinese",
  "portuguese",
  "polish",
] as const;

export type MegaloStringTableLanguage =
  (typeof MEGALO_STRING_TABLE_LANGUAGES)[number];

export function megaloLanguageName(langIndex: number): string {
  return MEGALO_STRING_TABLE_LANGUAGES[langIndex] ?? `language_${langIndex}`;
}

export function megaloLanguageIndex(name: string): number {
  const index = MEGALO_STRING_TABLE_LANGUAGES.indexOf(
    name as MegaloStringTableLanguage
  );
  return index >= 0 ? index : -1;
}
