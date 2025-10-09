import { z } from 'zod';

export const kidLoginSchema = z.object({
  childId: z
    .number({
      required_error: 'Child ID is required'
    })
    .int()
    .positive(),
  passcode: z
    .array(z.string().regex(/^\d$/, 'Each emoji must map to a digit'))
    .min(4, 'Provide at least four emojis')
    .max(6, 'Use no more than six emojis'),
  deviceName: z
    .string({
      required_error: 'Device name is required'
    })
    .min(2)
    .max(255)
});

export type KidLoginInput = z.infer<typeof kidLoginSchema>;
