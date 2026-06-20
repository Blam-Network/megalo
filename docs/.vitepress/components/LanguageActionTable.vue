<script setup lang="ts">
import { computed } from "vue";
import data from "../language-versions.json";
import actionData from "../language-actions.json";

type Action = {
  name: string;
  opcode: number;
};

type Version = {
  id: string;
  label: string;
  buildId: string;
  importPath: string;
  sourcePath: string;
  actions: Action[];
  mccOnlyActionNames?: string[];
};

const props = defineProps<{
  version: string;
}>();

const sourceRepoBase =
  (data as { sourceRepoBase?: string }).sourceRepoBase ??
  "https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam";

const mccOnly = new Set(
  (data as { mccOnlyActionNames?: string[] }).mccOnlyActionNames ?? []
);

const versionData = computed(() =>
  (data.versions as Version[]).find((entry) => entry.id === props.version)
);

function sourceHref(sourcePath: string): string {
  return `${sourceRepoBase}/${sourcePath}`;
}

function isMccOnly(name: string): boolean {
  return mccOnly.has(name);
}

const actionLinks = new Map(
  (actionData as { actions: { name: string; docLink: string }[] }).actions.map(
    (entry) => [entry.name, entry.docLink]
  )
);

function actionDocLink(name: string): string | undefined {
  return actionLinks.get(name);
}
</script>

<template>
  <div class="language-action-table">
    <p v-if="!versionData" class="autogen-note">
      Unknown version <code>{{ version }}</code> — run
      <code>npm run docs:gen</code>.
    </p>

    <template v-else>
      <table class="action-table">
        <colgroup>
          <col class="col-opcode" />
          <col class="col-name" />
          <col class="col-notes" />
        </colgroup>
        <thead>
          <tr>
            <th>Opcode</th>
            <th>Action</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="action in versionData.actions" :key="action.name">
            <td class="col-opcode">{{ action.opcode }}</td>
            <td class="col-name">
              <a v-if="actionDocLink(action.name)" :href="actionDocLink(action.name)">
                <code>{{ action.name }}</code>
              </a>
              <code v-else>{{ action.name }}</code>
            </td>
            <td class="col-notes">
              <span
                v-if="versionData.id === 'mcc' && isMccOnly(action.name)"
                class="tag mcc-only"
                >MCC only</span
              >
              <span v-else class="tag muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="source-link">
        Source:
        <a
          :href="sourceHref(versionData.sourcePath)"
          target="_blank"
          rel="noopener noreferrer"
          ><code>e_action_type</code> in blf</a
        >
      </p>
    </template>
  </div>
</template>

<style scoped>
.language-action-table {
  margin: 1.25rem 0 2rem;
}

.autogen-note {
  color: var(--vp-c-text-2);
  font-size: 0.95em;
}

.action-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.95em;
  line-height: 1.5;
}

.action-table thead {
  background: rgba(52, 211, 153, 0.06);
}

.action-table th {
  padding: 0.65rem 1.1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}

.action-table td {
  padding: 0.75rem 1.1rem;
  vertical-align: middle;
  border-top: 1px solid var(--vp-c-divider);
}

.col-opcode {
  width: 5.5rem;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-2);
}

.col-notes {
  width: 8rem;
}

.action-table tbody tr:hover td {
  background: rgba(52, 211, 153, 0.04);
}

.tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.tag.mcc-only {
  color: var(--vp-c-green-1);
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.22);
}

.tag.muted {
  color: var(--vp-c-text-3);
}

.source-link {
  margin-top: 0.75rem;
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .action-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
