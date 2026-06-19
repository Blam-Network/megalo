import type { MegaloExpr } from "./ast";
import { MegaloError } from "./error";
import { TokenKind, type Token } from "./tokens";
import { e_grenade_count_setting } from "@blamnetwork/blf/haloreach_mcc/v_untracked_25_08_16_1352";

export type MegaloGrenadeCountSettingExpr = Extract<
  MegaloExpr,
  { kind: "grenade_count_setting" }
>;

export type GrenadeCounts = { frag: number; plasma: number };

const GRENADE_COUNT_TYPES = new Set(["frag", "plasma", "each"]);

/** Matches `grenade_count_setting_get_frag_count` in the game. */
export function grenadeFragCountFromWire(value: number): number {
  switch (value) {
    case 3:
    case 11:
      return 1;
    case 4:
    case 12:
      return 2;
    case 5:
    case 13:
      return 3;
    case 6:
    case 14:
      return 4;
    default:
      return 0;
  }
}

/** Matches `grenade_count_setting_get_plasma_count` in the game. */
export function grenadePlasmaCountFromWire(value: number): number {
  const offset = value - 7;
  if (offset > 7) {
    return 0;
  }
  if (offset === 0) {
    return 1;
  }
  if (offset === 1) {
    return 2;
  }
  if (offset === 2) {
    return 3;
  }
  if (offset === 3) {
    return 4;
  }
  if (offset === 4) {
    return 1;
  }
  if (offset === 5) {
    return 2;
  }
  if (offset === 6) {
    return 3;
  }
  if (offset === 7) {
    return 4;
  }
  return 0;
}

export function grenadeCountsFromWire(value: number): GrenadeCounts {
  return {
    frag: grenadeFragCountFromWire(value),
    plasma: grenadePlasmaCountFromWire(value),
  };
}

export function wireFromGrenadeCounts(counts: GrenadeCounts): number {
  const { frag, plasma } = counts;
  if (frag <= 0 && plasma <= 0) {
    return e_grenade_count_setting.none;
  }
  if (frag > 0 && plasma > 0) {
    if (frag === plasma) {
      return frag + 10;
    }
    if (plasma > 0) {
      return plasma + 6;
    }
    return frag + 2;
  }
  if (frag > 0) {
    return frag + 2;
  }
  return plasma + 6;
}

export function mergeGrenadeCounts(
  current: GrenadeCounts,
  next: GrenadeCounts
): GrenadeCounts {
  return {
    frag: next.frag > 0 ? next.frag : current.frag,
    plasma: next.plasma > 0 ? next.plasma : current.plasma,
  };
}

function isGrenadeWireUnset(value: number): boolean {
  return (
    value === e_grenade_count_setting.none ||
    value === e_grenade_count_setting.map_default
  );
}

export function mergeGrenadeWireValues(current: number, next: number): number {
  if (isGrenadeWireUnset(current)) {
    return next;
  }
  if (isGrenadeWireUnset(next)) {
    return current;
  }
  return wireFromGrenadeCounts(
    mergeGrenadeCounts(grenadeCountsFromWire(current), grenadeCountsFromWire(next))
  );
}

export function grenadeCountSettingExpr(
  value: number
): MegaloGrenadeCountSettingExpr {
  return { kind: "grenade_count_setting", value };
}

export function decodeGrenadeCountSetting(
  value: number
): MegaloGrenadeCountSettingExpr {
  return grenadeCountSettingExpr(value);
}

export function grenadeCountSettingValue(
  expr: MegaloGrenadeCountSettingExpr
): number {
  return expr.value;
}

export function decompileGrenadeCountFields(
  value: number
): { key: string; value: MegaloGrenadeCountSettingExpr }[] {
  if (value === e_grenade_count_setting.none) {
    return [
      {
        key: "initial_grenades",
        value: grenadeCountSettingExpr(e_grenade_count_setting.none),
      },
    ];
  }
  if (value === e_grenade_count_setting.map_default) {
    return [
      {
        key: "initial_grenades",
        value: grenadeCountSettingExpr(e_grenade_count_setting.map_default),
      },
    ];
  }
  if (value === e_grenade_count_setting.zero) {
    return [
      {
        key: "initial_grenades",
        value: grenadeCountSettingExpr(e_grenade_count_setting.zero),
      },
    ];
  }

  const { frag, plasma } = grenadeCountsFromWire(value);
  const fields: { key: string; value: MegaloGrenadeCountSettingExpr }[] = [];
  if (frag > 0) {
    fields.push({
      key: "initial_grenades",
      value: grenadeCountSettingExpr(frag + 2),
    });
  }
  if (plasma > 0) {
    fields.push({
      key: "initial_grenades",
      value: grenadeCountSettingExpr(plasma + 6),
    });
  }
  return fields;
}

