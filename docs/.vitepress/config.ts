import { defineConfig } from "vitepress";
import type { DefaultTheme } from "vitepress/theme";
import languageVersions from "./language-versions.json";

function megaloLanguageSidebar(): DefaultTheme.SidebarItem[] {
  return [
    { text: "Overview", link: "/language/" },
    { text: "Object lists", link: "/language/object-lists" },
  ];
}

function supportedVersionsSidebar(): DefaultTheme.SidebarItem[] {
  const items: DefaultTheme.SidebarItem[] = [
    { text: "Overview", link: "/versions/" },
  ];

  for (const version of languageVersions.versions) {
    items.push({
      text: version.label,
      link: version.docLink,
    });
  }

  return items;
}

export default defineConfig({
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
        href: "https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;700&display=swap",
      },
    ],
  ],
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },
  themeConfig: {
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
        text: "Supported versions",
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
});
