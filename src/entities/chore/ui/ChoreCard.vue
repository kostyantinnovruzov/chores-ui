<template>
  <article class="chore-card" :data-test-id="`chore-card-${chore.id}`">
    <header class="chore-card__header">
      <label v-if="showCompletion" class="chore-card__checkbox">
        <input
          type="checkbox"
          :checked="isCompleted"
          :disabled="isCompleted || disabled"
          @change="handleToggle($event)"
        />
        <span class="sr-only">{{ t('entities.chore.markDone') }}</span>
      </label>
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
      <slot name="actions">
        <button
          class="chore-card__icon-button"
          type="button"
          aria-label="Edit chore"
          @click="emit('edit', chore)"
        >
          ✏️
        </button>
        <button
          class="chore-card__icon-button chore-card__icon-button--danger"
          type="button"
          aria-label="Delete chore"
          @click="emit('delete', chore)"
        >
          🗑️
        </button>
      </slot>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Chore } from '../model/chore';

const emit = defineEmits<{
  (e: 'edit', chore: Chore): void;
  (e: 'delete', chore: Chore): void;
  (e: 'toggle-complete', payload: { chore: Chore; completed: boolean }): void;
}>();

const props = defineProps<{
  chore: Chore;
  showCompletion?: boolean;
  disabled?: boolean;
}>();

const { t, d } = useI18n();

const dueLabel = computed(() => {
  if (!props.chore.dueAt) return null;
  return d(new Date(props.chore.dueAt), { timeStyle: 'short', dateStyle: 'medium' });
});

const showCompletion = computed(() => props.showCompletion ?? false);
const disabled = computed(() => props.disabled ?? false);
const isCompleted = computed(() => props.chore.status === 'completed');

function handleToggle(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('toggle-complete', { chore: props.chore, completed: target.checked });
}
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

.chore-card__checkbox {
  display: flex;
  align-items: center;
}

.chore-card__checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
  cursor: pointer;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.chore-card__icon-button {
  border: none;
  background: var(--color-surface);
  border-radius: var(--radius-base);
  padding: 0.4rem 0.6rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.chore-card__icon-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface-alt);
}

.chore-card__icon-button--danger {
  color: #dc2626;
}
</style>
