# Grenade Count

Value syntax for the `initial_grenades` field on the [Player traits](/language/enums/player-traits) enum. Used inside [`player_traits`](/language/elements/game-options/player-traits) blocks and `override base_player_traits` (and similar) in [`game_options`](/language/elements/game-options).

ManagedMegalo accepts a single token or a count plus grenade type. Reach scripts use only **frag** and **plasma** counts on the wire (`each` sets equal counts of both).

## Special values

| Value | Effect |
|-------|--------|
| `none` | No starting grenades |
| `default` | Use the map's default grenade loadout |

## Count forms

Count must be **1–4**. Type must be `frag`, `plasma`, or `each`.

| Syntax | Starting grenades |
|--------|-------------------|
| `1 frag` | 1 frag |
| `2 frag` | 2 frag |
| `3 frag` | 3 frag |
| `4 frag` | 4 frag |
| `1 plasma` | 1 plasma |
| `2 plasma` | 2 plasma |
| `3 plasma` | 3 plasma |
| `4 plasma` | 4 plasma |
| `1 each` | 1 frag and 1 plasma |
| `2 each` | 2 frag and 2 plasma |
| `3 each` | 3 frag and 3 plasma |
| `4 each` | 4 frag and 4 plasma |

To mix unequal frag and plasma counts, use **separate lines** — each line updates one side of the loadout:

```megalo
override base_player_traits
	initial_grenades 1 frag
	initial_grenades 1 plasma
end
```

```megalo
player_traits infected_traits
	initial_grenades none
end
```

Grenade types in [`grenades.txt`](/language/object-lists) (spike, firebomb, etc.) are not valid here; only `frag`, `plasma`, and `each` are accepted by the Megalo parser.

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