export function parseGrenadeCountSettingTokens(tokens: Token[]): MegaloExpr {
  if (tokens.length === 0) {
    throw new MegaloError("Empty initial_grenades value", tokens[0]?.loc);
  }

  const first = tokens[0]!;
  if (
    (first.kind === TokenKind.Identifier || first.kind === TokenKind.Keyword) &&
    first.text === "none"
  ) {
    if (tokens.length > 1) {
      throw new MegaloError(
        `Unexpected token '${tokens[1]?.text}' after '${first.text}'`,
        tokens[1]!.loc
      );
    }
    return grenadeCountSettingExpr(e_grenade_count_setting.none);
  }
  if (
    (first.kind === TokenKind.Identifier || first.kind === TokenKind.Keyword) &&
    first.text === "map_default"
  ) {
    if (tokens.length > 1) {
      throw new MegaloError(
        `Unexpected token '${tokens[1]?.text}' after '${first.text}'`,
        tokens[1]!.loc
      );
    }
    return grenadeCountSettingExpr(e_grenade_count_setting.map_default);
  }

  if (first.kind !== TokenKind.Number) {
    throw new MegaloError(
      `Expected grenade count or 'none' in initial_grenades, got '${first.text}'`,
      first.loc
    );
  }

  const count = Number(first.text);
  if (count === 0) {
    if (tokens.length > 1) {
      throw new MegaloError(
        `Unexpected token '${tokens[1]?.text}' after '0' in initial_grenades`,
        tokens[1]!.loc
      );
    }
    return grenadeCountSettingExpr(e_grenade_count_setting.zero);
  }

  if (!Number.isInteger(count) || count < 1 || count > 4) {
    throw new MegaloError(
      `Expected grenade count 1-4 in initial_grenades, got '${first.text}'`,
      first.loc
    );
  }

  const typeToken = tokens[1];
  if (
    !typeToken ||
    (typeToken.kind !== TokenKind.Identifier &&
      typeToken.kind !== TokenKind.Keyword)
  ) {
    throw new MegaloError(
      "Expected grenade type after count in initial_grenades",
      typeToken?.loc ?? first.loc
    );
  }

  if (!GRENADE_COUNT_TYPES.has(typeToken.text)) {
    throw new MegaloError(
      `Expected frag, plasma, or each in initial_grenades, got '${typeToken.text}'`,
      typeToken.loc
    );
  }

  if (tokens.length > 2) {
    throw new MegaloError(
      `Unexpected token '${tokens[2]?.text}' in initial_grenades`,
      tokens[2]!.loc
    );
  }

  return grenadeCountSettingExpr(
    encodeGrenadeCountParts(count, typeToken.text)
  );
}

function encodeGrenadeCountParts(count: number, grenadeType: string): number {
  switch (grenadeType) {
    case "frag":
      return count + 2;
    case "plasma":
      return count + 6;
    case "each":
      return count + 10;
    default:
      throw new MegaloError(
        `Unsupported grenade type '${grenadeType}' in initial_grenades`
      );
  }
}

export function formatGrenadeCountSetting(
  expr: MegaloGrenadeCountSettingExpr
): string {
  const value = expr.value;
  if (value === e_grenade_count_setting.none) {
    return "none";
  }
  if (value === e_grenade_count_setting.map_default) {
    return "map_default";
  }
  if (value === e_grenade_count_setting.zero) {
    return "0";
  }

  const { frag, plasma } = grenadeCountsFromWire(value);
  if (frag > 0 && plasma > 0 && frag === plasma) {
    return `${frag} each`;
  }
  if (frag > 0 && plasma === 0) {
    return `${frag} frag`;
  }
  if (plasma > 0 && frag === 0) {
    return `${plasma} plasma`;
  }
  return String(value);
}
