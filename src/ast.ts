/** Megalo expression — symbolic operand in conditions/actions. */
export type MegaloExpr =
  | { kind: "identifier"; name: string }
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "bool"; value: boolean }
  | { kind: "member"; base: MegaloExpr; member: string }
  | { kind: "grenade_count_setting"; value: number };

export interface MegaloCondition {
  /** Source keyword after `condition`, e.g. `if`, `team_is_active`. */
  keyword: string;
  operands: MegaloExpr[];
  negated: boolean;
  unionOr: boolean;
  unionGroup: number;
  executeBeforeAction: number;
}

export interface MegaloAction {
  /** Opcode name, e.g. `set`, `for_each`. */
  opcode: string;
  operands: MegaloExpr[];
}

export interface MegaloTrigger {
  name: string;
  /** `general`, `player`, `team`, `initialization`, etc. */
  kind: string;
  /** Object filter label for `for_each_object_with_label` triggers. */
  objectFilter?: string;
  conditions: MegaloStatement[];
  actions: MegaloStatement[];
}

export type MegaloStatement =
  | { type: "condition"; condition: MegaloCondition }
  | { type: "action"; action: MegaloAction }
  | { type: "trigger"; trigger: MegaloTrigger };

export interface MegaloConstant {
  type: "number" | "timer";
  name: string;
  value: number;
}

export interface MegaloVariable {
  scope: "global" | "team" | "player" | "object";
  storage: "networked" | "local";
  type: "number" | "timer" | "object" | "team" | "player";
  name: string;
  initial?: MegaloExpr;
}

export interface MegaloTeam {
  name: string;
  model?: string;
  designator?: string;
  color?: [number, number, number];
  fireteamCount?: number;
}

export interface MegaloMapObject {
  filterName: string;
  label: string;
  type?: string;
  min?: number;
}

export interface MegaloEngineData {
  name: string;
  description: string;
  icon?: string;
  category?: string;
}

export interface MegaloHudWidget {
  kind: string;
  position: string;
  name?: string;
}

export interface MegaloGameOptionValue {
  value: number;
  /** Symbolic constant value (e.g. `k_mongoose`) when not a numeric literal. */
  valueSymbol?: string;
  name?: string;
  description?: string;
}

export interface MegaloGameOption {
  kind: "option" | "ranged_option" | "override";
  name: string;
  description?: string;
  defaultValue?: number;
  /** Symbolic default (e.g. `k_mongoose`) when not a numeric literal. */
  defaultValueSymbol?: string;
  values?: MegaloGameOptionValue[];
  rangeMin?: number;
  rangeMax?: number;
  rangeDefault?: number;
  /** For override statements: keyword + value tokens */
  overrideKeyword?: string;
  overrideValue?: MegaloExpr;
  /** Multi-operand overrides (e.g. `override loadout_palette spartan_tier1 objective_loadouts`). */
  overrideOperands?: MegaloExpr[];
  /** Nested trait fields for `override base_player_traits` blocks. */
  overrideFields?: { key: string; value: MegaloExpr }[];
}

export interface MegaloPlayerTraits {
  name?: string;
  description?: string;
  fields: { key: string; value: MegaloExpr }[];
}

export interface MegaloStatistic {
  kind: "number" | "timer" | "rating";
  name: string;
  text?: string;
  team?: string;
  format?: number;
}

export interface MegaloStringTableEntry {
  symbol: string;
  value: string;
  line?: number;
  column?: number;
  offset?: number;
  length?: number;
}

export interface MegaloStringTableSection {
  type: "string_table";
  language: string;
  entries: MegaloStringTableEntry[];
}

export type MegaloSection =
  | { type: "include"; path: string }
  | { type: "comment"; text: string }
  | MegaloStringTableSection
  | { type: "constants"; items: MegaloConstant[] }
  | { type: "engine_data"; data: MegaloEngineData }
  | { type: "teams"; teams: MegaloTeam[] }
  | { type: "map_permissions"; defaultValue: boolean; exceptions: string[] }
  | { type: "map_object"; objects: MegaloMapObject[] }
  | { type: "variables"; scope: MegaloVariable["scope"]; items: MegaloVariable[] }
  | { type: "hud_widgets"; widgets: MegaloHudWidget[] }
  | { type: "game_options"; options: MegaloGameOption[]; traits: MegaloPlayerTraits[] }
  | { type: "statistics"; items: MegaloStatistic[] }
  | { type: "trigger"; trigger: MegaloTrigger };

/** Binary trigger slot mirroring `c_trigger` layout for round-trip. */
export interface MegaloTriggerBinding {
  name: string;
  kind: string;
  executionMode: string;
  objectFilterIndex: number;
  objectFilter?: string;
  /** Nested `action for_each` target triggers. */
  subroutine?: boolean;
  firstCondition: number;
  conditionCount: number;
  firstAction: number;
  actionCount: number;
}

/** Full decompiled Megalo program. */
export interface MegaloProgram {
  sections: MegaloSection[];
  /** Flat script arrays mirroring binary layout for deterministic ordering. */
  flatConditions: MegaloCondition[];
  flatActions: MegaloAction[];
  /** Full trigger table in binary order (includes subroutines). */
  triggerTable: MegaloTriggerBinding[];
  /** Index-ordered script string symbols (`m_script_strings` row keys). */
  stringSymbolOrder?: string[];
  /** Engine-level special trigger index bindings */
  specialTriggers: {
    initialization: number;
    localInitialization: number;
    hostMigration: number;
    doubleMigration: number;
    objectDeathEvent: number;
    local: number;
    pregame: number;
  };
  /** Encoding metadata required for byte-identical output */
  encodingVersion: number;
  buildNumber: number;
}
