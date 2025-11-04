<template>
  <main class="dashboard app-shell">
    <section class="dashboard__hero">
      <div>
        <p class="dashboard__eyebrow">{{ greeting }}</p>
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
        <span class="summary-card__label">{{ t('pages.dashboard.summary.pending') }}</span>
        <strong>{{ summary.pending }}</strong>
      </article>
      <article class="summary-card">
        <span class="summary-card__label">{{ t('pages.dashboard.summary.completedToday') }}</span>
        <strong>{{ summary.completedToday }}</strong>
      </article>
      <article class="summary-card summary-card--warning">
        <span class="summary-card__label">{{ t('pages.dashboard.summary.overdue') }}</span>
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
          <h2>{{ createModalTitle }}</h2>
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useChildDashboard } from '../../useChildDashboard';

import { ChoreCreateForm } from '@/features/chore-create';
import { ChoreListWidget } from '@/widgets';

const { t } = useI18n();

const {
  childName,
  summary,
  todayChores,
  upcomingChores,
  unscheduledChores,
  isLoading,
  isError,
  isCreateModalOpen,
  modalMode,
  editingChore,
  choreFormRef,
  isDeleteModalOpen,
  choreToDelete,
  isDeleting,
  isMarkingDone,
  logoutChild,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  handleFormSubmitted,
  requestDelete,
  closeDeleteModal,
  confirmDelete,
  handleToggleComplete
} = useChildDashboard();

const headline = computed(() => t('pages.dashboard.pendingTitle'));
const greeting = computed(() => t('pages.dashboard.greeting', { name: childName.value }));
const createModalTitle = computed(() =>
  t(modalMode.value === 'create' ? 'features.choreCreate.title' : 'features.choreCreate.update')
);
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
  box-shadow: 0 12px 25px rgb(99 102 241 / 25%);
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
  background: rgb(15 23 42 / 45%);
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
  box-shadow: 0 30px 70px rgb(15 23 42 / 25%);
  padding: 1.75rem;
  display: grid;
  gap: 1.5rem;
}

.chore-confirm__dialog {
  width: min(420px, 100%);
  border-radius: 20px;
  background: var(--color-surface);
  box-shadow: 0 30px 70px rgb(15 23 42 / 25%);
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
  padding: 0.65rem 1.1rem;
  border-radius: var(--radius-base);
  border: none;
  background: var(--color-surface-alt);
  cursor: pointer;
  font-weight: 600;
}

.chore-confirm__button--danger {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
}

.dashboard__summary {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.summary-card {
  display: grid;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: 0 12px 30px rgb(15 23 42 / 8%);
}

.summary-card--primary {
  background: linear-gradient(135deg, rgb(129 140 248 / 20%), rgb(99 102 241 / 45%));
  color: var(--color-text-primary);
}

.summary-card--warning {
  background: linear-gradient(135deg, rgb(251 191 36 / 18%), rgb(239 68 68 / 35%));
}

.summary-card__label {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}

.summary-card strong {
  font-size: 2rem;
  font-weight: 700;
}

.dashboard__content {
  display: grid;
  gap: 1.5rem;
}

.dashboard__grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.dashboard__state {
  padding: 1.5rem;
  border-radius: 18px;
  background: var(--color-surface);
  text-align: center;
  color: var(--color-text-secondary);
}
</style>
