import { lex } from "./lexer";
import {
  MEGALO_BUILTIN_GLOBALS,
  MEGALO_BUILTIN_OVERRIDE_OPTIONS,
  MEGALO_HIGHLIGHT_RESERVED_KEYWORDS,
  MEGALO_MAP_OBJECT_FILTER_PROPERTIES,
  MEGALO_VARIABLE_TYPES,
} from "./highlight_vocabulary";
import { TokenKind, type Token } from "./tokens";
import { MEGALO_ACTIONS, MEGALO_COMPARISON_OPS, MEGALO_CONDITIONS, MEGALO_MATH_OPS, MEGALO_TRIGGER_KINDS } from "./vocabulary";

/** Mirrors MegaCrow `SyntaxItemType` indices used by `ColorToken()`. */
export enum MegaloSyntaxItemType {
  None = 0,
  Comment = 1,
  Keyword = 2,
  Action = 4,
  Condition = 5,
  Number = 6,
  String = 9,
  GameOption = 12,
  VariableType = 14,
  NumericConstant = 15,
  Identifier = 16,
  OverrideOption = 17,
  MapObjectProperty = 18,
}

export interface SourceTokenSpan {
  offset: number;
  length: number;
  line: number;
  column: number;
  /** 0-based character index within the line string (Monaco semantic token position). */
  lineChar: number;
  type: MegaloSyntaxItemType;
}

type SectionKind =
  | "root"
  | "constants"
  | "variables"
  | "game_options"
  | "game_option"
  | "player_traits"
  | "map_object"
  | "trigger"
  | "engine_data"
  | "generic";

interface TokenSpan {
  token: Token;
  length: number;
}

const ACTION_SET = new Set(MEGALO_ACTIONS.map((name) => name.toLowerCase()));
const CONDITION_SET = new Set(
  [...MEGALO_CONDITIONS, ...MEGALO_MATH_OPS, ...MEGALO_COMPARISON_OPS].map(
    (name) => name.toLowerCase()
  )
);
const KEYWORD_SET = new Set(
  MEGALO_HIGHLIGHT_RESERVED_KEYWORDS.map((name) => name.toLowerCase())
);
const BUILTIN_GLOBAL_SET = new Set(
  MEGALO_BUILTIN_GLOBALS.map((name) => name.toLowerCase())
);
const OVERRIDE_SET = new Set(
  MEGALO_BUILTIN_OVERRIDE_OPTIONS.map((name) => name.toLowerCase())
);
const MAP_OBJECT_PROPERTY_SET = new Set(
  MEGALO_MAP_OBJECT_FILTER_PROPERTIES.map((name) => name.toLowerCase())
);
const VARIABLE_TYPE_SET = new Set(
  MEGALO_VARIABLE_TYPES.map((name) => name.toLowerCase())
);
const TRIGGER_KIND_SET = new Set(
  MEGALO_TRIGGER_KINDS.map((name) => name.toLowerCase())
);
const ENGINE_DATA_FIELDS = new Set([
  "name",
  "description",
  "icon",
  "category",
]);

function lower(text: string): string {
  return text.toLowerCase();
}

function pushSpan(
  spans: SourceTokenSpan[],
  token: Token,
  length: number,
  type: MegaloSyntaxItemType
): void {
  if (length <= 0 || type === MegaloSyntaxItemType.None) {
    return;
  }
  spans.push({
    offset: token.loc.offset,
    length,
    line: token.loc.line,
    column: token.loc.column,
    lineChar: 0,
    type,
  });
}

function buildLineStarts(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") {
      starts.push(i + 1);
      continue;
    }
    if (source[i] === "\r") {
      if (source[i + 1] === "\n") {
        starts.push(i + 2);
        i++;
      } else {
        starts.push(i + 1);
      }
    }
  }
  return starts;
}

/** Exclusive end offset of each line's content (excludes `\r`/`\n`). */
function buildLineContentEnds(source: string): number[] {
  const starts = buildLineStarts(source);
  const ends: number[] = [];
  for (const start of starts) {
    let end = start;
    while (end < source.length && source[end] !== "\n" && source[end] !== "\r") {
      end++;
    }
    ends.push(end);
  }
  return ends;
}

function buildModelLineLengths(source: string): number[] {
  const starts = buildLineStarts(source);
  const ends = buildLineContentEnds(source);
  return ends.map((end, index) => end - starts[index]!);
}

function annotateLineChars(source: string, spans: SourceTokenSpan[]): void {
  const lineStarts = buildLineStarts(source);
  for (const span of spans) {
    span.lineChar = span.offset - lineStarts[span.line - 1]!;
  }
}

