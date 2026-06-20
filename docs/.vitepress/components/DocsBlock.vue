<script setup lang="ts">
import { computed } from "vue";

type BlockType = "info" | "note" | "tip" | "warning" | "danger" | "details";

const props = withDefaults(
  defineProps<{
    type?: BlockType;
    title?: string;
  }>(),
  {
    type: "note",
  },
);

const base = import.meta.env.BASE_URL;

const CHIP_ICONS: Record<BlockType, string> = {
  info: `${base}images/icons/chip-info.png`,
  note: `${base}images/icons/chip-note.png`,
  tip: `${base}images/icons/chip-thumb.png`,
  warning: `${base}images/icons/chip-warn.png`,
  danger: `${base}images/icons/chip-error.png`,
  details: `${base}images/icons/chip-info.png`,
};

const chipIcon = computed(() => CHIP_ICONS[props.type]);
</script>

<template>
  <div :class="[type, 'custom-block', 'docs-block']">
    <img
      class="docs-block__chip"
      :src="chipIcon"
      alt=""
      aria-hidden="true"
    />
    <div class="docs-block__body">
      <p v-if="title" class="custom-block-title">{{ title }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.docs-block {
  position: relative;
  overflow: hidden;
  padding-right: 7.5rem;
}

.docs-block__chip {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  width: 6.5rem;
  height: auto;
  pointer-events: none;
  user-select: none;
}

.docs-block__body {
  position: relative;
  z-index: 1;
}

@media (max-width: 640px) {
  .docs-block {
    padding-right: 1rem;
    padding-top: 4.75rem;
  }

  .docs-block__chip {
    top: 0.25rem;
    right: 0.25rem;
    width: 5.5rem;
  }
}
</style>
