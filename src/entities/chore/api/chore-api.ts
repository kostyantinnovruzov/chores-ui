import type {
  ChildChoreCollectionResponse,
  ChildChoreCreateRequest,
  ChildChoreResponse,
  ChildChoreUpdateRequest
} from './types';
import type { Chore } from '../model/chore';

import { http } from '@/shared/api';

function mapChore(response: ChildChoreResponse): Chore {
  return {
    id: response.id,
    childId: response.child_id,
    title: response.title,
    description: response.description ?? null,
    categories: response.categories ?? [],
    dueAt: response.due_at ?? null,
    points: response.points,
    recurrence: response.recurrence ?? null,
    status: response.status,
    completedAt: response.completed_at ?? null,
    createdAt: response.created_at ?? null,
    updatedAt: response.updated_at ?? null
  };
}

export const choreApi = {
  async fetchList(): Promise<Chore[]> {
    const { data } = await http.get<ChildChoreCollectionResponse>('chores');
    return data.data.map(mapChore);
  },
  async create(payload: ChildChoreCreateRequest): Promise<Chore> {
    const { data } = await http.post<ChildChoreResponse>('chores', payload);
    return mapChore(data);
  },
  async update(id: number, payload: ChildChoreUpdateRequest): Promise<Chore> {
    const { data } = await http.put<ChildChoreResponse>(`chores/${id}`, payload);
    return mapChore(data);
  },
  async delete(id: number): Promise<void> {
    await http.delete(`chores/${id}`);
  },
  async markDone(id: number): Promise<Chore> {
    const { data } = await http.post<ChildChoreResponse>(`chores/${id}/mark-done`);
    return mapChore(data);
  }
};
