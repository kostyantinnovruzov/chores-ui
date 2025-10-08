<template>
  <section class="chore-create">
    <header>
      <h2>{{ t('features.choreCreate.title') }}</h2>
    </header>
    <form @submit.prevent="submit">
      <label>
        <span>{{ t('features.choreCreate.titleLabel') }}</span>
        <input v-model="title" type="text" name="title" required />
        <small v-if="errors.title">{{ errors.title }}</small>
      </label>

      <label>
        <span>{{ t('features.choreCreate.descriptionLabel') }}</span>
        <textarea v-model="description" name="description" rows="3" />
        <small v-if="errors.description">{{ errors.description }}</small>
      </label>

      <label>
        <span>{{ t('features.choreCreate.categoryLabel') }}</span>
        <input v-model="category" type="text" name="category" />
        <small v-if="errors.category">{{ errors.category }}</small>
      </label>

      <label>
        <span>{{ t('features.choreCreate.dueAtLabel') }}</span>
        <input v-model="dueAt" type="datetime-local" name="dueAt" />
        <small v-if="errors.dueAt">{{ errors.dueAt }}</small>
      </label>

      <label>
        <span>{{ t('features.choreCreate.pointsLabel') }}</span>
        <input v-model.number="points" type="number" name="points" min="0" max="1000" required />
        <small v-if="errors.points">{{ errors.points }}</small>
      </label>

      <label>
        <span>{{ t('features.choreCreate.recurrenceLabel') }}</span>
        <select v-model="recurrence" name="recurrence">
          <option value="">{{ t('features.choreCreate.recurrenceNone') }}</option>
          <option value="daily">{{ t('features.choreCreate.recurrenceDaily') }}</option>
          <option value="weekly">{{ t('features.choreCreate.recurrenceWeekly') }}</option>
        </select>
        <small v-if="errors.recurrence">{{ errors.recurrence }}</small>
      </label>

      <button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">{{ t('common.state.loading') }}</span>
        <span v-else>{{ t('features.choreCreate.submit') }}</span>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useChoreCreateForm } from '../model/useChoreCreateForm';

const { t } = useI18n();
const { submit, isSubmitting, errors, models } = useChoreCreateForm();
const { title, description, category, dueAt, points, recurrence } = models;
</script>

<style scoped>
.chore-create {
  padding: 1.5rem;
  border-radius: var(--radius-base);
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 1.5rem;
}

form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.9rem;
}

input,
textarea,
select {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  padding: 0.75rem 1rem;
  font: inherit;
  background: var(--color-surface);
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

button {
  align-self: flex-end;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-base);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

small {
  color: #ef4444;
}
</style>
