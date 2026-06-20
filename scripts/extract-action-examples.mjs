/**
 * Mines real `action` invocations from HREK broken gametype scripts.
 * Writes docs/.vitepress/action-examples.json (committed; refresh locally via HREK_ROOT).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "docs", ".vitepress", "action-examples.json");

const DEFAULT_HREK_ROOT =
  "C:/Program Files (x86)/Steam/steamapps/common/HREK";

/** Legacy HREK script opcode names → current blf `e_action_type` names. */
export const HREK_ACTION_ALIASES = {
  give_weapon: "biped_give_weapon",
  object_set_minimap_icon: "navpoint_set_icon",
  object_set_minimap_priority: "navpoint_set_priority",
  object_set_minimap_visibility: "navpoint_set_visible",
  set_respawn_loadout: "set_loadout_palette",
  player_get_fireteam_tier: "player_get_fireteam_index",
  player_set_fireteam_tier: "player_set_fireteam_index",
  object_get_vitality: "object_get_health",
  timer_set_value: "timer_set_rate",
  weapon_set_autopickup: "weapon_set_pickup_priority",
};

/**
 * @param {string} rawName
 */
export function normalizeActionName(rawName) {
  const lower = rawName.toLowerCase();
  return HREK_ACTION_ALIASES[lower] ?? lower;
}

/**
 * @param {string} line
 */
function scoreExampleLine(line) {
  let score = line.length;
  if (line.includes(";")) score += 50;
  if (/\t/.test(line)) score += 5;
  return score;
}

/**
 * @param {string} scriptsDir
 * @returns {Record<string, { line: string; source: string }>}
 */
export function extractActionExamples(scriptsDir) {
  /** @type {Record<string, { line: string; source: string; score: number }>} */
  const best = {};

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".txt")) {
        continue;
      }
      const text = fs.readFileSync(fullPath, "utf8");
      for (const rawLine of text.split(/\r?\n/)) {
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith(";")) {
          continue;
        }
        const match = trimmed.match(/^action\s+(\S+)(.*)$/i);
        if (!match) {
          continue;
        }
        const name = normalizeActionName(match[1]);
        const line = trimmed.replace(/\s+/g, " ");
        const score = scoreExampleLine(line);
        const existing = best[name];
        if (!existing || score < existing.score) {
          best[name] = {
            line,
            source: path.relative(scriptsDir, fullPath).replace(/\\/g, "/"),
            score,
          };
        }
      }
    }
  }

  walk(scriptsDir);

  /** @type {Record<string, { line: string; source: string }>} */
  const result = {};
  for (const [name, entry] of Object.entries(best)) {
    result[name] = { line: entry.line, source: entry.source };
  }
  return result;
}

/**
 * @param {{ write?: boolean; hrekRoot?: string }} [options]
 */
export function loadOrExtractActionExamples(options = {}) {
  const hrekRoot = options.hrekRoot ?? process.env.HREK_ROOT ?? DEFAULT_HREK_ROOT;
  const scriptsDir = path.join(hrekRoot, "data", "multiplayer", "megalo", "broken");

  if (fs.existsSync(scriptsDir)) {
    const examples = extractActionExamples(scriptsDir);
    if (options.write !== false) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(
        outPath,
        `${JSON.stringify({ source: scriptsDir, examples }, null, 2)}\n`
      );
      console.log(
        `Wrote ${Object.keys(examples).length} action examples to ${outPath}`
      );
    }
    return examples;
  }

  if (fs.existsSync(outPath)) {
    console.warn(
      `HREK scripts not found at ${scriptsDir}; using committed ${outPath}`
    );
    const data = JSON.parse(fs.readFileSync(outPath, "utf8"));
    return data.examples ?? data;
  }

  console.warn(
    `HREK scripts not found and no committed examples at ${outPath}; continuing with empty examples`
  );
  return {};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  loadOrExtractActionExamples({ write: true });
}
