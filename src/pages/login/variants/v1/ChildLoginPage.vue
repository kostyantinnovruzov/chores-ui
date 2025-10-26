<template>
  <main class="login-page app-shell">
    <KidProfilePicker
      v-if="!selectedKid"
      :kids="kidProfiles"
      :is-loading="isKidsLoading"
      :is-error="isKidsError"
      :selected-kid-id="selectedKidId"
      @select="$emit('select-kid', $event)"
      @highlight="$emit('highlight-kid', $event)"
      @retry="$emit('retry-kids')"
    />

    <KidLoginForm
      v-else
      :key="selectedKid?.id ?? 'manual-entry'"
      :selected-child="selectedKid"
      @change-child="$emit('change-kid')"
    />

    <section v-if="showParentControls" class="login-page__meta">
      <p>
        {{ t('features.authParent.loggedInAs', { email: parentEmail }) }}
      </p>
      <button type="button" @click="$emit('logout-parent')">
        {{ t('common.actions.logout') }}
      </button>
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
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  gap: 1.5rem;
}

.login-page__meta {
  display: grid;
  gap: 0.75rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.login-page__meta button {
  justify-self: center;
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.login-page__meta button:hover {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
}
</style>
