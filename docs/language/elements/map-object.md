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

## Binding

Every filter needs one primary binding:

- **`label`** — match any map object with this Forge label string
- **`type`** — match objects of this type from [object lists](/language/object-lists)

Optional criteria can further restrict the set:

- **`team`** — match objects owned by a team designator, or `each` for every team
- **`user_data`** — match objects whose Forge user-data field equals this signed integer
- **`min`** — require at least this many matching objects (default `0`)

```megalo
map_object flag_spawn_point
	label "ctf_flag_spawn"
	team each
end

map_object invasion_objective
	label "inv_objective"
	min 1
end

map_object phase_markers
	label "phase_marker"
	user_data 2
end
```

`team` accepts a multiplayer team designator (`none`, `defenders`, `attackers`, `third_party`, …, `neutral`) or `each`.

`user_data` on a `map_object` is a filter criterion. It is separate from the runtime `current_object.user_data` variable used in conditions and actions.

When used as a trigger kind (e.g. `trigger health_packs`), the trigger runs once per matching object with `current_object` set.

A script may declare at most **16** map object filters.

## Base-derived scripts

`map_object` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## See also

- [trigger](/language/elements/trigger) — map object trigger kinds
- [examples](/language/examples) — CTF filters using `team each`
