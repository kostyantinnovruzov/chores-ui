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

      <fieldset>
        <legend>{{ t('features.choreCreate.categoriesLabel') }}</legend>
        <div v-if="categoryOptions.length" class="chore-create__options">
          <label
            v-for="categoryOption in categoryOptions"
            :key="categoryOption.id"
            class="chore-create__option"
          >
            <input
              v-model="categories"
              type="checkbox"
              name="categories"
              :value="categoryOption.id"
            />
            <span>{{ categoryOption.name }}</span>
          </label>
        </div>
        <small v-else class="chore-create__hint">{{
          t('features.choreCreate.categoriesEmpty')
        }}</small>
        <small v-if="errors.categories">{{ errors.categories }}</small>
      </fieldset>

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

import { choreCreateSchema } from '../../../lib/schema';
import { useChoreCreateForm } from '../../../model/useChoreCreateForm';

import type { ChoreCategory } from '@/entities/chore';
import { useChoreUpdateMutation } from '@/entities/chore';

const emit = defineEmits<{
  (e: 'submitted', payload?: { mode: 'create' | 'edit' }): void;
}>();

const props = withDefaults(
  defineProps<{
    showHeader?: boolean;
    mode?: 'create' | 'edit';
    choreId?: number | null;
    categoryOptions?: ChoreCategory[];
  }>(),
  {
    showHeader: true,
    mode: 'create',
    choreId: null,
    categoryOptions: () => []
  }
);

const { showHeader, mode, choreId, categoryOptions } = toRefs(props);

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
const { title, description, categories, dueAt, points, recurrence } = models;

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
    categories: values.categories,
    dueAt: values.dueAt || undefined,
    points: typeof values.points === 'number' ? values.points : Number(values.points),
    recurrence: values.recurrence || undefined
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    form.setErrors({
      title: fieldErrors.title?.[0],
      description: fieldErrors.description?.[0],
      categories: fieldErrors.categories?.[0],
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
      categories: parsed.data.categories?.length ? parsed.data.categories : undefined,
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
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font: inherit;
}

textarea {
  resize: vertical;
}

fieldset {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  display: grid;
  gap: 0.5rem;
}

legend {
  font-weight: 600;
  font-size: 0.9rem;
}

.chore-create__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chore-create__option {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

.chore-create__hint {
  color: var(--color-text-secondary, #64748b);
  font-size: 0.8rem;
}

button {
  justify-self: start;
  padding: 0.65rem 1.2rem;
  border-radius: var(--radius-sm);
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

button:not([disabled]):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgb(99 102 241 / 22%);
}

small {
  color: #ef4444;
}
</style>
