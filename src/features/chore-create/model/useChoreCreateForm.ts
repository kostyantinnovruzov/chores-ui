import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';

import { choreCreateSchema } from '../lib/schema';

import { useChoreCreateMutation } from '@/entities/chore';

interface ChoreCreateFormValues {
  title: string;
  description: string;
  categories: number[];
  dueAt: string;
  points: number | null;
  recurrence: '' | 'daily' | 'weekly';
}

const initialValues: ChoreCreateFormValues = {
  title: '',
  description: '',
  categories: [],
  dueAt: '',
  points: 10,
  recurrence: ''
};

export function useChoreCreateForm() {
  const mutation = useChoreCreateMutation();

  const form = useForm<ChoreCreateFormValues>({
    initialValues
  });

  const { value: titleModel } = useField<string>('title');
  const { value: descriptionModel } = useField<string>('description');
  const { value: categoriesModel } = useField<number[]>('categories', undefined, {
    initialValue: []
  });
  const { value: dueAtModel } = useField<string>('dueAt');
  const { value: pointsModel } = useField<number | null>('points');
  const { value: recurrenceModel } = useField<'' | 'daily' | 'weekly'>('recurrence');

  const submit = form.handleSubmit(async (values) => {
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

    await mutation.mutateAsync({
      title: parsed.data.title,
      description: parsed.data.description ?? undefined,
      categories: parsed.data.categories?.length ? parsed.data.categories : undefined,
      due_at: parsed.data.dueAt ?? undefined,
      points: parsed.data.points,
      recurrence: parsed.data.recurrence ?? undefined
    });

    form.resetForm({ values: { ...initialValues } });
  });

  return {
    form,
    submit,
    isSubmitting: computed(() => mutation.isPending.value),
    wasSuccessful: computed(() => mutation.isSuccess.value),
    resetMutation: () => mutation.reset(),
    resetForm: () => form.resetForm({ values: { ...initialValues } }),
    setInitialValues: (values: Partial<ChoreCreateFormValues>) => {
      form.setValues({
        ...form.values,
        ...values
      });
    },
    errors: form.errors,
    models: {
      title: titleModel,
      description: descriptionModel,
      categories: categoriesModel,
      dueAt: dueAtModel,
      points: pointsModel,
      recurrence: recurrenceModel
    }
  };
}
