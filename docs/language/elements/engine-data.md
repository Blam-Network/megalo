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

<DocsBlock type="info" title="Variant name and description">

The gametype `name` and `description` are stored in separate variant metadata fields on the wire, not in the script `m_script_strings` table. They do not count toward the **112** entry or **19,456** byte limits on [string_table](/language/elements/string-table).

</DocsBlock>

## Base-derived scripts

`engine_data` can appear in [base-derived scripts](/language/base-files) to override the inherited gametype metadata.
