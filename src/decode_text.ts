/**
 * Decode Megalo / Reach `.txt` script bytes.
 * Official and decompiled scripts are usually UTF-16 LE (often with BOM).
 */
export function decodeMegaloText(bytes: Uint8Array | Buffer): string {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  if (data.length === 0) {
    return "";
  }

  if (data.length >= 2 && data[0] === 0xff && data[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(data.subarray(2));
  }

  if (data.length >= 2 && data[0] === 0xfe && data[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(data.subarray(2));
  }

  if (
    data.length >= 3 &&
    data[0] === 0xef &&
    data[1] === 0xbb &&
    data[2] === 0xbf
  ) {
    return new TextDecoder("utf-8").decode(data.subarray(3));
  }

  if (looksLikeUtf16Le(data)) {
    return new TextDecoder("utf-16le").decode(data);
  }

  return new TextDecoder("utf-8").decode(data);
}

function looksLikeUtf16Le(bytes: Uint8Array): boolean {
  if (bytes.length < 4 || bytes.length % 2 !== 0) {
    return false;
  }

  const sample = Math.min(bytes.length, 256);
  let asciiPairs = 0;
  for (let i = 0; i < sample; i += 2) {
    const low = bytes[i]!;
    const high = bytes[i + 1]!;
    if (
      high === 0 &&
      (low === 0x09 || low === 0x0a || low === 0x0d || low < 0x80)
    ) {
      asciiPairs++;
    }
  }

  return asciiPairs / (sample / 2) > 0.6;
}
