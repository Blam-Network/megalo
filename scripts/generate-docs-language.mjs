/**
 * Generates Megalo language version docs from @blamnetwork/blf action tables:
 * - docs/.vitepress/language-versions.json
 * - docs/versions/<id>/{index,actions,about}.md per supported build
 * - docs/.vitepress/megalo-highlight.bundle.mjs (MegaloEdit-style highlighter)
 */
import { spawnSync } from "node:child_process";
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

/** Chronological order — used for change diffs. */
const VERSIONS = [
  {
    id: "omaha-alpha",
    docSlug: "49",
    label: "49",
    buildId: "v08516_10_02_19_1607_omaha_alpha",
    buildLabel: "Private Alpha",
    blfGame: "haloreach",
    versionId: null,
    librarySupport: "blf-only",
    description:
      "Earliest Reach megalo action table in @blamnetwork/blf — the Private Alpha (Omaha) build.",
  },
  {
    id: "omaha-delta",
    docSlug: "73",
    label: "73",
    buildId: "v09730_10_04_09_1309_omaha_delta",
    buildLabel: "Public Beta",
    blfGame: "haloreach",
    versionId: null,
    librarySupport: "blf-only",
    description:
      "Public Beta (Omaha Delta) megalo build. Action tables are available in @blamnetwork/blf for historical comparison.",
  },
  {
    id: "release",
    docSlug: "106",
    label: "106",
    buildId: "v11860_10_07_24_0147_omaha_release",
    buildLabel: "Release",
    blfGame: "haloreach",
    versionId: null,
    librarySupport: "blf-only",
    description:
      "Original Xbox 360 Reach launch megalo build (encoding version 106). Action opcodes match Title Update 1; the custom variant layout omits AU1 settings added in TU1.",
  },
  {
    id: "tu1",
    docSlug: "107",
    label: "107",
    buildId: "v12065_11_08_24_1738_tu1actual",
    buildLabel: "Title Update 1",
    blfGame: "haloreach",
    versionId: "tu1",
    librarySupport: "stub",
    description:
      "Final Xbox 360 Reach Title Update megalo build. The TU1 megalo version is available in @blamnetwork/megalo but still routes through MCC codec wiring until TU1-specific tables are fully integrated.",
  },
  {
    id: "mcc",
    docSlug: "107-mcc",
    label: "107 (MCC)",
    buildId: "v_untracked_25_08_16_1352",
    buildLabel: "16th Aug 2025",
    blfGame: "haloreach_mcc",
    versionId: "mcc",
    librarySupport: "full",
    description:
      "Current Halo: The Master Chief Collection Reach megalo build. This is the default megalo version for @blamnetwork/megalo compile and decompile.",
  },
];

const REACH_ICON_SRC = "/megalo/images/icons/game-reach.png";

/** Newest-first rows for docs/versions/index.md. */
const VERSION_INDEX_ROWS = [
  {
    versionId: "mcc",
    versionNumber: 107,
    supportedBuilds: "(All Halo: Reach MCC Versions)",
  },
  {
    versionId: "tu1",
    versionNumber: 107,
    supportedBuilds: "`12065.11.08.24.1738.tu1actual`",
  },
  {
    versionId: "release",
    versionNumber: 106,
    supportedBuilds:
      "`12065.11.08.24.1738.tu1actual` (read only)<br/>`11860.10.07.24.0147.omaha_release`",
  },
  {
    versionId: "omaha-delta",
    versionNumber: 73,
    supportedBuilds:
      "`09730.10.04.09.1309.omaha_delta`<br/>`09664.10.04.06.2121.omaha_beta`",
  },
  {
    versionNumber: 69,
    supportedBuilds: "`08915.??.??.??.????.????`",
  },
  {
    versionId: "omaha-alpha",
    versionNumber: 49,
    supportedBuilds: "`08516.10.02.19.1607.omaha_alpha`",
  },
  {
    versionNumber: 41,
    supportedBuilds: "`07703.??.??.??.????.????`",
  },
  {
    versionNumber: 32,
    supportedBuilds: "`07151.??.??.??.????.????`",
  },
];

