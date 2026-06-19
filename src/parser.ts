import type {
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
  MegaloStringTableEntry,
  MegaloStringTableSection,
  MegaloTeam,
  MegaloTrigger,
  MegaloVariable,
} from "./ast";
import { MegaloError } from "./error";
import { lex } from "./lexer";
import {
  assertNoDuplicateStringTableSymbols,
  deriveSymbolOrderFromStringSections,
  mergeStringTableSections,
} from "./compiler/string_table";
import {
  collectLineTokens,
  lineTokensAfterKeyword,
  parseExprTokens,
  splitOperandTokens,
  TokenStream,
} from "./parse_utils";
import { TokenKind, type Token } from "./tokens";
import { MATH_OP_SPLIT_TOKENS } from "./operators";
import {
  buildScriptLayout,
  normalizeTriggerHeader,
} from "./script/build_layout";
import {
  parseGrenadeCountSettingTokens,
} from "./grenade_count_setting";
import {
  ParseWarnings,
  type ParseWarning,
} from "./parse_warnings";

export function parse(source: string): MegaloProgram {
  const { program } = parseWithWarnings(source);
  assertNoDuplicateStringTableSymbols(program);
  return program;
}

export function parseWithWarnings(source: string): {
  program: MegaloProgram;
  warnings: ParseWarning[];
} {
  const warnings = new ParseWarnings();
  const program = parseProgram(source, warnings);
  return { program, warnings: warnings.items };
}

function parseProgram(source: string, warnings: ParseWarnings): MegaloProgram {
  const stream = new TokenStream(lex(source));
  const sections: MegaloSection[] = [];

  stream.skipNewlines();
  while (!stream.atEnd()) {
  if (stream.peek().kind === TokenKind.Comment) {
      sections.push({ type: "comment", text: stream.advance().text });
      stream.skipNewlines();
      continue;
    }
    if (stream.match(TokenKind.Keyword, "include")) {
      const pathToken = stream.expect(TokenKind.String);
      sections.push({ type: "include", path: pathToken.text });
      stream.skipNewlines();
      continue;
    }
    if (stream.match(TokenKind.Keyword, "string_table")) {
      sections.push(parseStringTable(stream, warnings));
      continue;
    }
    if (stream.match(TokenKind.Keyword, "constants")) {
      sections.push({
        type: "constants",
        items: parseConstants(stream, warnings),
      });
      continue;
    }
    if (stream.match(TokenKind.Keyword, "engine_data")) {
      sections.push({
        type: "engine_data",
        data: parseEngineData(stream, warnings),
      });
      continue;
    }
    if (stream.match(TokenKind.Keyword, "teams")) {
      sections.push({ type: "teams", teams: parseTeams(stream, warnings) });
      continue;
    }
    if (stream.match(TokenKind.Keyword, "map_permissions")) {
      sections.push({
        type: "map_permissions",
        ...parseMapPermissions(stream, warnings),
      });
      continue;
    }
    if (stream.match(TokenKind.Keyword, "map_object")) {
      sections.push({
        type: "map_object",
        objects: [parseMapObject(stream, warnings)],
      });
      continue;
    }
    if (stream.match(TokenKind.Keyword, "variables")) {
      const scopeToken = stream.expectIdentifierOrKeyword();
      const scope = scopeToken.text as MegaloVariable["scope"];
      if (!["global", "team", "player", "object"].includes(scope)) {
        throw new MegaloError(
          `Invalid variable scope '${scope}'`,
          scopeToken.loc
        );
      }
      sections.push({
        type: "variables",
        scope,
        items: parseVariables(stream, scope, warnings),
      });
      continue;
    }
    if (stream.match(TokenKind.Keyword, "hud_widgets")) {
      sections.push({
        type: "hud_widgets",
        widgets: parseHudWidgets(stream, warnings),
      });
      continue;
    }
    if (stream.match(TokenKind.Keyword, "game_options")) {
      sections.push({
        type: "game_options",
        ...parseGameOptions(stream, warnings),
      });
      continue;
    }
    if (
      stream.match(TokenKind.Keyword, "statistics") ||
      stream.match(TokenKind.Keyword, "game_stats")
    ) {
      skipUntilEnd(stream);
      continue;
    }
    if (stream.match(TokenKind.Keyword, "trigger")) {
      const trigger = parseTrigger(stream, warnings);
      sections.push({ type: "trigger", trigger });
      continue;
    }
    if (stream.peek().kind === TokenKind.Newline) {
      stream.advance();
      continue;
    }
    throw new MegaloError(
      `Unexpected token '${stream.peek().text}' at line ${stream.peek().loc.line}`,
      stream.peek().loc
    );
  }

  const stringSymbolOrder = deriveParsedStringSymbolOrder(sections);
  const script = buildScriptLayout(sections);

  return {
    sections,
    flatConditions: script.flatConditions,
    flatActions: script.flatActions,
    triggerTable: script.triggerTable,
    stringSymbolOrder,
    specialTriggers: script.specialTriggers,
    encodingVersion: 0,
    buildNumber: 0,
  };
}

