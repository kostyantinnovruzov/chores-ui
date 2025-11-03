<template>
  <section class="login-card">
    <header class="login-card__header">
      <h1>{{ t('features.authParent.title') }}</h1>
    </header>

    <form class="login-card__form" @submit.prevent="submit">
      <label class="login-card__field">
        <span>{{ t('features.authParent.email') }}</span>
        <input
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="parent@demo.test"
          required
        />
        <small v-if="errors.email" class="login-card__error">{{ errors.email }}</small>
      </label>

      <label class="login-card__field">
        <span>{{ t('features.authParent.password') }}</span>
        <input
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
        />
        <small v-if="errors.password" class="login-card__error">{{ errors.password }}</small>
      </label>

      <label class="login-card__field">
        <span>{{ t('features.authParent.deviceName') }}</span>
        <input
          v-model="deviceName"
          type="text"
          name="deviceName"
          placeholder="parent-iphone"
          required
        />
        <small v-if="errors.deviceName" class="login-card__error">{{ errors.deviceName }}</small>
      </label>

      <button :disabled="isSubmitting" type="submit">
        <span v-if="isSubmitting">{{ t('common.state.loading') }}</span>
        <span v-else>{{ t('features.authParent.submit') }}</span>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useParentLoginForm } from '@/features/auth-parent/model/useParentLoginForm';

const { t } = useI18n();
const { submit, isSubmitting, errors, models } = useParentLoginForm();
const { email, password, deviceName } = models;
</script>

<style scoped>
.login-card {
  max-width: 420px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  border-radius: 24px;
  background: var(--color-surface-alt);
  box-shadow: 0 20px 45px rgb(79 70 229 / 15%);
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
  box-shadow: 0 10px 22px rgb(99 102 241 / 25%);
}

.login-card__error {
  color: #ef4444;
  font-size: 0.85rem;
}
</style>
