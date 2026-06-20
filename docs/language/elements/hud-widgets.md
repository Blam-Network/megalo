# hud_widgets

<AvailabilityCard reach="yes" halo4="yes" h2a="yes">


</AvailabilityCard>

Declares on-screen HUD widget slots. Each line is a widget identifier and a screen position.

```megalo
hud_widgets
	proximity_warning high_center
	arming_warning low_center
	game_state_widget top_left
	rating_widget top_left
end
```

The first token is either a **built-in widget type** (such as `proximity_warning`, `arming_warning`, `game_state_widget`, `rating_widget`, `stat_widget`, `watermark`) or a **custom name** you choose for generic omni-widgets. The second token is the anchor position.

Common positions include `top_left`, `top_right`, `top_center`, `bottom_center`, `high_left`, `high_right`, `high_center`, `low_center`, and `low_left`.

Widgets are driven at runtime by HUD actions such as `hud_widget_set_text`, `hud_widget_set_meter`, and `hud_widget_set_visibility`. See [action](/language/elements/trigger/action).

A script may declare at most **4** HUD widgets.

## Base-derived scripts

`hud_widgets` is **full-script-only** — it cannot be added in [base-derived scripts](/language/base-files).

## See also

- [player_rating](/language/elements/player-rating) — pairs with `rating_widget`
- [action](/language/elements/trigger/action)
