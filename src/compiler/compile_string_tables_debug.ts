import type { MegaloExpr, MegaloProgram } from "../ast";
import {
  expandMegaloIncludes,
  findMegaloIncludeDirectives,
  sourceHasIncludeDirectives,
} from "../expand_includes";
import type { MegaloCompileOptions } from "../gametype";
import { tryParse } from "../parse_result";
import {
  deriveSymbolOrder,
  mergeStringTableSections,
  stringTableSections,
} from "./string_table";

export interface CompileStringTablesDebugSnapshot {
  includesInSource: boolean;
  includesExpanded: boolean;
  includeFilesInCache: number;
  rawStringTableSectionCount: number;
  expandedStringTableSectionCount: number;
  /** `include` lines still present after expansion (should be 0). */
  unexpandedIncludeLineCount: number;
  /** Rough count of `string_table` keywords in expanded source text. */
  expandedStringTableKeywordCount: number;
  mergedByLanguage: Array<{
    language: string;
    symbolCount: number;
    symbols: string[];
  }>;
  symbolOrder: string[];
  scriptStringLiterals: string[];
  parseError?: string;
  /** English slots written to the compiled variant (`m_script_strings[0]`). */
  compiledEnglishSlots?: Array<string | null>;
}

export interface CompileStringTablesDebugMeta {
  includeFilesInCache?: number;
  compiledEnglishSlots?: Array<string | null>;
}

function collectExprLiterals(expr: MegaloExpr, literals: Set<string>): void {
  if (expr.kind === "string") {
    literals.add(expr.value);
    return;
  }
  if (expr.kind === "member") {
    collectExprLiterals(expr.base, literals);
  }
}

function collectScriptStringLiterals(program: MegaloProgram): string[] {
  const literals = new Set<string>();
  for (const action of program.flatActions) {
    for (const operand of action.operands) {
      collectExprLiterals(operand, literals);
    }
  }
  for (const condition of program.flatConditions) {
    for (const operand of condition.operands) {
      collectExprLiterals(operand, literals);
    }
  }
  return [...literals];
}

function countStringTableKeywords(source: string): number {
  const matches = source.match(/^\s*string_table\s+/gm);
  return matches?.length ?? 0;
}

function emptySnapshot(
  partial: Partial<CompileStringTablesDebugSnapshot> &
    Pick<
      CompileStringTablesDebugSnapshot,
      | "includesInSource"
      | "includesExpanded"
      | "includeFilesInCache"
      | "rawStringTableSectionCount"
    >
): CompileStringTablesDebugSnapshot {
  return {
    expandedStringTableSectionCount: 0,
    unexpandedIncludeLineCount: 0,
    expandedStringTableKeywordCount: 0,
    mergedByLanguage: [],
    symbolOrder: [],
    scriptStringLiterals: [],
    ...partial,
  };
}

function snapshotFromProgram(
  program: MegaloProgram,
  expandedSource: string,
  partial: Omit<
    CompileStringTablesDebugSnapshot,
    | "mergedByLanguage"
    | "symbolOrder"
    | "scriptStringLiterals"
    | "expandedStringTableSectionCount"
    | "unexpandedIncludeLineCount"
    | "expandedStringTableKeywordCount"
  >
): CompileStringTablesDebugSnapshot {
  const merged = mergeStringTableSections(stringTableSections(program));
  return {
    ...partial,
    expandedStringTableSectionCount: stringTableSections(program).length,
    unexpandedIncludeLineCount:
      findMegaloIncludeDirectives(expandedSource).length,
    expandedStringTableKeywordCount: countStringTableKeywords(expandedSource),
    mergedByLanguage: merged.map((section) => ({
      language: section.language,
      symbolCount: section.entries.length,
      symbols: section.entries.map((entry) => entry.symbol),
    })),
    symbolOrder: deriveSymbolOrder(program),
    scriptStringLiterals: collectScriptStringLiterals(program),
  };
}

/** Summarize parsed / merged string tables for compile diagnostics. */
export function collectCompileStringTablesDebug(
  source: string,
  options?: MegaloCompileOptions,
  meta?: Pick<CompileStringTablesDebugMeta, "includeFilesInCache">
): CompileStringTablesDebugSnapshot {
  const includesInSource = sourceHasIncludeDirectives(source);
  const includesExpanded = !!options?.includes;
  const includeFilesInCache = meta?.includeFilesInCache ?? 0;

  const rawParsed = tryParse(source);
  const rawStringTableSectionCount = rawParsed.ok
    ? stringTableSections(rawParsed.program).length
    : 0;

  if (!includesExpanded) {
    if (!rawParsed.ok) {
      return emptySnapshot({
        includesInSource,
        includesExpanded: false,
        includeFilesInCache: 0,
        rawStringTableSectionCount,
        parseError: rawParsed.message,
      });
    }
    return snapshotFromProgram(rawParsed.program, source, {
      includesInSource,
      includesExpanded: false,
      includeFilesInCache: 0,
      rawStringTableSectionCount,
    });
  }

  const expandedSource = expandMegaloIncludes(source, options!.includes!);
  const expandedParsed = tryParse(expandedSource);
  if (!expandedParsed.ok) {
    return emptySnapshot({
      includesInSource,
      includesExpanded: true,
      includeFilesInCache,
      rawStringTableSectionCount,
      unexpandedIncludeLineCount:
        findMegaloIncludeDirectives(expandedSource).length,
      expandedStringTableKeywordCount:
        countStringTableKeywords(expandedSource),
      parseError: expandedParsed.message,
    });
  }

  return snapshotFromProgram(expandedParsed.program, expandedSource, {
    includesInSource,
    includesExpanded: true,
    includeFilesInCache,
    rawStringTableSectionCount,
  });
}

export function logCompileStringTablesDebug(
  source: string,
  options?: MegaloCompileOptions,
  meta?: CompileStringTablesDebugMeta
): void {
  const snapshot = collectCompileStringTablesDebug(source, options, meta);
  if (meta?.compiledEnglishSlots) {
    snapshot.compiledEnglishSlots = meta.compiledEnglishSlots;
  }
  console.debug("[megalo compile] string tables", snapshot);
}
