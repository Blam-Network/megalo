# loadout_palette

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Groups [`loadout`](/language/elements/loadout) definitions into selectable palette presets. When assigned through `game_options`, the palette appears as the respawn loadout selection menu.

![Loadout selection menu in Reach multiplayer — a palette of five loadouts (Sprint, Armor Lock, Jet Pack, Active Camo, Hologram)](/images/language/loadout-palette.png)

*The in-game palette UI. Each `item` line in a `loadout_palette` block becomes one selectable row.*

```megalo
loadout_palette slayer_loadouts
	item loadout_scout
	item loadout_guard
end
```

Each `item` line references a loadout name declared elsewhere in the script. Palettes are assigned through `game_options` overrides such as `override loadout_palette spartan_tier1 slayer_loadouts`.

A script may declare at most **16** loadout palettes.

## Base-derived scripts

`loadout_palette` can appear in [base-derived scripts](/language/base-files).

## See also

- [loadout](/language/elements/loadout)
- [game_options](/language/elements/game-options)
