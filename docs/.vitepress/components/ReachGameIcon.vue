<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Game title shown beside the icon. */
    name?: string;
    /** Icon only — hide the title (for compact layouts). */
    iconOnly?: boolean;
  }>(),
  {
    name: "Halo: Reach",
    iconOnly: false,
  },
);

const base = import.meta.env.BASE_URL;
const src = `${base}images/icons/game-reach.png`;
</script>

<template>
  <span class="version-game-label">
    <img
      class="version-reach-icon"
      :src="src"
      alt=""
      aria-hidden="true"
    />
    <span v-if="!iconOnly" class="version-game-label__name">{{ name }}</span>
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
