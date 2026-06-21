# create_object


<AvailabilityCard reach="yes" />

## Description

Spawns an object of the given type at a reference object, with optional filter, flags, and offset.

<ActionParameters />

## Example

### Version &lt;73

```megalo
action create_object "area" main.team_a main
```

From HREK `broken/dmiller_sve.txt`.

### Version 73+

```megalo
action create_object "warthog" at current_object set freebie
```

## Supported Versions

<ActionSupportedVersions />


See also [action syntax](/language/elements/trigger/action).
