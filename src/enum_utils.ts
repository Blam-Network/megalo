/** Resolve a numeric enum value to its string key name. */
export function enumValueName(
  enumObj: Record<string, string | number>,
  value: string | number | undefined
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  for (const [key, v] of Object.entries(enumObj)) {
    if (typeof v === "number" && v === value) {
      return key;
    }
  }
  return undefined;
}
