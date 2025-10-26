<template>
  <main class="dashboard app-shell">
    <section class="dashboard__hero">
      <div>
        <p class="dashboard__eyebrow">{{ t('pages.dashboard.greeting', { name: childName }) }}</p>
        <h1>{{ headline }}</h1>
      </div>
      <div class="dashboard__actions">
        <button class="dashboard__action-button" type="button" @click="openCreateModal">
          {{ t('features.choreCreate.open') }}
        </button>
        <button class="dashboard__logout" type="button" @click="logoutChild">
          {{ t('common.actions.logout') }}
        </button>
      </div>
    </section>

    <section class="dashboard__summary">
      <article class="summary-card summary-card--primary">
        <span class="summary-card__label">Pending</span>
        <strong>{{ summary.pending }}</strong>
      </article>
      <article class="summary-card">
        <span class="summary-card__label">Completed today</span>
        <strong>{{ summary.completedToday }}</strong>
      </article>
      <article class="summary-card summary-card--warning">
        <span class="summary-card__label">Overdue</span>
        <strong>{{ summary.overdue }}</strong>
      </article>
    </section>

    <section class="dashboard__content">
      <div v-if="isLoading" class="dashboard__state">
        {{ t('common.state.loading') }}
      </div>
      <div v-else-if="isError" class="dashboard__state">
        {{ t('common.feedback.error') }}
      </div>
      <div v-else class="dashboard__grid">
        <ChoreListWidget
          :title="t('pages.dashboard.pendingTitle')"
          :chores="todayChores"
          :show-completion="true"
          :completion-disabled="isMarkingDone"
          @edit="openEditModal"
          @delete="requestDelete"
          @toggle-complete="handleToggleComplete"
        />
        <ChoreListWidget
          :title="t('pages.dashboard.upcomingTitle')"
          :chores="upcomingChores"
          :show-completion="true"
          :completion-disabled="isMarkingDone"
          @edit="openEditModal"
          @delete="requestDelete"
          @toggle-complete="handleToggleComplete"
        />
        <ChoreListWidget
          :title="t('pages.dashboard.unscheduledTitle')"
          :chores="unscheduledChores"
          :show-completion="true"
          :completion-disabled="isMarkingDone"
          @edit="openEditModal"
          @delete="requestDelete"
          @toggle-complete="handleToggleComplete"
        />
      </div>
    </section>
  </main>
  <Teleport to="body">
    <div v-if="isCreateModalOpen" class="chore-modal" @click.self="closeCreateModal">
      <div class="chore-modal__dialog" role="dialog" aria-modal="true">
        <header class="chore-modal__header">
          <h2>{{ t('features.choreCreate.title') }}</h2>
          <button type="button" class="chore-modal__close" @click="closeCreateModal">
            <span class="sr-only">{{ t('common.actions.close') }}</span>
            ×
          </button>
        </header>
        <ChoreCreateForm
          ref="choreFormRef"
          :show-header="false"
          :mode="modalMode"
          :chore-id="editingChore?.id ?? null"
          @submitted="handleFormSubmitted"
        />
      </div>
    </div>
  </Teleport>
  <Teleport to="body">
    <div v-if="isDeleteModalOpen" class="chore-modal" @click.self="closeDeleteModal">
      <div class="chore-confirm__dialog" role="dialog" aria-modal="true">
        <header class="chore-modal__header">
          <h2>{{ t('features.choreCreate.confirmDeleteTitle') }}</h2>
        </header>
        <p class="chore-confirm__message">
          {{
            t('features.choreCreate.confirmDeleteMessage', {
              title: choreToDelete?.title ?? ''
            })
          }}
        </p>
        <div class="chore-confirm__actions">
          <button type="button" class="chore-confirm__button" @click="closeDeleteModal">
            {{ t('common.actions.cancel') }}
          </button>
          <button
            type="button"
            class="chore-confirm__button chore-confirm__button--danger"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            <span v-if="isDeleting">{{ t('common.state.loading') }}</span>
            <span v-else>{{ t('common.actions.delete') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import {
  useChildChoresQuery,
  useChoreDeleteMutation,
  useChoreMarkDoneMutation
} from '@/entities/chore';
import type { Chore } from '@/entities/chore';
import { ChoreCreateForm } from '@/features/chore-create';
import { isPast, isToday } from '@/shared/lib/date';
import { useSessionStore } from '@/shared/session';
import { ChoreListWidget } from '@/widgets';

type ChoreFormHandles = {
  setInitialValues: (values: {
    title?: string;
    description?: string;
    category?: string;
    dueAt?: string;
    points?: number | null;
    recurrence?: '' | 'daily' | 'weekly';
  }) => void;
  resetForm: () => void;
};

const { t } = useI18n();
const router = useRouter();
const session = useSessionStore();
const isCreateModalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editingChore = ref<Chore | null>(null);
const choreFormRef = ref<ChoreFormHandles | null>(null);
const isDeleteModalOpen = ref(false);
const choreToDelete = ref<Chore | null>(null);
const deleteMutation = useChoreDeleteMutation();
const markDoneMutation = useChoreMarkDoneMutation();

const childName = computed(() => session.child.user?.nickname ?? 'Friend');
const headline = computed(() => t('pages.dashboard.pendingTitle'));

const { chores, isLoading, isError } = useChildChoresQuery();

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
      category: chore.category ?? '',
      dueAt: chore.dueAt ? formatDateTimeLocal(chore.dueAt) : '',
      points: chore.points,
      recurrence: chore.recurrence ?? ''
    });
  });
}

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

