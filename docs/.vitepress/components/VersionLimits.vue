<script setup lang="ts">
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";

type VersionKey = "mcc" | "tu1" | "release" | "omaha-delta" | "omaha-alpha";

const props = defineProps<{
  /** Override version (defaults from `/versions/<slug>/` route). */
  version?: VersionKey;
}>();

const route = useRoute();

const versionKey = computed((): VersionKey => {
  if (props.version) {
    return props.version;
  }
  const slug = route.path.replace(/\/+$/, "").split("/").pop() ?? "";
  switch (slug) {
    case "107-mcc":
      return "mcc";
    case "107":
      return "tu1";
    case "106":
      return "release";
    case "73":
      return "omaha-delta";
    case "49":
      return "omaha-alpha";
    default:
      return "mcc";
  }
});

const usesMccTemporaryPools = computed(() => versionKey.value === "mcc");
</script>

<template>
  <div class="version-limits">
    <p class="version-limits__intro">
      Compile-time caps for a single megalo script on this build. See
      <a :href="withBase('/language/variable-model')">Variable model</a> for declaration syntax.
    </p>

    <h3>Custom variables</h3>
    <p>Slots per scope and type in <code>variables</code> blocks:</p>
    <table>
      <thead>
        <tr>
          <th>Scope</th>
          <th><code>number</code></th>
          <th><code>object</code></th>
          <th><code>player</code></th>
          <th><code>team</code></th>
          <th><code>timer</code></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>global</code></td>
          <td>12</td>
          <td>16</td>
          <td>8</td>
          <td>8</td>
          <td>8</td>
        </tr>
        <tr>
          <td><code>player</code></td>
          <td>8</td>
          <td>4</td>
          <td>4</td>
          <td>4</td>
          <td>4</td>
        </tr>
        <tr>
          <td><code>team</code></td>
          <td>8</td>
          <td>6</td>
          <td>4</td>
          <td>4</td>
          <td>4</td>
        </tr>
        <tr>
          <td><code>object</code></td>
          <td>8</td>
          <td>4</td>
          <td>4</td>
          <td>2</td>
          <td>4</td>
        </tr>
      </tbody>
    </table>

    <h3>Temporary variables</h3>
    <template v-if="usesMccTemporaryPools">
      <p>
        Each <a :href="withBase('/language/elements/trigger#action-scope')">action scope</a>
        has a dedicated temporary pool per type. Nested scopes get separate pools.
        With
        <a :href="withBase('/language/compiler-settings#temporary-variable-overflow')">overflow enabled</a>
        (MegaloEdit default), excess temporaries may spill into unused
        <code>global</code> slots of the same type up to the overflow cap.
      </p>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Dedicated pool</th>
            <th>Max overflow into globals</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>number</code></td>
            <td>10</td>
            <td>12</td>
          </tr>
          <tr>
            <td><code>object</code></td>
            <td>8</td>
            <td>16</td>
          </tr>
          <tr>
            <td><code>team</code></td>
            <td>6</td>
            <td>8</td>
          </tr>
          <tr>
            <td><code>player</code></td>
            <td>3</td>
            <td>8</td>
          </tr>
        </tbody>
      </table>
      <p>
        Each <code>temporary</code> line also counts as one action toward the
        1024-action limit. There is no <code>timer</code> temporary type.
      </p>
    </template>
    <template v-else>
      <p>
        Temporaries map directly to <code>global</code> variable slots — there is
        no separate temporary pool on this build. The relevant cap is the
        <code>global</code> column in the custom variable table above. Each
        <code>temporary</code> line also counts as one action toward the
        1024-action limit.
      </p>
    </template>

    <h3>Triggers, conditions, and actions</h3>
    <table>
      <thead>
        <tr>
          <th>Resource</th>
          <th>Limit</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><a :href="withBase('/language/elements/trigger')">Triggers</a></td>
          <td>320</td>
          <td>Full-script only</td>
        </tr>
        <tr>
          <td><a :href="withBase('/language/elements/trigger/condition')">Conditions</a></td>
          <td>512</td>
          <td>Across all triggers</td>
        </tr>
        <tr>
          <td><a :href="withBase('/language/elements/trigger/action')">Actions</a></td>
          <td>1024</td>
          <td>
            Across all triggers; includes each <code>temporary</code> and
            <a :href="withBase('/language/elements/begin')"><code>begin</code></a> line
          </td>
        </tr>
      </tbody>
    </table>

    <h3>Strings and declarations</h3>
    <table>
      <thead>
        <tr>
          <th>Element</th>
          <th>Limit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a :href="withBase('/language/elements/string-table')">String table</a> entries
          </td>
          <td>112</td>
        </tr>
        <tr>
          <td>String table data (all languages combined)</td>
          <td>19,456 bytes</td>
        </tr>
        <tr>
          <td><a :href="withBase('/language/elements/hud-widgets')">HUD widgets</a></td>
          <td>4</td>
        </tr>
        <tr>
          <td><a :href="withBase('/language/elements/map-object')">Map object filters</a></td>
          <td>16</td>
        </tr>
        <tr>
          <td><a :href="withBase('/language/elements/loadout')">Loadouts</a></td>
          <td>32</td>
        </tr>
        <tr>
          <td><a :href="withBase('/language/elements/loadout-palette')">Loadout palettes</a></td>
          <td>16</td>
        </tr>
        <tr>
          <td>
            <a :href="withBase('/language/elements/requisition-palette')">Requisition palettes</a>
          </td>
          <td>8</td>
        </tr>
        <tr>
          <td>
            <a :href="withBase('/language/elements/game-options')">Custom lobby options</a>
            (<code>option</code> / <code>ranged_option</code>)
          </td>
          <td>16</td>
        </tr>
        <tr>
          <td>
            <a :href="withBase('/language/elements/game-options')">Player trait sets</a>
          </td>
          <td>16</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.version-limits {
  margin: 0 0 1.5rem;
}

.version-limits__intro {
  margin: 0 0 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.version-limits h3 {
  margin: 1.25rem 0 0.65rem;
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  padding: 0;
}

.version-limits h3:first-of-type {
  margin-top: 0;
}

.version-limits p {
  margin: 0 0 0.75rem;
  line-height: 1.6;
}

.version-limits table {
  margin: 0 0 1rem;
}
</style>
