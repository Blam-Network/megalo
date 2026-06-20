# 107

Final Xbox 360 Reach Title Update megalo build. The TU1 megalo version is available in @blamnetwork/megalo but still routes through MCC codec wiring until TU1-specific tables are fully integrated.

| | |
|---|---|
| **Build** | Title Update 1 (`v12065_11_08_24_1738_tu1actual`) |
| **BLF import** | `@blamnetwork/blf/haloreach/v12065_11_08_24_1738_tu1actual` |
| **Megalo version** | `tu1` |
| **Library support** | Available as megalo version `tu1`; compiler integration is still a stub. |
| **Action count** | 98 (excluding `none`) |

Megalo encoding version **107**.

## Supported Halo builds

- `12065.11.08.24.1738.tu1actual`

## Supported by @blamnetwork/megalo

Available as megalo version `tu1`; compiler integration is still a stub.

## Changes from prior version

Compared to [106](/versions/106/).

No action types were added or removed between these builds.

## Action opcodes

Action names match `e_action_type` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach/v12065_11_08_24_1738_tu1actual/game/megalogamengine/megalogamengine_actions.ts). Per-action documentation lives under [Actions](/language/actions/).

<LanguageActionTable version="tu1" />
