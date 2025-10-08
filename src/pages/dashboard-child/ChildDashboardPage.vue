<template>
  <main class="dashboard app-shell">
    <section class="dashboard__hero">
      <div>
        <p class="dashboard__eyebrow">{{ t('pages.dashboard.greeting', { name: childName }) }}</p>
        <h1>{{ headline }}</h1>
      </div>
      <ChoreCreateForm />
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
        <ChoreListWidget :title="t('pages.dashboard.pendingTitle')" :chores="todayChores" />
        <ChoreListWidget :title="t('pages.dashboard.upcomingTitle')" :chores="upcomingChores" />
        <ChoreListWidget
          :title="t('pages.dashboard.unscheduledTitle')"
          :chores="unscheduledChores"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useChildChoresQuery } from '@/entities/chore';
import { ChoreCreateForm } from '@/features/chore-create';
import { isPast, isToday } from '@/shared/lib/date';
import { useSessionStore } from '@/shared/session';
import { ChoreListWidget } from '@/widgets';

const { t } = useI18n();
const session = useSessionStore();

const childName = computed(() => session.child.user?.nickname ?? 'Friend');
const headline = computed(() => t('pages.dashboard.pendingTitle'));

const { chores, isLoading, isError } = useChildChoresQuery();

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
