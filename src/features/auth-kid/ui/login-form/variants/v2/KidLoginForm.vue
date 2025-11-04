<template>
  <section class="login">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-6"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-6"
    >
      <div
        v-if="selectedChild"
        class="login__overlay"
        role="dialog"
        aria-modal="true"
        @click.self="handleClose"
      >
        <form class="login__modal" @submit.prevent="submit">
          <div class="pin__panel" :class="{ 'pin__panel--error': isShaking }">
            <button
              type="button"
              class="pin__close"
              :aria-label="t('features.authKid.changeProfile')"
              @click="handleClose"
            >
              &times;
            </button>

            <div class="pin__identity">
              <div class="pin__avatar">
                <img
                  v-if="selectedChild?.avatarPath"
                  :src="selectedChild.avatarPath"
                  :alt="selectedChild.nickname"
                />
                <span v-else>{{ childInitials }}</span>
              </div>

              <div class="pin__summary">
                <p class="pin__summary-label">
                  {{ t('features.authKid.pinModal.title') }}
                </p>
                <p class="pin__summary-name">{{ selectedChild?.nickname }}</p>
              </div>
            </div>

            <EmojiPinKeyboard
              v-model="passcodeValue"
              :disabled="isSubmitting"
              :min-length="4"
              :max-length="4"
              :is-invalid="isShaking"
              @complete="submit()"
            />
          </div>
        </form>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="-translate-y-6 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="toastMessage" class="pin__toast pin__toast-global" role="alert">
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <div v-if="isCelebrating" class="pin__celebration" aria-hidden="true">
        <span class="pin__star">⭐</span>
        <div class="pin__confetti">
          <span
            v-for="piece in confettiPieces"
            :key="piece.id"
            class="pin__confetti-piece"
            :style="piece.style"
          />
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import EmojiPinKeyboard from './components/EmojiPinKeyboard.vue';

import type { KidProfile } from '@/entities/kid';
import { useKidLoginForm } from '@/features/auth-kid/model/useKidLoginForm';

const props = defineProps<{ selectedChild?: KidProfile | null }>();

const emit = defineEmits<{
  (e: 'change-child'): void;
}>();

const { t } = useI18n();

type ConfettiPiece = {
  id: number;
  style: Record<string, string>;
};

const { selectedChild } = toRefs(props);
const { submit, isSubmitting, errors, models, resetErrors } = useKidLoginForm({
  onSuccess: handleSuccess
});
const { childId, passcode } = models;

const passcodeValue = computed<string[]>({
  get: () => passcode.value ?? [],
  set: (value) => {
    passcode.value = value;
  }
});

const isShaking = ref(false);
const toastMessage = ref('');
const isCelebrating = ref(false);
const confettiPieces = ref<ConfettiPiece[]>([]);
let shakeTimer: number | undefined;
let toastTimer: number | undefined;
let confettiTimer: number | undefined;
const passcodeError = computed(() => errors.value.passcode);
const childInitials = computed(() => {
  const name = selectedChild.value?.nickname ?? '';
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
});

watch(passcodeValue, () => {
  if (!passcodeError.value) return;
  resetErrors();
  toastMessage.value = '';
});

watch(
  selectedChild,
  (child, previous) => {
    childId.value = child ? String(child.id) : '';
    if (child || previous) {
      passcodeValue.value = [];
      resetErrors();
    }
  },
  { immediate: true }
);

watch(passcodeError, (message) => {
  if (!message) return;
  window.clearTimeout(shakeTimer);
  isShaking.value = true;
  toastMessage.value = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastMessage.value = '';
  }, 5000);
  shakeTimer = window.setTimeout(() => {
    isShaking.value = false;
  }, 650);
});

onBeforeUnmount(() => {
  window.clearTimeout(shakeTimer);
  window.clearTimeout(toastTimer);
  window.clearTimeout(confettiTimer);
});

function handleClose() {
  toastMessage.value = '';
  isCelebrating.value = false;
  confettiPieces.value = [];
  window.clearTimeout(confettiTimer);
  emit('change-child');
}

function handleSuccess({ redirect }: { redirect: () => Promise<void> }) {
  toastMessage.value = '';
  window.clearTimeout(confettiTimer);
  isCelebrating.value = true;
  confettiPieces.value = createConfettiPieces();
  confettiTimer = window.setTimeout(() => {
    isCelebrating.value = false;
    confettiPieces.value = [];
    void redirect();
  }, 1800);
}

