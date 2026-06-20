import { defineConfig } from "vitepress";
import type { DefaultTheme } from "vitepress/theme";
import type MarkdownIt from "markdown-it";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import languageVersions from "./language-versions.json";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const highlightBundleUrl = pathToFileURL(
  path.join(configDir, "megalo-highlight.bundle.mjs")
).href;

const REACH_GAME_ICON = "/megalo/images/icons/game-reach.png";

function versionSidebarLabel(label: string) {
  return `<span class="version-sidebar-label"><img class="version-reach-icon" src="${REACH_GAME_ICON}" alt="" aria-hidden="true" /><span>${label}</span></span>`;
}

function normalizeFenceLang(lang: string | undefined): string {
  return (
    lang
      ?.replace(/\[.*\]/, "")
      .replace(/=(\d*)/, "")
      .replace(/:(no-)?line-numbers(=\d*)?$/, "")
      .replace(/-vue(?=:|$)/, "")
      .trim()
      .toLowerCase() ?? "txt"
  );
}

function elementsSidebar(): DefaultTheme.SidebarItem[] {
  return [
    { text: "Overview", link: "/language/elements/" },
    { text: "string_table", link: "/language/elements/string-table" },
    {
      text: "game_options",
      link: "/language/elements/game-options",
      items: [
        { text: "player_traits", link: "/language/elements/game-options/player-traits" },
      ],
    },
    { text: "constants", link: "/language/elements/constants" },
    { text: "loadout", link: "/language/elements/loadout" },
    { text: "loadout_palette", link: "/language/elements/loadout-palette" },
    { text: "include", link: "/language/elements/include" },
    { text: "localized_include", link: "/language/elements/localized-include" },
    { text: "base", link: "/language/elements/base" },
    { text: "teams", link: "/language/elements/teams" },
    { text: "engine_data", link: "/language/elements/engine-data" },
    { text: "player_rating", link: "/language/elements/player-rating" },
    { text: "map_permissions", link: "/language/elements/map-permissions" },
    { text: "variables", link: "/language/elements/variables" },
    {
      text: "trigger",
      link: "/language/elements/trigger",
      items: [
        { text: "condition", link: "/language/elements/trigger/condition" },
        { text: "action", link: "/language/elements/trigger/action" },
        { text: "begin", link: "/language/elements/begin" },
      ],
    },
    { text: "requisition_palette", link: "/language/elements/requisition-palette" },
    { text: "hud_widgets", link: "/language/elements/hud-widgets" },
    { text: "map_object", link: "/language/elements/map-object" },
    { text: "game_stats", link: "/language/elements/game-stats" },
  ];
}

function megaloLanguageSidebar(): DefaultTheme.SidebarItem[] {
  return [
    { text: "Introduction", link: "/language/" },
    { text: "Syntax & file format", link: "/language/syntax" },
    { text: "Base files", link: "/language/base-files" },
    {
      text: "Elements",
      collapsed: false,
      items: elementsSidebar(),
    },
    { text: "Variable model", link: "/language/variable-model" },
    { text: "References", link: "/language/references" },
    { text: "Example scripts", link: "/language/examples" },
    { text: "Object lists", link: "/language/object-lists" },
    { text: "Compiler settings", link: "/language/compiler-settings" },
  ];
}

function supportedVersionsSidebar(): DefaultTheme.SidebarItem[] {
  const items: DefaultTheme.SidebarItem[] = [
    { text: "Overview", link: "/versions/" },
  ];

  for (const version of languageVersions.versions) {
    items.push({
      text: versionSidebarLabel(version.label),
      collapsed: true,
      items: [
        { text: "About", link: `${version.docLink}about` },
        { text: "Actions", link: `${version.docLink}actions` },
      ],
    });
  }

  return items;
}

export default defineConfig(async () => {
  const { megaloCodeToHtml } = await import(
    /* @vite-ignore */ highlightBundleUrl
  );

  return {
    title: "@blamnetwork/megalo",
    description:
      "TypeScript library for parsing, compiling, and decompiling Halo Megalo scripts.",
    base: "/megalo/",
    cleanUrls: true,
    appearance: "force-dark",
    head: [
      ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
      [
        "link",
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
      ],
      [
        "link",
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Overpass:wght@400;500;600;700&display=swap",
        },
      ],
    ],
    markdown: {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      config(md: MarkdownIt) {
        const shikiHighlight = md.options.highlight;
        if (!shikiHighlight) {
          return;
        }

        md.options.highlight = (code, lang, attrs) => {
          if (normalizeFenceLang(lang) === "megalo") {
            return megaloCodeToHtml(code);
          }
          return shikiHighlight(code, lang, attrs);
        };
      },
    },
    themeConfig: {
      search: {
        provider: "local",
      },
      siteTitle:
        '<span class="megalo-site-title"><span class="megalo-scope">@blamnetwork/</span><span class="megalo-name">megalo</span></span>',
      nav: [
        { text: "Blam Network", link: "https://blam.network" },
        { text: "Guide", link: "/guide/quick-start" },
        { text: "Changelog", link: "/changelog" },
        {
          text: "npm",
          link: "https://www.npmjs.com/package/@blamnetwork/megalo",
        },
        {
          text: "GitHub",
          link: "https://github.com/Blam-Network/megalo",
        },
      ],
      sidebar: [
        {
          text: "Introduction",
          items: [
            { text: "What is megalo?", link: "/" },
            { text: "Install & quick start", link: "/guide/quick-start" },
          ],
        },
        {
          text: "Megalo language",
          items: megaloLanguageSidebar(),
        },
        {
          text: "Megalo Versions",
          items: supportedVersionsSidebar(),
        },
        {
          text: "Usage",
          items: [
            { text: "Parsing source", link: "/guide/parsing" },
            { text: "Compiling", link: "/guide/compiling" },
            { text: "Decompiling", link: "/guide/decompiling" },
            { text: "Gametypes & BLF", link: "/guide/gametypes" },
            { text: "Megalo versions", link: "/guide/megalo-versions" },
          ],
        },
        {
          text: "Contributing",
          items: [{ text: "Development", link: "/guide/development" }],
        },
        {
          text: "Reference",
          items: [{ text: "Changelog", link: "/changelog" }],
        },
      ],
      socialLinks: [
        {
          icon: "npm",
          link: "https://www.npmjs.com/package/@blamnetwork/megalo",
          ariaLabel: "npm",
        },
        {
          icon: "github",
          link: "https://github.com/Blam-Network/megalo",
        },
        {
          icon: "discord",
          link: "https://discord.gg/77ZAgXv8a6",
          ariaLabel: "Discord",
        },
      ],
      footer: {
        message: "MIT Licensed",
        copyright:
          'Copyright © <a href="https://discord.gg/77ZAgXv8a6" target="_blank" rel="noopener noreferrer">Blam Network</a>',
      },
    },
  };
});
