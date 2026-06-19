import { MEGACROW_VERSION } from "../version";
import type { MegaloProgram, MegaloSection, MegaloGameOption } from "../ast";
import { CONSTANTS_PLACEHOLDER_NOTE } from "./constants";
import {
  formatActionLine,
  formatConditionLine,
} from "../references/emit_lines";
import { formatMegaloStringLiteral } from "../string_format";
import { formatGrenadeCountSetting } from "../grenade_count_setting";
function indent(level: number): string {
  return "\t".repeat(level);
}

function emitTriggerBody(
  trigger: import("../ast").MegaloTrigger,
  level: number,
  lines: string[]
): void {
  for (const stmt of trigger.conditions) {
    if (stmt.type === "condition") {
      lines.push(`${indent(level)}${formatConditionLine(stmt.condition)}`);
    }
  }
  for (const stmt of trigger.actions) {
    if (stmt.type === "condition") {
      lines.push(`${indent(level)}${formatConditionLine(stmt.condition)}`);
    } else if (stmt.type === "action") {
      lines.push(`${indent(level)}${formatActionLine(stmt.action)}`);
    } else if (stmt.type === "trigger") {
      const target = stmt.trigger.kind;
      lines.push(`${indent(level)}action for_each ${target}`);
      emitTriggerBody(stmt.trigger, level + 1, lines);
      lines.push(`${indent(level)}end`);
    }
  }
}

function emitSection(section: MegaloSection, lines: string[]): void {
  switch (section.type) {
    case "comment":
      lines.push(`; ${section.text}`);
      return;
    case "include":
      lines.push(`include "${section.path}"`);
      return;
    case "string_table": {
      lines.push(`string_table ${section.language}`);
      for (const entry of section.entries) {
        lines.push(
          `\t${entry.symbol} ${formatMegaloStringLiteral(entry.value)}`
        );
      }
      lines.push("end");
      return;
    }
    case "engine_data": {      lines.push("engine_data");
      lines.push(`\tname ${section.data.name}`);
      lines.push(`\tdescription ${section.data.description}`);
      if (section.data.icon !== undefined) {
        lines.push(`\ticon ${section.data.icon}`);
      }
      if (section.data.category !== undefined) {
        lines.push(`\tcategory ${section.data.category}`);
      }
      lines.push("end");
      return;
    }
    case "map_permissions": {
      lines.push("map_permissions");
      lines.push(`\tdefault ${section.defaultValue ? "true" : "false"}`);
      for (const exception of section.exceptions) {
        lines.push(`\texception ${exception}`);
      }
      lines.push("end");
      return;
    }
    case "map_object": {
      for (const obj of section.objects) {
        lines.push(`map_object ${obj.filterName}`);
        if (obj.type) {
          lines.push(`\ttype "${obj.type}"`);
        } else {
          lines.push(`\tlabel "${obj.label}"`);
        }
        if (obj.min !== undefined && obj.min > 0) {
          lines.push(`\tmin ${obj.min}`);
        }
        lines.push("end");
      }
      return;
    }
    case "teams": {
      lines.push("teams");
      const sharedModel = section.teams[0]?.model;
      if (sharedModel === "by_designator") {
        lines.push("\tmodel by_designator");
      }
      for (const team of section.teams) {
        lines.push("\tteam");
        if (team.fireteamCount !== undefined) {
          lines.push(`\t\tfireteam_count ${team.fireteamCount}`);
        }
        if (team.name) {
          lines.push(`\t\tname ${team.name}`);
        }
        if (team.model && team.model !== "by_designator") {
          lines.push(`\t\tmodel ${team.model}`);
        }
        if (team.designator) {
          lines.push(`\t\tdesignator ${team.designator}`);
        }
        if (team.color) {
          lines.push(
            `\t\tcolor ${team.color[0]} ${team.color[1]} ${team.color[2]}`
          );
        }
        lines.push("\tend");
      }
      lines.push("end");
      return;
    }
    case "constants": {
      lines.push("constants");
      if (section.items.length === 0) {
        lines.push(`\t; ${CONSTANTS_PLACEHOLDER_NOTE}`);
      } else {
        for (const item of section.items) {
          lines.push(`\t${item.type} ${item.name} ${item.value}`);
        }
      }
      lines.push("end");
      return;
    }
    case "variables": {
      lines.push(`variables ${section.scope}`);
      for (const variable of section.items) {
        const storage =
          variable.storage !== "networked" ? `${variable.storage} ` : "";
        const initial = variable.initial
          ? ` ${formatExpr(variable.initial)}`
          : "";
        lines.push(
          `\t${storage}${variable.type} ${variable.name}${initial}`
        );
      }
      lines.push("end");
      return;
    }
    case "game_options": {
      lines.push("game_options");
      for (const option of section.options) {
        emitGameOption(option, lines);
      }
      for (const traits of section.traits) {
        lines.push(`\tplayer_traits ${traits.name ?? "traits"}`);
        for (const field of traits.fields) {
          lines.push(`\t\t${field.key} ${formatExpr(field.value)}`);
        }
        lines.push("\tend");
      }
      lines.push("end");
      return;
    }
    case "hud_widgets": {
      lines.push("hud_widgets");
      for (const widget of section.widgets) {
        lines.push(`\t${widget.kind} ${widget.position}`);
      }
      lines.push("end");
      return;
    }
    case "statistics": {
      lines.push("game_stats");
      for (const stat of section.items) {
        lines.push(
          `\t${stat.name} ${stat.kind} ${stat.text ?? "none"} ${stat.team ?? "none"} ${stat.format ?? 0}`
        );
      }
      lines.push("end");
      return;
    }
    case "trigger": {
      const header = section.trigger.objectFilter
        ? section.trigger.objectFilter
        : section.trigger.kind;
      lines.push(`trigger ${header}`);
      emitTriggerBody(section.trigger, 1, lines);
      lines.push("end");
      return;
    }
    default:
      return;
  }
}

