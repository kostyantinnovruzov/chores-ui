<template>
  <section class="login-card">
    <header class="login-card__header">
      <h1>
        {{
          selectedChild
            ? t('features.authKid.enterPasscodeTitle', { name: selectedChild.nickname })
            : t('features.authKid.title')
        }}
      </h1>
      <p>
        {{
          selectedChild
            ? t('features.authKid.enterPasscodeSubtitle')
            : t('features.authKid.subtitle')
        }}
      </p>
    </header>

    <form class="login-card__form" @submit.prevent="submit">
      <div v-if="selectedChild" class="login-card__selected">
        <div class="login-card__avatar">
          <img
            v-if="selectedChild.avatarPath"
            :alt="selectedChild.nickname"
            :src="selectedChild.avatarPath"
          />
          <span v-else>{{ initials(selectedChild.nickname) }}</span>
        </div>
        <div>
          <strong>{{ selectedChild.nickname }}</strong>
          <p v-if="selectedChild.passcodeHint" class="login-card__hint">
            {{ selectedChild.passcodeHint }}
          </p>
          <p v-else>{{ t('features.authKid.enterPasscodeSubtitle') }}</p>
        </div>
        <button type="button" class="login-card__change" @click="$emit('change-child')">
          {{ t('features.authKid.changeProfile') }}
        </button>
        <input v-model="childId" type="hidden" name="childId" />
      </div>
      <label v-else class="login-card__field">
        <span>{{ t('features.authKid.childId') }}</span>
        <input
          v-model="childId"
          inputmode="numeric"
          type="number"
          name="childId"
          placeholder="4"
          required
        />
        <small v-if="errors.childId" class="login-card__error">{{ errors.childId }}</small>
      </label>

      <label class="login-card__field">
        <span>{{ t('features.authKid.passcode') }}</span>
        <input
          v-model="passcode"
          type="text"
          name="passcode"
          placeholder="star, heart, smile"
          required
        />
        <small v-if="errors.passcode" class="login-card__error">{{ errors.passcode }}</small>
      </label>

      <input v-model="deviceName" type="hidden" name="deviceName" />

      <button :disabled="isSubmitting" type="submit">
        <span v-if="isSubmitting">{{ t('common.state.loading') }}</span>
        <span v-else>{{ t('features.authKid.submit') }}</span>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useKidLoginForm } from '../model/useKidLoginForm';

import type { KidProfile } from '@/entities/kid';

const props = defineProps<{ selectedChild?: KidProfile | null }>();

defineEmits<{
  (e: 'change-child'): void;
}>();

const { selectedChild } = toRefs(props);
const { t } = useI18n();
const { submit, isSubmitting, errors, models, resetErrors } = useKidLoginForm();
const { childId, passcode, deviceName } = models;

watch(
  selectedChild,
  (child, previous) => {
    childId.value = child ? String(child.id) : '';
    if (child || previous) {
      passcode.value = '';
      resetErrors();
    }
  },
  { immediate: true }
);

function initials(name: string) {
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
.login-card {
  max-width: 420px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  border-radius: 24px;
  background: var(--color-surface-alt);
  box-shadow: 0 20px 45px rgba(79, 70, 229, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.login-card__header h1 {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.login-card__header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.login-card__form {
  display: grid;
  gap: 1.25rem;
}

.login-card__selected {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.login-card__selected > div:last-of-type {
  display: grid;
  gap: 0.25rem;
}

.login-card__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  display: grid;
  place-items: center;
  overflow: hidden;
  font-size: 1.5rem;
  font-weight: 700;
}

.login-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-card__change {
  grid-column: 1 / -1;
  justify-self: start;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-primary);
  font-weight: 700;
  cursor: pointer;
}

.login-card__field {
  display: grid;
  gap: 0.5rem;
}

.login-card__field span {
  font-weight: 600;
  color: var(--color-text-primary);
}

input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  padding: 0.75rem 1rem;
  font: inherit;
  background: var(--color-surface);
}

input:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

button {
  padding: 0.875rem;
  border-radius: var(--radius-base);
  border: none;
  background: linear-gradient(135deg, #818cf8, #6366f1);
  color: var(--color-accent-contrast);
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(99, 102, 241, 0.25);
}

.login-card__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.login-card__error {
  color: #ef4444;
  font-size: 0.85rem;
}
</style>
