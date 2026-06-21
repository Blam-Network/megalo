<script setup lang="ts">
import { computed } from "vue";

type GameKey = "reach" | "halo4" | "h2a";

const props = withDefaults(
  defineProps<{
    game: GameKey;
    /** Override the default game title beside the icon. */
    name?: string;
    /** Icon only — hide the title (for compact layouts). */
    iconOnly?: boolean;
  }>(),
  {
    iconOnly: false,
  },
);

const base = import.meta.env.BASE_URL;

const GAMES: Record<GameKey, { name: string; icon: string }> = {
  reach: { name: "Halo: Reach", icon: "game-reach.png" },
  halo4: { name: "Halo 4", icon: "game-h4.png" },
  h2a: { name: "Halo 2 Anniversary", icon: "game-h2a.png" },
};

const gameInfo = computed(() => GAMES[props.game]);
const label = computed(() => props.name ?? gameInfo.value.name);
const src = computed(() => `${base}images/icons/${gameInfo.value.icon}`);
</script>

<template>
  <span class="version-game-label">
    <img
      class="version-reach-icon"
      :src="src"
      alt=""
      aria-hidden="true"
    />
    <span v-if="!iconOnly" class="version-game-label__name">{{ label }}</span>
  </span>
</template>

<style scoped>
.version-game-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.version-game-label .version-reach-icon {
  margin: 0;
}

.version-game-label__name {
  white-space: nowrap;
}
</style>
