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

## Supported Versions

<ActionSupportedVersions />


See also [action syntax](/language/elements/trigger/action).
