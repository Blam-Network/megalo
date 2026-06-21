# hud_post_message


<AvailabilityCard reach="yes" />

## Description

Posts a HUD message to a [team or player target](/language/enums/team-or-player-target). The sound operand selects an [e_megalo_sound](/language/enums/sounds) token or `none`.

<ActionParameters />

## Example

```megalo
action hud_post_message everyone none "CTF"
```

Example from HREK `broken/derekball.txt`.

## Supported Versions

<ActionSupportedVersions />


See also [action syntax](/language/elements/trigger/action).
- [Team or player target](/language/enums/team-or-player-target) — target operand syntax
- [Sounds](/language/enums/sounds) — `e_megalo_sound` tokens
