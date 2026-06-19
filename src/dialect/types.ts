import type {
  c_game_engine_custom_variant,
  c_game_variant,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { MegaloProgram } from "../ast";

export interface MegaloDialect {
  readonly id: string;
  readonly label: string;
  decompileGameVariant(variant: c_game_variant): MegaloProgram;
  compileGameVariant(program: MegaloProgram, base?: c_game_variant): c_game_variant;
  decompileCustomVariant(variant: c_game_engine_custom_variant): MegaloProgram;
  compileCustomVariant(
    program: MegaloProgram,
    base?: c_game_engine_custom_variant
  ): c_game_engine_custom_variant;
}

export type MegaloDialectId = "mcc" | "tu1";
