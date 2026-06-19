# Halo: Reach Xbox 360 TU1

<!-- autogen:language-version -->

Final Xbox 360 Reach Title Update megalo build. The TU1 megalo version is available in @blamnetwork/megalo but still routes through MCC codec wiring until TU1-specific tables are fully integrated.

| | |
|---|---|
| **Build** | Title Update 1 (`v12065_11_08_24_1738_tu1actual`) |
| **BLF import** | `@blamnetwork/blf/haloreach/v12065_11_08_24_1738_tu1actual` |
| **Megalo version** | `tu1` |
| **Library support** | Available as megalo version `tu1`; compiler integration is still a stub. |
| **Action count** | 98 (excluding `none`) |

Action names match `e_action_type` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach/v12065_11_08_24_1738_tu1actual/game/megalogamengine/megalogamengine_actions.ts).

<LanguageActionTable version="tu1" />

## Compared to MCC

TU1 ends at opcode `boundary_set_player_color` (`98`). Reach MCC adds 8 action types after that point — see the [MCC version page](/versions/mcc#mcc-only-actions).

