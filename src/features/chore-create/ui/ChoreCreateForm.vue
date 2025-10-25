<template>
  <section class="chore-create">
    <header v-if="showHeader">
      <h2>{{ t('features.choreCreate.title') }}</h2>
    </header>
    <form @submit.prevent="handleSubmit">
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

      <button type="submit" :disabled="isBusy">
        <span v-if="isBusy">{{ t('common.state.loading') }}</span>
        <span v-else>{{ submitLabel }}</span>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { choreCreateSchema } from '../lib/schema';
import { useChoreCreateForm } from '../model/useChoreCreateForm';

import { useChoreUpdateMutation } from '@/entities/chore';

const emit = defineEmits<{
  (e: 'submitted', payload?: { mode: 'create' | 'edit' }): void;
}>();

const props = withDefaults(
  defineProps<{
    showHeader?: boolean;
    mode?: 'create' | 'edit';
    choreId?: number | null;
  }>(),
  {
    showHeader: true,
    mode: 'create',
    choreId: null
  }
);

const { showHeader, mode, choreId } = toRefs(props);

const { t } = useI18n();
const {
  form,
  submit,
  isSubmitting,
  wasSuccessful,
  resetMutation,
  resetForm,
  setInitialValues,
  errors,
  models
} = useChoreCreateForm();
const { title, description, category, dueAt, points, recurrence } = models;

const updateMutation = useChoreUpdateMutation();
const isEditMode = computed(() => mode.value === 'edit' && choreId.value !== null);
const isBusy = computed(() =>
  isEditMode.value ? updateMutation.isPending.value : isSubmitting.value
);
const submitLabel = computed(() =>
  isEditMode.value ? t('features.choreCreate.update') : t('features.choreCreate.submit')
);

const submitUpdate = form.handleSubmit(async (values) => {
  const parsed = choreCreateSchema.safeParse({
    title: values.title,
    description: values.description,
    category: values.category,
    dueAt: values.dueAt || undefined,
    points: typeof values.points === 'number' ? values.points : Number(values.points),
    recurrence: values.recurrence || undefined
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    form.setErrors({
      title: fieldErrors.title?.[0],
      description: fieldErrors.description?.[0],
      category: fieldErrors.category?.[0],
      dueAt: fieldErrors.dueAt?.[0],
      points: fieldErrors.points?.[0],
      recurrence: fieldErrors.recurrence?.[0]
    });
    return;
  }

  if (!choreId.value) return;

  await updateMutation.mutateAsync({
    id: choreId.value,
    payload: {
      title: parsed.data.title,
      description: parsed.data.description ?? undefined,
      category: parsed.data.category ?? undefined,
      due_at: parsed.data.dueAt ?? undefined,
      points: parsed.data.points,
      recurrence: parsed.data.recurrence ?? undefined
    }
  });
});

watch(wasSuccessful, (value) => {
  if (value) {
    emit('submitted', { mode: 'create' });
    resetMutation();
    resetForm();
  }
});

watch(
  () => updateMutation.isSuccess.value,
  (value) => {
    if (value) {
      emit('submitted', { mode: 'edit' });
      updateMutation.reset();
      resetForm();
    }
  }
);

defineExpose({
  setInitialValues,
  resetForm
});

function handleSubmit() {
  if (isEditMode.value) {
    void submitUpdate();
  } else {
    void submit();
  }
}
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
