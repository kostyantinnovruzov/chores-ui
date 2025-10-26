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
    <div v-else class="carousel__viewport">
      <button
        type="button"
        class="carousel__nav carousel__nav--prev"
        :disabled="controlsDisabled"
        aria-label="Previous profile"
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
          :class="cardClass(entry.role)"
          :style="cardStyle(entry)"
          @click="handleCardClick(entry)"
        >
          <div class="carousel__avatar">
            <img
              v-if="entry.kid.avatarPath"
              :alt="entry.kid.nickname"
              :src="entry.kid.avatarPath"
            />
            <span v-else>{{ initials(entry.kid.nickname) }}</span>
          </div>
          <strong class="carousel__name">{{ entry.kid.nickname }}</strong>
          <p class="carousel__hint">
            {{ entry.kid.passcodeHint || t('features.authKid.enterPasscodeSubtitle') }}
          </p>
          <span v-if="entry.role === 'active'" class="carousel__cta">
            {{ t('features.authKid.submit') }}
          </span>
        </button>
      </div>

      <button
        type="button"
        class="carousel__nav carousel__nav--next"
        :disabled="controlsDisabled"
        aria-label="Next profile"
        @click="handleNext"
      >
        ›
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
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
    const kid = list[index];
    let role: VisibleRole = 'active';
    if (offset < 0) role = 'prev';
    if (offset > 0) role = 'next';
    return { kid, index, role };
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
    const key = String(next);
    const index = kids.value.findIndex((kid) => String(kid.id) === key);
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

function cardClass(role: VisibleRole) {
  return {
    'carousel__card--active': role === 'active',
    'carousel__card--side': role !== 'active',
    'carousel__card--side-prev': role === 'prev',
    'carousel__card--side-next': role === 'next'
  };
}

function cardStyle(entry: VisibleEntry) {
  const paletteIndex = entry.index % gradientPalette.length;
  return {
    background: gradientPalette[Math.abs(paletteIndex)]
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
  position: relative;
  display: grid;
  gap: 2rem;
}

.carousel__state {
  display: grid;
  gap: 1rem;
  justify-items: center;
  color: rgba(31, 31, 61, 0.75);
  font-weight: 600;
}

.carousel__state--error span {
  color: #ef4444;
}

.carousel__retry {
  padding: 0.65rem 1.35rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #f97316, #f43f5e);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.carousel__retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(244, 63, 94, 0.32);
}

.carousel__viewport {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: clamp(1rem, 4vw, 2rem);
  align-items: center;
}

.carousel__nav {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 36px rgba(79, 70, 229, 0.25);
  font-size: 2rem;
  color: #312e81;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.carousel__nav:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(79, 70, 229, 0.35);
}

.carousel__nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.carousel__deck {
  position: relative;
  min-height: clamp(240px, 28vw, 320px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 5vw, 2.25rem);
}

.carousel__card {
  position: relative;
  width: clamp(220px, 25vw, 260px);
  border: none;
  border-radius: 32px;
  padding: clamp(2rem, 4vw, 2.5rem);
  display: grid;
  gap: 1.25rem;
  justify-items: center;
  cursor: pointer;
  color: #fff;
  transition:
    transform 0.35s ease,
    filter 0.35s ease,
    opacity 0.35s ease,
    box-shadow 0.35s ease;
  transform: translateY(45px) scale(0.88);
  opacity: 0.45;
  filter: saturate(0.8);
  box-shadow: 0 20px 50px rgba(59, 130, 246, 0.2);
}

.carousel__card--active {
  transform: translateY(-18px) scale(1.05);
  opacity: 1;
  filter: saturate(1.05);
  box-shadow: 0 40px 80px rgba(236, 72, 153, 0.3);
}

.carousel__card--side-prev {
  transform: translate(-12px, 24px) scale(0.92);
}

.carousel__card--side-next {
  transform: translate(12px, 24px) scale(0.92);
}

.carousel__avatar {
  width: clamp(110px, 14vw, 130px);
  height: clamp(110px, 14vw, 130px);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  overflow: hidden;
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.35);
}

.carousel__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel__avatar span {
  font-size: clamp(3rem, 5vw, 3.5rem);
  font-weight: 800;
}

.carousel__name {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  font-weight: 800;
  text-align: center;
}

.carousel__hint {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
  opacity: 0.85;
}

.carousel__cta {
  padding: 0.45rem 1.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #4338ca;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 16px 32px rgba(255, 255, 255, 0.2);
}
</style>
