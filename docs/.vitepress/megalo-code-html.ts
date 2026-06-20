import {
  classifySourceTokens,
  MegaloSyntaxItemType,
  type SourceTokenSpan,
} from "../../src/highlight";
import {
  MEGALO_DEFAULT_CLASS,
  MEGALO_TOKEN_CLASS,
} from "./megalo-edit-colors";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lineBreakOffsets(source: string): number[] {
  const breaks = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") {
      breaks.push(i + 1);
    } else if (source[i] === "\r") {
      if (source[i + 1] === "\n") {
        breaks.push(i + 2);
        i++;
      } else {
        breaks.push(i + 1);
      }
    }
  }
  return breaks;
}

function spansForLine(
  lineStart: number,
  lineEnd: number,
  spans: SourceTokenSpan[]
): SourceTokenSpan[] {
  return spans
    .filter((span) => span.offset < lineEnd && span.offset + span.length > lineStart)
    .map((span) => ({
      ...span,
      offset: Math.max(span.offset, lineStart),
      length:
        Math.min(span.offset + span.length, lineEnd) -
        Math.max(span.offset, lineStart),
    }))
    .filter((span) => span.length > 0);
}

function spanClass(type: MegaloSyntaxItemType): string {
  return MEGALO_TOKEN_CLASS[type] ?? MEGALO_DEFAULT_CLASS;
}

function renderLine(
  source: string,
  lineStart: number,
  lineEnd: number,
  spans: SourceTokenSpan[]
): string {
  const lineSpans = spansForLine(lineStart, lineEnd, spans);
  if (lineSpans.length === 0) {
    const text = source.slice(lineStart, lineEnd);
    return text.length === 0
      ? "<wbr>"
      : `<span class="${MEGALO_DEFAULT_CLASS}">${escapeHtml(text)}</span>`;
  }

  let cursor = lineStart;
  let html = "";

  for (const span of lineSpans) {
    if (span.offset > cursor) {
      html += `<span class="${MEGALO_DEFAULT_CLASS}">${escapeHtml(source.slice(cursor, span.offset))}</span>`;
    }
    const text = source.slice(span.offset, span.offset + span.length);
    html += `<span class="${spanClass(span.type)}">${escapeHtml(text)}</span>`;
    cursor = span.offset + span.length;
  }

  if (cursor < lineEnd) {
    html += `<span class="${MEGALO_DEFAULT_CLASS}">${escapeHtml(source.slice(cursor, lineEnd))}</span>`;
  }

  return html.length === 0 ? "<wbr>" : html;
}

/** Context-aware Megalo highlighting using MegaloEdit color roles. */
export function megaloCodeToHtml(source: string): string {
  const normalized = source.replace(/\r\n/g, "\n").trimEnd();
  const spans = classifySourceTokens(normalized);
  const lineStarts = lineBreakOffsets(normalized);
  const lines: string[] = [];

  for (let i = 0; i < lineStarts.length; i++) {
    const lineStart = lineStarts[i]!;
    const lineEnd =
      i + 1 < lineStarts.length ? lineStarts[i + 1]! - 1 : normalized.length;
    lines.push(
      `<span class="line">${renderLine(normalized, lineStart, lineEnd, spans)}</span>`
    );
  }

  return `<pre class="megalo-edit vp-code" tabindex="0"><code>${lines.join("\n")}</code></pre>`;
}
