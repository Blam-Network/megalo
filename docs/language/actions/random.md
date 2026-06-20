# random

<AvailabilityCard reach="yes" />

## Description

Writes a random integer into an out-variable between the configured minimum and maximum. The minimum is **inclusive**; the maximum is **exclusive** (for example, `action random 0 5 x` yields 0–4).

<ActionParameters />

## Example

```megalo
action random 0 5 randumb
```

Example from HREK `broken/derekball.txt`.

## Build availability

| Build | Opcode |
|-------|--------|
| 49 | [25](/versions/49/) |
| 73 | [25](/versions/73/) |
| 106 | [25](/versions/106/) |
| 107 | [25](/versions/107/) |
| 107 (MCC) | [25](/versions/107-mcc/) |

See also the [Actions overview](/language/actions/) and [action syntax](/language/elements/trigger/action).
