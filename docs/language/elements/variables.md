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

## Base-derived scripts

`variables` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## See also

- [Variable model](/language/variable-model)
- [constants](/language/elements/constants)
