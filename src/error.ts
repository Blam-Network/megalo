import type { MegaloAction, MegaloCondition } from "./ast";
import type { SourceLocation } from "./tokens";

export class MegaloError extends Error {
  readonly loc?: SourceLocation;
  readonly actionIndex?: number;
  readonly conditionIndex?: number;
  readonly actionOpcode?: string;

  constructor(
    message: string,
    loc?: SourceLocation,
    meta?: {
      actionIndex?: number;
      conditionIndex?: number;
      actionOpcode?: string;
    }
  ) {
    super(message);
    this.name = "MegaloError";
    this.loc = loc;
    this.actionIndex = meta?.actionIndex;
    this.conditionIndex = meta?.conditionIndex;
    this.actionOpcode = meta?.actionOpcode;
  }
}

export function attachActionContextToError(
  error: unknown,
  action: MegaloAction,
  actionIndex: number
): unknown {
  if (error instanceof MegaloError && error.loc) {
    return error;
  }
  if (error instanceof MegaloError) {
    return new MegaloError(error.message, error.loc, {
      actionIndex: error.actionIndex ?? actionIndex,
      conditionIndex: error.conditionIndex,
      actionOpcode: error.actionOpcode ?? action.opcode,
    });
  }
  return new MegaloError(
    error instanceof Error ? error.message : String(error),
    undefined,
    { actionIndex, actionOpcode: action.opcode }
  );
}

export function attachConditionContextToError(
  error: unknown,
  condition: MegaloCondition,
  conditionIndex: number
): unknown {
  if (error instanceof MegaloError && error.loc) {
    return error;
  }
  if (error instanceof MegaloError) {
    return new MegaloError(error.message, error.loc, {
      actionIndex: error.actionIndex,
      conditionIndex: error.conditionIndex ?? conditionIndex,
      actionOpcode: error.actionOpcode,
    });
  }
  return new MegaloError(
    error instanceof Error ? error.message : String(error),
    undefined,
    { conditionIndex }
  );
}

function lineFromMessage(message: string): number | undefined {
  const match = /(?:at )?line (\d+)/i.exec(message);
  return match ? Number(match[1]) : undefined;
}

/** Normalize parser/compiler errors into 1-based source locations for IDEs. */
export function megaloErrorLocation(error: unknown): {
  message: string;
  line: number;
  column: number;
  offset?: number;
  length?: number;
} {
  if (error instanceof MegaloError) {
    return {
      message: error.message,
      line: error.loc?.line ?? lineFromMessage(error.message) ?? 1,
      column: error.loc?.column ?? 1,
      offset: error.loc?.offset,
      length: error.loc?.length,
    };
  }
  const message = error instanceof Error ? error.message : String(error);
  return {
    message,
    line: lineFromMessage(message) ?? 1,
    column: 1,
  };
}