const indexRowByVersionId = new Map(
  VERSION_INDEX_ROWS.filter((row) => row.versionId).map((row) => [
    row.versionId,
    row,
  ])
);

/**
 * @param {string} versionId
 */
function supportedHaloBuildsMarkdown(versionId) {
  const row = indexRowByVersionId.get(versionId);
  if (!row) {
    return "—";
  }
  const lines = row.supportedBuilds
    .split(/<br\/?>/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 1 && lines[0] === "(All Halo: Reach MCC Versions)") {
    return "All Halo: Reach MCC builds.";
  }
  return lines.map((line) => `- ${line}`).join("\n");
}

/**
 * @param {typeof VERSIONS[number]} version
 */
function aboutSupportNote(version) {
  switch (version.librarySupport) {
    case "full":
      return "Fully supported by @blamnetwork/megalo (default megalo dialect).";
    case "stub":
      return "Available as megalo version `tu1`; compiler integration is still a stub.";
    default:
      return "Not supported for compile or decompile in @blamnetwork/megalo.";
  }
}

function reachGameCell() {
  return `<img class="version-reach-icon" src="${REACH_ICON_SRC}" alt="Halo: Reach" title="Halo: Reach" />`;
}

/**
 * @param {typeof VERSION_INDEX_ROWS[number]} row
 * @param {typeof VERSIONS[number]} version
 */
function versionIndexLink(row, version) {
  const slug = versionDocSlug(version);
  const number = String(row.versionNumber);
  let label = number;
  if (version.id === "mcc") {
    label = `${number}<span class="version-index-suffix"> MCC</span>`;
  } else if (version.id === "tu1") {
    label = `${number}<span class="version-index-suffix"> TU1</span>`;
  }
  return `<a class="version-index-link" href="/versions/${slug}/">${label}</a>`;
}

/**
 * @param {typeof VERSION_INDEX_ROWS[number]} row
 */
function versionIndexCell(row) {
  if (!row.versionId) {
    return String(row.versionNumber);
  }
  const version = versionsById.get(row.versionId);
  if (!version) {
    throw new Error(`Unknown version index row: ${row.versionId}`);
  }
  return versionIndexLink(row, version);
}

/**
 * @param {"full" | "stub" | "blf-only"} librarySupport
 */
function megaloSupportTableLabel(librarySupport) {
  switch (librarySupport) {
    case "full":
      return "Full";
    case "stub":
      return "Stub";
    default:
      return "No";
  }
}

/**
 * @param {string} filePath
 * @returns {{ name: string; opcode: number }[]}
 */