function parseUntilEnd(
  stream: TokenStream,
  parseItem: () => void,
  warnings: ParseWarnings,
  blockLabel = "block"
): void {
  stream.skipNewlines();
  while (!stream.match(TokenKind.Keyword, "end")) {
    if (stream.atEnd()) {
      warnings.pushEof(
        `Unclosed ${blockLabel} — expected 'end' at end of file`,
        stream.peek().loc
      );
      return;
    }
    parseItem();
    stream.skipNewlines();
  }
}

function parseConstants(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloConstant[] {
  const items: MegaloConstant[] = [];
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line.length === 0) {
      return;
    }
    if (line[0]?.kind === TokenKind.Comment) {
      return;
    }
    const type = line[0]?.text;
    if (type !== "number" && type !== "timer") {
      throw new MegaloError(
        `Expected number or timer in constants`,
        line[0]?.loc
      );
    }
    items.push({
      type,
      name: line[1]!.text,
      value: Number(line[2]!.text),
    });
    },
    warnings,
    "constants"
  );
  return items;
}

function parseEngineData(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloEngineData {
  const data: MegaloEngineData = { name: "", description: "" };
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    const key = line[0]?.text;
    if (key === "name") {
      data.name = line[1]!.text;
    } else if (key === "description") {
      data.description = line[1]!.text;
    } else if (key === "icon") {
      data.icon = line[1]!.text;
    } else if (key === "category") {
      data.category = line[1]!.text;
    }
    },
    warnings,
    "engine_data"
  );
  return data;
}

function parseTeams(stream: TokenStream, warnings: ParseWarnings): MegaloTeam[] {
  const teams: MegaloTeam[] = [];
  parseUntilEnd(
    stream,
    () => {
    if (!stream.match(TokenKind.Keyword, "team")) {
      stream.skipLine();
      return;
    }
    const team: MegaloTeam = { name: "" };
    parseUntilEnd(
      stream,
      () => {
      const line = collectLineTokens(stream);
      const key = line[0]?.text;
      if (key === "name") {
        team.name = line[1]!.text;
      } else if (key === "model") {
        team.model = line[1]!.text;
      } else if (key === "designator") {
        team.designator = line[1]!.text;
      } else if (key === "color") {
        team.color = [
          Number(line[1]!.text),
          Number(line[2]!.text),
          Number(line[3]!.text),
        ];
      }
      },
      warnings,
      "team"
    );
    teams.push(team);
    },
    warnings,
    "teams"
  );
  return teams;
}

function parseMapPermissions(
  stream: TokenStream,
  warnings: ParseWarnings
): {
  defaultValue: boolean;
  exceptions: string[];
} {
  let defaultValue = false;
  const exceptions: string[] = [];
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line[0]?.text === "default") {
      defaultValue = line[1]?.text === "true";
    } else if (line[0]?.text === "exception") {
      exceptions.push(line[1]!.text);
    }
    },
    warnings,
    "map_permissions"
  );
  return { defaultValue, exceptions };
}

