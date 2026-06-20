/** Docs bundle stub — no @blamnetwork/blf dependency. */

export const MEGALO_MATH_OP_SYMBOLS: string[] = [
  "+",
  "-",
  "*",
  "/",
  "=",
  "%",
  "&",
  "|",
  "^",
  "~",
  "<<",
  ">>",
];

export const MEGALO_COMPARISON_OP_SYMBOLS: string[] = [
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",
];

export const MEGALO_OPERATOR_LEXEMES: string[] = [
  "==",
  "!=",
  "<=",
  ">=",
  "<<",
  ">>",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "=",
  "&",
  "|",
  "^",
  "~",
];

export const MATH_OP_SPLIT_TOKENS: string[] = [
  ...MEGALO_MATH_OP_SYMBOLS,
  "add",
  "subtract",
  "multiply_by",
  "divide_by",
  "set_to",
  "modulo_by",
  "multiply",
  "divide",
  "modulo",
];

export function comparisonToSymbol(): string {
  return "==";
}

export function mathOpToSymbol(): string {
  return "=";
}

export function parseComparisonName(name: string): string {
  return name;
}

export function parseMathOpName(name: string): string {
  return name;
}

export function isEqualComparison(): boolean {
  return true;
}
