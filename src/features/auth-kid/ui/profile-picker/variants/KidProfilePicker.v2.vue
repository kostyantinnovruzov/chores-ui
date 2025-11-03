<template>
  <section class="carousel">
    <div v-if="isLoading" class="carousel__state">
      {{ t('common.state.loading') }}
    </div>

    <div v-else-if="isError" class="carousel__state carousel__state--error">
      <span>{{ t('common.feedback.error') }}</span>
      <button type="button" class="carousel__retry" @click="$emit('retry')">
        {{ t('common.actions.retry') }}
      </button>
    </div>

    <div v-else-if="!kids.length" class="carousel__state">
      {{ t('features.authKid.noProfiles') }}
    </div>

    <div v-else class="carousel__stage">
      <button
        type="button"
        class="carousel__nav carousel__nav--prev"
        :disabled="controlsDisabled"
        :aria-label="t('features.authKid.profileCarousel.prev')"
        @click="handlePrev"
      >
        ‹
      </button>

      <div class="carousel__deck">
        <button
          v-for="entry in visibleKids"
          :key="entry.kid.id"
          type="button"
          class="carousel__card"
          :class="cardClass(entry)"
          :style="cardStyle(entry)"
          @click="handleCardClick(entry)"
        >
          <span class="carousel__glow" />

          <span class="carousel__avatar">
            <img
              v-if="entry.kid.avatarPath"
              :alt="entry.kid.nickname"
              :src="entry.kid.avatarPath"
            />
            <span v-else>{{ initials(entry.kid.nickname) }}</span>
          </span>

          <strong class="carousel__name">
            {{ entry.kid.nickname }}
          </strong>
        </button>
      </div>

      <button
        type="button"
        class="carousel__nav carousel__nav--next"
        :disabled="controlsDisabled"
        :aria-label="t('features.authKid.profileCarousel.next')"
        @click="handleNext"
      >
        ›
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { useI18n } from 'vue-i18n';

import type { KidProfile } from '@/entities/kid';

const props = defineProps<{
  kids: KidProfile[];
  isLoading?: boolean;
  isError?: boolean;
  selectedKidId?: KidProfile['id'] | null;
}>();

const emit = defineEmits<{
  (e: 'select', kid: KidProfile): void;
  (e: 'highlight', kid: KidProfile): void;
  (e: 'retry'): void;
}>();

const { t } = useI18n();
const { kids, selectedKidId } = toRefs(props);

type VisibleRole = 'prev' | 'active' | 'next';
type VisibleEntry = {
  kid: KidProfile;
  index: number;
  role: VisibleRole;
  offset: number;
};

const gradientPalette = [
  'linear-gradient(135deg, #f97316, #fbbf24)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #22d3ee, #38bdf8)',
  'linear-gradient(135deg, #f472b6, #fb7185)',
  'linear-gradient(135deg, #34d399, #22c55e)',
  'linear-gradient(135deg, #facc15, #f97316)'
] as const;

const currentIndex = ref(0);

const kidCount = computed(() => kids.value.length);
const controlsDisabled = computed(() => kidCount.value <= 1);
const activeKid = computed(() => kids.value[currentIndex.value] ?? null);

const visibleKids = computed<VisibleEntry[]>(() => {
  const list = kids.value;
  const length = list.length;
  if (!length) return [];

  const offsets = length === 1 ? [0] : length === 2 ? [0, 1] : [-1, 0, 1];

  return offsets.map((offset) => {
    const index = normalizeIndex(currentIndex.value + offset, length);
    const kid = list[index]!;
    let role: VisibleRole = 'active';
    if (offset < 0) role = 'prev';
    if (offset > 0) role = 'next';
    return { kid, index, role, offset };
  });
});

watch(
  kids,
  (next) => {
    if (!next.length) {
      currentIndex.value = 0;
      return;
    }
    if (currentIndex.value >= next.length) {
      currentIndex.value = 0;
      return;
    }
  },
  { immediate: true }
);

watch(
  selectedKidId,
  (next) => {
    if (next == null) return;
    const index = kids.value.findIndex((kid) => String(kid.id) === String(next));
    if (index >= 0) {
      currentIndex.value = index;
    }
  },
  { immediate: true }
);

