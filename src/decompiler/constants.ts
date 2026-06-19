import type { MegaloSection } from "../ast";

export const CONSTANTS_PLACEHOLDER_NOTE =
  "Numeric constants cannot be recovered from a compiled gametype — define them here.";

/** Placeholder `constants` block for decompiled output (values are not recoverable from binary). */
export function decompileConstantsPlaceholderSections(): MegaloSection[] {
  return [
    { type: "constants", items: [] },
  ];
}
