import { z } from 'zod';

export const kidLoginSchema = z.object({
  childId: z
    .number({
      required_error: 'Child ID is required'
    })
    .int()
    .positive(),
  passcode: z
    .array(z.string().min(1, 'Emoji cannot be empty').max(32))
    .min(1, 'Provide at least one emoji'),
  deviceName: z
    .string({
      required_error: 'Device name is required'
    })
    .min(2)
    .max(255)
});

export type KidLoginInput = z.infer<typeof kidLoginSchema>;
