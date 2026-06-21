<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import NotFound from "./NotFound.vue";

const { Layout: DefaultLayout } = DefaultTheme;
</script>

<template>
  <div class="megalo-layout">
    <div class="megalo-hero-bg" aria-hidden="true">
      <div class="megalo-hero-bg-image" />
      <div class="megalo-hero-bg-overlay" />
    </div>
    <DefaultLayout>
      <template #not-found>
        <NotFound />
      </template>
    </DefaultLayout>
  </div>
</template>

<style scoped>
.megalo-layout {
  position: relative;
  min-height: 100vh;
}

.megalo-hero-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.megalo-hero-bg-image {
  position: absolute;
  inset: -24px;
  background-position: center 35%;
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0.1;
  filter: blur(6px);
  transform: scale(1.05);
}

.megalo-hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10, 12, 10, 0.88) 0%,
    rgba(10, 12, 10, 0.94) 100%
  );
}

.megalo-layout :deep(.Layout) {
  position: relative;
  z-index: 1;
}
</style>
