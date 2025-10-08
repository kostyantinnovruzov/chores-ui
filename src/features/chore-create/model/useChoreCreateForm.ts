import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';

import { choreCreateSchema } from '../lib/schema';

import { useChoreCreateMutation } from '@/entities/chore';

interface ChoreCreateFormValues {
  title: string;
  description: string;
  category: string;
  dueAt: string;
  points: number | null;
  recurrence: '' | 'daily' | 'weekly';
}

const initialValues: ChoreCreateFormValues = {
  title: '',
  description: '',
  category: '',
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
  const { value: categoryModel } = useField<string>('category');
  const { value: dueAtModel } = useField<string>('dueAt');
  const { value: pointsModel } = useField<number | null>('points');
  const { value: recurrenceModel } = useField<'' | 'daily' | 'weekly'>('recurrence');

  const submit = form.handleSubmit(async (values) => {
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

    await mutation.mutateAsync({
      title: parsed.data.title,
      description: parsed.data.description ?? undefined,
      category: parsed.data.category ?? undefined,
      due_at: parsed.data.dueAt ?? undefined,
      points: parsed.data.points,
      recurrence: parsed.data.recurrence ?? undefined
    });

    form.resetForm({ values: { ...initialValues } });
  });

  return {
    submit,
    isSubmitting: computed(() => mutation.isPending.value),
    errors: form.errors,
    models: {
      title: titleModel,
      description: descriptionModel,
      category: categoryModel,
      dueAt: dueAtModel,
      points: pointsModel,
      recurrence: recurrenceModel
    }
  };
}
