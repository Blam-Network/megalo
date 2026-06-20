# engine_data

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Metadata shown in the gametype browser.

```megalo
engine_data
	name slayer_title
	description slayer_description
	icon k_engine_icon_slayer
	category slayer
end
```

| Field | Purpose |
|-------|---------|
| `name` | String table symbol for the gametype title |
| `description` | String table symbol for the description |
| `icon` | Engine icon constant (e.g. `k_engine_icon_slayer`) |
| `category` | Browser category string symbol |

Values are string table symbol names, not literal quoted strings.

## Base-derived scripts

`engine_data` can appear in [base-derived scripts](/language/base-files) to override the inherited gametype metadata.
