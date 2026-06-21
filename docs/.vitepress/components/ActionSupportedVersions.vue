<script setup lang="ts">
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";
import GameLabel from "./GameLabel.vue";
import languageActions from "../language-actions.json";
import languageVersions from "../language-versions.json";

type VersionId =
  | "omaha-alpha"
  | "omaha-delta"
  | "release"
  | "tu1"
  | "mcc";

const VERSION_ORDER: VersionId[] = [
  "omaha-alpha",
  "omaha-delta",
  "release",
  "tu1",
  "mcc",
];

const props = defineProps<{
  /** Override action name (defaults to slug from the page URL). */
  action?: string;
}>();

const route = useRoute();

const actionName = computed(() => {
  if (props.action) {
    return props.action;
  }
  const slug = route.path.replace(/\/+$/, "").split("/").pop() ?? "";
  return slug.replace(/-/g, "_");
});

const supportedBuilds = computed(() => {
  const entry = languageActions.actions.find(
    (action) => action.name === actionName.value,
  );
  return new Set(entry?.builds ?? []);
});

const rows = computed(() =>
  VERSION_ORDER.map((id) => {
    const version = languageVersions.versions.find((entry) => entry.id === id);
    return {
      id,
      label: version?.label ?? id,
      docLink: version?.docLink ?? "",
      supported: supportedBuilds.value.has(id),
    };
  }),
);
</script>

<template>
  <table class="action-supported-versions-table">
    <colgroup>
      <col class="action-supported-versions-table__col-version" />
      <col class="action-supported-versions-table__col-supported" />
    </colgroup>
    <thead>
      <tr>
        <th class="action-supported-versions-table__version">Version</th>
        <th class="action-supported-versions-table__supported">Supported</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td class="action-supported-versions-table__version">
          <a
            v-if="row.docLink"
            :href="withBase(row.docLink)"
            class="action-supported-versions-table__version-link"
          >
            <GameLabel game="reach" :name="row.label" />
          </a>
          <GameLabel v-else game="reach" :name="row.label" />
        </td>
        <td class="action-supported-versions-table__supported">
          <span
            class="availability-cell"
            :class="
              row.supported
                ? 'availability-cell--yes'
                : 'availability-cell--no'
            "
          >
            {{ row.supported ? "Yes" : "No" }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
