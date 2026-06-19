import type { MegaloAction, MegaloProgram } from "./ast";
import { programDefinesStringSymbol } from "./compiler/string_table";
import { MegaloError } from "./error";
import { sourceHasIncludeDirectives } from "./expand_includes";
import type { SourceLocation } from "./tokens";

interface ScriptLine {
  lineIndex: number;
  line: string;
  startOffset: number;
}

function splitSourceLines(source: string): ScriptLine[] {
  const lines: ScriptLine[] = [];
  let startOffset = 0;
  for (let lineIndex = 0; startOffset <= source.length; lineIndex++) {
    let lineEnd = source.indexOf("\n", startOffset);
    if (lineEnd === -1) {
      lineEnd = source.length;
    }
    let line = source.slice(startOffset, lineEnd);
    if (line.endsWith("\r")) {
      line = line.slice(0, -1);
    }
    lines.push({ lineIndex, line, startOffset });
    if (lineEnd === source.length) {
      break;
    }
    startOffset = lineEnd + 1;
  }
  return lines;
}

function isScriptLine(line: string): boolean {
  const code = line.split(";")[0]!.trimStart();
  return code.length > 0 && !code.startsWith(";");
}

function locationOnLine(
  entry: ScriptLine,
  columnInLine: number,
  length: number
): SourceLocation {
  return {
    line: entry.lineIndex + 1,
    column: columnInLine + 1,
    offset: entry.startOffset + columnInLine,
    length,
  };
}

function refineLocationOnLine(
  entry: ScriptLine,
  needle?: string
): SourceLocation {
  const code = entry.line.split(";")[0]!;
  if (needle) {
    const idx = code.indexOf(needle);
    if (idx >= 0) {
      return locationOnLine(entry, idx, needle.length);
    }
  }
  const statementMatch = code.match(/\b(?:action|condition)\s+(\S+)/);
  if (statementMatch) {
    const token = statementMatch[1]!;
    const tokenStart = code.indexOf(token);
    return locationOnLine(entry, tokenStart, token.length);
  }
  return locationOnLine(entry, 0, Math.max(0, code.trimEnd().length));
}

function collectActionLines(source: string): Array<ScriptLine & { opcode: string }> {
  const results: Array<ScriptLine & { opcode: string }> = [];
  for (const entry of splitSourceLines(source)) {
    if (!isScriptLine(entry.line)) {
      continue;
    }
    const code = entry.line.split(";")[0]!;
    const match = code.match(/\baction\s+(\S+)/);
    if (!match) {
      continue;
    }
    results.push({ ...entry, opcode: match[1]! });
  }
  return results;
}

function collectConditionLines(source: string): ScriptLine[] {
  const results: ScriptLine[] = [];
  for (const entry of splitSourceLines(source)) {
    if (!isScriptLine(entry.line)) {
      continue;
    }
    const code = entry.line.split(";")[0]!;
    if (/\bcondition\b/.test(code)) {
      results.push(entry);
    }
  }
  return results;
}

function findNthActionOpcode(
  source: string,
  opcode: string,
  occurrence: number
): SourceLocation | undefined {
  if (occurrence <= 0) {
    return undefined;
  }
  let seen = 0;
  for (const entry of collectActionLines(source)) {
    if (entry.opcode !== opcode) {
      continue;
    }
    seen++;
    if (seen === occurrence) {
      return refineLocationOnLine(entry, opcode);
    }
  }
  return undefined;
}

function opcodeOccurrenceIndex(
  flatActions: MegaloAction[],
  flatActionIndex: number
): number {
  const opcode = flatActions[flatActionIndex]?.opcode;
  if (!opcode) {
    return 0;
  }
  let count = 0;
  for (let i = 0; i <= flatActionIndex; i++) {
    if (flatActions[i]?.opcode === opcode) {
      count++;
    }
  }
  return count;
}

