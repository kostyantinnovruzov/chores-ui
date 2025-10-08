<template>
  <section class="login-card">
    <header class="login-card__header">
      <h1>{{ t('features.authKid.title') }}</h1>
      <p>{{ t('features.authKid.subtitle') }}</p>
    </header>

    <form class="login-card__form" @submit.prevent="submit">
      <label class="login-card__field">
        <span>{{ t('features.authKid.childId') }}</span>
        <input
          v-model="values.childId"
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
          v-model="values.passcode"
          type="text"
          name="passcode"
          placeholder="star, heart, smile"
          required
        />
        <small v-if="errors.passcode" class="login-card__error">{{ errors.passcode }}</small>
      </label>

      <label class="login-card__field">
        <span>{{ t('features.authKid.deviceName') }}</span>
        <input
          v-model="values.deviceName"
          type="text"
          name="deviceName"
          placeholder="ipad-mini"
          required
        />
        <small v-if="errors.deviceName" class="login-card__error">{{ errors.deviceName }}</small>
      </label>

      <button :disabled="isSubmitting" type="submit">
        <span v-if="isSubmitting">{{ t('common.state.loading') }}</span>
        <span v-else>{{ t('features.authKid.submit') }}</span>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useKidLoginForm } from '../model/useKidLoginForm';

const { t } = useI18n();
const { form, submit, isSubmitting } = useKidLoginForm();
const { errors, values } = form;
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

.login-card__error {
  color: #ef4444;
  font-size: 0.85rem;
}
</style>
