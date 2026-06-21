# Sprinting

Value syntax for the `sprinting` field on the [Player traits](/language/enums/player-traits) enum. Enables or disables sprint for the trait set.

ManagedMegalo maps tokens to `m_sprint_setting` on the wire (`player-traits-movement-sprint` in blf). The field is encodable only on Reach megalo encoding versions **49** through **73** (Omaha Alpha and Omaha Delta); it was removed from the trait block starting with Release / TU1.

## Values

| Value | Effect |
|-------|--------|
| `off` | Sprint disabled |
| `on` | Sprint enabled |
| `enabled` | Sprint enabled |
| `disabled` | Sprint disabled |

`enabled` / `disabled` and `on` / `off` are accepted synonyms (four-entry sprint setting string table).

```megalo
override base_player_traits
	sprinting disabled
end
```

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
