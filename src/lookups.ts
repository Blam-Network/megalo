import {
  MEGALO_DEVICE_ANIMATIONS,
  MEGALO_HUD_WIDGET_ICONS,
  MEGALO_INCIDENTS,
  MEGALO_LOADOUT_PALETTES,
  MEGALO_OBJECTS,
  MEGALO_VEHICLES,
  MEGALO_VEHICLE_SETS,
} from "./lookups_data";

export {
  MEGALO_OBJECTS,
  MEGALO_WEAPONS,
  MEGALO_EQUIPMENT,
  MEGALO_VEHICLES,
  MEGALO_INCIDENTS,
  MEGALO_VEHICLE_SETS,
  MEGALO_LOADOUT_PALETTES,
  MEGALO_DEVICE_ANIMATIONS,
  MEGALO_HUD_WIDGET_ICONS,
} from "./lookups_data";

const vehicleTypes = new Set<string>(MEGALO_VEHICLES);

export function megaloObjectTypeName(index: number | undefined): string {
  if (index === undefined || index < 0 || index >= MEGALO_OBJECTS.length) {
    return `object_type_${index ?? 0}`;
  }
  return MEGALO_OBJECTS[index] ?? `object_type_${index}`;
}

export function megaloIncidentName(incidentId: number): string {
  if (incidentId <= 0 || incidentId > MEGALO_INCIDENTS.length) {
    return `incident_${incidentId}`;
  }
  return MEGALO_INCIDENTS[incidentId - 1] ?? `incident_${incidentId}`;
}

/** Tier slot names used by `set_loadout_palette` and `override loadout_palette`. */
export const MEGALO_LOADOUT_PALETTE_SLOTS = [
  "none",
  "spartan_tier1",
  "spartan_tier2",
  "spartan_tier3",
  "elite_tier1",
  "elite_tier2",
  "elite_tier3",
] as const;

/** Preset palette names from `loadout_palettes.txt` plus engine sentinels. */
export const MEGALO_LOADOUT_PALETTE_PRESETS = [
  ...MEGALO_LOADOUT_PALETTES,
  "empty_palette",
] as const;

export function megaloLoadoutPaletteSlotName(index: number): string {
  if (index < 0 || index >= MEGALO_LOADOUT_PALETTE_SLOTS.length) {
    return `palette_${index}`;
  }
  return MEGALO_LOADOUT_PALETTE_SLOTS[index] ?? `palette_${index}`;
}

export function megaloLoadoutPalettePresetName(index: number): string {
  if (index < 0 || index >= MEGALO_LOADOUT_PALETTE_PRESETS.length) {
    return `palette_${index}`;
  }
  return MEGALO_LOADOUT_PALETTE_PRESETS[index] ?? `palette_${index}`;
}

/** @deprecated Use {@link megaloLoadoutPaletteSlotName} for action operands. */
export function megaloLoadoutPaletteName(index: number): string {
  return megaloLoadoutPaletteSlotName(index);
}

export function parseMegaloHudWidgetIconIndex(name: string): number | undefined {
  const index = (MEGALO_HUD_WIDGET_ICONS as readonly string[]).indexOf(name);
  return index >= 0 ? index : undefined;
}

