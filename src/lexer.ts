import { MegaloError } from "./error";
import { MEGALO_OPERATOR_LEXEMES } from "./operators";
import { unescapeMegaloStringLiteral } from "./string_format";
import { MEGALO_KEYWORDS, type SourceLocation, TokenKind, type Token } from "./tokens";

function locAt(source: string, offset: number): SourceLocation {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset; i++) {
    if (source[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column, offset };
}

export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const push = (
    kind: TokenKind,
    text: string,
    start: number,
    end: number = start + text.length
  ): void => {
    tokens.push({
      kind,
      text,
      loc: { ...locAt(source, start), length: end - start },
    });
  };

  while (i < source.length) {
    const start = i;
    const ch = source[i];

    if (ch === "\r") {
      i++;
      if (source[i] === "\n") {
        i++;
      }
      push(TokenKind.Newline, "\n", start, i);
      continue;
    }
    if (ch === "\n") {
      i++;
      push(TokenKind.Newline, "\n", start, i);
      continue;
    }
    if (ch === " " || ch === "\t") {
      i++;
      continue;
    }
    if (ch === ";") {
      while (i < source.length && source[i] !== "\n" && source[i] !== "\r") {
        i++;
      }
      push(TokenKind.Comment, source.slice(start, i), start, i);
      continue;
    }
    if (ch === '"') {
      i++;
      let raw = "";
      while (i < source.length && source[i] !== '"') {
        raw += source[i]!;
        i++;
      }
      if (source[i] !== '"') {
        throw new MegaloError(
          `Unterminated string at line ${locAt(source, start).line}`,
          { ...locAt(source, start), length: i - start }
        );
      }
      i++;
      push(TokenKind.String, unescapeMegaloStringLiteral(raw), start, i);
      continue;
    }
    if (
      (ch === "-" || ch === "+") &&
      i + 1 < source.length &&
      source[i + 1]! >= "0" &&
      source[i + 1]! <= "9"
    ) {
      let text = ch;
      i++;
      while (i < source.length && /[0-9.]/.test(source[i]!)) {
        text += source[i];
        i++;
      }
      push(TokenKind.Number, text, start, i);
      continue;
    }
    if (ch >= "0" && ch <= "9") {
      let text = "";
      while (i < source.length && /[0-9.-]/.test(source[i]!)) {
        text += source[i];
        i++;
      }
      push(TokenKind.Number, text, start, i);
      continue;
    }
    if (ch === ".") {
      i++;
      push(TokenKind.Identifier, ".", start, i);
      continue;
    }
    const operator = lexOperator(source, i);
    if (operator) {
      push(TokenKind.Identifier, operator, start, start + operator.length);
      i = start + operator.length;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let text = "";
      while (i < source.length && /[a-zA-Z0-9_]/.test(source[i]!)) {
        text += source[i];
        i++;
      }
      const kind = MEGALO_KEYWORDS.has(text)
        ? TokenKind.Keyword
        : TokenKind.Identifier;
      push(kind, text, start, i);
      continue;
    }
    throw new MegaloError(
      `Unexpected character '${ch}' at line ${locAt(source, start).line}`,
      { ...locAt(source, start), length: 1 }
    );
  }

  tokens.push({
    kind: TokenKind.EOF,
    text: "",
    loc: locAt(source, source.length),
  });
  return tokens;
}

function lexOperator(source: string, index: number): string | null {
  const ch = source[index]!;
  if ((ch === "+" || ch === "-") && index + 1 < source.length) {
    const next = source[index + 1]!;
    if (next >= "0" && next <= "9") {
      return null;
    }
  }
  for (const operator of MEGALO_OPERATOR_LEXEMES) {
    if (source.startsWith(operator, index)) {
      return operator;
    }
  }
  return null;
}
