import type MarkdownIt from "markdown-it";
import type { MarkdownEnv } from "vitepress";
import actionGrammar from "./action-context-grammar.json";
import languageActions from "./language-actions.json";
import languageGameOptionsVersions from "./language-game-options-versions.json";
import languagePlayerTraitsVersions from "./language-player-traits-versions.json";
import languageBuiltInVariablesVersions from "./language-built-in-variables-versions.json";
import languageSoundsVersions from "./language-sounds-versions.json";
import languageVersions from "./language-versions.json";

type ActionEntry = (typeof languageActions.actions)[number];
type GrammarEntry = { grammar: string; empty: boolean };

const actionsByName = new Map<string, ActionEntry>(
  languageActions.actions.map((action) => [action.name, action]),
);

const grammarByAction = actionGrammar.actions as Record<string, GrammarEntry>;

const buildLabels = new Map(
  languageVersions.versions.map((version) => [version.id, version.label]),
);

const enumTables: Record<string, { entries: Array<Record<string, unknown>> }> =
  {
    "player-traits": languagePlayerTraitsVersions,
    "game-options": languageGameOptionsVersions,
    "built-in-variables": languageBuiltInVariablesVersions,
    sounds: languageSoundsVersions,
  };

function identifierVariants(value: string): string[] {
  const normalized = value.toLowerCase();
  const variants = new Set<string>([normalized]);

  if (normalized.includes("_")) {
    variants.add(normalized.replace(/_/g, "-"));
    variants.add(normalized.replace(/_/g, " "));
  }
  if (normalized.includes("-")) {
    variants.add(normalized.replace(/-/g, "_"));
    variants.add(normalized.replace(/-/g, " "));
  }

  return [...variants];
}

function grammarSearchTerms(grammar: string): string {
  const tags = [...grammar.matchAll(/<([a-z_]+)>/gi)].map((match) => match[1]!);
  const alternatives = [...grammar.matchAll(/\{([^}]+)\}/g)].flatMap((match) =>
    match[1]!
      .split("|")
      .map((part) => part.trim().replace(/\s+\(.+\)$/, "").replace(/\s+.*/, ""))
      .filter(Boolean),
  );

  return [...tags, ...alternatives].join(" ");
}

function actionSlugFromPath(relativePath: string): string | undefined {
  const match = relativePath.match(/language[/\\]actions[/\\]([^/\\]+)\.md$/i);
  return match?.[1];
}

function formatEnumEntry(entry: Record<string, unknown>): string {
  const name = String(entry.name ?? "");
  const type = entry.type ? String(entry.type) : "";
  const keywords = Array.isArray(entry.typeKeywords)
    ? entry.typeKeywords.map(String).join(" ")
    : "";

  return [name, ...identifierVariants(name), type, keywords]
    .filter(Boolean)
    .join(" ");
}

function buildActionSearchMetadata(slug: string): string | undefined {
  const actionName = slug.replace(/-/g, "_");
  const action = actionsByName.get(actionName);
  const grammar = grammarByAction[actionName];

  if (!action && !grammar) {
    return undefined;
  }

  const lines: string[] = [];

  if (action) {
    lines.push(`Search aliases: ${identifierVariants(action.name).join(" ")}.`);
    lines.push(`Reach availability: ${action.reach}.`);

    const supportedBuilds = action.builds
      .map((build) => buildLabels.get(build) ?? build)
      .join(" ");
    lines.push(`Supported builds: ${supportedBuilds}.`);
  }

  if (grammar) {
    if (grammar.empty) {
      lines.push("Parameters: no operands.");
    } else {
      lines.push(`Parameters grammar: ${grammar.grammar}.`);
      lines.push(`Parameter operands: ${grammarSearchTerms(grammar.grammar)}.`);
    }
  }

  return lines.join("\n");
}

function buildEnumSearchMetadata(src: string): string | undefined {
  const match = src.match(/<EnumVersionTable enum="([^"]+)" \/>/);
  if (!match) {
    return undefined;
  }

  const table = enumTables[match[1]!];
  if (!table) {
    return undefined;
  }

  return table.entries.map((entry) => formatEnumEntry(entry)).join("\n");
}

function enrichActionPage(src: string, slug: string): string {
  const metadata = buildActionSearchMetadata(slug);
  return metadata ? `${src}\n\n${metadata}\n` : src;
}

function enrichEnumPage(src: string): string {
  const metadata = buildEnumSearchMetadata(src);
  if (!metadata) {
    return src;
  }

  const tagMatch = src.match(/<EnumVersionTable enum="([^"]+)" \/>/);
  if (tagMatch) {
    return src.replace(tagMatch[0], `${tagMatch[0]}\n\n${metadata}\n`);
  }

  return `${src}\n\n${metadata}\n`;
}

function enrichMarkdown(src: string, relativePath: string): string {
  const normalizedPath = relativePath.replace(/\\/g, "/");
  let enriched = src;

  const actionSlug = actionSlugFromPath(normalizedPath);
  if (actionSlug) {
    enriched = enrichActionPage(enriched, actionSlug);
  }

  if (normalizedPath.includes("language/enums/")) {
    enriched = enrichEnumPage(enriched);
  }

  return enriched;
}

export const localSearchOptions = {
  detailedView: true as const,
  miniSearch: {
    searchOptions: {
      combineWith: "AND" as const,
      fuzzy: 0.15,
      prefix: true,
      boost: { title: 8, text: 2, titles: 2 },
    },
    options: {
      tokenize(text: string) {
        const terms: string[] = [];

        for (const match of text.matchAll(
          /[a-z0-9]+(?:[_-][a-z0-9]+)+|[a-z0-9]+/gi,
        )) {
          const token = match[0].toLowerCase();
          terms.push(token);

          if (token.includes("_") || token.includes("-")) {
            for (const part of token.split(/[_-]/)) {
              if (part.length > 1) {
                terms.push(part);
              }
            }
          }
        }

        return terms;
      },
      processTerm(term: string) {
        const normalized = term.toLowerCase();
        const variants = new Set<string>([normalized]);

        if (normalized.includes("_")) {
          variants.add(normalized.replace(/_/g, "-"));
        }
        if (normalized.includes("-")) {
          variants.add(normalized.replace(/-/g, "_"));
        }

        return [...variants];
      },
    },
  },
};

export function createSearchRenderHook() {
  return async (src: string, env: MarkdownEnv, md: MarkdownIt) => {
    const enriched = enrichMarkdown(src, env.relativePath ?? "");
    const html = md.render(enriched, env);
    return env.frontmatter?.search === false ? "" : html;
  };
}