export function parseMegaloObjectTypeIndex(name: string): number {
  const index = (MEGALO_OBJECTS as readonly string[]).indexOf(name);
  if (index >= 0) {
    return index;
  }
  const match = /^object_type_(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

export function parseMegaloIncidentId(name: string): number {
  const index = (MEGALO_INCIDENTS as readonly string[]).indexOf(name);
  if (index >= 0) {
    return index + 1;
  }
  const match = /^incident_(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

export function parseMegaloLoadoutPaletteSlotIndex(name: string): number {
  const index = (
    MEGALO_LOADOUT_PALETTE_SLOTS as readonly string[]
  ).indexOf(name);
  if (index >= 0) {
    return index;
  }
  const match = /^palette_(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

export function parseMegaloLoadoutPalettePresetIndex(name: string): number {
  const index = (
    MEGALO_LOADOUT_PALETTE_PRESETS as readonly string[]
  ).indexOf(name);
  if (index >= 0) {
    return index;
  }
  const match = /^palette_(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

/** @deprecated Use {@link parseMegaloLoadoutPaletteSlotIndex} for action operands. */
export function parseMegaloLoadoutPaletteIndex(name: string): number {
  return parseMegaloLoadoutPaletteSlotIndex(name);
}

export function parseTraitsIndex(name: string): number {
  const match = /^traits_(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

export function typeFilterMapObjectName(typeIndex: number): {
  name: string;
  type: string;
} {
  const type = megaloObjectTypeName(typeIndex);
  const name = vehicleTypes.has(type) ? `${type}_vehicle` : type;
  return { name, type };
}

/** From HREK `includes/engine_icons.txt`. */
const ENGINE_ICON_NAMES = [
  "ctf",
  "slayer",
  "oddball",
  "king",
  "juggernaut",
  "territories",
  "assault",
  "infection",
  "vip",
  "invasion",
  "invasion_slayer",
  "stockpile",
  "action_sack",
  "race",
  "rocket_race",
  "grifball",
  "soccer",
  "headhunter",
  "crosshair",
  "wheel",
  "swirl",
  "bunker",
  "healthpack",
  "towershield",
  "return",
  "pre_game_warm_up",
  "cartographer",
  "eightball",
  "spartan",
  "elite",
  "attack",
] as const;

export function megaloEngineIconName(index: number): string {
  const name = ENGINE_ICON_NAMES[index > 0 ? index - 1 : index];
  return name ? `k_engine_icon_${name}` : `k_engine_icon_${index}`;
}

export function megaloEngineIconWireIndex(name: string): number | undefined {
  const index = parseMegaloEngineIconIndex(name);
  return index === undefined ? undefined : index + 1;
}

export function parseMegaloEngineIconIndex(name: string): number | undefined {
  if (!name.startsWith("k_engine_icon_")) {
    return undefined;
  }
  const suffix = name.slice("k_engine_icon_".length);
  const index = (ENGINE_ICON_NAMES as readonly string[]).indexOf(suffix);
  if (index >= 0) {
    return index;
  }
  const numeric = Number(suffix);
  return Number.isNaN(numeric) ? undefined : numeric;
}

export function megaloDeviceAnimationName(index: number): string {
  if (index >= 0 && index < MEGALO_DEVICE_ANIMATIONS.length) {
    return MEGALO_DEVICE_ANIMATIONS[index]!;
  }
  return `animation_${index}`;
}

export function parseMegaloDeviceAnimationIndex(name: string): number {
  const index = (MEGALO_DEVICE_ANIMATIONS as readonly string[]).indexOf(name);
  if (index >= 0) {
    return index;
  }
  const match = /^animation_(\d+)$/.exec(name);
  return match ? Number(match[1]) : Number(name) || 0;
}

/** HUD widget screen positions (`e_megalo_widget_position`). */
export const MEGALO_WIDGET_POSITIONS = [
  "top_left",
  "top_center",
  "top_right",
  "high_left",
  "high_center",
  "high_right",
  "low_left",
  "low_center",
  "low_right",
  "bottom_left",
  "bottom_center",
  "bottom_right",
] as const;

export const HUD_WIDGET_POSITIONS: Record<number, string> = Object.fromEntries(
  MEGALO_WIDGET_POSITIONS.map((name, index) => [index, name])
);

export function megaloHudWidgetPositionName(index: number): string {
  return HUD_WIDGET_POSITIONS[index] ?? `position_${index}`;
}

export function parseMegaloHudWidgetPosition(name: string): number {
  const index = MEGALO_WIDGET_POSITIONS.indexOf(
    name as (typeof MEGALO_WIDGET_POSITIONS)[number]
  );
  if (index >= 0) {
    return index;
  }
  const match = /^position_(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}
