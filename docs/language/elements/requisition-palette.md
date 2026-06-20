# requisition_palette

<AvailabilityCard reach="partial" halo4="no" h2a="no">

The Requisition system was scrapped before the original Xbox 360 release of Halo: Reach. This element is only supported in pre-release Halo: Reach builds, Megalo versions below 106.

</AvailabilityCard>

Controls which purchasable items appear in the D-pad **requisition menu** during a match.
Requisition items are **defined on the scenario tag** — weapons, vehicles, and equipment available on a map, with costs and categories, live in map data. The gametype `requisition_palette` element does not add new items; it selects **which scenario items are actually available** to players when a palette is assigned.

Each palette starts from a **baseline** (a preset subset) and then enables or disables individual items by name.

![The requisition menu in a Reach pre-alpha build — vehicle selection showing Ghost with a point cost, opened via Left D-pad](/images/language/requisition-menu.png)

*Requisition menu UI from a Reach pre-alpha build. Scenario data supplies the item list; gametype palettes and [`player_enable_purchases`](/language/elements/trigger/action#requisition-actions) control what players can buy.*

```megalo
requisition_palette covy_palette_gold
	baseline elite
end

requisition_palette covy_palette_silver
	baseline elite
	item "banshee" disabled
	item "wraith_heavy" disabled
	item "energy_blade" disabled
end

requisition_palette covy_palette_bronze
	baseline empty
	item "needler" enabled
	item "plasma_pistol" enabled
	item "plasma_carbine" enabled
end

requisition_palette unsc_palette_gold
	baseline spartan
	item "wolverine" disabled
	item "falcon" enabled
end
```

| Field | Purpose |
|-------|---------|
| `baseline` | Starting subset of scenario items. Values seen in scripts include `full`, `spartan`, `elite`, and `empty`. |
| `item` | Enable or disable a specific scenario requisition item. Syntax: `item "<name>" enabled` or `item "<name>" disabled`. Names must match entries from the scenario and [object lists](/language/object-lists). |

Assign palettes at runtime with `player_set_requisition_palette`, and gate purchasing with `player_enable_purchases`. See [Actions — Requisition actions](/language/elements/trigger/action#requisition-actions).

A script may declare at most **8** requisition palettes.

## Base-derived scripts

`requisition_palette` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## See also

- [Actions — Requisition actions](/language/elements/trigger/action#requisition-actions)
