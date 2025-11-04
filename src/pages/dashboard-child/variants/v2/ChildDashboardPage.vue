<template>
  <main class="dashboard">
    <div class="dashboard__halo dashboard__halo--primary" aria-hidden="true"></div>
    <div class="dashboard__halo dashboard__halo--secondary" aria-hidden="true"></div>

    <section class="dashboard__content">
      <header class="hero">
        <div>
          <p class="hero__eyebrow">{{ greeting }}</p>
          <h1 class="hero__title">{{ t('pages.dashboard.pendingTitle') }}</h1>
        </div>
        <div class="hero__actions">
          <button type="button" class="hero__action" @click="openCreateModal">
            {{ t('features.choreCreate.open') }}
          </button>
          <button type="button" class="hero__secondary" @click="logoutChild">
            {{ t('common.actions.logout') }}
          </button>
        </div>
      </header>

      <section class="summary">
        <article class="summary__card summary__card--primary">
          <span class="summary__label">{{ t('pages.dashboard.summary.pending') }}</span>
          <strong>{{ summary.pending }}</strong>
        </article>
        <article class="summary__card summary__card--accent">
          <span class="summary__label">{{ t('pages.dashboard.summary.completedToday') }}</span>
          <strong>{{ summary.completedToday }}</strong>
        </article>
        <article class="summary__card summary__card--warning">
          <span class="summary__label">{{ t('pages.dashboard.summary.overdue') }}</span>
          <strong>{{ summary.overdue }}</strong>
        </article>
      </section>

      <section class="board">
        <div v-if="isLoading" class="board__state">
          {{ t('common.state.loading') }}
        </div>
        <div v-else-if="isError" class="board__state board__state--error">
          {{ t('common.feedback.error') }}
        </div>
        <div v-else class="board__grid">
          <div class="board__panel">
            <ChoreListWidget
              :title="t('pages.dashboard.pendingTitle')"
              :chores="todayChores"
              :show-completion="true"
              :completion-disabled="isMarkingDone"
              @edit="openEditModal"
              @delete="requestDelete"
              @toggle-complete="handleToggleComplete"
            />
          </div>
          <div class="board__panel">
            <ChoreListWidget
              :title="t('pages.dashboard.upcomingTitle')"
              :chores="upcomingChores"
              :show-completion="true"
              :completion-disabled="isMarkingDone"
              @edit="openEditModal"
              @delete="requestDelete"
              @toggle-complete="handleToggleComplete"
            />
          </div>
          <div class="board__panel">
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
        </div>
      </section>
    </section>

    <Teleport to="body">
      <div v-if="isCreateModalOpen" class="modal" @click.self="closeCreateModal">
        <div class="modal__dialog" role="dialog" aria-modal="true">
          <header class="modal__header">
            <h2 class="modal__title">{{ createModalTitle }}</h2>
            <button type="button" class="modal__close" @click="closeCreateModal">
              <span class="sr-only">{{ t('common.actions.close') }}</span>
              &times;
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
      <div v-if="isDeleteModalOpen" class="modal" @click.self="closeDeleteModal">
        <div class="modal__dialog modal__dialog--compact" role="dialog" aria-modal="true">
          <header class="modal__header">
            <h2 class="modal__title">{{ t('features.choreCreate.confirmDeleteTitle') }}</h2>
          </header>
          <p class="modal__message">
            {{
              t('features.choreCreate.confirmDeleteMessage', {
                title: choreToDelete?.title ?? ''
              })
            }}
          </p>
          <div class="modal__actions">
            <button type="button" class="modal__button" @click="closeDeleteModal">
              {{ t('common.actions.cancel') }}
            </button>
            <button
              type="button"
              class="modal__button modal__button--danger"
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
  </main>
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

const greeting = computed(() => t('pages.dashboard.greeting', { name: childName.value }));
const createModalTitle = computed(() =>
  t(modalMode.value === 'create' ? 'features.choreCreate.title' : 'features.choreCreate.update')
);
</script>