/** Locate a flat action in source using opcode occurrence (robust to for_each layout). */
export function findFlatActionLocation(
  source: string,
  flatActionIndex: number,
  flatActions?: MegaloAction[]
): SourceLocation | undefined {
  if (flatActions && flatActions[flatActionIndex]) {
    const opcode = flatActions[flatActionIndex]!.opcode;
    if (opcode === "for_each") {
      return undefined;
    }
    const occurrence = opcodeOccurrenceIndex(flatActions, flatActionIndex);
    const byOpcode = findNthActionOpcode(source, opcode, occurrence);
    if (byOpcode) {
      return byOpcode;
    }
  }

  const actionLines = collectActionLines(source);
  let sourcePtr = 0;
  for (let flatIdx = 0; flatIdx <= flatActionIndex; flatIdx++) {
    if (flatActions?.[flatIdx]?.opcode === "for_each") {
      if (flatIdx === flatActionIndex) {
        return undefined;
      }
      continue;
    }
    const entry = actionLines[sourcePtr];
    if (!entry) {
      return undefined;
    }
    if (flatIdx === flatActionIndex) {
      return refineLocationOnLine(entry);
    }
    sourcePtr++;
  }
  return undefined;
}

/** Locate the Nth `condition` statement in Megalo source (0-based flat condition index). */
export function findFlatConditionLocation(
  source: string,
  flatConditionIndex: number
): SourceLocation | undefined {
  const conditionLines = collectConditionLines(source);
  const entry = conditionLines[flatConditionIndex];
  return entry ? refineLocationOnLine(entry) : undefined;
}

export function findTokenInScript(
  source: string,
  token: string,
  afterOffset = 0
): SourceLocation | undefined {
  for (const entry of splitSourceLines(source)) {
    if (entry.startOffset + entry.line.length < afterOffset) {
      continue;
    }
    if (!isScriptLine(entry.line)) {
      continue;
    }
    const code = entry.line.split(";")[0]!;
    if (code.includes(token)) {
      return refineLocationOnLine(entry, token);
    }
  }
  return undefined;
}

function quotedToken(message: string): string | undefined {
  const match = /'([^']+)'/.exec(message);
  return match?.[1];
}

function unknownStringSymbol(message: string): string | undefined {
  const match = /Unknown string symbol '([^']+)'/.exec(message);
  return match?.[1];
}