function parseMapObject(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloMapObject {
  const obj: MegaloMapObject = { filterName: "", label: "" };
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line[0]?.text === "label") {
      obj.label = line[2]?.kind === TokenKind.String ? line[2].text : line[1]!.text;
      obj.filterName = "map_object";
    }
    },
    warnings,
    "map_object"
  );
  return obj;
}

function parseVariables(
  stream: TokenStream,
  scope: MegaloVariable["scope"],
  warnings: ParseWarnings
): MegaloVariable[] {
  const items: MegaloVariable[] = [];
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line.length === 0 || line[0]?.kind === TokenKind.Comment) {
      return;
    }
    const storage =
      line[0]?.text === "networked" || line[0]?.text === "local"
        ? (line.shift()!.text as MegaloVariable["storage"])
        : "networked";
    const type = line[0]?.text as MegaloVariable["type"];
    if (!["number", "timer", "object", "team", "player"].includes(type)) {
      throw new MegaloError(`Invalid variable type '${type}'`, line[0]?.loc);
    }
    const name = line[1]!.text;
    const initial =
      line.length > 2 ? parseExprTokens(line.slice(2)) : undefined;
    items.push({ scope, storage, type, name, initial });
    },
    warnings,
    "variables"
  );
  return items;
}

function parseHudWidgets(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloHudWidget[] {
  const widgets: MegaloHudWidget[] = [];
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line.length === 0 || line[0]?.kind === TokenKind.Comment) {
      return;
    }
    if (line[0]?.text === "text" || line[0]?.text === "proximity_warning") {
      widgets.push({
        kind: line[0].text,
        name: line[1]?.text,
        position: line[line.length - 1]!.text,
      });
    } else if (line.length < 2) {
      throw new MegaloError(
        `Expected widget position after '${line[0]!.text}'`,
        line[0]!.loc
      );
    } else {
      widgets.push({
        kind: line[0]!.text,
        position: line[1]!.text,
      });
    }
    },
    warnings,
    "hud_widgets"
  );
  return widgets;
}

function parseOverrideOption(line: Token[]): MegaloGameOption {
  const optionName = line[0]!.text;
  const valueTokens = line.slice(1);

  if (optionName === "loadout_palette") {
    const parts = splitOperandTokens(valueTokens);
    if (parts.length !== 2) {
      throw new MegaloError(
        "Expected loadout palette slot and preset after 'override loadout_palette'",
        valueTokens[0]?.loc ?? line[0]!.loc
      );
    }
    return {
      kind: "override",
      name: optionName,
      overrideKeyword: "override",
      overrideOperands: parts.map((part) => parseExprTokens(part)),
    };
  }

  if (valueTokens.length === 0) {
    return {
      kind: "override",
      name: optionName,
      overrideKeyword: "override",
      overrideValue: { kind: "bool", value: true },
    };
  }

  return {
    kind: "override",
    name: optionName,
    overrideKeyword: "override",
    overrideValue: parseExprTokens(valueTokens),
  };
}

function parseTraitFieldValue(key: string, tokens: Token[]): MegaloExpr {
  if (key === "initial_grenades") {
    return parseGrenadeCountSettingTokens(tokens);
  }
  return parseExprTokens(tokens);
}

function parseTraitFieldsUntilEnd(
  stream: TokenStream,
  warnings: ParseWarnings
): { key: string; value: MegaloExpr }[] {
  const fields: { key: string; value: MegaloExpr }[] = [];
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line.length === 0 || line[0]?.kind === TokenKind.Comment) {
      return;
    }
    const key = line[0]!.text;
    fields.push({
      key,
      value: parseTraitFieldValue(key, line.slice(1)),
    });
    },
    warnings,
    "player_traits"
  );
  return fields;
}

function optionValueDescription(token: Token | undefined): string {
  if (!token) {
    return "";
  }
  return token.text;
}

