# variables

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Custom variable declarations. The `variables` element opens a scope block:

```megalo
variables global
	local number my_counter 0
end

variables team
	local number team_score 0
end
```

Scopes include `global`, `team`, `player`, and `object`. See [Variable model](/language/variable-model) for types, built-ins, and usage.

<DocsBlock type="tip" title="Bitfield booleans">

Megalo has no dedicated boolean type — truthy values are `number`s (`0` = false, non-zero = true). When the [variable quota](/language/variable-model#limits) is tight, some authors pack multiple on/off flags into one `number` variable using a **bitfield**: each bit stores one boolean. Use [bitwise math operations](/language/enums/math-operations) (`or` to set a bit, `not` to clear one) and named constants for each mask.

</DocsBlock>

```megalo
constants
	number k_has_shield 1
	number k_has_speed  2
	number k_has_jump   4
end

variables player
	networked number powerup_flags 0
end

; one variable replaces three separate booleans
action set current_player.powerup_flags or k_has_shield
action set current_player.powerup_flags not k_has_speed
```

To read a bit in a condition, mask into a [temporary](/language/elements/trigger#temporary-variables) and compare:

```megalo
temporary number masked 0
action set masked set_to current_player.powerup_flags
action set masked and k_has_jump
condition if masked equal_to k_has_jump
```

## Base-derived scripts

`variables` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## See also

- [Variable model](/language/variable-model)
- [constants](/language/elements/constants)
