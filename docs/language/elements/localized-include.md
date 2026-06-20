# localized_include

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

MegaloEdit recognizes a second include keyword:

```megalo
localized_include "strings/english/slayer_strings.txt"
```

Syntax mirrors [`include`](/language/elements/include) — a quoted path relative to the current file.

Localized includes are just like regular includes, except they are **optional when the file is missing** in lenient compile mode (see [Compiler settings](/language/compiler-settings)). If the compiler cannot find the path, it warns and skips the include. Plain `include` of a missing file is always a hard error.

MegaloEdit always uses lenient mode.

When the file **does** exist, `localized_include` loads and parses it the same as `include`. The keyword does not survive into compiled variant data; it is resolved entirely at compile time.

**No shipped HREK script uses it.** Bungie used wrapper files and plain `include` instead. For Reach scripting, that wrapper pattern is the authoritative approach.

## Base-derived scripts

`localized_include` can appear in [base-derived scripts](/language/base-files) the same as plain `include`.

## See also

- [include](/language/elements/include)
- [Compiler settings](/language/compiler-settings)
