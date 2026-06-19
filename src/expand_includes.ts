import { MegaloError } from "./error";

const INCLUDE_LINE =
  /^(?<indent>\s*)include\s+"(?<path>(?:[^"\\]|\\.)*)"\s*(?:;.*)?$/;

export type IncludeReadFile = (absolutePath: string) => string;

export interface ExpandIncludesOptions {
  /** Directory containing the file being expanded. */
  sourceDir: string;
  readFile: IncludeReadFile;
}

export interface MegaloIncludeDirective {
  line: number;
  column: number;
  offset: number;
  length: number;
  path: string;
}

export interface MegaloIncludeError extends MegaloIncludeDirective {
  message: string;
}

/** Locate every top-level `include "…"` directive in source text. */
export function findMegaloIncludeDirectives(
  source: string
): MegaloIncludeDirective[] {
  const lineStarts: number[] = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") {
      lineStarts.push(i + 1);
    }
  }

  const lines = source.split(/\r?\n/);
  const result: MegaloIncludeDirective[] = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!;
    const match = INCLUDE_LINE.exec(line);
    if (!match?.groups?.path) {
      continue;
    }
    const rawPath = match.groups.path;
    const path = rawPath.replace(/\\/g, "/");
    const quoteIndex = line.indexOf(`"${rawPath}"`);
    if (quoteIndex < 0) {
      continue;
    }
    const lineStart = lineStarts[lineIndex] ?? 0;
    result.push({
      line: lineIndex + 1,
      column: quoteIndex + 1,
      offset: lineStart + quoteIndex,
      length: rawPath.length + 2,
      path,
    });
  }
  return result;
}

export function sourceHasIncludeDirectives(source: string): boolean {
  return findMegaloIncludeDirectives(source).length > 0;
}

function includeErrorsForDirectives(
  directives: MegaloIncludeDirective[],
  message: string
): MegaloIncludeError[] {
  return directives.map((directive) => ({ ...directive, message }));
}

function matchIncludeErrors(
  directives: MegaloIncludeDirective[],
  message: string
): MegaloIncludeError[] {
  const matched = directives.filter(
    (directive) =>
      message.includes(directive.path) ||
      message.includes(`"${directive.path}"`)
  );
  if (matched.length > 0) {
    return matched.map((directive) => ({ ...directive, message }));
  }
  return includeErrorsForDirectives(directives, message);
}

/**
 * Expand includes or return structured errors anchored to `include` lines.
 * Fails when any include cannot be read or expanded.
 */
export function tryExpandMegaloIncludes(
  source: string,
  options: ExpandIncludesOptions
): { ok: true; source: string } | { ok: false; errors: MegaloIncludeError[] } {
  const directives = findMegaloIncludeDirectives(source);
  if (directives.length === 0) {
    return { ok: true, source };
  }
  try {
    return { ok: true, source: expandMegaloIncludes(source, options) };
  } catch (error) {
    const message =
      error instanceof MegaloError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    return { ok: false, errors: matchIncludeErrors(directives, message) };
  }
}

export function unresolvedIncludeErrors(
  source: string,
  message: string
): MegaloIncludeError[] {
  return includeErrorsForDirectives(findMegaloIncludeDirectives(source), message);
}

function normalizePath(path: string): string {
  const isWindowsDrive = /^[A-Za-z]:/.test(path);
  const isAbsolute = path.startsWith("/") || isWindowsDrive;
  const parts = path.replace(/\\/g, "/").split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") {
      continue;
    }
    if (part === "..") {
      out.pop();
      continue;
    }
    out.push(part);
  }
  if (isWindowsDrive) {
    return `${path.slice(0, 2)}\\${out.slice(1).join("\\")}`;
  }
  if (isAbsolute) {
    return `/${out.join("/")}`;
  }
  return out.join("/");
}

function joinPath(base: string, relative: string): string {
  const rel = relative.replace(/\\/g, "/");
  if (rel.startsWith("/") || /^[A-Za-z]:/.test(rel)) {
    return normalizePath(rel);
  }
  const baseNorm = base.replace(/\\/g, "/").replace(/\/$/, "");
  return normalizePath(`${baseNorm}/${rel}`);
}

function dirnamePath(path: string): string {
  const norm = path.replace(/\\/g, "/");
  const idx = norm.lastIndexOf("/");
  if (idx <= 0) {
    return norm;
  }
  return norm.slice(0, idx);
}

/**
 * Recursively expand `include "relative/path.txt"` lines into source text.
 * Paths resolve relative to the including file's directory.
 */
export function expandMegaloIncludes(
  source: string,
  options: ExpandIncludesOptions,
  seen: Set<string> = new Set()
): string {
  const lines: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    const match = INCLUDE_LINE.exec(line);
    if (!match?.groups?.path) {
      lines.push(line);
      continue;
    }

    const relativePath = match.groups.path.replace(/\\/g, "/");
    const absolutePath = joinPath(options.sourceDir, relativePath);
    if (seen.has(absolutePath)) {
      throw new MegaloError(`Circular include: ${relativePath}`);
    }

    const nextSeen = new Set(seen);
    nextSeen.add(absolutePath);
    const included = options.readFile(absolutePath);
    const expanded = expandMegaloIncludes(
      included,
      { ...options, sourceDir: dirnamePath(absolutePath) },
      nextSeen
    );
    if (lines.length > 0 && lines[lines.length - 1] !== "") {
      lines.push("");
    }
    lines.push(expanded);
  }
  return lines.join("\n");
}

/** Async variant for environments without synchronous filesystem access. */
export async function expandMegaloIncludesAsync(
  source: string,
  options: {
    sourceDir: string;
    readFile: (absolutePath: string) => Promise<string>;
  },
  seen: Set<string> = new Set()
): Promise<string> {
  const lines: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    const match = INCLUDE_LINE.exec(line);
    if (!match?.groups?.path) {
      lines.push(line);
      continue;
    }

    const relativePath = match.groups.path.replace(/\\/g, "/");
    const absolutePath = joinPath(options.sourceDir, relativePath);
    if (seen.has(absolutePath)) {
      throw new MegaloError(`Circular include: ${relativePath}`);
    }

    const nextSeen = new Set(seen);
    nextSeen.add(absolutePath);
    const included = await options.readFile(absolutePath);
    const expanded = await expandMegaloIncludesAsync(
      included,
      { ...options, sourceDir: dirnamePath(absolutePath) },
      nextSeen
    );
    if (lines.length > 0 && lines[lines.length - 1] !== "") {
      lines.push("");
    }
    lines.push(expanded);
  }
  return lines.join("\n");
}
