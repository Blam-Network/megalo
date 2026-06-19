import {
  MEGALO_EQUIPMENT,
  MEGALO_OBJECTS,
  MEGALO_WEAPONS,
  parseMegaloObjectTypeIndex,
} from "../lookups";

export type TraitObjectCategory = "weapon" | "equipment";

const TRAIT_CATEGORY_LISTS: Record<TraitObjectCategory, readonly string[]> = {
  weapon: MEGALO_WEAPONS,
  equipment: MEGALO_EQUIPMENT,
};

/** Parent slayer object table used for trait absolute-index resolution. */
export function slayerTraitParentObjectsUsed(): boolean[] {
  const used = Array.from({ length: MEGALO_OBJECTS.length }, () => false);
  for (const name of [...MEGALO_WEAPONS, ...MEGALO_EQUIPMENT]) {
    used[parseMegaloObjectTypeIndex(name)] = true;
  }
  return used;
}

function mergeObjectsUsed(...bitmaps: boolean[][]): boolean[] {
  const merged = Array.from({ length: MEGALO_OBJECTS.length }, () => false);
  for (const bitmap of bitmaps) {
    for (let i = 0; i < merged.length; i++) {
      if (bitmap[i]) {
        merged[i] = true;
      }
    }
  }
  return merged;
}

/** Assigns Reach trait `absolute_index` values against the parent gametype object table. */
export class ObjectIndexRegistry {
  private readonly indexObjectsUsed: boolean[];

  constructor(
    private readonly objectsUsed: boolean[],
    options?: { parentObjectsUsed?: boolean[] }
  ) {
    this.indexObjectsUsed = mergeObjectsUsed(
      slayerTraitParentObjectsUsed(),
      options?.parentObjectsUsed ?? []
    );
  }

  resolveTraitObjectName(
    name: string,
    category: TraitObjectCategory
  ): number {
    if (name === "map_default") {
      return -3;
    }
    if (name === "none") {
      return -1;
    }

    const list = TRAIT_CATEGORY_LISTS[category];
    const position = list.indexOf(name);
    if (position < 0) {
      throw new Error(
        `Object '${name}' is not a Reach ${category} for trait absolute-index resolution`
      );
    }

    let absolute = 0;
    for (let i = 0; i < position; i++) {
      const typeIndex = parseMegaloObjectTypeIndex(list[i]!);
      if (this.indexObjectsUsed[typeIndex]) {
        absolute++;
      }
    }
    return absolute;
  }

  markObjectName(name: string): void {
    if (name === "map_default" || name === "none") {
      return;
    }
    const typeIndex = parseMegaloObjectTypeIndex(name);
    this.objectsUsed[typeIndex] = true;
  }
}

export function traitObjectNameFromAbsoluteIndex(
  absolute: number,
  category: TraitObjectCategory,
  objectsUsed: boolean[]
): string {
  const indexObjectsUsed = mergeObjectsUsed(
    slayerTraitParentObjectsUsed(),
    objectsUsed
  );
  const list = TRAIT_CATEGORY_LISTS[category];
  let count = 0;
  for (const name of list) {
    const typeIndex = parseMegaloObjectTypeIndex(name);
    if (!indexObjectsUsed[typeIndex]) {
      continue;
    }
    if (count === absolute) {
      return name;
    }
    count++;
  }
  return `object_type_${absolute}`;
}
