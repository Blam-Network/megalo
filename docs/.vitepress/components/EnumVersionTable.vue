<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import GameLabel from "./GameLabel.vue";
import gameOptionsVersions from "../language-game-options-versions.json";
import playerTraitsVersions from "../language-player-traits-versions.json";
import builtInVariablesVersions from "../language-built-in-variables-versions.json";
import soundsVersions from "../language-sounds-versions.json";

type GameKey = "reach" | "halo4" | "h2a";
type AvailabilityValue = string;

type EnumVersionEntry = Record<GameKey, AvailabilityValue> & {
  name: string;
  type?: string;
  typeKeywords?: string[];
};

const props = defineProps<{
  /** Enum table data source. */
  enum: "sounds" | "game-options" | "player-traits" | "built-in-variables";
}>();

const GAME_COLUMNS: { key: GameKey }[] = [
  { key: "reach" },
  { key: "halo4" },
  { key: "h2a" },
];

const DATA: Record<typeof props.enum, EnumVersionEntry[]> = {
  sounds: soundsVersions.entries as EnumVersionEntry[],
  "game-options": gameOptionsVersions.entries as EnumVersionEntry[],
  "player-traits": playerTraitsVersions.entries as EnumVersionEntry[],
  "built-in-variables": builtInVariablesVersions.entries as EnumVersionEntry[],
};

const entries = computed(() => DATA[props.enum] ?? []);

const showTypeColumn = computed(
  () =>
    props.enum === "game-options" ||
    props.enum === "player-traits" ||
    props.enum === "built-in-variables",
);

const TYPE_LINKS: Record<string, string> = {
  player_traits: "/language/elements/game-options/player-traits",
  loadout_palette: "/language/elements/loadout-palette",
  grenade_count: "/language/enums/player-traits/grenade-count",
  vehicle_usage_setting: "/language/enums/player-traits/vehicle-usage-setting",
  sprint_setting: "/language/enums/player-traits/sprinting",
  equipment_usage_setting: "/language/enums/player-traits/equipment-usage-setting",
  active_camo_setting: "/language/enums/player-traits/active-camo-setting",
  waypoint_setting: "/language/enums/player-traits/waypoint-setting",
  forced_change_color_setting: "/language/enums/player-traits/forced-change-color-setting",
  motion_tracker_setting: "/language/enums/player-traits/motion-tracker-setting",
  team_scoring_method: "/language/enums/game-options/team-scoring-method",
  weapon_set: "/language/object-lists#weapon_sets",
  vehicle_set: "/language/object-lists#vehicle_sets",
};

function typeLink(type: string | undefined): string | undefined {
  if (!type) return undefined;
  return TYPE_LINKS[type];
}

function cellClass(value: AvailabilityValue): "yes" | "no" | "partial" {
  if (value === "Yes") return "yes";
  if (value === "No") return "no";
  return "partial";
}
</script>

<template>
  <table class="enum-version-table">
    <colgroup>
      <col class="enum-version-table__col-name" />
      <col
        v-if="showTypeColumn"
        class="enum-version-table__col-type"
      />
      <col
        v-for="game in GAME_COLUMNS"
        :key="game.key"
        class="enum-version-table__col-game"
      />
    </colgroup>
    <thead>
      <tr>
        <th class="enum-version-table__name">Name</th>
        <th v-if="showTypeColumn" class="enum-version-table__type">Type</th>
        <th
          v-for="game in GAME_COLUMNS"
          :key="game.key"
          class="enum-version-table__game"
        >
          <GameLabel :game="game.key" icon-only />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries" :key="entry.name">
        <td class="enum-version-table__name">
          <code>{{ entry.name }}</code>
        </td>
        <td v-if="showTypeColumn" class="enum-version-table__type">
          <a
            v-if="typeLink(entry.type) && !entry.typeKeywords?.length"
            :href="withBase(typeLink(entry.type)!)"
            class="enum-version-table__type-link"
          >
            <code>{{ entry.type }}</code>
          </a>
          <span v-else class="enum-version-table__type-value">
            {{ entry.type }}<template v-if="entry.typeKeywords?.length">
              or
              <template
                v-for="(keyword, index) in entry.typeKeywords"
                :key="keyword"
              >
                <template v-if="index">, </template>
                <code>{{ keyword }}</code>
              </template>
            </template>
          </span>
        </td>
        <td
          v-for="game in GAME_COLUMNS"
          :key="game.key"
          class="enum-version-table__game"
        >
          <span
            class="availability-cell"
            :class="`availability-cell--${cellClass(entry[game.key])}`"
          >
            {{ entry[game.key] }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