function parseActionTypes(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const reExport = text.match(/export \* from ["'](.+?)["']/);
  if (reExport && !text.includes("export enum e_action_type")) {
    let target = path.resolve(path.dirname(filePath), reExport[1]);
    if (!path.extname(target)) {
      target += ".ts";
    }
    if (!fs.existsSync(target)) {
      throw new Error(`Re-export target not found: ${target} (from ${filePath})`);
    }
    return parseActionTypes(target);
  }
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
 * @param {{ name: string; opcode: number }[]} current
 * @param {{ name: string; opcode: number }[]} previous
 */
function diffActions(current, previous) {
  const previousNames = new Set(previous.map((action) => action.name));
  const currentNames = new Set(current.map((action) => action.name));

  return {
    added: current.filter((action) => !previousNames.has(action.name)),
    removed: previous.filter((action) => !currentNames.has(action.name)),
  };
}

/**
 * @param {typeof VERSIONS[number]} version
 */
function librarySupportNote(version) {
  switch (version.librarySupport) {
    case "full":
      return "Fully supported by @blamnetwork/megalo (default megalo version).";
    case "stub":
      return "Available as megalo version `tu1`; compiler integration is still a stub.";
    default:
      return "Action tables only — not wired as a @blamnetwork/megalo dialect.";
  }
}

/**
 * @param {typeof VERSIONS[number]} version
 */
function versionDocSlug(version) {
  return version.docSlug ?? version.id;
}

/**
 * @param {typeof VERSIONS[number]} version
 * @param {{ name: string; opcode: number }[]} actions
 * @param {{ added: { name: string; opcode: number }[]; removed: { name: string; opcode: number }[] } | null} changeSet
 * @param {typeof VERSIONS[number] | null} previousVersion
 * @param {Set<string>} mccOnlyNames
 */
function writeVersionPages(
  version,
  actions,
  changeSet,
  previousVersion,
  mccOnlyNames
) {
  const slug = versionDocSlug(version);
  const versionDir = path.join(versionsDocsDir, slug);
  const importPath = `@blamnetwork/blf/${version.blfGame}/${version.buildId}`;
  const sourcePath = `${version.blfGame}/${version.buildId}/game/megalogamengine/megalogamengine_actions.ts`;
  const docBase = `/versions/${slug}`;
  const megaloVersionRow = version.versionId
    ? `\n| **Megalo version** | \`${version.versionId}\` |`
    : "";

  const indexBody = `# ${version.label}

${AUTOGEN_MARKER}

${version.description}

| | |
|---|---|
| **Build** | ${version.buildLabel} (\`${version.buildId}\`) |
| **BLF import** | \`${importPath}\` |${megaloVersionRow}
| **Library support** | ${librarySupportNote(version)} |
| **Action count** | ${actions.length} (excluding \`none\`) |

- [About](${docBase}/about) — version overview and changes from the prior build
- [Actions](${docBase}/actions) — full \`e_action_type\` opcode table
`;

  const actionsBody = `# Actions

${AUTOGEN_MARKER}

Action names match \`e_action_type\` in [@blamnetwork/blf](${SOURCE_REPO_BASE}/${sourcePath}).

<LanguageActionTable version="${version.id}" />
`;

  const indexRow = indexRowByVersionId.get(version.id);
  const versionNumber = indexRow?.versionNumber;

  let aboutBody = `# About

${AUTOGEN_MARKER}

${version.description}

`;

  if (versionNumber !== undefined) {
    aboutBody += `Megalo encoding version **${versionNumber}**.

`;
  }

  aboutBody += `## Supported Halo builds

${supportedHaloBuildsMarkdown(version.id)}

## Supported by @blamnetwork/megalo

${aboutSupportNote(version)}

## Changes from prior version

`;

  if (!previousVersion || !changeSet) {
    aboutBody += `Baseline megalo action table for **${version.buildLabel}**. No earlier Reach build with an \`e_action_type\` enum is tracked in @blamnetwork/blf.

See the [Actions](${docBase}/actions) page for the full opcode list.
`;
  } else {
    aboutBody += `Compared to [${previousVersion.label}](/versions/${versionDocSlug(previousVersion)}/about).

`;

    if (changeSet.added.length === 0 && changeSet.removed.length === 0) {
      aboutBody += `No action types were added or removed between these builds.
`;
    } else {
      if (changeSet.added.length > 0) {
        aboutBody += `### Actions added

${changeSet.added.map((action) => `- \`${action.name}\` (opcode ${action.opcode})`).join("\n")}

`;
      }
      if (changeSet.removed.length > 0) {
        aboutBody += `### Actions removed

${changeSet.removed.map((action) => `- \`${action.name}\` (opcode ${action.opcode})`).join("\n")}

`;
      }
    }

    if (version.id === "mcc") {
      aboutBody += `### Language changes

Reach MCC also adds megalo language features beyond new action opcodes — bit-shift assignment operators, temporary explicit references, survival/firefight flags, and more. See [Megalo MCC changes](https://blam-network.github.io/blf/guide/megalo-mcc-changes) in the blf docs.

`;
    }

    aboutBody += `See the [Actions](${docBase}/actions) page for the full opcode list on this build.
`;
  }

  fs.mkdirSync(versionDir, { recursive: true });
  fs.writeFileSync(path.join(versionDir, "index.md"), indexBody);
  fs.writeFileSync(path.join(versionDir, "actions.md"), actionsBody);
  fs.writeFileSync(path.join(versionDir, "about.md"), aboutBody);
  const staleChangesPath = path.join(versionDir, "changes.md");
  if (fs.existsSync(staleChangesPath)) {
    fs.unlinkSync(staleChangesPath);
  }
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

const MEGALO_KEYWORDS = [
  "action", "and", "begin", "category", "color", "condition", "constants",
  "default", "description", "designator", "end", "engine_data", "exception",
  "false", "game_options", "hud_widgets", "icon", "if", "include", "label",
  "local", "map_object", "map_permissions", "model", "name", "networked",
  "networked_high", "none", "number", "object", "option", "or", "override",
  "player", "player_traits", "ranged_option", "statistics", "game_stats", "team",
  "teams", "timer", "trigger", "true", "string_table", "variables",
];

const MEGALO_CONDITIONS = [
  "if", "player_died", "team_is_active", "timer_expired", "team_disposition",
  "object_is_type", "object_out_of_bounds", "object_in_area",
  "player_is_fireteam_leader", "player_assisted_kill_of", "object_matches_filter",
  "player_is_active", "equipment_is_active", "player_is_spartan", "player_is_elite",
  "player_is_monitor", "game_is_forge",
];

const MEGALO_MATH_OPS = [
  "+", "-", "*", "/", "=", "%", "&", "|", "^", "~", "<<", ">>",
  "add", "subtract", "multiply_by", "divide_by", "set_to", "modulo_by",
];

const MEGALO_COMPARISON_OPS = [
  "==", "!=", "<", ">", "<=", ">=",
  "equal_to", "not_equal_to", "less_than", "greater_than",
  "less_than_or_equal_to", "greater_than_or_equal_to",
];

const MEGALO_TRIGGER_KINDS = [
  "general", "player", "team", "object", "initialization",
  "local_initialization", "host_migration", "object_death", "local", "pregame",
];

const mccActions = parsedById.get("mcc") ?? [];
const highlightVocabularyPath = path.join(
  root,
  "docs",
  ".vitepress",
  "megalo-highlight-vocabulary.json"
);
fs.writeFileSync(
  highlightVocabularyPath,
  `${JSON.stringify(
    {
      actions: mccActions.map((action) => action.name).sort(),
      conditions: [...new Set(MEGALO_CONDITIONS)].sort(),
      mathOps: MEGALO_MATH_OPS,
      comparisonOps: MEGALO_COMPARISON_OPS,
      triggerKinds: MEGALO_TRIGGER_KINDS,
      sectionKeywords: [...new Set(MEGALO_KEYWORDS)].sort(),
    },
    null,
    2
  )}\n`
);

const tu1Actions = parsedById.get("tu1") ?? [];
const tu1Names = new Set(tu1Actions.map((a) => a.name));
const mccOnlyNames = new Set(
  mccActions.filter((a) => !tu1Names.has(a.name)).map((a) => a.name)
);

const displayVersions = [...VERSIONS].reverse();

const versions = displayVersions.map((version) => {
  const actions = parsedById.get(version.id) ?? [];
  const chronoIndex = VERSIONS.findIndex((entry) => entry.id === version.id);
  const previousVersion = chronoIndex > 0 ? VERSIONS[chronoIndex - 1] : null;
  const previousActions = previousVersion
    ? (parsedById.get(previousVersion.id) ?? [])
    : [];
  const changeSet = previousVersion
    ? diffActions(actions, previousActions)
    : null;

  return {
    ...version,
    docSlug: versionDocSlug(version),
    importPath: `@blamnetwork/blf/${version.blfGame}/${version.buildId}`,
    sourcePath: `${version.blfGame}/${version.buildId}/game/megalogamengine/megalogamengine_actions.ts`,
    docLink: `/versions/${versionDocSlug(version)}/`,
    aboutLink: `/versions/${versionDocSlug(version)}/about`,
    actionsLink: `/versions/${versionDocSlug(version)}/actions`,
    previousVersionId: previousVersion?.id ?? null,
    actions,
    addedActionNames: changeSet?.added.map((action) => action.name) ?? [],
    removedActionNames: changeSet?.removed.map((action) => action.name) ?? [],
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
  const chronoIndex = VERSIONS.findIndex((entry) => entry.id === version.id);
  const previousVersion = chronoIndex > 0 ? VERSIONS[chronoIndex - 1] : null;
  const actions = parsedById.get(version.id) ?? [];
  const previousActions = previousVersion
    ? (parsedById.get(previousVersion.id) ?? [])
    : [];
  const changeSet = previousVersion
    ? diffActions(actions, previousActions)
    : null;

  writeVersionPages(
    version,
    actions,
    changeSet,
    previousVersion,
    mccOnlyNames
  );
}

for (const stale of ["mcc.md", "tu1.md"]) {
  const stalePath = path.join(versionsDocsDir, stale);
  if (fs.existsSync(stalePath)) {
    fs.unlinkSync(stalePath);
  }
}

const activeSlugs = new Set(VERSIONS.map((version) => versionDocSlug(version)));
for (const entry of fs.readdirSync(versionsDocsDir, { withFileTypes: true })) {
  if (
    entry.isDirectory() &&
    entry.name !== "node_modules" &&
    !activeSlugs.has(entry.name)
  ) {
    fs.rmSync(path.join(versionsDocsDir, entry.name), {
      recursive: true,
      force: true,
    });
  }
}

const versionsById = new Map(VERSIONS.map((version) => [version.id, version]));

/**
 * @param {{ versionId?: string }} row
 */
function megaloSupportCell(row) {
  if (!row.versionId) {
    return "No";
  }
  const version = versionsById.get(row.versionId);
  if (!version) {
    throw new Error(`Unknown version index row: ${row.versionId}`);
  }
  return megaloSupportTableLabel(version.librarySupport);
}

const versionsIndex = `# Megalo Versions

${AUTOGEN_MARKER}

Halo: Reach gametypes carry a megalo **encoding version**. The table below lists each version we track, the Halo builds that use it, and whether @blamnetwork/megalo supports it for compile and decompile. Follow a version link for its **About** page (supported builds and changes since the prior version) and **Actions** page (full \`e_action_type\` opcode table).

| Version | Game | Supported Halo Builds | Supported by @blamnetwork/megalo |
|---------|------|-----------------------|----------------------------------|
${VERSION_INDEX_ROWS.map((row) => {
  return `| ${versionIndexCell(row)} | ${reachGameCell()} | ${row.supportedBuilds} | ${megaloSupportCell(row)} |`;
}).join("\n")}

Megalo encoding versions **69**, **41**, and **32** appear in recovered gametypes, but no supported Halo: Reach builds have surfaced at this time so information about their differences and actions is unavailable.
`;

fs.writeFileSync(path.join(versionsDocsDir, "index.md"), versionsIndex);

const bundleResult = spawnSync(
  process.execPath,
  [path.join(root, "scripts", "bundle-docs-highlight.mjs")],
  { cwd: root, stdio: "inherit" }
);
if (bundleResult.status !== 0) {
  throw new Error("Failed to bundle Megalo docs highlighter");
}

console.log(
  `Wrote ${versions.length} language version page sets and ${outPath}`
);
