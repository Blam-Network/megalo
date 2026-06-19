import type { MegaloExpr } from "./ast";
import { MegaloError } from "./error";
import { TokenKind, type Token } from "./tokens";

export class TokenStream {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  peek(offset = 0): Token {
    return this.tokens[this.index + offset] ?? this.tokens.at(-1)!;
  }

  advance(): Token {
    const token = this.peek();
    if (token.kind !== TokenKind.EOF) {
      this.index++;
    }
    return token;
  }

  atEnd(): boolean {
    return this.peek().kind === TokenKind.EOF;
  }

  match(kind: TokenKind, text?: string): boolean {
    const token = this.peek();
    if (token.kind !== kind) {
      return false;
    }
    if (text !== undefined && token.text !== text) {
      return false;
    }
    this.advance();
    return true;
  }

  expect(kind: TokenKind, text?: string): Token {
    const token = this.peek();
    if (token.kind !== kind || (text !== undefined && token.text !== text)) {
      throw new MegaloError(
        `Expected ${text ?? kind} at line ${token.loc.line}, got ${token.text}`,
        token.loc
      );
    }
    return this.advance();
  }

  /** Accept reserved words used as names (e.g. `trigger player`, `variables object`). */
  expectIdentifierOrKeyword(): Token {
    const token = this.peek();
    if (
      token.kind !== TokenKind.Identifier &&
      token.kind !== TokenKind.Keyword
    ) {
      throw new MegaloError(
        `Expected identifier at line ${token.loc.line}, got ${token.text}`,
        token.loc
      );
    }
    return this.advance();
  }

  skipNewlines(): void {
    while (this.peek().kind === TokenKind.Newline) {
      this.advance();
    }
  }

  /** Advance past the current statement line (comment, blank, or tokens until newline). */
  skipLine(): void {
    if (this.atEnd()) {
      return;
    }
    if (this.peek().kind === TokenKind.Newline) {
      this.advance();
      return;
    }
    while (
      !this.atEnd() &&
      this.peek().kind !== TokenKind.Newline &&
      this.peek().kind !== TokenKind.EOF
    ) {
      this.advance();
    }
    this.skipNewlines();
  }
}

export function parseExprTokens(tokens: Token[]): MegaloExpr {
  if (tokens.length === 0) {
    throw new MegaloError("Empty expression", tokens[0]?.loc);
  }
  let expr: MegaloExpr = tokenToExpr(tokens[0]!);
  let i = 1;
  while (i < tokens.length) {
    if (tokens[i]?.text === ".") {
      const member = tokens[i + 1];
      if (
        !member ||
        (member.kind !== TokenKind.Identifier &&
          member.kind !== TokenKind.Keyword)
      ) {
        throw new MegaloError(
          "Expected member after '.'",
          tokens[i]?.loc ?? tokens[0]!.loc
        );
      }
      expr = { kind: "member", base: expr, member: member.text };
      i += 2;
      continue;
    }
    throw new MegaloError(
      `Unexpected token '${tokens[i]?.text}' in expression`,
      tokens[i]!.loc
    );
  }
  return expr;
}

function tokenToExpr(token: Token): MegaloExpr {
  if (token.kind === TokenKind.Number) {
    return { kind: "number", value: Number(token.text) };
  }
  if (token.kind === TokenKind.String) {
    return { kind: "string", value: token.text };
  }
  if (token.kind === TokenKind.Keyword && token.text === "true") {
    return { kind: "bool", value: true };
  }
  if (token.kind === TokenKind.Keyword && token.text === "false") {
    return { kind: "bool", value: false };
  }
  if (token.kind === TokenKind.Identifier || token.kind === TokenKind.Keyword) {
    return { kind: "identifier", name: token.text };
  }
  throw new MegaloError(`Invalid expression token '${token.text}'`, token.loc);
}

export function collectLineTokens(stream: TokenStream): Token[] {
  const line: Token[] = [];
  while (
    !stream.atEnd() &&
    stream.peek().kind !== TokenKind.Newline &&
    stream.peek().kind !== TokenKind.EOF
  ) {
    const token = stream.advance();
    if (token.kind === TokenKind.Comment) {
      break;
    }
    line.push(token);
  }
  stream.skipNewlines();
  return line;
}

export function lineTokensAfterKeyword(
  line: Token[],
  keyword: string
): Token[] {
  if (line[0]?.text !== keyword) {
    throw new MegaloError(
      `Expected '${keyword}' at start of line`,
      line[0]?.loc
    );
  }
  return line.slice(1);
}

/** Split a line into one token group per operand (member access stays grouped). */
export function splitOperandTokens(tokens: Token[]): Token[][] {
  const parts: Token[][] = [];
  let i = 0;
  while (i < tokens.length) {
    const part: Token[] = [tokens[i]!];
    i++;
    while (i < tokens.length && tokens[i]?.text === ".") {
      part.push(tokens[i]!);
      i++;
      if (i < tokens.length) {
        part.push(tokens[i]!);
        i++;
      }
    }
    parts.push(part);
  }
  return parts;
}
