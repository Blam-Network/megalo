import {
  type BLFChunk,
  getBlfChunkMeta,
  search_for_chunk,
  s_blf_header,
  write_blffile,
} from "@blamnetwork/blf";
import { s_blf_chunk_end_of_file, s_blf_chunk_start_of_file } from "@blamnetwork/blf/halo3/v12070_08_09_05_2031_halo3_ship";
import {
  s_blf_chunk_game_variant,
  s_blf_chunk_packed_game_variant,
  type c_game_variant,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { c } from "@craftycodie/cstruct";
import { mccDialect } from "./dialect/mcc";
import type { MegaloProgram } from "./ast";
import { emitSource } from "./decompiler/emit_source";
import { MegaloError } from "./error";
import { encodeCustomVariantMglo } from "./mglo";
import { parse } from "./parser";
import { tryParse } from "./parse_result";
import { enrichCompileErrorLocation } from "./source_locate";
import {
  expandMegaloIncludes,
  type ExpandIncludesOptions,
} from "./expand_includes";
import { resolveStringSymbolFromProgram } from "./compiler/string_table";

export type { ExpandIncludesOptions, IncludeReadFile } from "./expand_includes";
export { expandMegaloIncludes } from "./expand_includes";

export interface MegaloCompileOptions {
  includes?: ExpandIncludesOptions;
}

function prepareSourceForCompile(
  source: string,
  options?: MegaloCompileOptions
): string {
  if (!options?.includes) {
    return source;
  }
  return expandMegaloIncludes(source, options.includes);
}

/**
 * Re-encode a decompiled program into a BLF buffer.
 */
export function roundtripGvarProgram(
  originalBlf: Uint8Array,
  program?: MegaloProgram
): Uint8Array {
  const resolved = program ?? decompileGvarFromBlf(originalBlf).program;
  return patchGvarInBlf(originalBlf, resolved);
}

/**
 * Decompile → emit source → parse → recompile symbolically.
 */
export function roundtripGvarSource(originalBlf: Uint8Array): {
  program: MegaloProgram;
  source: string;
  output: Uint8Array;
} {
  const { program, source } = decompileGvarFromBlf(originalBlf);
  const reparsed = parse(source);
  const merged = mergeEditedProgram(reparsed, program);
  return {
    program: merged,
    source,
    output: patchGvarInBlf(originalBlf, merged),
  };
}

const ENDIAN = "big" as const;

/** Reach MCC defaults when compiling Megalo source without a base gametype. */
const MCC_DEFAULT_ENCODING_VERSION = 107;
const MCC_DEFAULT_BUILD_NUMBER = 12065;

function resolveProgramForCompile(program: MegaloProgram): MegaloProgram {
  return {
    ...program,
    encodingVersion:
      program.encodingVersion || MCC_DEFAULT_ENCODING_VERSION,
    buildNumber: program.buildNumber || MCC_DEFAULT_BUILD_NUMBER,
  };
}

function engineDataName(program: MegaloProgram): string {
  for (const section of program.sections) {
    if (section.type === "engine_data" && section.data.name) {
      const resolved = resolveStringSymbolFromProgram(
        program,
        section.data.name
      );
      return resolved ?? section.data.name;
    }
  }
  return "megalo-script";
}

function parseSourceOrThrow(
  source: string,
  options?: MegaloCompileOptions
): MegaloProgram {
  const resolved = prepareSourceForCompile(source, options);
  const parsed = tryParse(resolved);
  if (!parsed.ok) {
    throw new MegaloError(parsed.message, {
      line: parsed.line,
      column: parsed.column,
      offset: parsed.offset ?? 0,
      length: parsed.length,
    });
  }
  return parsed.program;
}

/** Compile Megalo source to a new Reach BLF gametype (`.bin`) without a base file. */
export function compileGvarFromMegaloSource(
  source: string,
  options?: MegaloCompileOptions
): Uint8Array {
  const prepared = prepareSourceForCompile(source, options);
  const program = resolveProgramForCompile(parseSourceOrThrow(source, options));
  try {
    const variant = mccDialect.compileGameVariant(program);
    const gvar = s_blf_chunk_packed_game_variant.create(variant);
    return write_blffile(ENDIAN, [
      s_blf_chunk_start_of_file.create(engineDataName(program)),
      gvar,
      new s_blf_chunk_end_of_file(),
    ]);
  } catch (error) {
    throw enrichCompileErrorLocation(error, source, program.flatActions, program);
  }
}

function resolveProgramForMgloCompile(program: MegaloProgram): MegaloProgram {
  return {
    ...program,
    encodingVersion:
      program.encodingVersion || MCC_DEFAULT_ENCODING_VERSION,
    buildNumber: program.buildNumber !== 0 ? program.buildNumber : -1,
  };
}

/** Compile a parsed Megalo program to MCC hot-reload `.mglo` bytes. */
export function compileMgloFromMegaloProgram(program: MegaloProgram): Uint8Array {
  const resolved = resolveProgramForMgloCompile(program);
  const variant = mccDialect.compileGameVariant(resolved);
  if (!variant.m_custom_variant) {
    throw new Error("Compiled variant is not a custom Reach gametype");
  }
  return encodeCustomVariantMglo(variant.m_custom_variant);
}

/** Compile Megalo source to MCC hot-reload `.mglo` bytes. */
export function compileMgloFromMegaloSource(
  source: string,
  options?: MegaloCompileOptions
): Uint8Array {
  const prepared = prepareSourceForCompile(source, options);
  const program = parseSourceOrThrow(source, options);
  try {
    return compileMgloFromMegaloProgram(program);
  } catch (error) {
    throw enrichCompileErrorLocation(error, source, program.flatActions, program);
  }
}

export type GametypeChunkKind = "mpvr" | "gvar";

type GametypeChunk =
  | s_blf_chunk_game_variant
  | s_blf_chunk_packed_game_variant;

function gametypeChunkConstructor(
  kind: GametypeChunkKind
): new () => GametypeChunk {
  return kind === "mpvr"
    ? s_blf_chunk_game_variant
    : s_blf_chunk_packed_game_variant;
}

function readGametypeChunk(
  blfBytes: Uint8Array,
  kind: GametypeChunkKind
): GametypeChunk | undefined {
  const chunk = new (gametypeChunkConstructor(kind))();
  if (!search_for_chunk(blfBytes, chunk, ENDIAN)) {
    return undefined;
  }
  return chunk;
}

/** Detect which Reach gametype chunk (`mpvr` or `gvar`) is present in a BLF buffer. */
export function detectGametypeChunkInBlf(
  blfBytes: Uint8Array
): GametypeChunkKind | undefined {
  if (readGametypeChunk(blfBytes, "mpvr")) {
    return "mpvr";
  }
  if (readGametypeChunk(blfBytes, "gvar")) {
    return "gvar";
  }
  return undefined;
}

/** Extract a decoded game variant and which chunk type it came from. */
export function extractGametypeFromBlf(blfBytes: Uint8Array): {
  variant: c_game_variant;
  chunkKind: GametypeChunkKind;
} {
  const mpvr = readGametypeChunk(blfBytes, "mpvr");
  if (mpvr) {
    return { variant: mpvr.game_variant, chunkKind: "mpvr" };
  }
  const gvar = readGametypeChunk(blfBytes, "gvar");
  if (gvar) {
    return { variant: gvar.game_variant, chunkKind: "gvar" };
  }
  throw new Error("No mpvr or gvar gametype chunk found in BLF");
}

function findChunkBodyRange(
  buffer: Uint8Array,
  signature: string,
  major: number,
  minor: number
): { bodyStart: number; bodyEnd: number } | undefined {
  const headerSize = c.sizeof(s_blf_header);

  for (let offset = 0; offset + headerSize <= buffer.length; offset++) {
    let header: s_blf_header;
    try {
      header = c.read(
        s_blf_header,
        buffer.subarray(offset, offset + headerSize),
        ENDIAN
      );
    } catch {
      continue;
    }

    if (
      header.signature !== signature ||
      header.major !== major ||
      header.minor !== minor
    ) {
      continue;
    }

    const chunkEnd = offset + header.chunk_length;
    if (chunkEnd > buffer.length) {
      continue;
    }

    return {
      bodyStart: offset + headerSize,
      bodyEnd: chunkEnd,
    };
  }

  return;
}

/** Extract and decode a gametype chunk (`mpvr` or `gvar`) from a BLF buffer. */
export function extractGvarFromBlf(
  blfBytes: Uint8Array,
  ChunkType?: new () => BLFChunk
): c_game_variant {
  if (ChunkType) {
    const chunk = new ChunkType();
    if (!search_for_chunk(blfBytes, chunk, ENDIAN)) {
      throw new Error("Requested gametype chunk not found in BLF");
    }
    if (chunk instanceof s_blf_chunk_game_variant) {
      return chunk.game_variant;
    }
    if (chunk instanceof s_blf_chunk_packed_game_variant) {
      return chunk.game_variant;
    }
    throw new Error("Unsupported gametype chunk type");
  }
  return extractGametypeFromBlf(blfBytes).variant;
}

/** Decompile Megalo source from a BLF gametype buffer (`mpvr` or `gvar`). */
export function decompileGvarFromBlf(
  blfBytes: Uint8Array,
  options?: { fileName?: string; editorVersion?: string }
): {
  program: MegaloProgram;
  source: string;
  chunkKind: GametypeChunkKind;
} {
  const { variant, chunkKind } = extractGametypeFromBlf(blfBytes);
  const program = mccDialect.decompileGameVariant(variant);
  return {
    program,
    source: emitSource(program, options),
    chunkKind,
  };
}

export function mergeEditedProgram(
  reparsed: MegaloProgram,
  baseProgram: MegaloProgram
): MegaloProgram {
  reparsed.encodingVersion = baseProgram.encodingVersion;
  reparsed.buildNumber = baseProgram.buildNumber;
  reparsed.stringSymbolOrder = baseProgram.stringSymbolOrder;
  reparsed.triggerTable = baseProgram.triggerTable;
  reparsed.flatConditions = baseProgram.flatConditions;
  reparsed.flatActions = baseProgram.flatActions;
  reparsed.specialTriggers = { ...baseProgram.specialTriggers };
  return reparsed;
}

/** Compile edited Megalo source against a loaded gametype. */
export function compileGvarFromEditedSource(
  originalBlf: Uint8Array,
  baseProgram: MegaloProgram,
  source: string
): Uint8Array {
  const parsed = tryParse(source);
  if (!parsed.ok) {
    throw new MegaloError(parsed.message, {
      line: parsed.line,
      column: parsed.column,
      offset: parsed.offset ?? 0,
      length: parsed.length,
    });
  }
  const program = mergeEditedProgram(parsed.program, baseProgram);
  try {
    return patchGvarInBlf(originalBlf, program);
  } catch (error) {
    throw enrichCompileErrorLocation(error, source, program.flatActions, program);
  }
}

/** Compile edited source to `.mglo` bytes without patching the BLF container. */
export function compileMgloFromEditedSource(
  originalBlf: Uint8Array,
  baseProgram: MegaloProgram,
  source: string
): Uint8Array {
  const parsed = tryParse(source);
  if (!parsed.ok) {
    throw new MegaloError(parsed.message, {
      line: parsed.line,
      column: parsed.column,
      offset: parsed.offset ?? 0,
      length: parsed.length,
    });
  }
  const program = mergeEditedProgram(parsed.program, baseProgram);
  try {
    return compileMgloFromEditedProgram(originalBlf, baseProgram, program);
  } catch (error) {
    throw enrichCompileErrorLocation(error, source, program.flatActions, program);
  }
}

export function compileMgloFromEditedProgram(
  originalBlf: Uint8Array,
  baseProgram: MegaloProgram,
  editedProgram: MegaloProgram
): Uint8Array {
  const program = mergeEditedProgram(editedProgram, baseProgram);
  const { variant } = extractGametypeFromBlf(originalBlf);
  const compiled = mccDialect.compileGameVariant(program, variant);
  if (!compiled.m_custom_variant) {
    throw new Error("BLF does not contain a custom Reach gametype");
  }
  return encodeCustomVariantMglo(compiled.m_custom_variant);
}

/**
 * Re-encode a Megalo program into a BLF buffer, patching the original `mpvr` or `gvar` chunk.
 * Preserves byte-identical layout when the compiled body matches the original length.
 */
export function patchGvarInBlf(
  originalBlf: Uint8Array,
  program: MegaloProgram,
  chunkKind?: GametypeChunkKind
): Uint8Array {
  const kind = chunkKind ?? detectGametypeChunkInBlf(originalBlf);
  if (!kind) {
    throw new Error("No mpvr or gvar gametype chunk found in BLF");
  }

  const ChunkType = gametypeChunkConstructor(kind);
  const chunk = readGametypeChunk(originalBlf, kind);
  if (!chunk) {
    throw new Error(`${kind} chunk not found in BLF`);
  }

  const baseVariant = chunk.game_variant;
  const compiled = mccDialect.compileGameVariant(program, baseVariant);

  const packed = new ChunkType();
  if (kind === "mpvr") {
    const sourceMpvr = chunk as s_blf_chunk_game_variant;
    const targetMpvr = packed as s_blf_chunk_game_variant;
    targetMpvr.game_variant = compiled;
    targetMpvr.unknown04 = sourceMpvr.unknown04;
    targetMpvr.unknown06 = sourceMpvr.unknown06;
  } else {
    (packed as s_blf_chunk_packed_game_variant).game_variant = compiled;
  }
  const rewrittenBody = packed.write_body(ENDIAN);

  const meta = getBlfChunkMeta(chunk);
  const range = findChunkBodyRange(
    originalBlf,
    meta.signature,
    meta.major,
    meta.minor
  );
  if (!range) {
    throw new Error(`Could not locate ${kind} chunk body in BLF`);
  }

  const output = new Uint8Array(originalBlf);
  if (rewrittenBody.length !== range.bodyEnd - range.bodyStart) {
    throw new Error(
      `Compiled ${kind} body length ${rewrittenBody.length} does not match original ${range.bodyEnd - range.bodyStart}`
    );
  }
  output.set(rewrittenBody, range.bodyStart);
  return output;
}

export type GametypeSaveFormat = "mglo" | "gvar" | "mpvr";

function writeGametypeBlfFromProgram(
  program: MegaloProgram,
  kind: GametypeChunkKind
): Uint8Array {
  const variant = mccDialect.compileGameVariant(resolveProgramForCompile(program));
  const chunks: BLFChunk[] = [
    s_blf_chunk_start_of_file.create(engineDataName(program)),
  ];
  if (kind === "gvar") {
    chunks.push(s_blf_chunk_packed_game_variant.create(variant));
  } else {
    const mpvr = new s_blf_chunk_game_variant();
    mpvr.game_variant = variant;
    chunks.push(mpvr);
  }
  chunks.push(new s_blf_chunk_end_of_file());
  return write_blffile(ENDIAN, chunks);
}

/** Compile edited or standalone Megalo source to the requested save format. */
export function compileGametypeForSave(
  source: string,
  format: GametypeSaveFormat,
  originalBlf?: Uint8Array | null,
  baseProgram?: MegaloProgram | null,
  options?: MegaloCompileOptions
): Uint8Array {
  if (format === "mglo") {
    if (originalBlf && baseProgram) {
      return compileMgloFromEditedSource(originalBlf, baseProgram, source);
    }
    return compileMgloFromMegaloSource(source, options);
  }

  const prepared = prepareSourceForCompile(source, options);
  const parsed = tryParse(prepared);
  if (!parsed.ok) {
    throw new MegaloError(parsed.message, {
      line: parsed.line,
      column: parsed.column,
      offset: parsed.offset ?? 0,
      length: parsed.length,
    });
  }

  const program =
    originalBlf && baseProgram
      ? mergeEditedProgram(parsed.program, baseProgram)
      : resolveProgramForCompile(parsed.program);

  const kind = format;
  try {
    if (originalBlf && detectGametypeChunkInBlf(originalBlf) === kind) {
      return patchGvarInBlf(originalBlf, program, kind);
    }
    return writeGametypeBlfFromProgram(program, kind);
  } catch (error) {
    throw enrichCompileErrorLocation(error, source, program.flatActions, program);
  }
}
