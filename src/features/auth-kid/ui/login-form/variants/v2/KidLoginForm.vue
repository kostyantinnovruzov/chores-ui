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
              :aria-label="t('features.authKid.actions.changeProfile', 'Change profile')"
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
                  {{ t('features.authKid.pinModal.title', 'Enter emoji PIN') }}
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

          <p v-if="passcodeError" class="pin__error">
            {{ passcodeError }}
          </p>
        </form>
      </div>
    </Transition>
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

const { selectedChild } = toRefs(props);
const { submit, isSubmitting, errors, models, resetErrors } = useKidLoginForm();
const { childId, passcode } = models;

const passcodeValue = computed<string[]>({
  get: () => passcode.value ?? [],
  set: (value) => {
    passcode.value = value;
  }
});

const isShaking = ref(false);
let shakeTimer: number | undefined;
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
  shakeTimer = window.setTimeout(() => {
    isShaking.value = false;
  }, 650);
});

onBeforeUnmount(() => {
  window.clearTimeout(shakeTimer);
});

function handleClose() {
  emit('change-child');
}
</script>

<style scoped>
.login__overlay {
  @apply fixed inset-0 z-40 grid place-items-center bg-slate-900/40 px-4 pb-10 sm:px-6;
}

.login__modal {
  @apply w-full max-w-[30rem];
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

.pin__error {
  @apply text-center text-sm font-semibold text-rose-500;
}
</style>
