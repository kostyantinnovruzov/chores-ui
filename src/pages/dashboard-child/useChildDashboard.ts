import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  useChildChoresQuery,
  useChoreDeleteMutation,
  useChoreMarkDoneMutation
} from '@/entities/chore';
import type { Chore, ChoreCategory } from '@/entities/chore';
import { isPast, isToday } from '@/shared/lib/date';
import { useSessionStore } from '@/shared/session';

export type ChildDashboardModalMode = 'create' | 'edit';

export type ChoreFormHandles = {
  setInitialValues: (values: {
    title?: string;
    description?: string;
    categories?: number[];
    dueAt?: string;
    points?: number | null;
    recurrence?: '' | 'daily' | 'weekly';
  }) => void;
  resetForm: () => void;
};

function formatDateTimeLocal(value: string) {
  const date = new Date(value);
  const pad = (num: number) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function useChildDashboard() {
  const router = useRouter();
  const session = useSessionStore();

  const isCreateModalOpen = ref(false);
  const modalMode = ref<ChildDashboardModalMode>('create');
  const editingChore = ref<Chore | null>(null);
  const choreFormRef = ref<ChoreFormHandles | null>(null);

  const isDeleteModalOpen = ref(false);
  const choreToDelete = ref<Chore | null>(null);

  const deleteMutation = useChoreDeleteMutation();
  const markDoneMutation = useChoreMarkDoneMutation();

  const { chores, isLoading, isError } = useChildChoresQuery();
  const availableCategories = computed<ChoreCategory[]>(() => {
    const map = new Map<number, ChoreCategory>();
    chores.value.forEach((chore) => {
      chore.categories.forEach((category) => {
        if (!map.has(category.id)) {
          map.set(category.id, category);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  const childName = computed(() => session.child.user?.nickname ?? 'Friend');

  const todayChores = computed(() =>
    chores.value.filter((chore) => {
      if (!chore.dueAt) return false;
      const due = new Date(chore.dueAt);
      return isToday(due);
    })
  );

  const upcomingChores = computed(() =>
    chores.value.filter((chore) => {
      if (!chore.dueAt) return false;
      const due = new Date(chore.dueAt);
      return !isToday(due) && !isPast(due);
    })
  );

  const unscheduledChores = computed(() => chores.value.filter((chore) => !chore.dueAt));

  const summary = computed(() => ({
    pending: chores.value.filter((chore) => chore.status === 'pending').length,
    completedToday: chores.value.filter((chore) => {
      if (chore.status !== 'completed' || !chore.completedAt) return false;
      return isToday(new Date(chore.completedAt));
    }).length,
    overdue: chores.value.filter((chore) => {
      if (chore.status !== 'pending' || !chore.dueAt) return false;
      const due = new Date(chore.dueAt);
      return isPast(due) && !isToday(due);
    }).length
  }));

  function logoutChild() {
    session.clearChildSession();
    void router.push({ name: 'child-login' });
  }

  function openCreateModal() {
    modalMode.value = 'create';
    editingChore.value = null;
    isCreateModalOpen.value = true;
    void nextTick(() => {
      choreFormRef.value?.resetForm();
    });
  }

  function closeCreateModal() {
    isCreateModalOpen.value = false;
    modalMode.value = 'create';
    editingChore.value = null;
    choreFormRef.value?.resetForm();
  }

  function openEditModal(chore: Chore) {
    editingChore.value = chore;
    modalMode.value = 'edit';
    isCreateModalOpen.value = true;
    void nextTick(() => {
      choreFormRef.value?.setInitialValues({
        title: chore.title,
        description: chore.description ?? '',
        categories: chore.categories.map((category) => category.id),
        dueAt: chore.dueAt ? formatDateTimeLocal(chore.dueAt) : '',
        points: chore.points,
        recurrence: chore.recurrence ?? ''
      });
    });
  }

  function handleFormSubmitted() {
    closeCreateModal();
  }

  function requestDelete(chore: Chore) {
    choreToDelete.value = chore;
    isDeleteModalOpen.value = true;
  }

  function closeDeleteModal() {
    isDeleteModalOpen.value = false;
    choreToDelete.value = null;
    deleteMutation.reset();
  }

  async function confirmDelete() {
    if (!choreToDelete.value) return;
    await deleteMutation.mutateAsync(choreToDelete.value.id);
    closeDeleteModal();
  }

  async function handleToggleComplete(event: { chore: Chore; completed: boolean }) {
    if (!event.completed || event.chore.status === 'completed') return;
    await markDoneMutation.mutateAsync(event.chore.id);
  }

  const isDeleting = computed(() => deleteMutation.isPending.value);
  const isMarkingDone = computed(() => markDoneMutation.isPending.value);

  return {
    // state
    childName,
    summary,
    todayChores,
    upcomingChores,
    unscheduledChores,
    isLoading,
    isError,
    availableCategories,
    isCreateModalOpen,
    modalMode,
    editingChore,
    choreFormRef,
    isDeleteModalOpen,
    choreToDelete,
    isDeleting,
    isMarkingDone,
    // actions
    logoutChild,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    handleFormSubmitted,
    requestDelete,
    closeDeleteModal,
    confirmDelete,
    handleToggleComplete
  };
}
