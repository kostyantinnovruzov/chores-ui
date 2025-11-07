<template>
  <section class="create">
    <header v-if="showHeader" class="create__header">
      <div class="create__icon">🧹</div>
      <div>
        <p class="create__eyebrow">{{ t('features.choreCreate.title') }}</p>
        <h2 class="create__title">{{ headerTitle }}</h2>
      </div>
    </header>

    <form class="create__form" @submit.prevent="handleSubmit">
      <div class="create__field">
        <label class="create__label" for="chore-title">
          {{ t('features.choreCreate.titleLabel') }}
        </label>
        <input
          id="chore-title"
          v-model="title"
          class="create__input"
          type="text"
          name="title"
          required
        />
        <p v-if="errors.title" class="create__error">{{ errors.title }}</p>
      </div>

      <div class="create__field create__field--span">
        <label class="create__label" for="chore-description">
          {{ t('features.choreCreate.descriptionLabel') }}
        </label>
        <textarea
          id="chore-description"
          v-model="description"
          class="create__textarea"
          name="description"
          rows="3"
        />
        <p v-if="errors.description" class="create__error">{{ errors.description }}</p>
      </div>

      <div class="create__field">
        <span class="create__label">
          {{ t('features.choreCreate.categoriesLabel') }}
        </span>
        <div v-if="categoryOptions.length" class="create__chips">
          <label
            v-for="categoryOption in categoryOptions"
            :key="categoryOption.id"
            :class="[
              'create__chip',
              { 'create__chip--active': categories.includes(categoryOption.id) }
            ]"
          >
            <input
              v-model="categories"
              class="create__chip-input"
              type="checkbox"
              name="categories"
              :value="categoryOption.id"
            />
            <span>{{ categoryOption.name }}</span>
          </label>
        </div>
        <p v-else class="create__hint">{{ t('features.choreCreate.categoriesEmpty') }}</p>
        <p v-if="errors.categories" class="create__error">{{ errors.categories }}</p>
      </div>

      <div class="create__field">
        <label class="create__label" for="chore-due">
          {{ t('features.choreCreate.dueAtLabel') }}
        </label>
        <input
          id="chore-due"
          v-model="dueAt"
          class="create__input"
          type="datetime-local"
          name="dueAt"
        />
        <p v-if="errors.dueAt" class="create__error">{{ errors.dueAt }}</p>
      </div>

      <div class="create__field">
        <label class="create__label" for="chore-points">
          {{ t('features.choreCreate.pointsLabel') }}
        </label>
        <input
          id="chore-points"
          v-model.number="points"
          class="create__input"
          type="number"
          name="points"
          min="0"
          max="1000"
          required
        />
        <p v-if="errors.points" class="create__error">{{ errors.points }}</p>
      </div>

      <div class="create__field">
        <label class="create__label" for="chore-recurrence">
          {{ t('features.choreCreate.recurrenceLabel') }}
        </label>
        <select id="chore-recurrence" v-model="recurrence" class="create__select" name="recurrence">
          <option value="">{{ t('features.choreCreate.recurrenceNone') }}</option>
          <option value="daily">{{ t('features.choreCreate.recurrenceDaily') }}</option>
          <option value="weekly">{{ t('features.choreCreate.recurrenceWeekly') }}</option>
        </select>
        <p v-if="errors.recurrence" class="create__error">{{ errors.recurrence }}</p>
      </div>

      <footer class="create__actions">
        <button type="submit" class="create__submit" :disabled="isBusy">
          <span v-if="isBusy" class="create__spinner"></span>
          <span>{{ submitLabel }}</span>
        </button>
      </footer>
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
const headerTitle = computed(() =>
  mode.value === 'edit' ? t('features.choreCreate.update') : t('features.choreCreate.submit')
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
.create {
  @apply grid gap-6 rounded-[32px] border border-white/60 bg-white/80 px-8 py-10 shadow-[0_24px_70px_rgba(79,70,229,0.18)]
    backdrop-blur-lg text-slate-700;
}

.create__header {
  @apply flex items-center gap-4 rounded-[24px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-400/10
    px-5 py-4;
}

.create__icon {
  @apply grid h-12 w-12 place-items-center rounded-2xl bg-white/80 text-2xl shadow-inner shadow-indigo-200;
}

.create__eyebrow {
  @apply text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500;
}

.create__title {
  @apply text-2xl font-bold text-slate-900;
}

.create__form {
  @apply grid gap-5 md:grid-cols-2;
}

.create__field {
  @apply grid gap-2;
}

.create__chips {
  @apply flex flex-wrap gap-2;
}

.create__chip {
  @apply relative inline-flex cursor-pointer items-center rounded-full border border-indigo-100 bg-white/60 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-slate-800;
}

.create__chip--active {
  @apply border-indigo-400 bg-indigo-50/80 text-indigo-600 shadow-[0_10px_25px_rgba(99,102,241,0.25)];
}

.create__chip-input {
  @apply sr-only;
}

.create__hint {
  @apply text-sm text-slate-500;
}

.create__field--span {
  @apply md:col-span-2;
}

.create__label {
  @apply text-xs font-semibold uppercase tracking-[0.2em] text-slate-500;
}

.create__input,
.create__textarea,
.create__select {
  @apply w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-inner
    shadow-indigo-100 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200;
}

.create__textarea {
  @apply resize-y min-h-[7rem];
}

.create__select {
  @apply pr-10;
}

.create__error {
  @apply text-xs font-semibold text-rose-500;
}

.create__actions {
  @apply md:col-span-2 flex justify-end;
}

.create__submit {
  @apply inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm
    font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5
    hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60;
}

.create__spinner {
  @apply h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent;
}
</style>