watch(
  activeKid,
  (kid) => {
    if (kid) emit('highlight', kid);
  },
  { immediate: true }
);

function handlePrev() {
  if (!kidCount.value) return;
  currentIndex.value = normalizeIndex(currentIndex.value - 1, kidCount.value);
}

function handleNext() {
  if (!kidCount.value) return;
  currentIndex.value = normalizeIndex(currentIndex.value + 1, kidCount.value);
}

function handleCardClick(entry: VisibleEntry) {
  if (entry.role === 'active') {
    emit('select', entry.kid);
  } else {
    currentIndex.value = entry.index;
  }
}

function cardClass(entry: VisibleEntry) {
  return {
    'carousel__card--active': entry.role === 'active',
    'carousel__card--neighbour': entry.role !== 'active'
  };
}

function cardStyle(entry: VisibleEntry): CSSProperties {
  const paletteIndex = Math.abs(entry.index % gradientPalette.length);
  const isActive = entry.role === 'active';
  const translateX = entry.offset * 240;
  const translateY = isActive ? -24 : 28;
  const scale = isActive ? 1 : 0.72;
  const opacity = kidCount.value <= 1 ? 1 : isActive ? 1 : kidCount.value === 2 ? 0.7 : 0.45;
  const pointerEvents: CSSProperties['pointerEvents'] =
    Math.abs(entry.offset) > 1 ? 'none' : 'auto';

  return {
    background: gradientPalette[paletteIndex],
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
    opacity,
    filter: isActive ? 'none' : 'blur(1.5px)',
    pointerEvents,
    zIndex: isActive ? 10 : 1
  };
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function normalizeIndex(target: number, length: number) {
  return ((target % length) + length) % length;
}
</script>

<style scoped>
.carousel {
  @apply mx-auto flex w-full max-w-[60rem] flex-col items-center gap-8;
}

.carousel__state {
  @apply flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/70 p-10
    font-semibold text-indigo-900 shadow-lg shadow-indigo-200/50 backdrop-blur;
}

.carousel__state--error span {
  @apply text-rose-500;
}

.carousel__retry {
  @apply rounded-full bg-gradient-to-r from-orange-400 to-rose-500 px-6 py-2 text-white shadow-lg
    transition hover:-translate-y-0.5 hover:shadow-xl;
}

.carousel__stage {
  @apply relative mx-auto grid h-[20rem] w-full max-w-[52rem] place-items-center;
}

.carousel__nav {
  @apply absolute top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full
    bg-white/85 text-3xl text-indigo-900 shadow-xl shadow-indigo-300/50 transition hover:-translate-y-0.5
    hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40;

  z-index: 20;
}

.carousel__nav--prev {
  @apply left-0;
}

.carousel__nav--next {
  @apply right-0;
}

.carousel__deck {
  @apply relative mx-auto h-[18.5rem] w-full max-w-[48rem];
}

.carousel__card {
  @apply absolute flex h-[18.5rem] w-[16.5rem] -translate-x-1/2 -translate-y-1/2 flex-col
    items-center justify-center gap-6 rounded-[36px] border-4 border-white/90 px-10 text-white
    shadow-[0_32px_72px_rgba(79,70,229,0.25)] transition-all duration-500
    ease-[cubic-bezier(0.22,0.61,0.36,1)] focus-visible:outline-none focus-visible:ring-4
    focus-visible:ring-white/70;
}

.carousel__card--active {
  @apply shadow-[0_40px_90px_rgba(236,72,153,0.32)];
}

.carousel__card--neighbour {
  @apply shadow-[0_24px_60px_rgba(59,130,246,0.22)];
}

.carousel__glow {
  @apply absolute inset-0 rounded-[36px] bg-white/20 opacity-0 transition-opacity duration-500;
}

.carousel__card--active .carousel__glow {
  @apply opacity-40;
}

.carousel__avatar {
  @apply relative grid h-32 w-32 place-items-center rounded-3xl bg-white/20 text-5xl font-extrabold
    shadow-[inset_0_0_0_6px_rgba(255,255,255,0.35)];
}

.carousel__avatar img {
  @apply h-full w-full rounded-3xl object-cover;
}

.carousel__name {
  @apply text-center text-2xl font-extrabold tracking-wide drop-shadow-lg;
}
</style>
