export interface ChildChoreResponse {
  id: number;
  child_id: number;
  title: string;
  description: string | null;
  category: string | null;
  due_at: string | null;
  points: number;
  recurrence: 'daily' | 'weekly' | null;
  status: 'pending' | 'completed' | 'approved';
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ChildChoreCollectionResponse {
  data: ChildChoreResponse[];
}

export interface ChildChoreCreateRequest {
  title: string;
  description?: string | null;
  category?: string | null;
  due_at?: string | null;
  points: number;
  recurrence?: 'daily' | 'weekly' | null;
}

export type ChildChoreUpdateRequest = Partial<ChildChoreCreateRequest>;