function parseOptionValueLine(line: Token[], option: MegaloGameOption): void {
  if (line.length === 0 || line[0]?.kind === TokenKind.Comment) {
    return;
  }
  const first = line[0]!;

  if (first.kind === TokenKind.Number) {
    const value = Number(first.text);
    if (line.length === 1) {
      if (
        option.defaultValue === undefined &&
        option.defaultValueSymbol === undefined
      ) {
        option.defaultValue = value;
      }
      return;
    }
    option.values!.push({
      value,
      name: line[1]?.text,
      description: optionValueDescription(line[2]),
    });
    return;
  }

  if (
    first.kind === TokenKind.Identifier ||
    first.kind === TokenKind.Keyword
  ) {
    const symbol = first.text;
    if (line.length === 1) {
      if (
        option.defaultValue === undefined &&
        option.defaultValueSymbol === undefined
      ) {
        option.defaultValueSymbol = symbol;
      }
      return;
    }
    option.values!.push({
      value: 0,
      valueSymbol: symbol,
      name: line[1]?.text,
      description: optionValueDescription(line[2]),
    });
  }
}

function parseRangedOptionLine(line: Token[], option: MegaloGameOption): void {
  if (line.length === 0 || line[0]?.kind === TokenKind.Comment) {
    return;
  }
  const first = line[0]!;

  if (first.kind === TokenKind.Number) {
    const value = Number(first.text);
    if (option.rangeDefault === undefined) {
      option.rangeDefault = value;
    } else if (option.rangeMin === undefined) {
      option.rangeMin = value;
    } else {
      option.rangeMax = value;
    }
    return;
  }

  if (first.kind === TokenKind.String) {
    if (option.description === undefined) {
      option.description = first.text;
    }
    return;
  }

  if (first.text?.startsWith("option_name")) {
    option.description = line[1]?.text;
    return;
  }

  if (first.text?.startsWith("option_description")) {
    return;
  }

  if (first.kind === TokenKind.Identifier) {
    option.description = first.text;
    let i = 1;
    if (line[i]?.kind === TokenKind.String && line[i]?.text === "") {
      i++;
    }
    while (i < line.length && line[i]?.kind === TokenKind.Number) {
      const value = Number(line[i]!.text);
      if (option.rangeDefault === undefined) {
        option.rangeDefault = value;
      } else if (option.rangeMin === undefined) {
        option.rangeMin = value;
      } else {
        option.rangeMax = value;
      }
      i++;
    }
  }
}

