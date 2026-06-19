import type { MegaloProgram } from "../ast";
import { c_megalogamengine_map_permissions } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import type { c_game_engine_custom_variant } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { MegaloError } from "../error";

function parseMapIdException(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new MegaloError(`Invalid map id '${value}' — use a numeric map id`);
  }
  return Number(value);
}

function mapPermissionsSection(program: MegaloProgram) {
  return program.sections.find((section) => section.type === "map_permissions");
}

export function compileMapPermissions(
  program: MegaloProgram
): c_megalogamengine_map_permissions | undefined {
  const section = mapPermissionsSection(program);
  if (!section || section.type !== "map_permissions") {
    return undefined;
  }

  const permissions = new c_megalogamengine_map_permissions();
  permissions.m_allow_by_default = section.defaultValue;
  permissions.m_except_map_ids = section.exceptions.map(parseMapIdException);
  return permissions;
}

/** Apply parsed `map_permissions` onto a custom variant when present in source. */
export function applyMapPermissionsToVariant(
  program: MegaloProgram,
  variant: c_game_engine_custom_variant
): void {
  const compiled = compileMapPermissions(program);
  if (!compiled) {
    return;
  }
  variant.m_map_permissions.m_allow_by_default = compiled.m_allow_by_default;
  variant.m_map_permissions.m_except_map_ids = [...compiled.m_except_map_ids];
}
