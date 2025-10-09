<template>
  <section class="profile-picker">
    <header class="profile-picker__header">
      <h1>{{ t('features.authKid.pickProfileTitle') }}</h1>
      <p>{{ t('features.authKid.pickProfileSubtitle') }}</p>
    </header>

    <div v-if="isLoading" class="profile-picker__state">
      {{ t('common.state.loading') }}
    </div>
    <div v-else-if="isError" class="profile-picker__state profile-picker__state--error">
      <span>{{ t('common.feedback.error') }}</span>
      <button type="button" @click="$emit('retry')">
        {{ t('common.actions.retry') }}
      </button>
    </div>
    <div v-else-if="!kids.length" class="profile-picker__state">
      {{ t('features.authKid.noProfiles') }}
    </div>
    <div v-else class="profile-picker__grid">
      <button
        v-for="kid in kids"
        :key="kid.id"
        type="button"
        class="profile-picker__card"
        @click="$emit('select', kid)"
      >
        <div class="profile-picker__avatar">
          <img v-if="kid.avatarPath" :alt="kid.nickname" :src="kid.avatarPath" />
          <span v-else>{{ initials(kid.nickname) }}</span>
        </div>
        <strong>{{ kid.nickname }}</strong>
        <small v-if="kid.passcodeHint" class="profile-picker__hint">{{ kid.passcodeHint }}</small>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import type { KidProfile } from '@/entities/kid';

const props = defineProps<{ kids: KidProfile[]; isLoading?: boolean; isError?: boolean }>();

defineEmits<{
  (e: 'select', kid: KidProfile): void;
  (e: 'retry'): void;
}>();

const { t } = useI18n();
const { kids, isLoading, isError } = toRefs(props);

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
.profile-picker {
  max-width: 520px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  border-radius: 24px;
  background: var(--color-surface-alt);
  box-shadow: 0 20px 45px rgba(79, 70, 229, 0.15);
  display: grid;
  gap: 1.75rem;
}

.profile-picker__header h1 {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.profile-picker__header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.profile-picker__state {
  display: grid;
  gap: 1rem;
  justify-items: center;
  color: var(--color-text-secondary);
}

.profile-picker__state--error button {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
}

.profile-picker__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.profile-picker__card {
  border: none;
  border-radius: var(--radius-lg, var(--radius-base));
  padding: 1.25rem 1rem;
  background: var(--color-surface);
  display: grid;
  gap: 0.5rem;
  place-items: center;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.profile-picker__card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.15);
}

.profile-picker__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  display: grid;
  place-items: center;
  overflow: hidden;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.profile-picker__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

strong {
  color: var(--color-text-primary);
}

.profile-picker__hint {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}
</style>