function formatExpr(
  expr: import("../ast").MegaloExpr
): string {
  switch (expr.kind) {
    case "identifier":
      return expr.name;
    case "number":
      return String(expr.value);
    case "string":
      return formatMegaloStringLiteral(expr.value);
    case "bool":
      return expr.value ? "true" : "false";
    case "member":
      return `${formatExpr(expr.base)}.${expr.member}`;
    case "grenade_count_setting":
      return formatGrenadeCountSetting(expr);
  }
}

function isStringsBannerSection(section: MegaloSection): boolean {
  return section.type === "comment" && /STRINGS/i.test(section.text);
}

function isTriggersBannerSection(section: MegaloSection): boolean {
  return section.type === "comment" && /TRIGGERS/i.test(section.text);
}

function isStringsBlockSection(section: MegaloSection): boolean {
  return (
    section.type === "string_table" ||
    (section.type === "comment" &&
      (/STRINGS/i.test(section.text) || /^\*+$/.test(section.text.trim())))
  );
}

function isTriggersBlockSection(section: MegaloSection): boolean {
  return (
    section.type === "trigger" ||
    (section.type === "comment" &&
      (/TRIGGERS/i.test(section.text) || /^\*+$/.test(section.text.trim())))
  );
}

function findSectionBlock(
  sections: MegaloSection[],
  startIndex: number,
  isBlockSection: (section: MegaloSection) => boolean,
  contentType: "string_table" | "trigger"
): { start: number; end: number } | null {
  const current = sections[startIndex];
  if (!current || !isBlockSection(current)) {
    return null;
  }

  let start = startIndex;
  while (start > 0 && isBlockSection(sections[start - 1]!)) {
    start--;
  }

  let end = start;
  while (end < sections.length && isBlockSection(sections[end]!)) {
    end++;
  }

  if (!sections.slice(start, end).some((section) => section.type === contentType)) {
    return null;
  }

  return { start, end };
}

function emitRegion(name: string, lines: string[]): void {
  lines.push(`;#region ${name}`);
}

function emitRegionEnd(lines: string[]): void {
  lines.push(";#endregion");
}

function appendBlankLineBetween(
  lines: string[],
  previous: MegaloSection | undefined,
  current: MegaloSection
): void {
  if (!previous) {
    return;
  }
  if (previous.type === "comment" && current.type === "comment") {
    return;
  }
  lines.push("");
}

