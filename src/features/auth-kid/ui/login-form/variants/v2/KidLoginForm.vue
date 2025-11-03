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
</script>

<style scoped>
.login {
  @apply grid w-full max-w-4xl gap-10;
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