function validateSpans(
  source: string,
  spans: SourceTokenSpan[]
): SourceTokenSpan[] {
  const lineLengths = buildModelLineLengths(source);
  const valid: SourceTokenSpan[] = [];

  for (const span of spans) {
    const lineLen = lineLengths[span.line - 1];
    if (lineLen === undefined) {
      continue;
    }
    if (span.lineChar < 0 || span.lineChar >= lineLen) {
      continue;
    }
    let end = span.offset + span.length;
    while (end > span.offset && /[\r\n]/.test(source[end - 1]!)) {
      end--;
    }
    while (end > span.offset && /[ \t]/.test(source[end - 1]!)) {
      end--;
    }
    const length = Math.min(end - span.offset, lineLen - span.lineChar);
    if (length <= 0) {
      continue;
    }
    valid.push({ ...span, length });
  }

  return valid;
}

function tokenSourceLength(
  source: string,
  token: Token,
  nextOffset: number,
  lineContentEnds: number[]
): number {
  const lineEnd = lineContentEnds[token.loc.line - 1] ?? source.length;
  const cappedNext = Math.min(nextOffset, lineEnd);

  if (token.kind === TokenKind.String) {
    let end = token.loc.offset + 1;
    while (end < source.length && source[end] !== '"') {
      end++;
    }
    if (source[end] === '"') {
      end++;
    }
    return Math.min(end - token.loc.offset, lineEnd - token.loc.offset);
  }
  if (token.kind === TokenKind.Comment) {
    return Math.min(cappedNext - token.loc.offset, lineEnd - token.loc.offset);
  }
  let end = cappedNext;
  while (
    end > token.loc.offset &&
    (source[end - 1] === " " || source[end - 1] === "\t")
  ) {
    end--;
  }
  return end - token.loc.offset;
}

function tokenSpans(source: string, tokens: Token[]): TokenSpan[] {
  const lineContentEnds = buildLineContentEnds(source);
  const spans: TokenSpan[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (token.kind === TokenKind.EOF) {
      break;
    }
    const next = tokens[i + 1];
    const length = tokenSourceLength(
      source,
      token,
      next?.loc.offset ?? source.length,
      lineContentEnds
    );
    spans.push({ token, length });
  }
  return spans;
}

function isEndLine(line: TokenSpan[]): boolean {
  const first = line.find(
    (entry) =>
      entry.token.kind !== TokenKind.Comment &&
      entry.token.kind !== TokenKind.Newline
  );
  return first?.token.kind === TokenKind.Keyword && lower(first.token.text) === "end";
}

function firstMeaningful(line: TokenSpan[]): TokenSpan | undefined {
  return line.find(
    (entry) =>
      entry.token.kind !== TokenKind.Comment &&
      entry.token.kind !== TokenKind.Newline
  );
}

function isTriggerHeader(line: TokenSpan[]): boolean {
  const first = firstMeaningful(line);
  return (
    first?.token.kind === TokenKind.Keyword &&
    lower(first.token.text) === "trigger"
  );
}

function isNestedTriggerActionLine(line: TokenSpan[]): boolean {
  const meaningful = line.filter(
    (entry) =>
      entry.token.kind !== TokenKind.Comment &&
      entry.token.kind !== TokenKind.Newline
  );
  return (
    meaningful.length >= 2 &&
    lower(meaningful[0]!.token.text) === "action" &&
    lower(meaningful[1]!.token.text) === "trigger"
  );
}

