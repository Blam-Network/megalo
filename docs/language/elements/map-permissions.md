# map_permissions

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Controls which Forge objects can be placed on which maps.

```megalo
map_permissions
	default false
	exception k_map_id_boneyard
	exception k_map_id_spire
end
```

| Field | Purpose |
|-------|---------|
| `default` | Default permission when a map is not listed |
| `exception` | Map ID that is allowed (or denied, depending on `default`) |

## Base-derived scripts

`map_permissions` can appear in [base-derived scripts](/language/base-files) to change forge placement rules.