const isDeleting = computed(() => deleteMutation.isPending.value);
const isMarkingDone = computed(() => markDoneMutation.isPending.value);

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

function handleFormSubmitted() {
  closeCreateModal();
}

async function handleToggleComplete(event: { chore: Chore; completed: boolean }) {
  if (!event.completed || event.chore.status === 'completed') return;
  await markDoneMutation.mutateAsync(event.chore.id);
}

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
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 2.5rem;
  padding: 3rem clamp(1rem, 5vw, 4rem);
}

.dashboard__hero {
  display: grid;
  gap: 1.5rem;
  align-items: start;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.dashboard__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  align-items: center;
}

.dashboard__action-button {
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-base);
  border: none;
  background: linear-gradient(135deg, #818cf8, #6366f1);
  color: var(--color-accent-contrast);
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.dashboard__action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(99, 102, 241, 0.25);
}

.dashboard__logout {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.dashboard__logout:hover {
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-sm);
}

.chore-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 1000;
}

.chore-modal__dialog {
  width: min(480px, 100%);
  max-height: 90vh;
  overflow: auto;
  border-radius: 24px;
  background: var(--color-surface);
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.25);
  padding: 1.75rem;
  display: grid;
  gap: 1.5rem;
}

.chore-confirm__dialog {
  width: min(420px, 100%);
  border-radius: 20px;
  background: var(--color-surface);
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.25);
  padding: 1.5rem;
  display: grid;
  gap: 1.25rem;
}

.chore-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.chore-modal__header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.chore-modal__close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.chore-confirm__message {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.chore-confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.chore-confirm__button {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  padding: 0.6rem 1.1rem;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.chore-confirm__button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface-alt);
}

.chore-confirm__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chore-confirm__button--danger {
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #fff;
  border: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dashboard__eyebrow {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--color-text-primary);
  margin: 0;
}

.dashboard__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1.5rem;
  border-radius: var(--radius-base);
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 0.5rem;
}

.summary-card--primary {
  background: linear-gradient(135deg, #818cf8, #6366f1);
  color: var(--color-accent-contrast);
}

.summary-card--warning {
  background: linear-gradient(135deg, #fb7185, #f97316);
  color: #fff;
}

.summary-card__label {
  font-size: 0.9rem;
  opacity: 0.85;
}

.summary-card strong {
  font-size: 2rem;
}

.dashboard__content {
  display: grid;
  gap: 1.5rem;
}

.dashboard__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.dashboard__state {
  padding: 2rem;
  border-radius: var(--radius-base);
  background: var(--color-surface-alt);
  text-align: center;
  color: var(--color-text-secondary);
}
</style>
