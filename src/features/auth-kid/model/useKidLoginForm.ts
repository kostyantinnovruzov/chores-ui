import { useMutation } from '@tanstack/vue-query';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { kidAuthApi, type KidLoginRequest } from '../api/kid-auth-api';
import { kidLoginSchema } from '../lib/schema';

import { getBrowserDeviceName } from '@/shared/lib/device';
import { notifyError, notifySuccess } from '@/shared/lib/notifications';
import { useSessionStore } from '@/shared/session';

interface KidLoginFormValues {
  childId: string;
  passcode: string[];
  deviceName: string;
}

export function useKidLoginForm() {
  const router = useRouter();
  const route = useRoute();
  const session = useSessionStore();

  const form = useForm<KidLoginFormValues>({
    initialValues: {
      childId: '',
      passcode: [],
      deviceName: getBrowserDeviceName()
    }
  });

  const { value: childIdModel } = useField<string>('childId');
  const { value: passcodeModel } = useField<string[]>('passcode');
  const { value: deviceNameModel } = useField<string>('deviceName');

  const mutation = useMutation({
    mutationFn: (payload: KidLoginRequest) => kidAuthApi.login(payload),
    onSuccess: (response) => {
      session.setChildSession({
        token: response.token,
        user: {
          id: response.user.id,
          type: 'child',
          nickname: response.user.nickname,
          parentId: response.user.parent_id,
          avatarPath: response.user.avatar_path,
          timezone: response.user.timezone,
          status: response.user.status
        }
      });

      notifySuccess('Logged in successfully!');

      const redirect = (route.query.redirect as string | undefined) ?? { name: 'child-dashboard' };
      void router.push(redirect);
    },
    onError: () => {
      notifyError('Unable to log in. Check your passcode and try again.');
    }
  });

  const submit = form.handleSubmit(async (values) => {
    const parsed = kidLoginSchema.safeParse({
      childId: Number(values.childId),
      deviceName: values.deviceName.trim(),
      passcode: values.passcode ?? []
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      form.setErrors({
        childId: fieldErrors.childId?.[0],
        deviceName: fieldErrors.deviceName?.[0],
        passcode: fieldErrors.passcode?.[0]
      });
      return;
    }

    await mutation.mutateAsync({
      child_id: parsed.data.childId,
      device_name: parsed.data.deviceName,
      password: parsed.data.passcode.join('')
    });
  });

  return {
    submit,
    isSubmitting: computed(() => mutation.isPending.value),
    errors: form.errors,
    models: {
      childId: childIdModel,
      passcode: passcodeModel,
      deviceName: deviceNameModel
    },
    resetErrors: () => form.setErrors({})
  };
}
