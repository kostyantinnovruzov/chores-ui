import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';

import { choreApi } from './chore-api';
import { choreQueryKeys } from './query-keys';
import type { ChildChoreCreateRequest } from './types';

import { notifySuccess } from '@/shared/lib/notifications';

export function useChildChoresQuery() {
  const query = useQuery({
    queryKey: choreQueryKeys.lists(),
    queryFn: () => choreApi.fetchList()
  });

  return {
    ...query,
    chores: computed(() => query.data.value ?? [])
  };
}

export function useChoreCreateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChildChoreCreateRequest) => choreApi.create(payload),
    onSuccess: () => {
      notifySuccess('Chore created!');
      return queryClient.invalidateQueries({ queryKey: choreQueryKeys.lists() });
    }
  });
}
