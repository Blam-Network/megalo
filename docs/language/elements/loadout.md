# loadout

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Player loadout definitions.

```megalo
loadout loadout_scout
	name loadout_name_scout
	primary_weapon assault_rifle
	backpack_weapon magnum
	equipment sprint_equipment
	grenades 2 frag
end
```

| Field | Purpose |
|-------|---------|
| `name` | String table symbol for the loadout name |
| `primary_weapon` | Primary weapon from [object lists](/language/object-lists) |
| `backpack_weapon` | Secondary weapon |
| `equipment` | Armor ability / equipment |
| `grenades` | Count and type (e.g. `2 frag`) |

Loadouts are grouped into palettes with [`loadout_palette`](/language/elements/loadout-palette).

A script may declare at most **32** loadouts.

## Base-derived scripts

`loadout` can appear in [base-derived scripts](/language/base-files) to override loadout definitions.

## See also

- [loadout_palette](/language/elements/loadout-palette)
