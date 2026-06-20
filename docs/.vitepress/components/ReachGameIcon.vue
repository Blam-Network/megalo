<script setup lang="ts">
const base = import.meta.env.BASE_URL;
const src = `${base}images/icons/game-reach.png`;
</script>

<template>
  <img
    class="version-reach-icon"
    :src="src"
    alt="Halo: Reach"
    title="Halo: Reach"
  />
</template>
