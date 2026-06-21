<script setup lang="ts">
import GameLabel from "./GameLabel.vue";

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
</script>

<template>
  <GameLabel game="reach" :name="name" :icon-only="iconOnly" />
</template>
