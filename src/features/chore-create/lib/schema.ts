import { z } from 'zod';

export const choreCreateSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required'
    })
    .min(2)
    .max(255),
  description: z
    .string()
    .max(500)
    .optional()
    .transform((value) => value || null),
  categories: z
    .array(z.number().int().positive())
    .optional()
    .transform((value) => value ?? []),
  dueAt: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value).toISOString() : null)),
  points: z
    .number({
      required_error: 'Points required'
    })
    .int()
    .min(0)
    .max(1000),
  recurrence: z
    .enum(['daily', 'weekly'])
    .optional()
    .transform((value) => value ?? null)
});

export type ChoreCreateInput = z.infer<typeof choreCreateSchema>;
