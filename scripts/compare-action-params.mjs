import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blfRoot = path.join(root, "node_modules", "@blamnetwork", "blf", "src", "blam");

const VERSIONS = [
  {
    id: "omaha-alpha",
    file: "haloreach/v08516_10_02_19_1607_omaha_alpha/game/megalogamengine/megalogamengine_actions.ts",
  },
  {
    id: "omaha-delta",
    file: "haloreach/v09730_10_04_09_1309_omaha_delta/game/megalogamengine/megalogamengine_actions.ts",
  },
  {
    id: "release",
    file: "haloreach/v11860_10_07_24_0147_omaha_release/game/megalogamengine/megalogamengine_actions.ts",
  },
  {
    id: "tu1",
    file: "haloreach/v12065_11_08_24_1738_tu1actual/game/megalogamengine/megalogamengine_actions.ts",
  },
  {
    id: "mcc",
    file: "haloreach_mcc/v_untracked_25_08_16_1352/game/megalogamengine/megalogamengine_actions.ts",
  },
];

function resolveFile(filePath) {
  let text = fs.readFileSync(filePath, "utf8");
  const reExport = text.match(/export \* from ["'](.+?)["']/);
  if (reExport && !text.includes("export enum e_action_type")) {
    let target = path.resolve(path.dirname(filePath), reExport[1]);
    if (!path.extname(target)) {
      target += ".ts";
    }
    return resolveFile(target);
  }
  return text;
}

function parseActionEnum(text) {
  const match = text.match(/export enum e_action_type \{([\s\S]*?)\n\}/);
  if (!match) {
    throw new Error("e_action_type not found");
  }
  const map = new Map();
  for (const [, name, value] of match[1].matchAll(/(\w+)\s*=\s*(\d+)/g)) {
    map.set(name, Number(value));
  }
  return map;
}

function parseParamStruct(text, className) {
  const re = new RegExp(
    `export class ${className} \\{([\\s\\S]*?)\\n\\}`,
    "m"
  );
  const match = text.match(re);
  if (!match) {
    return null;
  }
  const body = match[1];
  const fields = [];
  for (const fieldMatch of body.matchAll(/^\s*m_(\w+)\s*[:=]/gm)) {
    if (!fields.includes(fieldMatch[1])) {
      fields.push(fieldMatch[1]);
    }
  }
  const reads = [];
  for (const readMatch of body.matchAll(
    /bitstream\.read_(\w+)\([\s\S]*?\)/g
  )) {
    const call = readMatch[0];
    const kindMatch = call.match(/read_(\w+)/);
    const nameMatch = call.match(/"([^"]+)"/);
    const argsMatch = call.match(/\(([\s\S]*)\)$/);
    if (!kindMatch || !argsMatch) {
      continue;
    }
    const kind = kindMatch[1] === "enum" ? "integer" : kindMatch[1];
    const args = argsMatch[1]
      .replace(/"[^"]*"/g, "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const width = args[0] ?? "";
    reads.push(`${nameMatch?.[1] ?? "?"}:${kind}(${width})`);
  }
  return JSON.stringify({ fields, reads });
}

function structNameForAction(actionName) {
  return `s_action_${actionName}_parameters`;
}

const byVersion = new Map();
for (const version of VERSIONS) {
  const filePath = path.join(blfRoot, version.file);
  const text = resolveFile(filePath);
  const actions = parseActionEnum(text);
  const structs = new Map();
  for (const actionName of actions.keys()) {
    if (actionName === "none") {
      continue;
    }
    structs.set(
      actionName,
      parseParamStruct(text, structNameForAction(actionName))
    );
  }
  byVersion.set(version.id, { actions, structs });
}

const allActions = new Set();
for (const { actions } of byVersion.values()) {
  for (const name of actions.keys()) {
    if (name !== "none") {
      allActions.add(name);
    }
  }
}

const changes = [];
for (const action of [...allActions].sort()) {
  const present = VERSIONS.filter((v) => byVersion.get(v.id).actions.has(action));
  if (present.length < 2) {
    continue;
  }
  const sigs = new Map();
  for (const version of present) {
    sigs.set(version.id, byVersion.get(version.id).structs.get(action));
  }
  const unique = [...new Set([...sigs.values()].filter(Boolean))];
  if (unique.length > 1) {
    changes.push({ action, present: present.map((v) => v.id), sigs });
  }
}

function wireSignature(sig) {
  if (!sig) return null;
  const parsed = JSON.parse(sig);
  // Wire layout is type + bit width + order; bitstream debug names are not on-wire.
  return parsed.reads
    .map((read) => {
      const match = read.match(/^[^:]+:(\w+)\((.*)\)$/);
      return match ? `${match[1]}(${match[2]})` : read;
    })
    .join("|");
}

const wireChanges = [];
const fieldRenames = [];
for (const change of changes) {
  const wireSigs = new Map();
  for (const [versionId, sig] of change.sigs) {
    wireSigs.set(versionId, wireSignature(sig));
  }
  const uniqueWire = [...new Set([...wireSigs.values()])].filter(
    (wire) => wire !== null
  );
  if (uniqueWire.length > 1) {
    wireChanges.push({ ...change, wireSigs });
  } else {
    const fieldSigs = [...new Set([...change.sigs.values()].filter(Boolean))];
    if (fieldSigs.length > 1) {
      fieldRenames.push(change);
    }
  }
}

console.log(`Wire-format parameter changes: ${wireChanges.length}\n`);
for (const change of wireChanges) {
  console.log(`${change.action}:`);
  for (const [versionId, wire] of change.wireSigs) {
    console.log(`  ${versionId}: ${wire}`);
  }
  console.log("");
}

console.log(`Same wire layout, blf field/type naming only: ${fieldRenames.length}`);
for (const change of fieldRenames) {
  console.log(`  ${change.action}`);
}
