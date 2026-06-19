import type { MegaloProgram } from "./ast";
import { assertNoDuplicateStringTableSymbols } from "./compiler/string_table";
import { megaloErrorLocation } from "./error";
import { classifySourceTokens, type SourceTokenSpan } from "./highlight";
import { parseWithWarnings } from "./parser";
import type { ParseWarning } from "./parse_warnings";

export type ParseResult =
  | { ok: true; program: MegaloProgram; warnings: ParseWarning[] }
  | {
      ok: false;
      message: string;
      line: number;
      column: number;
      offset?: number;
      length?: number;
    };

export interface MegaloSourceAnalysis {
  parse: ParseResult;
  tokens: SourceTokenSpan[];
}

/** Parse Megalo source without throwing. */
export function tryParse(source: string): ParseResult {
  try {
    const { program, warnings } = parseWithWarnings(source);
    assertNoDuplicateStringTableSymbols(program);
    return { ok: true, program, warnings };
  } catch (error) {
    const { message, line, column, offset, length } = megaloErrorLocation(error);
    return { ok: false, message, line, column, offset, length };
  }
}

/** Lex + classify + parse in one pass for IDE tooling. */
export function analyzeMegaloSource(source: string): MegaloSourceAnalysis {
  const tokens = classifySourceTokens(source);
  return { tokens, parse: tryParse(source) };
}
