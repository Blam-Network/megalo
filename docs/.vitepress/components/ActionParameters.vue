<script setup lang="ts">
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";
import grammarData from "../action-context-grammar.json";

type GrammarPart = {
  text: string;
  href?: string;
};

type VersionGrammar = {
  label: string;
  grammar: string;
};

type GrammarEntry = {
  grammar: string;
  empty: boolean;
  versionGrammars?: VersionGrammar[];
};

const props = defineProps<{
  /** Override action name (defaults to slug from the page URL). */
  action?: string;
}>();

const route = useRoute();

const GRAMMAR_OPERAND_LINKS: Record<string, string> = {
  math_operation: "/language/enums/math-operations",
  team_or_player_target: "/language/enums/team-or-player-target",
  dynamic_string: "/language/enums/dynamic-strings",
  scriptable_button: "/language/actions/get-button-time#scriptable-buttons",
};

const actionName = computed(() => {
  if (props.action) {
    return props.action;
  }
  const slug = route.path.replace(/\/+$/, "").split("/").pop() ?? "";
  return slug.replace(/-/g, "_");
});

const entry = computed((): GrammarEntry | undefined => {
  const actions = (grammarData as { actions: Record<string, GrammarEntry> })
    .actions;
  return actions[actionName.value];
});

function grammarPartsFor(grammar: string): GrammarPart[] {
  const parts: GrammarPart[] = [];
  const re = /<([a-z_]+)>/gi;
  let last = 0;

  for (const match of grammar.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ text: grammar.slice(last, index) });
    }

    const tag = match[1]?.toLowerCase() ?? "";
    const link = GRAMMAR_OPERAND_LINKS[tag];
    const text = match[0];
    parts.push(link ? { text, href: withBase(link) } : { text });
    last = index + text.length;
  }

  if (last < grammar.length) {
    parts.push({ text: grammar.slice(last) });
  }

  return parts.length ? parts : [{ text: grammar }];
}

const versionGrammars = computed(() => {
  const action = entry.value;
  if (!action || action.empty) {
    return [];
  }

  if (action.versionGrammars?.length) {
    return action.versionGrammars.map((version) => ({
      label: version.label,
      parts: grammarPartsFor(version.grammar),
    }));
  }

  return [
    {
      label: undefined,
      parts: grammarPartsFor(action.grammar),
    },
  ];
});
</script>

<template>
  <section v-if="entry" class="action-parameters">
    <h2>Parameters</h2>

    <p v-if="entry.empty" class="action-parameters__none">No operands.</p>

    <template v-else>
      <div
        v-for="(version, versionIndex) in versionGrammars"
        :key="version.label ?? versionIndex"
        class="action-parameters__version"
      >
        <h3 v-if="version.label" class="action-parameters__version-label">
          {{ version.label }}
        </h3>

        <p class="action-parameters__grammar">
          <code>
            <template
              v-for="(part, index) in version.parts"
              :key="(version.label || 'default') + '-' + index"
            >
              <a
                v-if="part.href"
                :href="part.href"
                class="action-parameters__grammar-link"
                >{{ part.text }}</a
              >
              <template v-else>{{ part.text }}</template>
            </template>
          </code>
        </p>
      </div>

      <ul class="action-parameters__legend">
        <li><code>&lt;name&gt;</code> — required operand</li>
        <li><code>{a|b|c}</code> — choose one alternative</li>
        <li><code>[ … ]</code> — optional clause</li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.action-parameters {
  margin: 0 0 1.5rem;
}

.action-parameters h2 {
  margin: 0 0 0.65rem;
  font-size: 1.15rem;
  font-weight: 600;
  border: none;
  padding: 0;
}

.action-parameters__version {
  margin: 0 0 1rem;
}

.action-parameters__version:last-of-type {
  margin-bottom: 0.75rem;
}

.action-parameters__version-label {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  padding: 0;
}

.action-parameters__grammar {
  margin: 0;
}

.action-parameters__grammar code {
  display: block;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: rgba(0, 0, 0, 0.22);
  font-size: 0.9em;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.action-parameters__grammar-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.action-parameters__grammar-link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.action-parameters__none {
  margin: 0 0 0.75rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.action-parameters__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.88em;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.action-parameters__legend li {
  margin: 0;
}

.action-parameters__legend code {
  font-size: 0.95em;
}
</style>
