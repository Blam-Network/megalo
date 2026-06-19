import type { MegaloDialect } from "./types";
import {
  decompileCustomVariant,
  decompileGameVariant,
} from "../decompiler/from_variant";
import {
  compileCustomVariant,
  compileGameVariant,
} from "../compiler/to_variant";

export const mccDialect: MegaloDialect = {
  id: "mcc",
  label: "Halo Reach MCC",
  decompileGameVariant,
  compileGameVariant,
  decompileCustomVariant,
  compileCustomVariant,
};
