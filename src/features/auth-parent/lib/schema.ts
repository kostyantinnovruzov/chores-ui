import { z } from 'zod';

export const parentLoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required'
    })
    .trim()
    .min(1)
    .email(),
  password: z
    .string({
      required_error: 'Password is required'
    })
    .min(6),
  deviceName: z
    .string({
      required_error: 'Device name is required'
    })
    .min(2)
    .max(255)
});

export type ParentLoginInput = z.infer<typeof parentLoginSchema>;
