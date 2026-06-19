import type { MegaloAction, MegaloCondition, MegaloExpr } from "../ast";

export function exprToTokens(expr: MegaloExpr): string[] {
  switch (expr.kind) {
    case "identifier":
      return [expr.name];
    case "number":
      return [String(expr.value)];
    case "string":
      return [`"${expr.value}"`];
    case "bool":
      return [expr.value ? "true" : "false"];
    case "member":
      return [...exprToTokens(expr.base), ".", expr.member];
    case "grenade_count_setting":
      return [String(expr.value)];
  }
}

export function exprToString(expr: MegaloExpr): string {
  return exprToTokens(expr).join("");
}

export function actionOperandStrings(action: MegaloAction): string[] {
  if (action.operands.length === 0) {
    return [];
  }
  if (action.operands.length === 1) {
    return tokenizeOperandLine(exprToString(action.operands[0]!));
  }
  return action.operands.flatMap((op) => exprToTokens(op));
}

export function tokenizeOperandLine(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let i = 0;
  while (i < line.length) {
    const ch = line[i]!;
    if (ch === " " || ch === "\t") {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      i++;
      continue;
    }
    if (ch === ".") {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      tokens.push(".");
      i++;
      continue;
    }
    current += ch;
    i++;
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

export function formatConditionLine(condition: MegaloCondition): string {
  if (condition.keyword === "if") {
    const left = exprToString(condition.operands[0]!);
    const comparison = condition.operands[1]
      ? exprToString(condition.operands[1])
      : "==";
    const right = condition.operands[2]
      ? exprToString(condition.operands[2])
      : "";
    const base = `condition if ${left} ${comparison} ${right}`.trim();
    return condition.unionOr ? `${base} or` : base;
  }
  const args = condition.operands.map(exprToString).join(" ");
  const base = `condition ${condition.keyword} ${args}`.trim();
  return condition.unionOr ? `${base} or` : base;
}

export function formatActionLine(action: MegaloAction): string {
  const args = actionOperandStrings(action).join(" ");
  return `action ${action.opcode}${args.length > 0 ? ` ${args}` : ""}`;
}
