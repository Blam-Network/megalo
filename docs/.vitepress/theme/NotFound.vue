<script setup lang="ts">
import { useData, withBase } from "vitepress";

const { theme } = useData();
</script>

<template>
  <div class="megalo-not-found">
    <img
      class="megalo-not-found__image"
      :src="withBase('/images/404.png')"
      alt="404 — page not found"
      width="640"
      height="640"
      decoding="async"
    />

    <h1 class="megalo-not-found__title">
      {{ theme.notFound?.title ?? "Page not found" }}
    </h1>

    <p class="megalo-not-found__quote">
      {{
        theme.notFound?.quote ??
        "That route isn't in the variant. Check the URL or head back to the docs."
      }}
    </p>

    <a
      class="megalo-not-found__link"
      :href="withBase('/')"
      :aria-label="theme.notFound?.linkLabel ?? 'Go to home'"
    >
      {{ theme.notFound?.linkText ?? "Take me home" }}
    </a>
  </div>
</template>
