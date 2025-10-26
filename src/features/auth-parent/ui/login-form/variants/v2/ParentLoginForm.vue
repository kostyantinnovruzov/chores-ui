<template>
  <section class="parent-login">
    <header class="parent-login__hero">
      <h1 class="parent-login__title">
        {{ t('features.authParent.title') }}
      </h1>
      <p class="parent-login__subtitle">
        {{ t('features.authParent.subtitle') }}
      </p>
    </header>

    <form class="parent-login__form" @submit.prevent="submit">
      <label class="parent-login__field">
        <span>{{ t('features.authParent.email') }}</span>
        <input
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="parent@demo.test"
          required
        />
        <small v-if="errors.email" class="parent-login__error">{{ errors.email }}</small>
      </label>

      <label class="parent-login__field">
        <span>{{ t('features.authParent.password') }}</span>
        <input
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
        />
        <small v-if="errors.password" class="parent-login__error">{{ errors.password }}</small>
      </label>

      <div class="parent-login__device">
        <div class="parent-login__device-label">
          <span>{{ t('features.authParent.deviceName') }}</span>
          <small>{{ t('features.authKid.deviceHint') }}</small>
        </div>
        <div class="parent-login__device-chip">
          <span>{{ deviceName }}</span>
        </div>
        <input v-model="deviceName" type="hidden" name="deviceName" />
        <small v-if="errors.deviceName" class="parent-login__error">{{ errors.deviceName }}</small>
      </div>

      <button class="parent-login__submit" :disabled="isSubmitting" type="submit">
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
.parent-login {
  position: relative;
  padding: clamp(2rem, 4vw, 2.75rem);
  border-radius: 40px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.18));
  backdrop-filter: blur(18px);
  box-shadow: 0 35px 80px rgba(79, 70, 229, 0.2);
  width: min(520px, 100%);
  display: grid;
  gap: clamp(1.75rem, 3vw, 2.25rem);
}

.parent-login__hero {
  text-align: center;
  display: grid;
  gap: 0.5rem;
  color: #1f1f3d;
}

.parent-login__title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.4rem);
  font-weight: 800;
  text-shadow: 0 14px 38px rgba(129, 140, 248, 0.35);
}

.parent-login__subtitle {
  margin: 0;
  font-size: clamp(1rem, 2.2vw, 1.1rem);
  color: rgba(31, 31, 61, 0.72);
}

.parent-login__form {
  display: grid;
  gap: clamp(1.25rem, 2.5vw, 1.75rem);
}

.parent-login__field {
  display: grid;
  gap: 0.6rem;
}

.parent-login__field span {
  font-weight: 600;
  color: #1f1f3d;
}

.parent-login__field input {
  border: none;
  border-radius: 18px;
  padding: 0.95rem 1.2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: inset 0 0 0 1px rgba(129, 140, 248, 0.25);
  font: inherit;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.parent-login__field input:focus {
  outline: none;
  transform: translateY(-1px);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.32);
}

.parent-login__device {
  display: grid;
  gap: 0.75rem;
}

.parent-login__device-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: rgba(31, 31, 61, 0.75);
  font-weight: 600;
}

.parent-login__device-label small {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(31, 31, 61, 0.6);
}

.parent-login__device-chip {
  padding: 0.85rem 1.2rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(129, 140, 248, 0.2);
  font-weight: 600;
  color: rgba(31, 31, 61, 0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.parent-login__error {
  color: #ef4444;
  font-size: 0.9rem;
}

.parent-login__submit {
  justify-self: center;
  width: min(240px, 100%);
  padding: 0.95rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.parent-login__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.parent-login__submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.35);
}
</style>