function classifyTriggerHeader(
  line: TokenSpan[],
  stack: SectionKind[],
  spans: SourceTokenSpan[]
): void {
  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    const word = lower(token.text);
    if (word === "trigger" || KEYWORD_SET.has(word) || TRIGGER_KIND_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
  stack.push("trigger");
}

function classifyRootHeader(
  line: TokenSpan[],
  stack: SectionKind[],
  spans: SourceTokenSpan[]
): void {
  const first = firstMeaningful(line);
  if (!first) {
    return;
  }
  const word = lower(first.token.text);
  if (word === "constants") {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    stack.push("constants");
    return;
  }
  if (word === "variables") {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    stack.push("variables");
    return;
  }
  if (word === "game_options") {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    stack.push("game_options");
    return;
  }
  if (word === "map_object") {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    stack.push("map_object");
    return;
  }
  if (word === "engine_data") {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    stack.push("engine_data");
    return;
  }
  if (word === "trigger") {
    classifyTriggerHeader(line, stack, spans);
    return;
  }
  if (KEYWORD_SET.has(word)) {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    stack.push("generic");
  }
}

function classifyTriggerLine(
  line: TokenSpan[],
  stack: SectionKind[],
  spans: SourceTokenSpan[]
): void {
  let sawAction = false;
  let sawCondition = false;
  let sawIf = false;
  let opcodeAssigned = false;

  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (token.kind === TokenKind.String) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }

    const word = lower(token.text);
    if (token.kind === TokenKind.Keyword || token.kind === TokenKind.Identifier) {
      if (word === "action") {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        sawAction = true;
        opcodeAssigned = false;
        continue;
      }
      if (word === "condition") {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        sawCondition = true;
        opcodeAssigned = false;
        continue;
      }
      if (word === "if" && firstMeaningful(line) === entry) {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Condition);
        sawIf = true;
        opcodeAssigned = true;
        continue;
      }
      if (word === "and" || word === "or") {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        sawCondition = true;
        opcodeAssigned = false;
        continue;
      }
      if (word === "end") {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        continue;
      }
      if (sawAction && word === "trigger" && !opcodeAssigned) {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        opcodeAssigned = true;
        continue;
      }
      if (
        !opcodeAssigned &&
        ((sawAction && ACTION_SET.has(word)) ||
          (sawCondition && CONDITION_SET.has(word)) ||
          (sawIf && CONDITION_SET.has(word)))
      ) {
        pushSpan(
          spans,
          token,
          length,
          sawAction ? MegaloSyntaxItemType.Action : MegaloSyntaxItemType.Condition
        );
        opcodeAssigned = true;
        continue;
      }
      if (
        BUILTIN_GLOBAL_SET.has(word) ||
        KEYWORD_SET.has(word) ||
        TRIGGER_KIND_SET.has(word)
      ) {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        continue;
      }
      if (word.startsWith("option_")) {
        pushSpan(spans, token, length, MegaloSyntaxItemType.GameOption);
        continue;
      }
      pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
      continue;
    }

    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }

  if (isNestedTriggerActionLine(line)) {
    stack.push("trigger");
  }
}

function classifyGameOptionsLine(
  line: TokenSpan[],
  stack: SectionKind[],
  spans: SourceTokenSpan[]
): void {
  const first = firstMeaningful(line);
  if (!first) {
    return;
  }
  const firstWord = lower(first.token.text);

  if (firstWord === "option" || firstWord === "ranged_option") {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    const name = line.find(
      (entry, index) =>
        index > 0 &&
        entry.token.kind === TokenKind.Identifier &&
        entry !== first
    );
    if (name) {
      pushSpan(spans, name.token, name.length, MegaloSyntaxItemType.GameOption);
    }
    stack.push("game_option");
    return;
  }

  if (firstWord === "player_traits") {
    pushSpan(spans, first.token, first.length, MegaloSyntaxItemType.Keyword);
    stack.push("player_traits");
    return;
  }

  if (firstWord === "override") {
    for (const entry of line) {
      const { token, length } = entry;
      if (token.kind === TokenKind.Comment) {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
        continue;
      }
      if (token.kind === TokenKind.Newline) {
        continue;
      }
      const word = lower(token.text);
      if (word === "override") {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        continue;
      }
      if (
        token.kind === TokenKind.Identifier ||
        token.kind === TokenKind.Keyword
      ) {
        if (OVERRIDE_SET.has(word)) {
          pushSpan(spans, token, length, MegaloSyntaxItemType.OverrideOption);
        } else {
          pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
        }
        continue;
      }
      if (token.kind === TokenKind.Number) {
        pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
        continue;
      }
      if (token.kind === TokenKind.String) {
        pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      }
    }
    return;
  }

  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    const word = lower(token.text);
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (token.kind === TokenKind.String) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }
    if (KEYWORD_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    if (word.startsWith("option_")) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.GameOption);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
}

function classifyGameOptionBodyLine(line: TokenSpan[], spans: SourceTokenSpan[]): void {
  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    const word = lower(token.text);
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (token.kind === TokenKind.String) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }
    if (KEYWORD_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    if (word.startsWith("option_")) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.GameOption);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
}

function classifyPlayerTraitsLine(
  line: TokenSpan[],
  stack: SectionKind[],
  spans: SourceTokenSpan[],
  firstLine: boolean
): void {
  if (firstLine) {
    const name = firstMeaningful(line);
    if (name && name.token.kind === TokenKind.Identifier) {
      pushSpan(spans, name.token, name.length, MegaloSyntaxItemType.GameOption);
    }
    return;
  }

  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (token.kind === TokenKind.String) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }
    const word = lower(token.text);
    if (word.startsWith("traits_")) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    if (KEYWORD_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
}

function classifyConstantsLine(line: TokenSpan[], spans: SourceTokenSpan[]): void {
  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    const word = lower(token.text);
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (VARIABLE_TYPE_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.VariableType);
      continue;
    }
    if (word === "end") {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    if (
      token.kind === TokenKind.Identifier ||
      token.kind === TokenKind.Keyword
    ) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.NumericConstant);
    }
  }
}

