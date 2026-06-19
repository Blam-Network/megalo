import { e_math_operation, e_numeric_comparison } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { enumValueName } from "./enum_utils";

const COMPARISON_TO_SYMBOL: Record<string, string> = {
  less_than: "<",
  greater_than: ">",
  equal_to: "==",
  less_than_or_equal_to: "<=",
  greater_than_or_equal_to: ">=",
  not_equal_to: "!=",
};

const MATH_TO_SYMBOL: Record<string, string> = {
  add: "+",
  subtract: "-",
  multiply_by: "*",
  divide_by: "/",
  set_to: "=",
  modulo_by: "%",
  bitwise_and_with: "&",
  bitwise_or_with: "|",
  bitwise_xor_with: "^",
  bitwise_not_with: "~",
  shift_left_with: "<<",
  shift_right_with: ">>",
};

/** Short names used in official Reach `.txt` scripts (e.g. `multiply 60`). */
const MATH_OP_ALIASES: Record<string, string> = {
  multiply: "multiply_by",
  divide: "divide_by",
  modulo: "modulo_by",
};

const SYMBOL_TO_COMPARISON = invert(COMPARISON_TO_SYMBOL);
const SYMBOL_TO_MATH = invert(MATH_TO_SYMBOL);

function invert(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, symbol] of Object.entries(map)) {
    out[symbol] = name;
  }
  return out;
}

/** Display/source form for a numeric comparison enum value. */
export function comparisonToSymbol(comparison: e_numeric_comparison): string {
  const name = enumValueName(e_numeric_comparison, comparison) ?? "equal_to";
  return COMPARISON_TO_SYMBOL[name] ?? name;
}

/** Display/source form for a math operation enum value. */
export function mathOpToSymbol(operation: e_math_operation): string {
  const name = enumValueName(e_math_operation, operation) ?? "set_to";
  return MATH_TO_SYMBOL[name] ?? name;
}

/** Normalize a comparison token (symbol or legacy enum name) to an enum key. */
export function parseComparisonName(name: string): string {
  return SYMBOL_TO_COMPARISON[name] ?? name;
}

/** Normalize a math token (symbol, alias, or legacy enum name) to an enum key. */
export function parseMathOpName(name: string): string {
  return SYMBOL_TO_MATH[name] ?? MATH_OP_ALIASES[name] ?? name;
}

export function isEqualComparison(name: string): boolean {
  return parseComparisonName(name) === "equal_to";
}

/** Tokens that split `action set` operands (symbols plus legacy names). */
export const MATH_OP_SPLIT_TOKENS: string[] = [
  ...Object.values(MATH_TO_SYMBOL),
  ...Object.keys(MATH_TO_SYMBOL),
  ...Object.keys(MATH_OP_ALIASES),
];

/** Math operator symbols for highlighting and completion. */
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

/** Comparison operator symbols for highlighting and completion. */
export const MEGALO_COMPARISON_OP_SYMBOLS: string[] = [
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",
];

/** Multi-character operators recognized by the lexer (longest first). */
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
