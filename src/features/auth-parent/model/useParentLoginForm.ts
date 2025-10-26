import { useMutation } from '@tanstack/vue-query';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { parentAuthApi, type ParentLoginRequest } from '../api/parent-auth-api';
import { parentLoginSchema } from '../lib/schema';

import { getBrowserDeviceName } from '@/shared/lib/device';
import { notifyError, notifySuccess } from '@/shared/lib/notifications';
import { useSessionStore } from '@/shared/session';

interface ParentLoginFormValues {
  email: string;
  password: string;
  deviceName: string;
}

export function useParentLoginForm() {
  const router = useRouter();
  const route = useRoute();
  const session = useSessionStore();

  const form = useForm<ParentLoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      deviceName: getBrowserDeviceName()
    }
  });

  const { value: emailModel } = useField<string>('email');
  const { value: passwordModel } = useField<string>('password');
  const { value: deviceNameModel } = useField<string>('deviceName');

  const mutation = useMutation({
    mutationFn: (payload: ParentLoginRequest) => parentAuthApi.login(payload),
    onSuccess: (response) => {
      session.clearChildSession();
      session.setParentSession({
        token: response.token,
        user: {
          id: response.user.id,
          type: response.user.type,
          email: response.user.email,
          name: response.user.name,
          firstName: response.user.first_name,
          lastName: response.user.last_name,
          timezone: response.user.timezone,
          status: response.user.status as 'active' | 'inactive' | (string & {})
        }
      });

      notifySuccess('Logged in successfully!');

      const redirect = route.query.redirect as string | undefined;
      void router.push({
        name: 'child-login',
        query: redirect ? { redirect } : undefined
      });
    },
    onError: () => {
      notifyError('Unable to log in. Check your credentials and try again.');
    }
  });

  const submit = form.handleSubmit(async (values) => {
    const parsed = parentLoginSchema.safeParse({
      email: values.email,
      password: values.password,
      deviceName: values.deviceName.trim()
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      form.setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        deviceName: fieldErrors.deviceName?.[0]
      });
      return;
    }

    await mutation.mutateAsync({
      email: parsed.data.email,
      password: parsed.data.password,
      device_name: parsed.data.deviceName,
      guard: 'parent'
    });
  });

  return {
    submit,
    isSubmitting: computed(() => mutation.isPending.value),
    errors: form.errors,
    models: {
      email: emailModel,
      password: passwordModel,
      deviceName: deviceNameModel
    }
  };
}
