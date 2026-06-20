# Sounds

Symbolic sound tokens for `play_sound` and the optional sound operand on `hud_post_message`. Values match `e_megalo_sound` in @blamnetwork/blf (Reach MCC). Older Reach builds store the same 7-bit index as a raw integer.

Used by [`play_sound`](/language/actions/play-sound) and [`hud_post_message`](/language/actions/hud-post-message).

| Index | Name |
|-------|------|
| 0 | `slayer` |
| 1 | `ctf` |
| 2 | `flag_captured` |
| 3 | `flag_dropped` |
| 4 | `flag_recovered` |
| 5 | `flag_reset` |
| 6 | `flag_stolen` |
| 7 | `flag_taken` |
| 8 | `vip` |
| 9 | `new_vip` |
| 10 | `vip_killed` |
| 11 | `juggernaut` |
| 12 | `new_juggernaut` |
| 13 | `territories` |
| 14 | `territory_captured` |
| 15 | `territory_lost` |
| 16 | `assault` |
| 17 | `bomb_armed` |
| 18 | `bomb_detonated` |
| 19 | `bomb_disarmed` |
| 20 | `bomb_dropped` |
| 21 | `bomb_reset` |
| 22 | `bomb_returned` |
| 23 | `bomb_taken` |
| 24 | `infection` |
| 25 | `infected` |
| 26 | `last_man_standing` |
| 27 | `new_zombie` |
| 28 | `oddball` |
| 29 | `ball_spawned` |
| 30 | `ball_taken` |
| 31 | `ball_dropped` |
| 32 | `ball_reset` |
| 33 | `king` |
| 34 | `hill_controlled` |
| 35 | `hill_contested` |
| 36 | `hill_moved` |
| 37 | `headhunter` |
| 38 | `stockpile` |
| 39 | `race` |
| 40 | `defense` |
| 41 | `offense` |
| 42 | `destination_moved` |
| 43 | `generator_armed` |
| 44 | `core_armed` |
| 45 | `generator_disarmed` |
| 46 | `core_disarmed` |
| 47 | `sudden_death` |
| 48 | `game_over` |
| 49 | `bone_cv_defeat` |
| 50 | `bone_cv_ph1_defeat` |
| 51 | `bone_cv_ph1_intro` |
| 52 | `bone_cv_ph1_victory` |
| 53 | `bone_cv_ph2_defeat` |
| 54 | `bone_cv_ph2_victory` |
| 55 | `bone_cv_ph3_victory` |
| 56 | `bone_cv_victory` |
| 57 | `bone_sp_defeat` |
| 58 | `bone_sp_ph1_intro` |
| 59 | `bone_sp_ph1_victory` |
| 60 | `bone_sp_ph2_intro` |
| 61 | `bone_sp_ph2_victory` |
| 62 | `bone_sp_ph3_intro` |
| 63 | `bone_sp_ph3_victory` |
| 64 | `isle_cv_defeat` |
| 65 | `isle_cv_ph1_defeat` |
| 66 | `isle_cv_ph1_intro` |
| 67 | `isle_cv_ph2_intro` |
| 68 | `isle_cv_ph2_victory` |
| 69 | `isle_cv_ph3_intro` |
| 70 | `isle_cv_ph3_victory` |
| 71 | `isle_sp_defeat` |
| 72 | `isle_sp_ph1_defeat` |
| 73 | `isle_sp_ph1_extra` |
| 74 | `isle_sp_ph1_intro` |
| 75 | `isle_sp_ph1_victory` |
| 76 | `isle_sp_ph2_defeat` |
| 77 | `isle_sp_ph2_victory` |
| 78 | `isle_sp_ph3_victory` |
| 79 | `isle_sp_victory` |
| 80 | `bone_sp_ph3_defeat` |
| 81 | `isle_cv_ph3_defeat` |
| 82 | `covy_big_win` |
| 83 | `covy_win1` |
| 84 | `covy_win2` |
| 85 | `invasion_beginning` |
| 86 | `unsc_big_win` |
| 87 | `unsc_win1` |
| 88 | `unsc_win2` |
| 89 | `power_down` |
| 90 | `reinforcements` |
| 91 | `respawn_tick` |
| 92 | `alpha_under_attack` |
| 93 | `bravo_under_attack` |
| 94 | `charlie_under_attack` |

## Notes

Use `none` as the sound operand on `hud_post_message` when the message should not play an accompanying sound. `play_sound` accepts an optional `immediate` prefix before the target.

## Source

[`e_megalo_sound`](https://github.com/Blam-Network/blf/blob/main/blf-ts/src/blam/haloreach_mcc/v_untracked_25_08_16_1352/game/megalogamengine/megalogamengine_actions.ts) in @blamnetwork/blf.
