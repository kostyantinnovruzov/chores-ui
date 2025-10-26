<template>
  <section class="kid-login-v2">
    <div class="kid-login-v2__profile" :class="{ 'kid-login-v2__profile--empty': !selectedChild }">
      <button
        v-if="selectedChild"
        type="button"
        class="kid-login-v2__change"
        @click="$emit('change-child')"
      >
        {{ t('features.authKid.changeProfile') }}
      </button>
      <div class="kid-login-v2__avatar">
        <template v-if="selectedChild?.avatarPath">
          <img :alt="selectedChild.nickname" :src="selectedChild.avatarPath" />
        </template>
        <template v-else>
          <span>{{ initials(selectedChild?.nickname ?? '') }}</span>
        </template>
      </div>

      <h2 class="kid-login-v2__headline">
        {{
          selectedChild
            ? t('features.authKid.enterPasscodeTitle', { name: selectedChild.nickname })
            : t('features.authKid.title')
        }}
      </h2>
      <p class="kid-login-v2__subtitle">
        {{
          selectedChild
            ? selectedChild.passcodeHint || t('features.authKid.enterPasscodeSubtitle')
            : t('features.authKid.subtitle')
        }}
      </p>
    </div>

    <form class="kid-login-v2__form" @submit.prevent="submit">
      <div class="kid-login-v2__pinpad" :class="{ 'kid-login-v2__pinpad--shake': isShaking }">
        <EmojiPinKeyboard
          v-model="passcodeValue"
          :disabled="isSubmitting || !selectedChild"
          :min-length="4"
          :max-length="6"
          @complete="submit()"
        />
      </div>
      <p v-if="errors.passcode" class="kid-login-v2__error">
        {{ errors.passcode }}
      </p>

      <button
        class="kid-login-v2__submit"
        :disabled="isSubmitDisabled || !selectedChild"
        type="submit"
      >
        <span v-if="isSubmitting">{{ t('common.state.loading') }}</span>
        <span v-else>{{ t('features.authKid.submit') }}</span>
      </button>
    </form>
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

watch(
  () => errors.passcode,
  (message) => {
    if (!message) return;
    window.clearTimeout(shakeTimer);
    isShaking.value = true;
    shakeTimer = window.setTimeout(() => {
      isShaking.value = false;
    }, 650);
  }
);

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
.kid-login-v2 {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  width: min(960px, 100%);
}

.kid-login-v2__profile {
  position: relative;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: 36px;
  background: linear-gradient(135deg, rgba(253, 186, 116, 0.85), rgba(244, 114, 182, 0.85));
  color: #fff;
  display: grid;
  justify-items: center;
  gap: clamp(1rem, 3vw, 1.5rem);
  box-shadow: 0 30px 70px rgba(244, 114, 182, 0.25);
}

.kid-login-v2__profile--empty {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.75), rgba(129, 140, 248, 0.85));
}

.kid-login-v2__change {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  border: none;
  padding: 0.55rem 1.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #4338ca;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.kid-login-v2__change:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(255, 255, 255, 0.35);
}

.kid-login-v2__avatar {
  width: clamp(110px, 14vw, 140px);
  height: clamp(110px, 14vw, 140px);
  border-radius: 32px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 0 0 6px rgba(255, 255, 255, 0.35);
  overflow: hidden;
}

.kid-login-v2__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kid-login-v2__avatar span {
  font-size: clamp(3rem, 5vw, 3.6rem);
  font-weight: 800;
}

.kid-login-v2__headline {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  text-align: center;
  text-shadow: 0 18px 40px rgba(120, 53, 15, 0.35);
}

.kid-login-v2__subtitle {
  margin: 0;
  font-size: clamp(1rem, 2.2vw, 1.1rem);
  text-align: center;
  opacity: 0.9;
}

.kid-login-v2__form {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2rem);
  align-items: start;
}

.kid-login-v2__pinpad {
  padding: clamp(1.5rem, 4vw, 2rem);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 28px 60px rgba(79, 70, 229, 0.22);
  transition: transform 0.25s ease;
}

.kid-login-v2__pinpad--shake {
  animation: kid-login-shake 0.6s ease;
}

@keyframes kid-login-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-12px);
  }
  40%,
  80% {
    transform: translateX(12px);
  }
}

.kid-login-v2__error {
  margin: 0;
  color: #ef4444;
  font-size: 0.95rem;
  text-align: center;
}

.kid-login-v2__submit {
  justify-self: center;
  width: min(320px, 100%);
  padding: 1rem;
  border-radius: 999px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.kid-login-v2__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.kid-login-v2__submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(34, 197, 94, 0.35);
}
</style>
