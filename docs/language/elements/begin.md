# begin

<AvailabilityCard reach="partial" halo4="yes" h2a="yes">

The `begin` action was added in the Master Chief Collection release of Halo: Reach, it is not available on Xbox 360 versions of Halo: Reach.

</AvailabilityCard>

Opens an explicit **sub-block** inside an [action scope](/language/elements/trigger#action-scope). Although the compiler lowers `begin` to an action opcode, in source it behaves like a scope element alongside `condition`, `action`, `temporary`, and `or`.

The primary shipped use is **if/elseif-style branching**: several `begin`/`end` pairs in sequence, where each block has its own conditions. If a condition inside one block fails, only that block halts — the next `begin` block still runs.

## Example from Winter Contingency

Reach MCC's `tu1_winter_contingency.txt` rewrote a round-timeout winner check using `begin` blocks inside `action for_each team`. Each block tests a different frozen-player count and updates tie-tracking state:

```megalo
trigger general
	condition if round_time_limit > 0
	condition timer_expired round_timer

	temporary number least_frozen_players k_maximum_team_size
	temporary team least_frozen_players_team none

	action for_each team
		action set active_teams_count += 1
		condition team_is_active current_team

		begin
			condition if current_team.players_frozen == least_frozen_players
			action set teams_tied = true
		end
		begin
			condition if current_team.players_frozen < least_frozen_players
			action set least_frozen_players = current_team.players_frozen
			action set least_frozen_players_team = current_team
		end
	end
end
```

Without `begin`, flat conditions would **AND** together — the first failing comparison would halt the rest of the iteration. Separate blocks let each branch run independently, like `if` / `else if`.

The same trigger in HREK still contains the older Reach pattern in comments: a single `for_each` body with `or`-chained conditions acting as elseif branches. MCC added the `begin` opcode (ported from Halo 4) so that logic could be expressed as explicit sub-blocks instead.

## Syntax

`begin` is written on its own line, not as `action begin`:

```megalo
begin
	[<conditions, actions, temporaries, nested begin/end pairs>]
end
```

Legal contents match any other action scope: `condition`, `or`, `action`, `temporary`, and nested `begin`/`end` pairs.

## Where it appears

`begin` blocks are valid anywhere an action scope is valid:

- Inside a [`trigger`](/language/elements/trigger) body
- Inside an `action for_each` sub-trigger
- Nested inside another `begin` block

## Rules

**Independent blocks** — Sequential `begin`/`end` pairs are evaluated one after another. A false condition inside block *N* does not prevent block *N + 1* from running.

**Action budget** — Each `begin` line counts as **one action** toward the script's 1024-action limit, in addition to the actions inside the block.

**Temporary variables** — [`temporary`](/language/variable-model#temporary-variables) declarations inside a `begin` block are scoped to that block (and any nested blocks inside it).

## See also

- [trigger — Action scope](/language/elements/trigger#action-scope) — keywords valid inside triggers
- [trigger](/language/elements/trigger) — execution and `for_each`
- [Conditions — OR](/language/elements/trigger/condition#or) — the pre-`begin` elseif pattern
- [action](/language/elements/trigger/action) — imperative opcodes inside blocks
- [Variable model — Temporary variables](/language/variable-model#temporary-variables)
