import { bitstream } from "@blamnetwork/blf";
import {
  c_game_engine_custom_variant,
  e_game_mode,
  type c_game_engine_custom_variant as CustomVariant,
} from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";
import { extractGametypeFromBlf } from "./gametype";

const MGLO_BUFFER_SIZE = 4 * 1024 * 1024;

const { c_bitstream_reader, c_bitstream_writer, e_bitstream_byte_order } =
  bitstream;

/** Encode a custom variant to MCC hot-reload `.mglo` bitstream bytes. */
export function encodeCustomVariantMglo(
  custom: c_game_engine_custom_variant
): Uint8Array {
  const writer = c_bitstream_writer.new(
    MGLO_BUFFER_SIZE,
    e_bitstream_byte_order._bitstream_byte_order_big_endian
  );
  writer.begin_writing();
  custom.encode(writer);
  writer.finish_writing();
  return writer.get_data();
}

/** Decode MCC hot-reload `.mglo` bitstream bytes to a custom variant. */
export function decodeCustomVariantMglo(bytes: Uint8Array): CustomVariant {
  const reader = c_bitstream_reader.new(
    bytes,
    e_bitstream_byte_order._bitstream_byte_order_big_endian
  );
  reader.begin_reading();
  const custom = new c_game_engine_custom_variant();
  custom.decode(reader);
  return custom;
}
/** Extract `.mglo` payload from a compiled Reach BLF gametype buffer. */
export function exportMgloFromBlf(blfBytes: Uint8Array): Uint8Array {
  const { variant } = extractGametypeFromBlf(blfBytes);
  if (variant.m_game_engine !== e_game_mode.custom || !variant.m_custom_variant) {
    throw new Error("BLF does not contain a custom Reach gametype");
  }
  return encodeCustomVariantMglo(variant.m_custom_variant);
}
