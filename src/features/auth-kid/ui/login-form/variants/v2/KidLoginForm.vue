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
      <form v-if="selectedChild" @submit.prevent="submit">
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
      </form>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRefs, watch } from 'vue';

import EmojiPinKeyboard from './components/EmojiPinKeyboard.vue';

import type { KidProfile } from '@/entities/kid';
import { useKidLoginForm } from '@/features/auth-kid/model/useKidLoginForm';

const props = defineProps<{ selectedChild?: KidProfile | null }>();

defineEmits<{
  (e: 'change-child'): void;
}>();

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
.pin__panel {
  @apply rounded-[28px] border-4 border-white bg-white/70 p-6 shadow-[0_24px_60px_rgba(99,102,241,0.18)] transition;
}

.pin__error {
  @apply text-center text-sm font-semibold text-rose-500;
}
</style>
