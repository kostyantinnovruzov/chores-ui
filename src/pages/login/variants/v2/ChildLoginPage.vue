<template>
  <main class="page">
    <div class="page__halo page__halo--primary" aria-hidden="true"></div>
    <div class="page__halo page__halo--secondary" aria-hidden="true"></div>

    <section class="page__content">
      <header class="hero">
        <h1 class="hero__title">{{ t('features.authKid.heroTitle') }}</h1>
        <p class="hero__subtitle">{{ t('features.authKid.pickProfileSubtitle') }}</p>
      </header>

      <section class="stage">
        <KidProfilePicker
          :kids="kidProfiles"
          :is-loading="isKidsLoading"
          :is-error="isKidsError"
          :selected-kid-id="selectedKidId"
          @select="$emit('select-kid', $event)"
          @highlight="$emit('highlight-kid', $event)"
          @retry="$emit('retry-kids')"
        />

        <KidLoginForm
          class="stage__form"
          :selected-child="selectedKid"
          @change-child="$emit('change-kid')"
        />
      </section>

      <footer v-if="showParentControls" class="parent">
        <span>{{ t('features.authParent.loggedInAs', { email: parentEmail }) }}</span>
        <button type="button" class="parent__logout" @click="$emit('logout-parent')">
          {{ t('common.actions.logout') }}
        </button>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { KidProfile } from '@/entities/kid';
import { KidLoginForm, KidProfilePicker } from '@/features/auth-kid';

defineProps<{
  kidProfiles: KidProfile[];
  isKidsLoading: boolean;
  isKidsError: boolean;
  selectedKid: KidProfile | null;
  selectedKidId: KidProfile['id'] | null;
  parentEmail: string;
  showParentControls: boolean;
}>();

defineEmits<{
  (e: 'select-kid', kid: KidProfile): void;
  (e: 'highlight-kid', kid: KidProfile): void;
  (e: 'change-kid'): void;
  (e: 'retry-kids'): void;
  (e: 'logout-parent'): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.page {
  @apply relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-300 via-indigo-200 to-sky-200
    px-6 py-10 sm:px-10 lg:px-16;
}

.page__halo {
  @apply pointer-events-none absolute rounded-full blur-3xl;

  width: 28rem;
  height: 28rem;
}

.page__halo--primary {
  @apply -left-24 top-10 bg-gradient-to-br from-amber-200/80 via-rose-200/70 to-transparent;
}

.page__halo--secondary {
  @apply -right-32 -bottom-24 bg-gradient-to-br from-indigo-200/80 via-sky-200/70 to-transparent;
}

.page__content {
  @apply relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-12;
}

.hero {
  @apply text-center text-slate-900;
}

.hero__title {
  @apply text-4xl font-extrabold tracking-tight drop-shadow-[0_16px_45px_rgba(129,140,248,0.35)];
}

.hero__subtitle {
  @apply mt-3 text-lg text-slate-600;
}

.stage {
  @apply flex flex-col items-center gap-10;
}

.stage__form {
  @apply w-full;
}

.parent {
  @apply mx-auto flex items-center gap-3 rounded-full bg-white/70 px-6 py-3 text-sm font-medium
    text-slate-700 shadow-lg shadow-indigo-200/40 backdrop-blur;
}

.parent__logout {
  @apply rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 px-4 py-2 text-white shadow-md
    transition hover:-translate-y-0.5 hover:shadow-lg;
}
</style>
