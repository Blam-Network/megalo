# create_tunnel

<AvailabilityCard reach="partial" />

## Description

Places an object between two entities and gives that object a **cylinder** shape. The radius comes from the radius operand; if that value is **0**, the engine uses **5** instead.

<DocsBlock type="info" title="Same object for both endpoints">

If both endpoints are the same object, the tunnel is placed **exactly** on that reference—there is no collision check, unlike [create_object](/language/actions/create-object). The spawned object also faces straight up.

</DocsBlock>

<ActionParameters />

## Example

```megalo
action create_tunnel …
```

No curated example yet — see [Megalo Versions](/versions/) for build availability.

## Build availability

| Build | Opcode |
|-------|--------|
| 49 | — |
| 73 | [88](/versions/73/) |
| 106 | [87](/versions/106/) |
| 107 | [87](/versions/107/) |
| 107 (MCC) | [87](/versions/107-mcc/) |

See also the [Actions overview](/language/actions/) and [action syntax](/language/elements/trigger/action).
