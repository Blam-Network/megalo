import type { MegaloDialect, MegaloDialectId } from "./types";
import { mccDialect } from "./mcc";
import { tu1Dialect } from "./tu1";

export function getDialect(id: MegaloDialectId): MegaloDialect {
  switch (id) {
    case "tu1":
      return tu1Dialect;
    case "mcc":
    default:
      return mccDialect;
  }
}
