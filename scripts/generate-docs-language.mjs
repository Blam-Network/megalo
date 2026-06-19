/**
 * Generates Megalo language version docs from @blamnetwork/blf action tables:
 * - docs/.vitepress/language-versions.json
 * - docs/versions/<id>.md per supported build
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blfRoot = path.join(root, "node_modules", "@blamnetwork", "blf");
const outPath = path.join(root, "docs", ".vitepress", "language-versions.json");
const versionsDocsDir = path.join(root, "docs", "versions");
const AUTOGEN_MARKER = "<!-- autogen:language-version -->";

const SOURCE_REPO_BASE =
  "https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam";

/** @type {Array<{
 *   id: string;
 *   label: string;
 *   buildId: string;
 *   buildLabel: string;
 *   blfGame: string;
 *   versionId: string;
 *   librarySupport: "full" | "stub";
 *   description: string;
 * }>} */
const VERSIONS = [
  {
    id: "mcc",
    label: "Halo: Reach MCC",
    buildId: "v_untracked_25_08_16_1352",
    buildLabel: "16th Aug 2025",
    blfGame: "haloreach_mcc",
    versionId: "mcc",
    librarySupport: "full",
    description:
      "Current Halo: The Master Chief Collection Reach megalo build. This is the default megalo version for @blamnetwork/megalo compile and decompile.",
  },
  {
    id: "tu1",
    label: "Halo: Reach Xbox 360 TU1",
    buildId: "v12065_11_08_24_1738_tu1actual",
    buildLabel: "Title Update 1",
    blfGame: "haloreach",
    versionId: "tu1",
    librarySupport: "stub",
    description:
      "Final Xbox 360 Reach Title Update megalo build. The TU1 megalo version is available in @blamnetwork/megalo but still routes through MCC codec wiring until TU1-specific tables are fully integrated.",
  },
];

/**
 * @param {string} filePath
 * @returns {{ name: string; opcode: number }[]}
 */
function parseActionTypes(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(/export enum e_action_type \{([\s\S]*?)\n\}/);
  if (!match) {
    throw new Error(`e_action_type enum not found in ${filePath}`);
  }
  return [...match[1].matchAll(/(\w+)\s*=\s*(\d+)/g)]
    .filter(([, name]) => name !== "none")
    .map(([, name, opcode]) => ({ name, opcode: Number(opcode) }))
    .sort((a, b) => a.opcode - b.opcode);
}

/**
 * @param {typeof VERSIONS[number]} version
 * @param {{ name: string; opcode: number }[]} actions
 * @param {Set<string>} mccOnlyNames
 */
function writeVersionPage(version, actions, mccOnlyNames) {
  const pagePath = path.join(versionsDocsDir, `${version.id}.md`);
  const importPath = `@blamnetwork/blf/${version.blfGame}/${version.buildId}`;
  const sourcePath = `${version.blfGame}/${version.buildId}/game/megalogamengine/megalogamengine_actions.ts`;
  const supportNote =
    version.librarySupport === "full"
      ? "Fully supported by @blamnetwork/megalo (default megalo version)."
      : "Available as megalo version `tu1`; compiler integration is still a stub.";

  const mccOnlySection =
    version.id === "mcc"
      ? `
## MCC-only actions

These opcodes exist in Reach MCC but not in Xbox 360 TU1. Scripts that use them cannot be converted to TU1 without changes.

${[...mccOnlyNames]
  .sort()
  .map((name) => `- \`${name}\``)
  .join("\n")}
`
      : `
## Compared to MCC

TU1 ends at opcode \`${actions.at(-1)?.name ?? "—"}\` (\`${actions.at(-1)?.opcode ?? "—"}\`). Reach MCC adds ${mccOnlyNames.size} action type${mccOnlyNames.size === 1 ? "" : "s"} after that point — see the [MCC version page](/versions/mcc#mcc-only-actions).
`;

  const body = `# ${version.label}

${AUTOGEN_MARKER}

${version.description}

| | |
|---|---|
| **Build** | ${version.buildLabel} (\`${version.buildId}\`) |
| **BLF import** | \`${importPath}\` |
| **Megalo version** | \`${version.versionId}\` |
| **Library support** | ${supportNote} |
| **Action count** | ${actions.length} (excluding \`none\`) |

Action names match \`e_action_type\` in [@blamnetwork/blf](${SOURCE_REPO_BASE}/${sourcePath}).

<LanguageActionTable version="${version.id}" />
${mccOnlySection}
`;

  fs.mkdirSync(versionsDocsDir, { recursive: true });
  fs.writeFileSync(pagePath, body);
}

const parsedById = new Map();
for (const version of VERSIONS) {
  const actionsPath = path.join(
    blfRoot,
    "src",
    "blam",
    version.blfGame,
    version.buildId,
    "game",
    "megalogamengine",
    "megalogamengine_actions.ts"
  );
  if (!fs.existsSync(actionsPath)) {
    throw new Error(
      `Missing blf action table at ${actionsPath} — run npm install`
    );
  }
  parsedById.set(version.id, parseActionTypes(actionsPath));
}

const mccActions = parsedById.get("mcc") ?? [];
const tu1Actions = parsedById.get("tu1") ?? [];
const tu1Names = new Set(tu1Actions.map((a) => a.name));
const mccOnlyNames = new Set(
  mccActions.filter((a) => !tu1Names.has(a.name)).map((a) => a.name)
);

const versions = VERSIONS.map((version) => {
  const actions = parsedById.get(version.id) ?? [];
  return {
    ...version,
    importPath: `@blamnetwork/blf/${version.blfGame}/${version.buildId}`,
    sourcePath: `${version.blfGame}/${version.buildId}/game/megalogamengine/megalogamengine_actions.ts`,
    docLink: `/versions/${version.id}`,
    actions,
    mccOnlyActionNames:
      version.id === "mcc" ? [...mccOnlyNames].sort() : undefined,
  };
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  `${JSON.stringify({ sourceRepoBase: SOURCE_REPO_BASE, versions, mccOnlyActionNames: [...mccOnlyNames].sort() }, null, 2)}\n`
);

for (const version of VERSIONS) {
  writeVersionPage(
    version,
    parsedById.get(version.id) ?? [],
    mccOnlyNames
  );
}

const versionsIndex = `# Supported versions

${AUTOGEN_MARKER}

@blamnetwork/megalo targets the Reach megalo builds below. Each page lists the compiled **action opcodes** (\`e_action_type\`) for that build, taken from [@blamnetwork/blf](https://blam-network.github.io/blf/) struct definitions.

| Version | Build | Actions | Library |
|---------|-------|---------|---------|
${versions
  .map(
    (v) =>
      `| [${v.label}](${v.docLink}) | \`${v.buildId}\` | ${v.actions.length} | ${v.librarySupport === "full" ? "Full" : "Stub"} |`
  )
  .join("\n")}

Run \`npm run docs:gen\` after updating @blamnetwork/blf to refresh these tables.

Historical pre-release Reach builds (Omaha Alpha, Public Beta, and so on) also have megalo action tables in blf — see the [blf version guide](https://blam-network.github.io/blf/guide/versions/haloreach/).
`;

fs.writeFileSync(path.join(versionsDocsDir, "index.md"), versionsIndex);

console.log(
  `Wrote ${versions.length} language version pages and ${outPath}`
);