function enrichUnknownStringSymbolMessage(
  message: string,
  source: string,
  program?: MegaloProgram
): string {
  const symbol = unknownStringSymbol(message);
  if (!symbol) {
    return message;
  }
  if (
    sourceHasIncludeDirectives(source) &&
    (!program || !programDefinesStringSymbol(program, symbol))
  ) {
    return `${message} — this symbol is likely defined in an included string file; open the script from Local Disk (HREK megalo folder) so includes resolve`;
  }
  return message;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Prefer engine_data `name`/`description` fields when resolving string symbols. */
export function findStringSymbolInScript(
  source: string,
  symbol: string
): SourceLocation | undefined {
  const escaped = escapeRegExp(symbol);
  const patterns = [
    new RegExp(`\\bname\\s+(${escaped})\\b`),
    new RegExp(`\\bdescription\\s+(${escaped})\\b`),
  ];
  for (const entry of splitSourceLines(source)) {
    if (!isScriptLine(entry.line)) {
      continue;
    }
    const code = entry.line.split(";")[0]!;
    for (const pattern of patterns) {
      const match = pattern.exec(code);
      if (!match || match.index === undefined) {
        continue;
      }
      const tokenStart = code.indexOf(symbol, match.index);
      if (tokenStart >= 0) {
        return locationOnLine(entry, tokenStart, symbol.length);
      }
    }
  }
  return findTokenInScript(source, symbol);
}

function missingOperandNumber(message: string): number | undefined {
  const match = /missing operand (\d+)/i.exec(message);
  return match ? Number(match[1]) : undefined;
}

function refineMissingOperandLocation(
  source: string,
  loc: SourceLocation,
  operandNumber: number
): SourceLocation {
  const entry = splitSourceLines(source)[loc.line - 1];
  if (!entry) {
    return loc;
  }
  const code = entry.line.split(";")[0]!;
  const actionMatch = code.match(/\baction\s+(\S+)(.*)$/);
  if (!actionMatch) {
    return loc;
  }
  const rest = actionMatch[2] ?? "";
  const tokens = rest.trim().split(/\s+/).filter(Boolean);
  const operandIndex = operandNumber - 1;
  if (operandIndex < 0 || operandIndex >= tokens.length) {
    const opcode = actionMatch[1]!;
    const opcodeStart = code.indexOf(opcode);
    return locationOnLine(entry, opcodeStart, opcode.length);
  }
  let searchFrom = code.indexOf(actionMatch[1]!) + actionMatch[1]!.length;
  for (let i = 0; i < operandIndex; i++) {
    const token = tokens[i]!;
    const idx = code.indexOf(token, searchFrom);
    if (idx < 0) {
      break;
    }
    searchFrom = idx + token.length;
  }
  const token = tokens[operandIndex]!;
  const idx = code.indexOf(token, searchFrom);
  if (idx >= 0) {
    return locationOnLine(entry, idx, token.length);
  }
  return loc;
}

export function enrichCompileErrorLocation(
  error: unknown,
  source: string,
  flatActions?: MegaloAction[],
  program?: MegaloProgram
): unknown {
  if (!(error instanceof MegaloError)) {
    const message = enrichUnknownStringSymbolMessage(
      error instanceof Error ? error.message : String(error),
      source,
      program
    );
    const stringSymbol = unknownStringSymbol(message);
    if (stringSymbol) {
      const loc = findStringSymbolInScript(source, stringSymbol);
      if (loc) {
        return new MegaloError(message, loc);
      }
    }
    const needle = quotedToken(message);
    if (needle) {
      const loc = findTokenInScript(source, needle);
      if (loc) {
        return new MegaloError(message, loc);
      }
    }
    return error instanceof Error && message !== error.message
      ? new MegaloError(message)
      : error;
  }

  const message = enrichUnknownStringSymbolMessage(
    error.message,
    source,
    program
  );

  if (error.loc) {
    return message !== error.message
      ? new MegaloError(message, error.loc, {
          actionIndex: error.actionIndex,
          conditionIndex: error.conditionIndex,
          actionOpcode: error.actionOpcode,
        })
      : error;
  }

  let loc =
    error.actionIndex !== undefined
      ? findFlatActionLocation(source, error.actionIndex, flatActions)
      : error.conditionIndex !== undefined
        ? findFlatConditionLocation(source, error.conditionIndex)
        : undefined;

  const needle = quotedToken(error.message);
  const stringSymbol = unknownStringSymbol(message);
  if (!loc && stringSymbol) {
    loc = findStringSymbolInScript(source, stringSymbol);
  } else if (!loc && needle) {
    loc = findTokenInScript(source, needle);
  } else if (loc && needle) {
    const entry = splitSourceLines(source)[loc.line - 1];
    if (entry?.line.includes(needle)) {
      loc = refineLocationOnLine(entry, needle);
    }
  } else if (loc && stringSymbol) {
    const entry = splitSourceLines(source)[loc.line - 1];
    if (entry?.line.includes(stringSymbol)) {
      loc = refineLocationOnLine(entry, stringSymbol);
    }
  } else if (loc && error.actionOpcode) {
    const entry = splitSourceLines(source)[loc.line - 1];
    if (entry?.line.includes(error.actionOpcode)) {
      loc = refineLocationOnLine(entry, error.actionOpcode);
    }
  }

  const missingOperand = missingOperandNumber(error.message);
  if (loc && missingOperand !== undefined) {
    loc = refineMissingOperandLocation(source, loc, missingOperand);
  }

  if (!loc) {
    return message !== error.message
      ? new MegaloError(message, undefined, {
          actionIndex: error.actionIndex,
          conditionIndex: error.conditionIndex,
          actionOpcode: error.actionOpcode,
        })
      : error;
  }

  return new MegaloError(message, loc, {
    actionIndex: error.actionIndex,
    conditionIndex: error.conditionIndex,
    actionOpcode: error.actionOpcode,
  });
}
