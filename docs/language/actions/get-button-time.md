# get_button_time

<AvailabilityCard reach="partial" />

## Description

Reads how long a [scriptable button](#scriptable-buttons) was held into a custom variable, in milliseconds (Reach MCC only).

<ActionParameters />

## Scriptable buttons {#scriptable-buttons}

The second operand is a member of `e_scriptable_game_buttons` (5 bits on the wire). Values match [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach_mcc/v_untracked_25_08_16_1352/game/megalogamengine/megalogamengine_actions.ts).

| Button | Index |
|--------|------:|
| `jump` | 0 |
| `grenade` | 1 |
| `switch_weapon` | 2 |
| `context_primary` | 3 |
| `melee_attack` | 4 |
| `equipment` | 5 |
| `throw_grenade` | 6 |
| `fire_primary` | 7 |
| `crouch` | 8 |
| `scope_zoom` | 9 |
| `night_vision` | 10 |
| `fire_secondary` | 11 |
| `fire_tertiary` | 12 |
| `vehicle_trick` | 13 |

Wire indices **14–16** (`unknown`, `unknown_1`, `unknown_2`) exist in the BLF enum but are not supported by MegaloEdit and should not appear in scripts.

## Example

```megalo
action get_button_time current_player jump button_hold_ms
```

## Supported Versions

<ActionSupportedVersions />


See also [action syntax](/language/elements/trigger/action).
