# map_object

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Labels map objects so triggers and actions can reference them by name.

```megalo
map_object slayer_stuff
	label "slayer"
end

map_object health_packs
	type "health_station"
end
```

Two binding modes:

- **`label`** — match any map object with this Forge label string
- **`type`** — match objects of this type from [object lists](/language/object-lists)

When used as a trigger kind (e.g. `trigger health_packs`), the trigger runs once per matching object with `current_object` set.

A script may declare at most **16** map object filters.

## Base-derived scripts

`map_object` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## See also

- [trigger](/language/elements/trigger) — map object trigger kinds