function parseRangedOption(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloGameOption {
  const name = stream.expect(TokenKind.Identifier).text;
  const option: MegaloGameOption = { kind: "ranged_option", name };

  const headerTail: Token[] = [];
  while (
    !stream.atEnd() &&
    stream.peek().kind !== TokenKind.Newline &&
    stream.peek().kind !== TokenKind.EOF
  ) {
    headerTail.push(stream.advance());
  }
  if (headerTail.length > 0) {
    parseRangedOptionLine(headerTail, option);
    if (
      headerTail.some(
        (token) => token.kind === TokenKind.Keyword && token.text === "end"
      )
    ) {
      return option;
    }
  }

  stream.skipNewlines();
  let closed = false;
  while (!stream.atEnd()) {
    if (stream.match(TokenKind.Keyword, "end")) {
      closed = true;
      break;
    }
    const line = collectLineTokens(stream);
    const hasInlineEnd = line.some(
      (token) => token.kind === TokenKind.Keyword && token.text === "end"
    );
    parseRangedOptionLine(
      line.filter(
        (token) => !(token.kind === TokenKind.Keyword && token.text === "end")
      ),
      option
    );
    if (hasInlineEnd) {
      closed = true;
      break;
    }
    stream.skipNewlines();
  }
  if (!closed && stream.atEnd()) {
    warnings.pushEof(
      `Unclosed ranged_option '${name}' — expected 'end' at end of file`,
      stream.peek().loc
    );
  }
  return option;
}

function parseHideGameOption(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloGameOption {
  if (stream.match(TokenKind.Keyword, "override")) {
    const line = collectLineTokens(stream);
    const optionName = line[0]!.text;
    if (optionName === "base_player_traits") {
      return {
        kind: "override",
        name: optionName,
        overrideKeyword: "hide",
        overrideFields: parseTraitFieldsUntilEnd(stream, warnings),
      };
    }
    const override = parseOverrideOption(line);
    override.overrideKeyword = "hide";
    return override;
  }
  if (!stream.match(TokenKind.Keyword, "option")) {
    if (!stream.match(TokenKind.Keyword, "ranged_option")) {
      throw new MegaloError(
        "Expected 'option' or 'ranged_option' after 'hide'",
        stream.peek().loc
      );
    }
    const option = parseRangedOption(stream, warnings);
    option.overrideKeyword = "hide";
    return option;
  }
  const option = parseDiscreteOption(stream, warnings);
  option.overrideKeyword = "hide";
  return option;
}

function parseGameOptions(
  stream: TokenStream,
  warnings: ParseWarnings
): {
  options: MegaloGameOption[];
  traits: MegaloPlayerTraits[];
} {
  const options: MegaloGameOption[] = [];
  const traits: MegaloPlayerTraits[] = [];
  parseUntilEnd(
    stream,
    () => {
    if (
      stream.peek().kind === TokenKind.Identifier &&
      stream.peek().text === "lock"
    ) {
      stream.advance();
      if (!stream.match(TokenKind.Keyword, "override")) {
        throw new MegaloError(
          "Expected 'override' after 'lock'",
          stream.peek().loc
        );
      }
      const line = collectLineTokens(stream);
      const override = parseOverrideOption(line);
      override.overrideKeyword = "lock";
      options.push(override);
      return;
    }
    if (stream.match(TokenKind.Keyword, "override")) {
      const line = collectLineTokens(stream);
      const optionName = line[0]!.text;
      if (optionName === "base_player_traits") {
        options.push({
          kind: "override",
          name: optionName,
          overrideKeyword: "override",
          overrideFields: parseTraitFieldsUntilEnd(stream, warnings),
        });
        return;
      }
      options.push(parseOverrideOption(line));
      return;
    }
    if (
      stream.peek().kind === TokenKind.Identifier &&
      stream.peek().text === "hide"
    ) {
      stream.advance();
      options.push(parseHideGameOption(stream, warnings));
      return;
    }
    if (stream.match(TokenKind.Keyword, "option")) {
      options.push(parseDiscreteOption(stream, warnings));
      return;
    }
    if (stream.match(TokenKind.Keyword, "ranged_option")) {
      options.push(parseRangedOption(stream, warnings));
      return;
    }
    if (stream.match(TokenKind.Keyword, "player_traits")) {
      traits.push(parsePlayerTraits(stream, warnings));
      return;
    }
    stream.skipLine();
    },
    warnings,
    "game_options"
  );
  return { options, traits };
}

function parseDiscreteOption(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloGameOption {
  const name = stream.expect(TokenKind.Identifier).text;
  const option: MegaloGameOption = {
    kind: "option",
    name,
    values: [],
  };
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line[0]?.text === "option_name") {
      option.description = line[1]?.text;
    } else if (line[0]?.text?.startsWith("option_name")) {
      /* option_name_* */
    } else if (line[0]?.text?.startsWith("option_description")) {
      option.description = line[1]?.text;
    } else {
      parseOptionValueLine(line, option);
    }
    },
    warnings,
    `option '${name}'`
  );
  return option;
}

