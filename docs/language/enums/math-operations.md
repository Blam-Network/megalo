# Math operations

Operators for actions that modify a numeric value in place. Operand order is always `<target> <operation> <value>` (for example `action set my_counter add 1`).

Used by [`set`](/language/actions/set), [`set_score`](/language/actions/set-score), [`player_adjust_money`](/language/actions/player-adjust-money), [`adjust_grenades`](/language/actions/adjust-grenades), and the [`object_adjust_*`](/language/actions/object-adjust-health) health/shield actions.

Values match `e_math_operation` in [@blamnetwork/blf](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach_mcc/v_untracked_25_08_16_1352/game/megalogamengine/megalogamengine_actions.ts). Reach scripts spell operators as words (`add`, `set_to`, `multiply`); the decompiler emits assignment-style symbols (`+=`, `=`, `*=`). Both forms are accepted.

| Operator | Symbol | Effect | Added in |
|----------|--------|--------|----------|
| `add` | `+=` | Add to the current value | [49](/versions/49/) |
| `subtract` | `-=` | Subtract from the current value | [49](/versions/49/) |
| `multiply` | `*=` | Multiply the current value | [49](/versions/49/) |
| `divide` | `/=` | Divide the current value | [49](/versions/49/) |
| `set_to` | `=` | Assign (replace) the current value | [49](/versions/49/) |
| `modulo` | `%=` | Replace with the remainder after division | [49](/versions/49/) |
| `and` | `&=` | Bitwise AND with the operand | [49](/versions/49/) |
| `or` | `\|=` | Bitwise OR with the operand | [49](/versions/49/) |
| `xor` | `^=` | Bitwise XOR with the operand | [73](/versions/73/) |
| `not` | `~=` | Bitwise NOT merge (`a not b` → `a &= ~b`) | [73](/versions/73/) |
| `abs` | — | Set to the absolute value of the operand | [73](/versions/73/) |
| `lshift` | `<<` | Bit-shift left and assign | [107 (MCC)](/versions/107-mcc/) |
| `rshift` | `>>` | Bit-shift right and assign | [107 (MCC)](/versions/107-mcc/) |

## Notes

Omaha Alpha (build **49**) stores the operation in three bits, so only the first eight operators above are encodable. Omaha Delta (**73**) widens the field to four bits and adds XOR, NOT, and absolute assignment. Reach MCC (**107 MCC**) adds the bit-shift operators; on MCC builds `abs` is enum index **12** (it is index **10** on Xbox 360 TU1).

@blamnetwork/megalo accepts word names and symbols. Legacy blf enum names (`multiply_by`, `set_to_absolute`, …) are still accepted when parsing older scripts.

## Example

```megalo
action set my_counter set_to 0
action set my_counter add 1
action set temp modulo 5
action set_score add kill_points player killing_player
action object_adjust_shield current_player set_to 100
```

