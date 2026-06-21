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

## Duplicate symbols

Within a single `string_table` block, each symbol may appear only once.

Across separate `string_table` blocks for the same language, MegaloEdit rejects duplicate symbols when both definitions are actually parsed. If an [`include`](/language/elements/include) file was already loaded earlier in the same script, a second `include` of that path is skipped entirely (MegaloEdit tracks included paths case-insensitively), so shared string files such as `strings/slayer_strings.txt` are not merged twice when multiple wrappers reference them.

```text
String table for language english already has a string for token foo defined
```

Shipped Reach scripts avoid this by defining each symbol once across their include tree. Re-defining a symbol in a later block or include is a compile error, not a silent override.

## Base-derived scripts

`string_table` and string [`include`](/language/elements/include) directives can appear in [base-derived scripts](/language/base-files) to add localized strings.

## See also

- [include](/language/elements/include)