function parsePlayerTraits(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloPlayerTraits {
  const traits: MegaloPlayerTraits = { fields: [] };
  const headerLine = collectLineTokens(stream);
  if (headerLine[0]) {
    traits.name = headerLine[0].text;
  }
  parseUntilEnd(
    stream,
    () => {
    const line = collectLineTokens(stream);
    if (line.length === 0 || line[0]?.kind === TokenKind.Comment) {
      return;
    }
    const first = line[0]!;
    if (first.text?.startsWith("traits_name")) {
      traits.name = line[1]?.text ?? traitMetadataSuffix(first.text, "traits_name");
      return;
    }
    if (first.text?.startsWith("traits_description")) {
      traits.description =
        line[1]?.text ??
        traitMetadataSuffix(first.text, "traits_description");
      return;
    }
    if (line.length === 1) {
      throw new MegaloError(
        `Expected value after '${first.text}' in player_traits`,
        first.loc
      );
    }
    traits.fields.push({
      key: first.text,
      value: parseTraitFieldValue(first.text, line.slice(1)),
    });
    },
    warnings,
    "player_traits"
  );
  return traits;
}

function traitMetadataSuffix(token: string, prefix: string): string {
  if (token === prefix) {
    return token;
  }
  if (token.startsWith(`${prefix}_`)) {
    return token.slice(prefix.length + 1);
  }
  return token;
}

function parseTrigger(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloTrigger {
  const name = stream.expectIdentifierOrKeyword().text;
  const header = normalizeTriggerHeader(name);
  const trigger: MegaloTrigger = {
    name,
    kind: header.kind,
    objectFilter: header.objectFilter,
    conditions: [],
    actions: [],
  };
  stream.skipNewlines();
  stream.match(TokenKind.Keyword, "begin");
  stream.skipNewlines();
  while (!stream.match(TokenKind.Keyword, "end")) {
    if (stream.atEnd()) {
      warnings.pushEof(
        `Unclosed trigger '${name}' — expected 'end' at end of file`,
        stream.peek().loc
      );
      return trigger;
    }
    if (stream.peek().kind === TokenKind.Comment) {
      stream.advance();
      continue;
    }
    if (
      stream.peek().kind === TokenKind.Keyword &&
      stream.peek().text === "condition"
    ) {
      trigger.conditions.push({
        type: "condition",
        condition: parseCondition(stream),
      });
      continue;
    }
    if (
      stream.peek().kind === TokenKind.Keyword &&
      stream.peek().text === "action"
    ) {
      stream.advance();
      const actionLine = collectLineTokens(stream);
      if (actionLine[0]?.text === "for_each") {
        const nested = parseNestedForEach(stream, actionLine[1]!.text, warnings);
        trigger.actions.push({ type: "trigger", trigger: nested });
        continue;
      }
      trigger.actions.push({
        type: "action",
        action: parseActionFromTokens(actionLine),
      });
      continue;
    }
    stream.skipLine();
  }
  return trigger;
}

function parseNestedForEach(
  stream: TokenStream,
  target: string,
  warnings: ParseWarnings
): MegaloTrigger {
  const header = normalizeTriggerHeader(target);
  const nested: MegaloTrigger = {
    name: `for_each_${target}`,
    kind: header.kind,
    objectFilter: header.objectFilter,
    conditions: [],
    actions: [],
  };
  stream.skipNewlines();
  while (!stream.match(TokenKind.Keyword, "end")) {
    if (stream.atEnd()) {
      warnings.pushEof(
        `Unclosed for_each '${target}' — expected 'end' at end of file`,
        stream.peek().loc
      );
      return nested;
    }
    if (stream.peek().kind === TokenKind.Comment) {
      stream.advance();
      continue;
    }
    if (
      stream.peek().kind === TokenKind.Keyword &&
      stream.peek().text === "condition"
    ) {
      nested.conditions.push({
        type: "condition",
        condition: parseCondition(stream),
      });
    } else if (
      stream.peek().kind === TokenKind.Keyword &&
      stream.peek().text === "action"
    ) {
      stream.advance();
      const line = collectLineTokens(stream);
      if (line[0]?.text === "for_each") {
        const inner = parseNestedForEach(stream, line[1]!.text, warnings);
        nested.actions.push({ type: "trigger", trigger: inner });
      } else {
        nested.actions.push({
          type: "action",
          action: parseActionFromTokens(line),
        });
      }
    } else {
      stream.skipLine();
    }
  }
  return nested;
}

function parseCondition(stream: TokenStream): MegaloCondition {
  stream.expect(TokenKind.Keyword, "condition");
  const line = collectLineTokens(stream);
  const keyword = line[0]!.text;
  const orIndex = line.findIndex((t) => t.text === "or");
  const tokensAfterOr =
    orIndex >= 0
      ? line.slice(orIndex + 1).filter((t) => t.kind !== TokenKind.Comment)
      : [];
  const unionOr = orIndex >= 0 && tokensAfterOr.length === 0;
  let operands: MegaloExpr[];
  if (keyword === "if") {
    const comparisonTokens =
      orIndex >= 0 ? line.slice(1, orIndex) : line.slice(1);
    operands = parseIfOperands(comparisonTokens);
    if (tokensAfterOr.length > 0) {
      operands.push(parseExprTokens(tokensAfterOr));
    }
  } else {
    const operandTokens =
      orIndex >= 0 ? line.slice(1, orIndex) : line.slice(1);
    operands = splitOperandTokens(operandTokens).map((part) =>
      parseExprTokens(part)
    );
  }
  return {
    keyword,
    operands,
    negated: false,
    unionOr,
    unionGroup: 0,
    executeBeforeAction: 0,
  };
}

function parseIfOperands(tokens: Token[]): MegaloExpr[] {
  const parts = splitOperandTokens(tokens);
  if (parts.length >= 3) {
    return parts
      .slice(0, 3)
      .map((part) => parseExprTokens(part));
  }
  return parts.map((part) => parseExprTokens(part));
}

function parseActionFromTokens(tokens: Token[]): MegaloAction {
  const opcode = tokens[0]!.text;
  return {
    opcode,
    operands: parseActionOperands(opcode, tokens.slice(1)),
  };
}

export function parseActionOperands(
  opcode: string,
  tokens: Token[]
): MegaloExpr[] {
  if (tokens.length === 0) {
    return [];
  }
  return splitActionOperands(opcode, tokens).map((part) =>
    parseExprTokens(part)
  );
}

function splitActionOperands(opcode: string, tokens: Token[]): Token[][] {
  if (opcode === "set") {
    return splitAtKeywords(tokens, MATH_OP_SPLIT_TOKENS);
  }
  if (opcode === "set_score") {
    return splitAtKeywords(tokens.slice(0, 1), MATH_OP_SPLIT_TOKENS).concat(
      splitOperandTokens(tokens.slice(1))
    );
  }
  if (opcode === "if") {
    return [tokens];
  }
  return splitOperandTokens(tokens);
}

function splitAtKeywords(tokens: Token[], keywords: string[]): Token[][] {
  const parts: Token[][] = [];
  let current: Token[] = [];
  for (const token of tokens) {
    if (keywords.includes(token.text)) {
      if (current.length > 0) {
        parts.push(current);
        current = [];
      }
      parts.push([token]);
    } else {
      current.push(token);
    }
  }
  if (current.length > 0) {
    parts.push(current);
  }
  return parts;
}

function parseStringTable(
  stream: TokenStream,
  warnings: ParseWarnings
): MegaloStringTableSection {
  const languageToken = stream.expect(TokenKind.Identifier);
  const entries: MegaloStringTableEntry[] = [];

  stream.skipNewlines();
  let closed = false;
  while (!stream.atEnd()) {
    if (stream.match(TokenKind.Keyword, "end")) {
      closed = true;
      stream.skipNewlines();
      break;
    }
    if (stream.peek().kind === TokenKind.Newline) {
      stream.advance();
      continue;
    }
    if (stream.peek().kind === TokenKind.Comment) {
      stream.advance();
      continue;
    }
    const symbolToken = stream.expect(TokenKind.Identifier);
    const valueToken = stream.expect(TokenKind.String);
    const entry: MegaloStringTableEntry = {
      symbol: symbolToken.text,
      value: valueToken.text,
      line: symbolToken.loc.line,
      column: symbolToken.loc.column,
      offset: symbolToken.loc.offset,
      length: symbolToken.loc.length,
    };
    entries.push(entry);
    stream.skipNewlines();
  }
  if (!closed && stream.atEnd()) {
    warnings.pushEof(
      `Unclosed string_table '${languageToken.text}' — expected 'end' at end of file`,
      stream.peek().loc
    );
  }

  return {
    type: "string_table",
    language: languageToken.text,
    entries,
  };
}

function deriveParsedStringSymbolOrder(sections: MegaloSection[]): string[] {
  return deriveSymbolOrderFromStringSections(
    sections.filter(
      (section): section is MegaloStringTableSection =>
        section.type === "string_table"
    )
  );
}

function skipUntilEnd(stream: TokenStream): void {
  stream.skipNewlines();
  while (!stream.atEnd()) {
    if (stream.match(TokenKind.Keyword, "end")) {
      stream.skipNewlines();
      return;
    }
    stream.advance();
  }
}
