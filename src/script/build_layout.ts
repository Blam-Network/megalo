import type {
  MegaloAction,
  MegaloCondition,
  MegaloProgram,
  MegaloSection,
  MegaloTrigger,
  MegaloTriggerBinding,
} from "../ast";
import { MEGALO_TRIGGER_KINDS } from "../vocabulary";

const TRIGGER_KIND_SET = new Set(
  MEGALO_TRIGGER_KINDS.map((name) => name.toLowerCase())
);

const SPECIAL_TRIGGER_FIELDS: Record<
  string,
  keyof MegaloProgram["specialTriggers"]
> = {
  initialization: "initialization",
  local_initialization: "localInitialization",
  host_migration: "hostMigration",
  object_death: "objectDeathEvent",
  local: "local",
  pregame: "pregame",
};

const EXECUTION_MODE_KINDS = new Set(["general", "player", "team", "object"]);

export interface ScriptLayout {
  flatConditions: MegaloCondition[];
  flatActions: MegaloAction[];
  triggerTable: MegaloTriggerBinding[];
  specialTriggers: MegaloProgram["specialTriggers"];
}

interface RegisteredTrigger {
  trigger: MegaloTrigger;
  subroutine: boolean;
}

function buildMapObjectFilterIndex(
  sections: MegaloSection[]
): Map<string, number> {
  const map = new Map<string, number>();
  let index = 0;
  for (const section of sections) {
    if (section.type !== "map_object") {
      continue;
    }
    for (const obj of section.objects) {
      map.set(obj.filterName, index);
      if (obj.label) {
        map.set(obj.label, index);
      }
      index++;
    }
  }
  return map;
}

function resolveFilterIndex(
  filterIndexByName: Map<string, number>,
  name: string
): number {
  return filterIndexByName.get(name) ?? -1;
}

function bindingExecutionMode(trigger: MegaloTrigger): string {
  if (trigger.objectFilter) {
    return "object";
  }
  if (EXECUTION_MODE_KINDS.has(trigger.kind)) {
    return trigger.kind;
  }
  return "general";
}

function createBinding(
  trigger: MegaloTrigger,
  index: number,
  subroutine: boolean,
  filterIndexByName: Map<string, number>
): MegaloTriggerBinding {
  const objectFilter = trigger.objectFilter;
  const objectFilterIndex = objectFilter
    ? resolveFilterIndex(filterIndexByName, objectFilter)
    : -1;

  return {
    name: `trigger_${index}`,
    kind: objectFilter ?? trigger.kind,
    executionMode: bindingExecutionMode(trigger),
    objectFilterIndex,
    objectFilter,
    firstCondition: 0,
    conditionCount: 0,
    firstAction: 0,
    actionCount: 0,
    subroutine,
  };
}

/** Register triggers in final table order (subroutines immediately after their parent slot). */
function registerTriggers(
  trigger: MegaloTrigger,
  subroutine: boolean,
  registered: RegisteredTrigger[],
  triggerIndex: Map<MegaloTrigger, number>
): number {
  const index = registered.length;
  registered.push({ trigger, subroutine });
  triggerIndex.set(trigger, index);

  for (const stmt of trigger.actions) {
    if (stmt.type === "trigger") {
      registerTriggers(stmt.trigger, true, registered, triggerIndex);
    }
  }

  return index;
}

/** Append one trigger's slice to the flat script pools. */
function layoutTriggerSlice(
  trigger: MegaloTrigger,
  binding: MegaloTriggerBinding,
  layout: ScriptLayout,
  triggerIndex: Map<MegaloTrigger, number>
): void {
  binding.firstCondition = layout.flatConditions.length;
  for (const stmt of trigger.conditions) {
    if (stmt.type === "condition") {
      layout.flatConditions.push(stmt.condition);
    }
  }
  binding.conditionCount =
    layout.flatConditions.length - binding.firstCondition;

  binding.firstAction = layout.flatActions.length;
  for (const stmt of trigger.actions) {
    if (stmt.type === "condition") {
      layout.flatConditions.push(stmt.condition);
    } else if (stmt.type === "action") {
      layout.flatActions.push(stmt.action);
    } else if (stmt.type === "trigger") {
      const nestedIndex = triggerIndex.get(stmt.trigger);
      if (nestedIndex === undefined) {
        continue;
      }
      layout.flatActions.push({
        opcode: "for_each",
        operands: [{ kind: "number", value: nestedIndex }],
      });
    }
  }
  binding.actionCount = layout.flatActions.length - binding.firstAction;
}

/** Rebuild flat script arrays and trigger metadata from parsed sections. */
export function buildScriptLayout(sections: MegaloSection[]): ScriptLayout {
  const layout: ScriptLayout = {
    flatConditions: [],
    flatActions: [],
    triggerTable: [],
    specialTriggers: {
      initialization: 0,
      localInitialization: 0,
      hostMigration: 0,
      doubleMigration: 0,
      objectDeathEvent: 0,
      local: 0,
      pregame: 0,
    },
  };

  const filterIndexByName = buildMapObjectFilterIndex(sections);
  const registered: RegisteredTrigger[] = [];
  const triggerIndex = new Map<MegaloTrigger, number>();

  for (const section of sections) {
    if (section.type !== "trigger") {
      continue;
    }
    const index = registerTriggers(section.trigger, false, registered, triggerIndex);
    const specialField = SPECIAL_TRIGGER_FIELDS[section.trigger.kind];
    if (specialField) {
      layout.specialTriggers[specialField] = index;
    }
  }

  for (let i = 0; i < registered.length; i++) {
    const { trigger, subroutine } = registered[i]!;
    const binding = createBinding(trigger, i, subroutine, filterIndexByName);
    layout.triggerTable.push(binding);
    layoutTriggerSlice(trigger, binding, layout, triggerIndex);
  }

  return layout;
}

/** Normalize trigger header keyword from source identifier. */
export function normalizeTriggerHeader(name: string): {
  kind: string;
  objectFilter?: string;
} {
  const lower = name.toLowerCase();
  if (TRIGGER_KIND_SET.has(lower)) {
    return { kind: lower };
  }
  return { kind: "object", objectFilter: name };
}