function emitGameOption(option: MegaloGameOption, lines: string[]): void {
  if (option.kind === "override") {
    const keyword = option.overrideKeyword ?? "override";
    if (option.overrideFields) {
      if (keyword === "hide") {
        lines.push(`\thide override ${option.name}`);
      } else {
        lines.push(`\t${keyword} ${option.name}`);
      }
      for (const field of option.overrideFields) {
        lines.push(`\t\t${field.key} ${formatExpr(field.value)}`);
      }
      lines.push("\tend");
      return;
    }
    if (option.overrideOperands) {
      const operands = option.overrideOperands.map(formatExpr).join(" ");
      if (keyword === "lock") {
        lines.push(`\tlock override ${option.name} ${operands}`);
      } else if (keyword === "hide") {
        lines.push(`\thide override ${option.name} ${operands}`);
      } else {
        lines.push(`\toverride ${option.name} ${operands}`);
      }
      return;
    }
    const value = option.overrideValue
      ? formatExpr(option.overrideValue)
      : "true";
    if (keyword === "lock") {
      lines.push(`\tlock override ${option.name} ${value}`);
    } else if (keyword === "hide") {
      lines.push(`\thide override ${option.name} ${value}`);
    } else {
      lines.push(`\toverride ${option.name} ${value}`);
    }
    return;
  }

  const hide = option.overrideKeyword === "hide";
  const prefix = hide ? "hide " : "";

  if (option.kind === "ranged_option") {
    if (hide) {
      if (option.description === "") {
        lines.push(`\t${prefix}ranged_option ${option.name}`);
        lines.push('\t\t""');
        lines.push('\t\t""');
        lines.push(`\t\t${option.rangeDefault ?? 0}`);
        lines.push(`\t\t${option.rangeMin ?? 0}`);
        lines.push(`\t\t${option.rangeMax ?? 0}`);
        lines.push("\tend");
        return;
      }
      lines.push(
        `\t${prefix}ranged_option ${option.name} ${option.description ?? `${option.name}_text`} "" ${option.rangeDefault ?? 0} ${option.rangeMin ?? 0} ${option.rangeMax ?? 0} end`
      );
      return;
    }
    lines.push(`\tranged_option ${option.name}`);
    lines.push(`\t\t${option.rangeDefault ?? 0}`);
    if (option.rangeMin !== undefined) {
      lines.push(`\t\t${option.rangeMin}`);
    }
    if (option.rangeMax !== undefined) {
      lines.push(`\t\t${option.rangeMax}`);
    }
    lines.push("\tend");
    return;
  }

  lines.push(`\t${prefix}option ${option.name}`);
  lines.push(`\t\toption_name_${option.name}`);
  lines.push(`\t\toption_description_${option.name}`);
  if (option.defaultValueSymbol !== undefined) {
    lines.push(`\t\t${option.defaultValueSymbol}`);
  } else if (option.defaultValue !== undefined) {
    lines.push(`\t\t${option.defaultValue}`);
  }
  for (const value of option.values ?? []) {
    const label = value.name ?? String(value.value);
    const rendered = value.valueSymbol ?? String(value.value);
    lines.push(`\t\t${rendered} ${label} ""`);
  }
  lines.push("\tend");
}

export function formatDecompileHeader(options?: {
  fileName?: string;
  editorVersion?: string;
}): string {
  const version = options?.editorVersion ?? MEGACROW_VERSION;
  const base = options?.fileName
    ? `; Decompiled Megalo script: ${options.fileName}`
    : "; Decompiled Megalo script";
  return [
    `${base} by MegaCrow ${version}`,
    "; Note: decompiled output is missing original constants, variable names, and includes.",
  ].join("\n");
}

/** Emit Megalo source text from a decompiled program. */
export function emitSource(
  program: MegaloProgram,
  options?: { fileName?: string; editorVersion?: string }
): string {
  const lines: string[] = [formatDecompileHeader(options), ""];
  const sections = program.sections;
  let previous: MegaloSection | undefined;

  for (let i = 0; i < sections.length; ) {
    const stringsBlock = findSectionBlock(
      sections,
      i,
      isStringsBlockSection,
      "string_table"
    );
    if (
      stringsBlock &&
      (sections[i]!.type === "string_table" || isStringsBannerSection(sections[i]!))
    ) {
      appendBlankLineBetween(lines, previous, sections[stringsBlock.start]!);
      emitRegion("STRINGS", lines);
      for (let j = stringsBlock.start; j < stringsBlock.end; j++) {
        emitSection(sections[j]!, lines);
      }
      emitRegionEnd(lines);
      previous = sections[stringsBlock.end - 1];
      i = stringsBlock.end;
      continue;
    }

    const triggersBlock = findSectionBlock(
      sections,
      i,
      isTriggersBlockSection,
      "trigger"
    );
    if (
      triggersBlock &&
      (sections[i]!.type === "trigger" || isTriggersBannerSection(sections[i]!))
    ) {
      appendBlankLineBetween(lines, previous, sections[triggersBlock.start]!);
      emitRegion("TRIGGERS", lines);
      for (let j = triggersBlock.start; j < triggersBlock.end; j++) {
        emitSection(sections[j]!, lines);
      }
      emitRegionEnd(lines);
      previous = sections[triggersBlock.end - 1];
      i = triggersBlock.end;
      continue;
    }

    const section = sections[i]!;
    appendBlankLineBetween(lines, previous, section);
    emitSection(section, lines);
    previous = section;
    i++;
  }

  return `${lines.join("\n").trim()}\n`;
}
