<script setup lang="ts">
import { computed, useSlots } from "vue";

type ChipVariant = "success" | "error" | "warn" | "info" | "note" | "tip";
type AvailabilityStatus = "yes" | "no" | "partial";

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  yes: "Yes",
  no: "No",
  partial: "Partial",
};

const base = import.meta.env.BASE_URL;
const gamesImage = `${base}images/what-games.png`;
const thumbImage = `${base}images/icons/mega-thumb.png`;

type GameKey = "reach" | "halo4" | "h2a";

const GAME_ICONS: Record<GameKey, string> = {
  reach: `${base}images/icons/game-reach.png`,
  halo4: `${base}images/icons/game-h4.png`,
  h2a: `${base}images/icons/game-h2a.png`,
};

const props = withDefaults(
  defineProps<{
    variant?: ChipVariant;
    /** Halo: Reach availability for this feature. */
    reach?: AvailabilityStatus;
    /** Halo 4 availability for this feature. */
    halo4?: AvailabilityStatus;
    /** Halo 2: Anniversary availability for this feature. */
    h2a?: AvailabilityStatus;
  }>(),
  {}
);

const slots = useSlots();

const gameRows = computed(() => {
  const rows: { key: GameKey; name: string; icon: string; status: AvailabilityStatus }[] =
    [];

  if (props.reach !== undefined) {
    rows.push({
      key: "reach",
      name: "Halo: Reach",
      icon: GAME_ICONS.reach,
      status: props.reach,
    });
  }
  if (props.halo4 !== undefined) {
    rows.push({
      key: "halo4",
      name: "Halo 4",
      icon: GAME_ICONS.halo4,
      status: props.halo4,
    });
  }
  if (props.h2a !== undefined) {
    rows.push({
      key: "h2a",
      name: "Halo 2: Anniversary",
      icon: GAME_ICONS.h2a,
      status: props.h2a,
    });
  }

  return rows;
});

const resolvedVariant = computed((): ChipVariant => {
  if (props.variant) {
    return props.variant;
  }

  const statuses = gameRows.value.map((row) => row.status);
  if (statuses.length === 0) {
    return "info";
  }
  if (statuses.every((status) => status === "yes")) {
    return "success";
  }
  if (statuses.every((status) => status === "no")) {
    return "error";
  }
  return "warn";
});

const hasDefaultSlot = computed(() => Boolean(slots.default));

const isGreen = computed(() => resolvedVariant.value === "success");

const artImage = computed(() => (isGreen.value ? thumbImage : gamesImage));
</script>

<template>
  <aside
    class="availability-card"
    :class="`availability-card--${resolvedVariant}`"
    role="note"
  >
    <img
      class="availability-card__art"
      :class="{ 'availability-card__art--thumb': isGreen }"
      :src="artImage"
      alt=""
      aria-hidden="true"
    />

    <div class="availability-card__body">
      <ul v-if="gameRows.length" class="availability-card__games">
        <li
          v-for="game in gameRows"
          :key="game.key"
          class="availability-card__game"
        >
          <span class="availability-card__game-label">
            <img
              class="availability-card__game-icon"
              :src="game.icon"
              alt=""
              aria-hidden="true"
            />
            <span class="availability-card__game-name">{{ game.name }}</span>
          </span>
          <span
            class="availability-card__game-status"
            :class="`is-${game.status}`"
          >
            {{ STATUS_LABELS[game.status] }}
          </span>
        </li>
      </ul>

      <div v-if="hasDefaultSlot" class="availability-card__content">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.availability-card {
  --availability-accent: var(--vp-c-brand-2);
  --availability-bg: var(--vp-c-brand-soft);

  position: relative;
  margin: 0 0 1rem;
  padding: 0.65rem 1.15rem;
  padding-right: 11.5rem;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--availability-accent);
  border-radius: 8px;
  background: var(--availability-bg);
  color: var(--vp-c-text-1);
  overflow: hidden;
}

.availability-card__art {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  width: 10.5rem;
  height: auto;
  transform: translateY(-50%);
  pointer-events: none;
  user-select: none;
}

.availability-card__art--thumb {
  width: 5rem;
  right: 0.75rem;
}

.availability-card--success {
  padding-right: 8rem;
}

.availability-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.availability-card__games {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem 0.85rem;
}

.availability-card__game {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  line-height: 1.3;
  white-space: nowrap;
}

.availability-card__game-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.availability-card__game-icon {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 2px;
}

.availability-card__game + .availability-card__game {
  padding-left: 0.85rem;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

.availability-card__game-name {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.availability-card__game-status {
  flex-shrink: 0;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.availability-card__game-status.is-yes {
  color: var(--vp-c-green-1);
}

.availability-card__game-status.is-no {
  color: #f87171;
}

.availability-card__game-status.is-partial {
  color: #facc15;
}

.availability-card__content {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--vp-c-text-1);
  padding-top: 0.15rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.availability-card__content :deep(p) {
  margin: 0;
}

.availability-card__content :deep(p + p) {
  margin-top: 0.45rem;
}

.availability-card__content :deep(a) {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.availability-card__content :deep(code) {
  font-family: var(--vp-font-family-mono);
  font-size: 0.88em;
  padding: 0.12rem 0.35rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.22);
  color: var(--vp-code-color);
}

.availability-card--success {
  --availability-accent: var(--vp-c-green-2);
  --availability-bg: rgba(61, 214, 140, 0.1);
}

.availability-card--error {
  --availability-accent: #ef4444;
  --availability-bg: rgba(239, 68, 68, 0.1);
}

.availability-card--warn {
  --availability-accent: #eab308;
  --availability-bg: rgba(234, 179, 8, 0.1);
}

.availability-card--info {
  --availability-accent: #60a5fa;
  --availability-bg: rgba(96, 165, 250, 0.1);
}

.availability-card--note {
  --availability-accent: #c084fc;
  --availability-bg: rgba(192, 132, 252, 0.1);
}

.availability-card--tip {
  --availability-accent: var(--vp-c-green-2);
  --availability-bg: rgba(61, 214, 140, 0.1);
}

@media (max-width: 640px) {
  .availability-card {
    padding-right: 1.15rem;
    padding-top: 7.5rem;
  }

  .availability-card--success {
    padding-top: 5rem;
  }

  .availability-card__art {
    top: 0.35rem;
    right: 0.35rem;
    width: 7.25rem;
    transform: none;
  }

  .availability-card__art--thumb {
    width: 4rem;
  }

  .availability-card__games {
    gap: 0.5rem 0.65rem;
  }

  .availability-card__game {
    font-size: 0.82rem;
  }

  .availability-card__game + .availability-card__game {
    padding-left: 0.65rem;
  }
}
</style>
