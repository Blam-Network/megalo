# constants

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Named numeric values that cannot change at runtime.

```megalo
constants
	number k_special_death_type_none 0
	number k_special_death_type_melee 1
	number k_special_death_type_headshot 5
end
```

Each line declares a type (`number` in shipped scripts), a name, and an integer value. Constants share the global naming namespace with variables, triggers, and other named elements.

## Base-derived scripts

`constants` can appear in [base-derived scripts](/language/base-files) to add or replace constants.

## See also

- [Variable model](/language/variable-model) — runtime mutable storage
