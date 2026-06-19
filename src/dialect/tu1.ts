import type { MegaloDialect } from "./types";
import { mccDialect } from "./mcc";

/**
 * TU1 dialect stub — uses MCC codec wiring until TU1-specific
 * action tables and chunk types are wired from haloreach/v12065.
 */
export const tu1Dialect: MegaloDialect = {
  ...mccDialect,
  id: "tu1",
  label: "Halo Reach Xbox 360 TU1 (stub)",
};