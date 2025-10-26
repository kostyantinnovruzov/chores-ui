<template>
  <section class="chore-list">
    <header>
      <h3>{{ title }}</h3>
      <slot name="actions" />
    </header>
    <div v-if="chores.length === 0" class="chore-list__empty">
      {{ t('common.state.empty') }}
    </div>
    <div v-else class="chore-list__grid">
      <ChoreCard
        v-for="chore in chores"
        :key="chore.id"
        :chore="chore"
        :show-completion="showCompletion"
        :disabled="completionDisabled"
        @edit="$emit('edit', chore)"
        @delete="$emit('delete', chore)"
        @toggle-complete="$emit('toggle-complete', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { Chore } from '@/entities/chore';
import { ChoreCard } from '@/entities/chore';

defineEmits<{
  (e: 'edit', chore: Chore): void;
  (e: 'delete', chore: Chore): void;
  (e: 'toggle-complete', payload: { chore: Chore; completed: boolean }): void;
}>();

defineProps<{
  title: string;
  chores: Chore[];
  showCompletion?: boolean;
  completionDisabled?: boolean;
}>();

const { t } = useI18n();
</script>

<style scoped>
.chore-list {
  display: grid;
  gap: 1rem;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h3 {
  font-size: 1.125rem;
  color: var(--color-text-primary);
}

.chore-list__grid {
  display: grid;
  gap: 1rem;
}

.chore-list__empty {
  padding: 1.5rem;
  border-radius: var(--radius-base);
  border: 1px dashed var(--color-border);
  text-align: center;
  color: var(--color-text-secondary);
}
</style>