function createConfettiPieces(count = 36): ConfettiPiece[] {
  const colors = ['#f87171', '#fb923c', '#facc15', '#34d399', '#38bdf8', '#a855f7'];

  return Array.from({ length: count }, (_, index) => {
    const color = colors[index % colors.length];
    const delay = (Math.random() * 200) / 1000;
    const duration = 1.4 + Math.random() * 0.6;
    const offset = (Math.random() - 0.5) * 160;
    const rotateStart = Math.floor(Math.random() * 360);
    const rotateEnd = rotateStart + 540 + Math.floor(Math.random() * 360);
    const width = 6 + Math.random() * 6;
    const height = 10 + Math.random() * 14;

    return {
      id: index,
      style: {
        left: `${Math.random() * 100}%`,
        width: `${width}px`,
        height: `${height}px`,
        background: color,
        '--confetti-delay': `${delay}s`,
        '--confetti-duration': `${duration}s`,
        '--confetti-offset': `${offset}px`,
        '--confetti-rotate-start': `${rotateStart}deg`,
        '--confetti-rotate-end': `${rotateEnd}deg`
      }
    };
  });
}
</script>

<style scoped>
.login__overlay {
  @apply fixed inset-0 z-40 grid place-items-center bg-slate-900/40 px-4 pb-10 sm:px-6;
}

.login__modal {
  @apply w-full max-w-[30rem];
}

.pin__toast-global {
  @apply fixed top-6 left-1/2 z-[999] w-[min(90%,24rem)] -translate-x-1/2 rounded-2xl bg-rose-500/95 px-5 py-3
    text-sm font-semibold text-white shadow-xl shadow-rose-400/40 backdrop-blur;
}

.pin__celebration {
  @apply pointer-events-none fixed inset-0 z-[998] overflow-hidden;
}

.pin__star {
  @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl drop-shadow-[0_20px_45px_rgba(251,191,36,0.55)];

  animation: pin-star-dance 1.6s ease-in-out forwards;
}

.pin__confetti {
  @apply absolute inset-0 overflow-hidden;
}

.pin__confetti-piece {
  @apply absolute block rounded-md opacity-0;

  top: -12vh;
  animation: pin-confetti-fall var(--confetti-duration, 1.6s) linear forwards;
  animation-delay: var(--confetti-delay, 0s);
  will-change: transform, opacity;
}

.pin__panel {
  @apply relative grid gap-8 rounded-[28px] border-4 border-white bg-white/80 p-8 shadow-[0_24px_60px_rgba(99,102,241,0.18)]
    backdrop-blur-md transition;
}

.pin__panel--error {
  animation: pin-panel-shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);

  @apply border-rose-300 shadow-rose-300/70;
}

.pin__close {
  @apply absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100/60
    text-2xl font-bold text-indigo-500 transition hover:-translate-y-0.5 hover:scale-105 hover:bg-white;
}

.pin__identity {
  @apply flex items-center justify-center gap-4 text-center;
}

.pin__avatar {
  @apply grid h-16 w-16 place-items-center rounded-2xl bg-indigo-500/15 text-2xl font-extrabold text-indigo-700
    shadow-inner shadow-indigo-200;
}

.pin__avatar img {
  @apply h-full w-full rounded-2xl object-cover;
}

.pin__summary {
  @apply grid gap-1;
}

.pin__summary-label {
  @apply text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400;
}

.pin__summary-name {
  @apply text-lg font-bold text-indigo-900;
}

@keyframes pin-panel-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  15%,
  45%,
  75% {
    transform: translateX(-18px);
  }

  30%,
  60%,
  90% {
    transform: translateX(18px);
  }
}

@keyframes pin-confetti-fall {
  0% {
    transform: translate(var(--confetti-offset, 0), -120vh)
      rotate(var(--confetti-rotate-start, 0deg));
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translate(var(--confetti-offset, 0), 110vh)
      rotate(var(--confetti-rotate-end, 720deg));
    opacity: 0;
  }
}

@keyframes pin-star-dance {
  0% {
    transform: translate(-50%, -60%) scale(0.4) rotate(-20deg);
    opacity: 0;
  }

  30% {
    transform: translate(-50%, -50%) scale(1) rotate(10deg);
    opacity: 1;
  }

  60% {
    transform: translate(-50%, -48%) scale(1.15) rotate(-8deg);
  }

  80% {
    transform: translate(-50%, -52%) scale(1.05) rotate(6deg);
  }

  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 0;
  }
}

.pin__error {
  @apply text-center text-sm font-semibold text-rose-500;
}
</style>
