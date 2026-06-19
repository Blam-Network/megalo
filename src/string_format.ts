/** Escape a Megalo string literal for source emission. */
export function formatMegaloStringLiteral(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const escaped = normalized
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\r\\n");
  return `"${escaped}"`;
}

/** Unescape a Megalo string literal from source text. */
export function unescapeMegaloStringLiteral(raw: string): string {
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "\\" && i + 1 < raw.length) {
      const next = raw[i + 1]!;
      if (next === "\\") {
        result += "\\";
        i++;
      } else if (next === '"') {
        result += '"';
        i++;
      } else if (next === "r" && raw[i + 2] === "\\" && raw[i + 3] === "n") {
        result += "\r\n";
        i += 3;
      } else if (next === "n") {
        result += "\n";
        i++;
      } else if (next === "r") {
        result += "\r";
        i++;
      } else if (next === "t") {
        result += "\t";
        i++;
      } else {
        result += next;
        i++;
      }
      continue;
    }
    result += raw[i];
  }
  return result;
}
