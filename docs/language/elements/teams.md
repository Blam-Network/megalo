# teams

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">
</AvailabilityCard>

Defines the teams available in the gametype.

```megalo
teams
	team
		designator defenders
	end
	team
		designator attackers
	end
end
```

Each team is a nested `team` … `end` block. Team fields include:

| Field | Purpose |
|-------|---------|
| `name` | String table symbol for the team name |
| `designator` | Role (`defenders`, `attackers`, `third_party`, …) |
| `model` | Player model (`spartan`, `elite`, or `by_designator`) |
| `color` | Four RGBA values |
| `fireteam_count` | Number of fireteams |

<DocsBlock type="warning" title="MCC Support">
On the Master Chief Collection release of Halo: Reach, team name and color overrides are not supported by the MCC menus. This can lead to confusion as players appear to be on different teams between the MCC menus and the in-game Halo: Reach menus.
</DocsBlock>

A `model by_designator` line at the `teams` block level sets the default model rule for all teams. Each team's `designator` then picks the model — for example `defenders` spawn as Spartans and `attackers` as Elites when no per-team `model` overrides it.

From `megalo/3nvasion.txt` in the HREK:

```megalo
teams
	model by_designator

	team
		fireteam_count 3
	end

	team
		fireteam_count 3
	end
end
```

Compare with `megalo/slayer_classic.txt`, which sets one model for every team at the block level instead:

```megalo
teams
	model spartan
end
```

## Base-derived scripts

`teams` can appear in [base-derived scripts](/language/base-files) to retune team models, colors, and designators.
