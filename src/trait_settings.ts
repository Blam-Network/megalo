/** Megalo source `1`/`true` maps to wire value `2` for on/off trait toggles. */
export function encodeTraitToggleSetting(value: number): number {
  if (value === 1) {
    return 2;
  }
  return value;
}

/** Decompile wire value `2` back to Megalo `1`. */
export function decodeTraitToggleSetting(value: number): number {
  if (value === 2) {
    return 1;
  }
  return value;
}

export function traitToggleIsEnabled(value: number): boolean {
  return value === 2;
}