<style scoped>
.dashboard {
  @apply relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-300 via-indigo-200 to-sky-200
    px-6 py-10 sm:px-10 lg:px-16;
}

.dashboard__halo {
  @apply pointer-events-none absolute rounded-full blur-3xl;

  width: 26rem;
  height: 26rem;
}

.dashboard__halo--primary {
  @apply -left-24 top-8 bg-gradient-to-br from-orange-200/60 via-rose-200/70 to-transparent;
}

.dashboard__halo--secondary {
  @apply -right-32 bottom-0 bg-gradient-to-tr from-sky-200/65 via-indigo-200/65 to-transparent;
}

.dashboard__content {
  @apply relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12;
}

.hero {
  @apply flex flex-col gap-8 rounded-[32px] bg-white/65 px-8 py-10 shadow-[0_24px_70px_rgba(79,70,229,0.18)]
    backdrop-blur-lg md:flex-row md:items-center md:justify-between;
}

.hero__eyebrow {
  @apply text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500;
}

.hero__title {
  @apply mt-3 text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-[0_18px_45px_rgba(129,140,248,0.35)];
}

.hero__actions {
  @apply flex flex-col gap-3 md:flex-row md:items-center;
}

.hero__action {
  @apply inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3
    text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-xl;
}

.hero__secondary {
  @apply inline-flex items-center justify-center rounded-full border border-white/60 bg-white/80 px-6 py-3
    text-indigo-600 shadow-[0_12px_30px_rgba(148,163,184,0.25)] transition hover:-translate-y-0.5
    hover:bg-white;
}

.summary {
  @apply grid gap-5 md:grid-cols-3;
}

.summary__card {
  @apply rounded-[28px] border border-white/60 bg-white/70 px-6 py-6 shadow-[0_18px_50px_rgba(148,163,184,0.22)] backdrop-blur-lg;
}

.summary__card--primary {
  @apply bg-gradient-to-br from-indigo-500/15 via-indigo-400/10 to-white/70;
}

.summary__card--accent {
  @apply bg-gradient-to-br from-emerald-400/20 via-sky-300/15 to-white/70;
}

.summary__card--warning {
  @apply bg-gradient-to-br from-amber-300/25 via-rose-300/15 to-white/70;
}

.summary__label {
  @apply text-xs font-semibold uppercase tracking-[0.25em] text-slate-500;
}

.summary__card strong {
  @apply text-4xl font-extrabold text-slate-900;
}

.board {
  @apply grid gap-8;
}

.board__state {
  @apply rounded-[28px] border border-white/50 bg-white/70 px-8 py-10 text-center text-base font-semibold text-slate-600
    shadow-[0_22px_55px_rgba(148,163,184,0.2)] backdrop-blur-lg;
}

.board__state--error {
  @apply text-rose-500;
}

.board__grid {
  @apply grid gap-6 lg:grid-cols-3;
}

.board__panel {
  @apply rounded-[28px] border border-white/60 bg-white/80 px-6 py-6 shadow-[0_18px_45px_rgba(148,163,184,0.2)] backdrop-blur-lg;
}

.modal {
  @apply fixed inset-0 z-[1200] grid place-items-center bg-slate-900/45 px-4 backdrop-blur-md;
}

.modal__dialog {
  @apply w-full max-w-xl rounded-[28px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur
    transition;
}

.modal__dialog--compact {
  @apply max-w-md;
}

.modal__header {
  @apply mb-6 flex items-start justify-between gap-4;
}

.modal__title {
  @apply text-2xl font-bold text-slate-900;
}

.modal__close {
  @apply text-2xl font-bold text-slate-400 transition hover:text-slate-600;
}

.modal__message {
  @apply mb-6 text-sm leading-6 text-slate-600;
}

.modal__actions {
  @apply flex justify-end gap-3;
}

.modal__button {
  @apply inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600
    transition hover:bg-slate-200;
}

.modal__button--danger {
  @apply bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-500 hover:to-rose-500;
}
</style>
