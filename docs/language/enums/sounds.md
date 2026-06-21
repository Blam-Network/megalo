# Sounds

Symbolic sound tokens for `play_sound` and the optional sound operand on `hud_post_message`. Values match `e_megalo_sound` in @blamnetwork/blf.

Used by [`play_sound`](/language/actions/play-sound) and [`hud_post_message`](/language/actions/hud-post-message).

Megalo sounds reference the `megalogameengine_sounds` (`mgls`) tag. Unlike other Megalo assets, these are not customizable via the [object lists](/language/object-lists) system. Instead, these sounds are hardcoded into the Megalo compiler. While custom maps can replace the sounds, they cannot rename them or add new sounds.

<EnumVersionTable enum="sounds" />

## Notes

Use `none` as the sound operand on `hud_post_message` when the message should not play an accompanying sound. `play_sound` accepts an optional `immediate` prefix before the target.

