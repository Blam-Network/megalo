export type {
  MegaloAction,
  MegaloCondition,
  MegaloConstant,
  MegaloEngineData,
  MegaloExpr,
  MegaloGameOption,
  MegaloHudWidget,
  MegaloMapObject,
  MegaloPlayerTraits,
  MegaloProgram,
  MegaloSection,
  MegaloStatement,
  MegaloStatistic,
  MegaloStringTableEntry,
  MegaloStringTableSection,
  MegaloTeam,
  MegaloTrigger,
  MegaloTriggerBinding,
  MegaloVariable,
} from "./ast";

export { MegaloError, megaloErrorLocation } from "./error";
export { decodeMegaloText } from "./decode_text";
export {
  expandMegaloIncludes,
  expandMegaloIncludesAsync,
  findMegaloIncludeDirectives,
  sourceHasIncludeDirectives,
  tryExpandMegaloIncludes,
  unresolvedIncludeErrors,
  type ExpandIncludesOptions,
  type IncludeReadFile,
  type MegaloIncludeDirective,
  type MegaloIncludeError,
} from "./expand_includes";
export type { GametypeChunkKind, GametypeSaveFormat, MegaloCompileOptions } from "./gametype";
export { parse, parseWithWarnings } from "./parser";
export { resolveStringSymbolFromProgram } from "./compiler/string_table";
export {
  deriveSymbolOrderFromStringSections,
  mergeStringTableSections,
} from "./compiler/string_table";
export {
  collectCompileStringTablesDebug,
  logCompileStringTablesDebug,
  type CompileStringTablesDebugSnapshot,
} from "./compiler/compile_string_tables_debug";
export {
  StringTable,
  VariableTable,
  ConstantTable,
  CompileContext,
  DecompileContext,
} from "./symbols";
export type { VariableSlot } from "./symbols";

export {
  decompileCustomVariant,
  decompileGameVariant,
} from "./decompiler/from_variant";
export { emitSource } from "./decompiler/emit_source";
export {
  compileCustomVariant,
  compileGameVariant,
} from "./compiler/to_variant";

export type { MegaloDialect, MegaloDialectId } from "./dialect/types";
export { mccDialect } from "./dialect/mcc";
export { tu1Dialect } from "./dialect/tu1";
export { getDialect } from "./dialect/registry";

export {
  extractGvarFromBlf,
  extractGametypeFromBlf,
  detectGametypeChunkInBlf,
  decompileGvarFromBlf,
  patchGvarInBlf,
  roundtripGvarProgram,
  roundtripGvarSource,
  compileGvarFromEditedSource,
  compileGvarFromMegaloSource,
  compileMgloFromEditedProgram,
  compileMgloFromEditedSource,
  compileMgloFromMegaloProgram,
  compileMgloFromMegaloSource,
  compileGametypeForSave,
  autosaveQueueFileName,
  mergeEditedProgram,
} from "./gametype";
export {
  encodeCustomVariantMglo,
  decodeCustomVariantMglo,
  exportMgloFromBlf,
} from "./mglo";

export { lex } from "./lexer";
export {
  decodeCustomVariable,
  decodeObjectReference,
  decodePlayerReference,
  decodeTeamReference,
  decodeTimerReference,
  decodeVariantVariable,
} from "./references/decode";

export {
  grenadeCountsFromWire,
  mergeGrenadeWireValues,
} from "./grenade_count_setting";

export {
  encodeCustomVariable,
  encodeObjectReference,
  encodePlayerReference,
  encodeTeamReference,
  encodeTimerReference,
  encodeVariantVariable,
} from "./references/encode";

export {
  formatExplicitObject,
  formatExplicitPlayer,
  formatExplicitTeam,
} from "./references/format";

export {
  formatActionLine,
  formatConditionLine,
  exprToString,
} from "./references/emit_lines";

export {
  MEGALO_ACTIONS,
  MEGALO_CONDITIONS,
  MEGALO_COMPARISON_OPS,
  MEGALO_MATH_OPS,
  MEGALO_SECTION_KEYWORDS,
  MEGALO_TRIGGER_KINDS,
} from "./vocabulary";
export {
  MEGALO_BUILTIN_GLOBALS,
  MEGALO_BUILTIN_OVERRIDE_OPTIONS,
  MEGALO_HIGHLIGHT_RESERVED_KEYWORDS,
  MEGALO_MAP_OBJECT_FILTER_PROPERTIES,
  MEGALO_VARIABLE_SCOPES,
  MEGALO_VARIABLE_TYPES,
} from "./highlight_vocabulary";
export { MEGALO_KEYWORDS } from "./tokens";
export { MEGACROW_VERSION } from "./version";
export {
  MEGALO_STRING_TABLE_LANGUAGES,
  megaloLanguageIndex,
  megaloLanguageName,
} from "./languages";
export type { MegaloStringTableLanguage } from "./languages";
export { formatMegaloStringLiteral } from "./string_format";
export { formatDecompileHeader } from "./decompiler/emit_source";
export {
  classifySourceTokens,
  MegaloSyntaxItemType,
} from "./highlight";
export type { SourceTokenSpan } from "./highlight";
export { tryParse, analyzeMegaloSource } from "./parse_result";
export type { ParseResult, MegaloSourceAnalysis } from "./parse_result";
export type { ParseWarning } from "./parse_warnings";
