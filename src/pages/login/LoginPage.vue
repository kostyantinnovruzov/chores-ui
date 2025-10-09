<template>
  <main class="login-page app-shell">
    <KidProfilePicker
      v-if="!selectedKid"
      :kids="kidProfiles"
      :is-loading="isKidsLoading"
      :is-error="isKidsError"
      @select="handleSelect"
      @retry="retryKids"
    />

    <KidLoginForm
      v-else
      :key="selectedKid?.id ?? 'manual-entry'"
      :selected-child="selectedKid"
      @change-child="resetSelection"
    />

    <section v-if="showParentControls" class="login-page__meta">
      <p>
        {{ t('features.authParent.loggedInAs', { email: parentEmail }) }}
      </p>
      <button type="button" @click="logoutParent">
        {{ t('common.actions.logout') }}
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { type KidProfile, useParentKidsQuery } from '@/entities/kid';
import { KidLoginForm, KidProfilePicker } from '@/features/auth-kid';
import { useSessionStore } from '@/shared/session';

const router = useRouter();
const session = useSessionStore();
const { t } = useI18n();

const selectedKid = ref<KidProfile | null>(null);

const {
  data: kids,
  isLoading: isKidsLoading,
  isError: isKidsError,
  refetch: retryKids
} = useParentKidsQuery();

const kidProfiles = computed(() => kids.value ?? []);

const parentEmail = computed(() => session.parent.user?.email ?? 'parent');
const showParentControls = computed(
  () => session.isParentAuthenticated && !session.isChildAuthenticated
);

function logoutParent() {
  session.clearAll();
  void router.push({ name: 'parent-login' });
}

function handleSelect(kid: KidProfile) {
  selectedKid.value = kid;
}

function resetSelection() {
  selectedKid.value = null;
}
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
