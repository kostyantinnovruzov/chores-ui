<template>
  <section class="card">
    <header class="card__heading">
      <h1 class="card__title">{{ t('features.authParent.title') }}</h1>
      <p class="card__subtitle">{{ t('features.authParent.subtitle') }}</p>
    </header>

    <form class="card__form" @submit.prevent="submit">
      <label class="field">
        <span class="field__label">{{ t('features.authParent.email') }}</span>
        <input
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="parent@demo.test"
          required
          class="field__input"
        />
        <small v-if="errors.email" class="field__error">{{ errors.email }}</small>
      </label>

      <label class="field">
        <span class="field__label">{{ t('features.authParent.password') }}</span>
        <input
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
          class="field__input"
        />
        <small v-if="errors.password" class="field__error">{{ errors.password }}</small>
      </label>

      <div class="device">
        <div class="device__label">
          <span>{{ t('features.authParent.deviceName') }}</span>
          <small>{{ t('features.authKid.deviceHint') }}</small>
        </div>
        <div class="device__chip">
          <span>{{ deviceName }}</span>
        </div>
        <input v-model="deviceName" type="hidden" name="deviceName" />
        <small v-if="errors.deviceName" class="field__error">{{ errors.deviceName }}</small>
      </div>

      <button class="cta" :disabled="isSubmitting" type="submit">
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
.card {
  @apply grid gap-8 rounded-[40px] bg-gradient-to-br from-indigo-200/45 via-pink-200/40 to-white/70
    p-10 text-slate-900 shadow-[0_35px_80px_rgba(79,70,229,0.2)] backdrop-blur-xl;
}

.card__heading {
  @apply grid gap-2 text-center;
}

.card__title {
  @apply text-3xl font-extrabold tracking-tight drop-shadow-[0_14px_38px_rgba(129,140,248,0.35)];
}

.card__subtitle {
  @apply text-base text-slate-600;
}

.card__form {
  @apply grid gap-6;
}

.field {
  @apply grid gap-2 text-left;
}

.field__label {
  @apply text-sm font-semibold text-slate-700;
}

.field__input {
  @apply rounded-2xl border border-indigo-200/40 bg-white/95 px-4 py-3 text-base
    shadow-[inset_0_0_0_1px_rgba(129,140,248,0.25)] transition duration-150 ease-out
    focus:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-200/60;
}

.field__error {
  @apply text-sm font-semibold text-rose-500;
}

.device {
  @apply grid gap-3;
}

.device__label {
  @apply flex items-baseline justify-between text-sm font-semibold text-slate-600;
}

.device__label small {
  @apply text-xs font-medium text-slate-500;
}

.device__chip {
  @apply flex items-center justify-between rounded-2xl border border-indigo-200/40
    bg-white/90 px-4 py-3 font-semibold text-slate-700 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.2)];
}

.cta {
  @apply mx-auto flex w-48 items-center justify-center gap-2 rounded-full bg-gradient-to-r
    from-emerald-400 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg
    shadow-emerald-300/50 transition hover:-translate-y-0.5 hover:shadow-xl
    disabled:cursor-not-allowed disabled:opacity-60;
}
</style>
