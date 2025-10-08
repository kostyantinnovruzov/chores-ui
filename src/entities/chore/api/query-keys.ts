export const choreQueryKeys = {
  all: ['chores'] as const,
  lists: () => [...choreQueryKeys.all, 'list'] as const,
  detail: (choreId: number | string) => [...choreQueryKeys.all, 'detail', choreId] as const
};
