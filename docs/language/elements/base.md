# base

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Inherits from a compiled parent `.mglo` variant. A derived script merges its elements on top of the base gametype — useful for variant families (1-Flag CTF from CTF, and so on).

The `base` line must be the **first line** of the file — nothing may appear before it.

```megalo
base "ctf.mglo"
```

<DocsBlock type="note" title="Ubiquitous Language">

Technically, MegaloEdit does not treat `base` like an element; in fact it does not even syntax-highlight the `base` declaration. We have included it under the Elements section simply to make it easier to find in our documentation.

</DocsBlock>

For more information, see [Base files](/language/base-files).