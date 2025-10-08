<template>
  <article class="chore-card" :data-test-id="`chore-card-${chore.id}`">
    <header class="chore-card__header">
      <h3 class="chore-card__title">{{ chore.title }}</h3>
      <span class="chore-card__points">{{ chore.points }} pts</span>
    </header>

    <p v-if="chore.description" class="chore-card__description">
      {{ chore.description }}
    </p>

    <dl class="chore-card__meta">
      <div v-if="dueLabel">
        <dt>{{ t('entities.chore.due') }}</dt>
        <dd>{{ dueLabel }}</dd>
      </div>
      <div v-if="chore.category">
        <dt>{{ t('entities.chore.category') }}</dt>
        <dd>{{ chore.category }}</dd>
      </div>
      <div>
        <dt>{{ t('entities.chore.status') }}</dt>
        <dd>{{ chore.status }}</dd>
      </div>
    </dl>

    <footer class="chore-card__footer">
      <slot name="actions" />
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Chore } from '../model/chore';

const props = defineProps<{
  chore: Chore;
}>();

const { t, d } = useI18n();

const dueLabel = computed(() => {
  if (!props.chore.dueAt) return null;
  return d(new Date(props.chore.dueAt), { timeStyle: 'short', dateStyle: 'medium' });
});
</script>

<style scoped>
.chore-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: var(--radius-base);
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-sm);
}

.chore-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.chore-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.chore-card__points {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.1);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
}

.chore-card__description {
  color: var(--color-text-secondary);
}

.chore-card__meta {
  display: grid;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.chore-card__meta dt {
  font-weight: 600;
}

.chore-card__meta dd {
  margin: 0;
}

.chore-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
