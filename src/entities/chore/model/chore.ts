export type ChoreStatus = 'pending' | 'completed' | 'approved';

export interface ChoreCategory {
  id: number;
  name: string;
}

export interface Chore {
  id: number;
  childId: number;
  title: string;
  description: string | null;
  categories: ChoreCategory[];
  dueAt: string | null;
  points: number;
  recurrence: 'daily' | 'weekly' | null;
  status: ChoreStatus;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
