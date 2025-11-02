<template>
  <section class="login">
    <div class="profile" :class="{ 'profile--empty': !selectedChild }">
      <button
        v-if="selectedChild"
        type="button"
        class="profile__change"
        @click="$emit('change-child')"
      >
        {{ t('features.authKid.changeProfile') }}
      </button>

      <div class="profile__avatar">
        <template v-if="selectedChild?.avatarPath">
          <img :alt="selectedChild.nickname" :src="selectedChild.avatarPath" />
        </template>
        <template v-else>
          <span>{{ initials(selectedChild?.nickname ?? '') }}</span>
        </template>
      </div>

      <div class="profile__text">
        <h2 class="profile__title">
          {{
            selectedChild
              ? t('features.authKid.enterPasscodeTitle', { name: selectedChild.nickname })
              : t('features.authKid.title')
          }}
        </h2>
        <p class="profile__subtitle">
          {{
            selectedChild
              ? selectedChild.passcodeHint || t('features.authKid.enterPasscodeSubtitle')
              : t('features.authKid.subtitle')
          }}
        </p>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-6"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-6"
    >
      <form v-if="selectedChild" class="pin" @submit.prevent="submit">
        <div class="pin__panel" :class="{ 'animate-kid-shake': isShaking }">
          <EmojiPinKeyboard
            v-model="passcodeValue"
            :disabled="isSubmitting"
            :min-length="4"
            :max-length="4"
            @complete="submit()"
          />
        </div>

        <p v-if="passcodeError" class="pin__error">
          {{ passcodeError }}
        </p>

        <button class="pin__cta" :disabled="isSubmitDisabled" type="submit">
          <span v-if="isSubmitting">{{ t('common.state.loading') }}</span>
          <span v-else>{{ t('features.authKid.submit') }}</span>
        </button>
      </form>
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

defineEmits<{
  (e: 'change-child'): void;
}>();

const { selectedChild } = toRefs(props);
const { t } = useI18n();
const { submit, isSubmitting, errors, models, resetErrors } = useKidLoginForm();
const { childId, passcode } = models;

const passcodeValue = computed<string[]>({
  get: () => passcode.value ?? [],
  set: (value) => {
    passcode.value = value;
  }
});

const isPasscodeReady = computed(() => passcodeValue.value.length >= 4);
const isChildProvided = computed(() => Boolean(childId.value));
const isSubmitDisabled = computed(
  () => isSubmitting.value || !isChildProvided.value || !isPasscodeReady.value
);

const isShaking = ref(false);
let shakeTimer: number | undefined;
const passcodeError = computed(() => errors.value.passcode);

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

function initials(name: string) {
  if (!name) return '👤';
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
</script>

<style scoped>
.login {
  @apply grid w-full max-w-4xl gap-10;
}

.profile {
  @apply relative overflow-hidden rounded-[36px] p-10 text-white shadow-[0_32px_80px_rgba(244,114,182,0.28)]
    transition-colors bg-gradient-to-br from-orange-300/90 via-pink-400/90 to-indigo-400/80
    grid gap-6 justify-items-center;
}

.profile--empty {
  @apply bg-gradient-to-br from-indigo-400/85 via-violet-400/80 to-sky-400/75;
}

.profile__change {
  @apply absolute right-6 top-6 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-indigo-700
    shadow-lg shadow-white/40 transition hover:-translate-y-0.5 hover:shadow-xl;
}

.profile__avatar {
  @apply grid h-32 w-32 place-items-center rounded-[32px] bg-white/25 text-5xl font-extrabold
    shadow-[inset_0_0_0_6px_rgba(255,255,255,0.35)];
}

.profile__avatar img {
  @apply h-full w-full rounded-[32px] object-cover;
}

.profile__text {
  @apply grid gap-3 text-center;
}

.profile__title {
  @apply text-3xl font-extrabold tracking-wide drop-shadow-[0_18px_40px_rgba(120,53,15,0.35)];
}

.profile__subtitle {
  @apply text-base text-white/90;
}

.pin {
  @apply grid gap-6 rounded-[32px] bg-white/90 p-8 shadow-[0_38px_80px_rgba(79,70,229,0.22)] backdrop-blur;
}

.pin__panel {
  @apply rounded-[28px] border-4 border-white bg-white/70 p-6 shadow-[0_24px_60px_rgba(99,102,241,0.18)] transition;
}

.pin__error {
  @apply text-center text-sm font-semibold text-rose-500;
}

.pin__cta {
  @apply mx-auto flex w-48 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400
    to-emerald-600 px-6 py-3 text-white shadow-lg shadow-emerald-300/50 transition hover:-translate-y-0.5
    hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60;
}
</style>
