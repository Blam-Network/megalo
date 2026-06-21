# Vehicle Usage Setting

Value syntax for the `vehicle_usage` field on the [Player traits](/language/enums/player-traits) enum. Controls whether a player can enter vehicles and which seats are allowed.

ManagedMegalo maps tokens to `e_vehicle_usage_setting` (`vehicle_use_setting_names`, nine entries).

## Values

| Value | Effect |
|-------|--------|
| `none` | Cannot enter vehicles |
| `full` | Full vehicle access (driver, gunner, and passenger seats) |
| `passenger` | Passenger seats only |
| `not_passenger` | Driver and gunner seats, not passenger |
| `driver` | Driver seat only |
| `gunner` | Gunner seat only |
| `not_driver` | Gunner and passenger seats, not driver |
| `not_gunner` | Driver and passenger seats, not gunner |
| `unchanged` | Leave the previous setting unchanged |

```megalo
player_traits race_traits
	vehicle_usage not_passenger
end
```

Reach scripts most often use `passenger`, `none`, and `not_passenger`.

## See also

- [Player traits](/language/enums/player-traits)
- [player_traits](/language/elements/game-options/player-traits)
