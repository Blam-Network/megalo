# action

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

**Actions** are imperative statements inside triggers that change game state. They run in order, top to bottom, after all preceding conditions in the trigger have passed.

## Syntax

```megalo
action <name> [arg1] [arg2] ...
```

Each action line names an opcode followed by its operands. Operands can be variables, constants, references, literals, or string table symbols depending on the action.

```megalo
action set my_counter add 1
action set_score add kill_points player killing_player
action hud_post_message everyone "Round started!"
action create_object "warthog" at current_player never_garbage
action submit_incident game_start_slayer player current_player player none
```

Per-opcode grammar, examples, and build availability are documented under **[Actions](/language/actions/adjust-grenades)** in the sidebar. See [Megalo Versions](/versions/) for which opcodes exist on each Reach build.

## See also

- [trigger](/language/elements/trigger) — when actions run
- [condition](/language/elements/trigger/condition) — gating actions
- [References](/language/references) — operand types
- [Variable model](/language/variable-model) — targets for `set`
- [Object lists](/language/object-lists) — symbolic names for objects, incidents, and more
