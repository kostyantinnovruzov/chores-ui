import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { parentKidsApi } from './parent-kids-api';

import { useSessionStore } from '@/shared/session';

export const parentKidsQueryKeys = {
  all: ['parent-kids'] as const
};

export function useParentKidsQuery() {
  const session = useSessionStore();

  return useQuery({
    queryKey: parentKidsQueryKeys.all,
    queryFn: () => parentKidsApi.list(),
    staleTime: 5 * 60_000,
    enabled: computed(() => session.isParentAuthenticated)
  });
}
