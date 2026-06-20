# hud_post_message


<AvailabilityCard reach="yes" />

## Description

Posts a HUD message to a player, team, or everyone. The sound operand selects an [e_megalo_sound](/language/enums/sounds) token or `none`.

<ActionParameters />

## Example

```megalo
action hud_post_message everyone none "CTF"
```

Example from HREK `broken/derekball.txt`.

## Build availability

| Build | Opcode |
|-------|--------|
| 49 | [16](/versions/49/) |
| 73 | [16](/versions/73/) |
| 106 | [16](/versions/106/) |
| 107 | [16](/versions/107/) |
| 107 (MCC) | [16](/versions/107-mcc/) |

See also the [Actions overview](/language/actions/) and [action syntax](/language/elements/trigger/action).
- [Sounds](/language/enums/sounds) — `e_megalo_sound` tokens
