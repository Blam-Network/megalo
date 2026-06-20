# string_table

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Localized UI strings, organized by language.

```megalo
string_table english
	slayer_title "Slayer"
	slayer_description "Score points by killing players on the opposing team."
end
```

Each block names a language (`english`, `french`, `german`, etc.). String names are referenced by symbol elsewhere in the script (e.g. `engine_data name slayer_title`).

A script may contain at most **112** string entries and **19,456** bytes of string data total across all languages.

String tables are usually included through wrapper files — see [include](/language/elements/include).

## Base-derived scripts

`string_table` and string [`include`](/language/elements/include) directives can appear in [base-derived scripts](/language/base-files) to add localized strings.

## See also

- [include](/language/elements/include)