function classifyVariablesLine(line: TokenSpan[], spans: SourceTokenSpan[]): void {
  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    const word = lower(token.text);
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (VARIABLE_TYPE_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.VariableType);
      continue;
    }
    if (word === "end" || KEYWORD_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
}

function classifyMapObjectLine(line: TokenSpan[], spans: SourceTokenSpan[]): void {
  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    const word = lower(token.text);
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (token.kind === TokenKind.String) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }
    if (word === "end" || KEYWORD_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    if (MAP_OBJECT_PROPERTY_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.MapObjectProperty);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
}

function classifyEngineDataLine(line: TokenSpan[], spans: SourceTokenSpan[]): void {
  let fieldAssigned = false;

  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (token.kind === TokenKind.String) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }

    const word = lower(token.text);
    if (!fieldAssigned && ENGINE_DATA_FIELDS.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      fieldAssigned = true;
      continue;
    }
    if (fieldAssigned) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }
    if (word === "end" || KEYWORD_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
}

function classifyGenericLine(line: TokenSpan[], spans: SourceTokenSpan[]): void {
  for (const entry of line) {
    const { token, length } = entry;
    if (token.kind === TokenKind.Comment) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Comment);
      continue;
    }
    if (token.kind === TokenKind.Newline) {
      continue;
    }
    const word = lower(token.text);
    if (token.kind === TokenKind.Number) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Number);
      continue;
    }
    if (token.kind === TokenKind.String) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.String);
      continue;
    }
    if (word === "end" || KEYWORD_SET.has(word)) {
      pushSpan(spans, token, length, MegaloSyntaxItemType.Keyword);
      continue;
    }
    pushSpan(spans, token, length, MegaloSyntaxItemType.Identifier);
  }
}

function classifyLine(
  line: TokenSpan[],
  stack: SectionKind[],
  spans: SourceTokenSpan[],
  playerTraitsFirstLine: boolean
): boolean {
  if (line.length === 0) {
    return playerTraitsFirstLine;
  }

  if (isEndLine(line)) {
    for (const entry of line) {
      if (entry.token.kind === TokenKind.Comment) {
        pushSpan(spans, entry.token, entry.length, MegaloSyntaxItemType.Comment);
      } else if (entry.token.kind !== TokenKind.Newline) {
        pushSpan(spans, entry.token, entry.length, MegaloSyntaxItemType.Keyword);
      }
    }
    if (stack.length > 0) {
      stack.pop();
    }
    return false;
  }

  if (isTriggerHeader(line)) {
    classifyTriggerHeader(line, stack, spans);
    return false;
  }

  const section = stack.length === 0 ? "root" : stack[stack.length - 1]!;

  if (section === "root") {
    classifyRootHeader(line, stack, spans);
    for (const entry of line) {
      if (
        entry.token.kind === TokenKind.Comment &&
        entry !== firstMeaningful(line)
      ) {
        pushSpan(spans, entry.token, entry.length, MegaloSyntaxItemType.Comment);
      }
    }
    return false;
  }

  switch (section) {
    case "trigger":
      classifyTriggerLine(line, stack, spans);
      return false;
    case "game_options":
      classifyGameOptionsLine(line, stack, spans);
      return false;
    case "game_option":
      classifyGameOptionBodyLine(line, spans);
      return false;
    case "player_traits":
      classifyPlayerTraitsLine(line, stack, spans, playerTraitsFirstLine);
      return false;
    case "constants":
      classifyConstantsLine(line, spans);
      return false;
    case "variables":
      classifyVariablesLine(line, spans);
      return false;
    case "map_object":
      classifyMapObjectLine(line, spans);
      return false;
    case "engine_data":
      classifyEngineDataLine(line, spans);
      return false;
    default:
      classifyGenericLine(line, spans);
      return false;
  }
}

/** Classify Megalo source into positioned syntax items for editor highlighting. */
export function classifySourceTokens(source: string): SourceTokenSpan[] {
  let tokens: Token[];
  try {
    tokens = lex(source);
  } catch {
    return [];
  }

  const spans: SourceTokenSpan[] = [];
  const stack: SectionKind[] = [];
  let line: TokenSpan[] = [];
  let playerTraitsFirstLine = false;

  const flush = (): void => {
    if (stack[stack.length - 1] === "player_traits") {
      playerTraitsFirstLine = classifyLine(
        line,
        stack,
        spans,
        playerTraitsFirstLine
      );
    } else {
      classifyLine(line, stack, spans, false);
      playerTraitsFirstLine = false;
    }
    line = [];
  };

  for (const entry of tokenSpans(source, tokens)) {
    if (entry.token.kind === TokenKind.Newline) {
      flush();
      continue;
    }
    line.push(entry);
  }
  if (line.length > 0) {
    flush();
  }

  annotateLineChars(source, spans);
  return validateSpans(source, spans);
}
