import { MEGALO_KEYWORDS } from "./tokens";

export function escapeReservedIdentifier(value: string): string {
  if (MEGALO_KEYWORDS.has(value)) {
    return `_${value}`;
  }
  return value;
}

export function sanitizeIdentifier(value: string): string {
  let id = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  if (id && /^[0-9]/.test(id)) {
    id = `_${id}`;
  }

  return id;
}

/** Megalo HUD/message symbol derived from display text. */
export function sanitizeMessageName(message: string): string {
  if (!message) {
    return "message_unknown";
  }
  const id = sanitizeIdentifier(message.split(/\r?\n/)[0]!.trim()).slice(0, 48);
  return id || "message_unknown";
}
