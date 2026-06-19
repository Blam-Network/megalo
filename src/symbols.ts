import type { c_string_table } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";

import type { MegaloConstant, MegaloStringTableSection } from "./ast";
import { MegaloError } from "./error";

/** Bidirectional string table with stable index assignment. */
export class StringTable {
  private readonly indexToName = new Map<number, string>();
  private readonly nameToIndex = new Map<string, number>();
  private readonly indexToLiteral = new Map<number, string>();
  private nextIndex = 0;

  /** Reach script strings use 1-based wire indices with a compact language row. */
  static forReachCompile(): StringTable {
    const st = new StringTable();
    st.nextIndex = 1;
    return st;
  }

  literalValue(index: number): string | undefined {
    return this.indexToLiteral.get(index);
  }

  usedIndices(): number[] {
    const indices = new Set<number>();
    for (const index of this.indexToName.keys()) {
      indices.add(index);
    }
    for (const index of this.indexToLiteral.keys()) {
      indices.add(index);
    }
    return [...indices].sort((a, b) => a - b);
  }

  static fromScriptStrings(table: c_string_table): StringTable {
    const st = new StringTable();
    const englishRow = table.strings[0] ?? [];
    for (let i = 0; i < englishRow.length; i++) {
      const cell = englishRow[i];
      if (typeof cell === "string" && cell.length > 0) {
        st.assign(i, cell);
      }
    }
    return st;
  }

  /** Build from decompiled symbol order (index → Megalo identifier). */
  static fromSymbolOrder(symbols: string[]): StringTable {
    const st = new StringTable();
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      if (symbol) {
        st.assign(i, symbol);
      }
    }
    return st;
  }

  intern(name: string): number {
    const existing = this.nameToIndex.get(name);
    if (existing !== undefined) {
      return existing;
    }
    const index = this.nextIndex++;
    this.nameToIndex.set(name, index);
    this.indexToName.set(index, name);
    return index;
  }

  /** Register an inline string literal for dynamic-string actions. */
  internLiteral(value: string): number {
    for (const [index, literal] of this.indexToLiteral) {
      if (literal === value) {
        return index;
      }
    }
    const index = this.intern(`string_${this.nextIndex}`);
    this.indexToLiteral.set(index, value);
    return index;
  }

  /** Overlay inline literal text onto a compiled `c_string_table`. */
  applyLiteralsTo(table: c_string_table): void {
    if (this.indexToLiteral.size === 0) {
      return;
    }
    const rows = table.strings[0] ?? [];
    table.strings[0] = rows;
    for (const [index, literal] of this.indexToLiteral) {
      while (rows.length <= index) {
        rows.push(null);
      }
      rows[index] = literal;
    }
  }

  /** Resolved display text for a string index (literal or symbol name). */
  textAt(index: number): string {
    return this.indexToLiteral.get(index) ?? this.lookup(index);
  }

  lookup(index: number): string {
    return this.indexToName.get(index) ?? `string_${index}`;
  }

  lookupName(name: string): number | undefined {
    return this.nameToIndex.get(name);
  }

  /** Preserve exact indices when rebuilding string table. */
  assign(index: number, name: string): void {
    this.indexToName.set(index, name);
    this.nameToIndex.set(name, index);
    this.nextIndex = Math.max(this.nextIndex, index + 1);
  }

  entries(): [number, string][] {
    return [...this.indexToName.entries()].sort((a, b) => a[0] - b[0]);
  }

  maxIndex(): number {
    let max = -1;
    for (const index of this.indexToName.keys()) {
      max = Math.max(max, index);
    }
    return max;
  }
}

export interface VariableSlot {
  scope: "global" | "team" | "player" | "object";
  type: "number" | "timer" | "object" | "team" | "player";
  storage: "networked" | "local";
  name: string;
  index: number;
}

export class VariableTable {
  private readonly slots: VariableSlot[] = [];
  private readonly nameKey = new Map<string, VariableSlot>();

  private static key(
    scope: VariableSlot["scope"],
    type: VariableSlot["type"],
    index: number
  ): string {
    return `${scope}:${type}:${index}`;
  }

  register(slot: VariableSlot): void {
    this.slots.push(slot);
    this.nameKey.set(slot.name, slot);
  }

  findByName(name: string): VariableSlot | undefined {
    return this.nameKey.get(name);
  }

  findByIndex(
    scope: VariableSlot["scope"],
    type: VariableSlot["type"],
    index: number
  ): VariableSlot | undefined {
    return this.slots.find(
      (s) => s.scope === scope && s.type === type && s.index === index
    );
  }

  all(): VariableSlot[] {
    return [...this.slots];
  }
}

export class ConstantTable {
  private readonly numbers = new Map<string, number>();
  private readonly timers = new Map<string, number>();

  register(constant: MegaloConstant): void {
    if (constant.type === "number") {
      this.numbers.set(constant.name, constant.value);
      return;
    }
    this.timers.set(constant.name, constant.value);
  }

  lookupNumber(name: string): number | undefined {
    return this.numbers.get(name);
  }

  lookupTimer(name: string): number | undefined {
    return this.timers.get(name);
  }
}

export class CompileContext {
  constructor(
    readonly strings: StringTable,
    readonly variables: VariableTable,
    readonly constants: ConstantTable = new ConstantTable(),
    readonly mapObjectFilters: ReadonlyMap<string, number> = new Map(),
    readonly optionIndexByName: ReadonlyMap<string, number> = new Map(),
    readonly widgetIndexByName: ReadonlyMap<string, number> = new Map(),
    readonly stringSections: MegaloStringTableSection[] = []
  ) {}

  internStringSymbol(symbol: string): number {
    const existing = this.strings.lookupName(symbol);
    if (existing !== undefined) {
      return existing;
    }
    for (const section of this.stringSections) {
      if (section.entries.some((entry) => entry.symbol === symbol)) {
        return this.strings.intern(symbol);
      }
    }
    throw new MegaloError(`Unknown string symbol '${symbol}'`);
  }

  mapObjectFilterIndex(name: string): number | undefined {
    const index = this.mapObjectFilters.get(name);
    return index === undefined ? undefined : index;
  }

  widgetIndex(name: string): number | undefined {
    return this.widgetIndexByName.get(name);
  }
}

import type { MapObjectSymbol } from "./decompiler/map_objects";

export class DecompileContext {
  constructor(
    readonly strings: StringTable,
    readonly variables: VariableTable,
    readonly optionNames: string[] = [],
    readonly mapObjectSymbols: (MapObjectSymbol | undefined)[] = []
  ) {}

  optionName(index: number | undefined): string {
    if (index === undefined || index < 0) {
      return "option_unknown";
    }
    return this.optionNames[index] ?? `option_${index}`;
  }

  mapObjectName(index: number): string {
    if (index < 0) {
      return "general";
    }
    return this.mapObjectSymbols[index]?.name ?? `map_object_${index}`;
  }
}
