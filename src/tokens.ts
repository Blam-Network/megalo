export enum TokenKind {
  EOF = "EOF",
  Newline = "Newline",
  Comment = "Comment",
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  Keyword = "Keyword",
  Semicolon = "Semicolon",
}

export interface SourceLocation {
  line: number;
  column: number;
  offset: number;
  /** Length of the highlighted span in source characters. */
  length?: number;
}

export interface Token {
  kind: TokenKind;
  text: string;
  loc: SourceLocation;
}

export const MEGALO_KEYWORDS = new Set([
  "action",
  "and",
  "begin",
  "category",
  "color",
  "condition",
  "constants",
  "default",
  "description",
  "designator",
  "end",
  "engine_data",
  "exception",
  "false",
  "game_options",
  "hud_widgets",
  "icon",
  "if",
  "include",
  "label",
  "local",
  "map_object",
  "map_permissions",
  "model",
  "name",
  "networked",
  "none",
  "number",
  "object",
  "option",
  "or",
  "override",
  "player",
  "player_traits",
  "ranged_option",
  "statistics",
  "game_stats",
  "team",
  "teams",
  "timer",
  "trigger",
  "true",
  "string_table",
  "variables",
  "temporary",
]);
