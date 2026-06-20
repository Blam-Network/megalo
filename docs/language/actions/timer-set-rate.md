# timer_set_rate


<AvailabilityCard reach="yes" />

## Description

Sets a timer's tick rate. `0` pauses, `-1` counts down, `1` is normal speed.

<ActionParameters />

## Example

```megalo
action timer_set_rate period_timer 1
```

Example from HREK `broken/1Flag_Boneyard_Extreme.txt`.

## Build availability

| Build | Opcode |
|-------|--------|
| 49 | [17](/versions/49/) |
| 73 | [17](/versions/73/) |
| 106 | [17](/versions/106/) |
| 107 | [17](/versions/107/) |
| 107 (MCC) | [17](/versions/107-mcc/) |

See also the [Actions overview](/language/actions/) and [action syntax](/language/elements/trigger/action).
