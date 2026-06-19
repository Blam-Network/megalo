import { join } from "node:path";

const blfFixtures = join(import.meta.dirname, "../../../blf/blf-ts/tests/fixtures");

/** Reach MCC hopper gametype (3nvasion DLC). */
export const reach_mcc_3nvasion_dlc_fixture = join(
  blfFixtures,
  "3nvasion_dlc_054.bin"
);
