import type { SourceLocation } from "./tokens";

export interface ParseWarning {
  message: string;
  line: number;
  column: number;
  offset?: number;
  length?: number;
}

export class ParseWarnings {
  readonly items: ParseWarning[] = [];

  push(message: string, loc?: SourceLocation): void {
    this.items.push({
      message,
      line: loc?.line ?? 1,
      column: loc?.column ?? 1,
      ...(loc?.offset !== undefined ? { offset: loc.offset } : {}),
      ...(loc?.length !== undefined && loc.length > 0 ? { length: loc.length } : {}),
    });
  }

  pushEof(message: string, loc: SourceLocation): void {
    if (loc.offset > 0) {
      this.push(message, {
        line: loc.line,
        column: Math.max(1, loc.column - 1),
        offset: loc.offset - 1,
        length: 1,
      });
      return;
    }
    this.push(message, { ...loc, length: 1 });
  }
}
