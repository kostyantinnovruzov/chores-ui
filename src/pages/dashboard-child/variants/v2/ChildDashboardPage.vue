<template>
  <main class="calendar">
    <section class="calendar__content">
      <header class="calendar__header">
        <div class="calendar__hero">
          <div class="calendar__avatar">😸</div>
          <div>
            <p class="calendar__eyebrow">{{ greeting }}</p>
            <h1 class="calendar__title">Мої завдання</h1>
            <p class="calendar__subtitle">{{ currentWeekText }}</p>
          </div>
        </div>
        <div class="calendar__cta">
          <div class="calendar__points">
            <span class="calendar__points-value">⭐ {{ totalPoints }}</span>
            <span class="calendar__points-label">Зароблено балів</span>
          </div>
          <div class="calendar__actions">
            <button
              class="calendar__button calendar__button--primary"
              type="button"
              @click="openCreateModal"
            >
              {{ t('features.choreCreate.open') }}
            </button>
            <button
              class="calendar__button calendar__button--ghost"
              type="button"
              @click="logoutChild"
            >
              {{ t('common.actions.logout') }}
            </button>
          </div>
        </div>
      </header>

      <section class="calendar__grid-section">
        <div v-if="isLoading" class="calendar__state">
          {{ t('common.state.loading') }}
        </div>
        <div v-else-if="isError" class="calendar__state calendar__state--error">
          {{ t('common.feedback.error') }}
        </div>
        <div v-else class="calendar__grid">
          <article v-for="column in calendarColumns" :key="column.id" class="calendar-column">
            <header
              class="calendar-column__header"
              :class="
                column.isToday
                  ? 'calendar-column__header--today'
                  : 'calendar-column__header--default'
              "
            >
              <div class="calendar-column__day">{{ column.name }}</div>
              <div class="calendar-column__date">
                <span v-if="column.dateLabel">{{ column.dateLabel }}</span>
                <span v-else>∞</span>
              </div>
              <div v-if="column.isToday" class="calendar-column__badge">Сьогодні 🎯</div>
              <div
                v-else-if="column.isUnscheduled"
                class="calendar-column__badge calendar-column__badge--muted"
              >
                Без дати
              </div>
            </header>

            <div class="calendar-column__body">
              <button
                v-for="chore in column.chores"
                :key="chore.id"
                type="button"
                class="calendar-task"
                :class="isChoreCompleted(chore) ? 'calendar-task--done' : 'calendar-task--pending'"
                @click="openChoreDetail(chore)"
              >
                <div class="calendar-task__meta">
                  <div class="calendar-task__time">{{ formatChoreTime(chore) }}</div>
                  <strong class="calendar-task__title">{{ chore.title }}</strong>
                </div>
                <span class="calendar-task__emoji">
                  {{ isChoreCompleted(chore) ? '✅' : getChoreEmoji(chore) }}
                </span>
                <div class="calendar-task__footer">
                  <span class="calendar-task__category">
                    {{ getPrimaryCategory(chore) }}
                  </span>
                  <span class="calendar-task__points">+{{ chore.points }} ⭐</span>
                </div>
              </button>

              <p v-if="!column.chores.length" class="calendar-column__empty">
                <span class="calendar-column__empty-emoji">📅</span>
                <span>Вільний день!</span>
              </p>
            </div>

            <button class="calendar-column__add" type="button" @click="handleAddChore(column)">
              <span class="calendar-column__add-icon">+</span>
              <span>Додати завдання</span>
            </button>
          </article>
        </div>
      </section>
    </section>

    <Teleport to="body">
      <Transition name="calendar-fade">
        <div v-if="showDetailModal" class="calendar-modal" @click.self="closeDetailModal">
          <div
            class="calendar-modal__dialog calendar-modal__dialog--detail"
            role="dialog"
            aria-modal="true"
          >
            <header class="calendar-modal__header">
              <div class="calendar-modal__hero">
                <span class="calendar-modal__emoji">{{ selectedChoreEmoji }}</span>
                <div>
                  <h2 class="calendar-modal__title">{{ selectedChore?.title }}</h2>
                  <p class="calendar-modal__subtitle">{{ selectedChoreCategories }}</p>
                </div>
              </div>
              <button type="button" class="calendar-modal__close" @click="closeDetailModal">
                <span class="sr-only">{{ t('common.actions.close') }}</span>
                &times;
              </button>
            </header>

            <div class="calendar-modal__info">
              <div class="calendar-modal__info-block">
                <span class="calendar-modal__info-icon">⏰</span>
                <div>
                  <p class="calendar-modal__info-label">Час</p>
                  <p class="calendar-modal__info-value">{{ selectedChoreTime }}</p>
                </div>
              </div>
              <div class="calendar-modal__info-block">
                <span class="calendar-modal__info-icon">⭐</span>
                <div>
                  <p class="calendar-modal__info-label">Нагорода</p>
                  <p class="calendar-modal__info-value">{{ selectedChore?.points }} балів</p>
                </div>
              </div>
            </div>

            <p v-if="selectedChore?.description" class="calendar-modal__description">
              {{ selectedChore.description }}
            </p>

            <div class="calendar-modal__actions">
              <button
                v-if="!isSelectedChoreCompleted"
                class="calendar-modal__cta"
                type="button"
                :disabled="isMarkingDone"
                @click="markSelectedChoreComplete"
              >
                ✓ Виконано!
              </button>
              <p v-else class="calendar-modal__cta calendar-modal__cta--done">
                ✅ Завдання виконано
              </p>
              <div class="calendar-modal__secondary">
                <button type="button" @click="handleEditSelectedChore">
                  {{ t('common.actions.edit') ?? 'Редагувати' }}
                </button>
                <button
                  type="button"
                  class="calendar-modal__danger"
                  @click="handleDeleteSelectedChore"
                >
                  {{ t('common.actions.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="calendar-fade">
        <div v-if="isCreateModalOpen" class="calendar-modal" @click.self="closeCreateModal">
          <div
            class="calendar-modal__dialog calendar-modal__dialog--form"
            role="dialog"
            aria-modal="true"
          >
            <header class="calendar-modal__header">
              <div>
                <p class="calendar-modal__eyebrow">{{ t('features.choreCreate.title') }}</p>
                <h2 class="calendar-modal__title">
                  {{
                    modalMode === 'create'
                      ? t('features.choreCreate.submit')
                      : t('features.choreCreate.update')
                  }}
                </h2>
              </div>
              <button type="button" class="calendar-modal__close" @click="closeCreateModal">
                <span class="sr-only">{{ t('common.actions.close') }}</span>
                &times;
              </button>
            </header>
            <ChoreCreateForm
              ref="choreFormRef"
              :show-header="false"
              :mode="modalMode"
              :chore-id="editingChore?.id ?? null"
              :category-options="availableCategories"
              @submitted="handleFormSubmitted"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="calendar-fade">
        <div v-if="isDeleteModalOpen" class="calendar-modal" @click.self="closeDeleteModal">
          <div
            class="calendar-modal__dialog calendar-modal__dialog--confirm"
            role="dialog"
            aria-modal="true"
          >
            <header class="calendar-modal__header">
              <h2 class="calendar-modal__title">
                {{ t('features.choreCreate.confirmDeleteTitle') }}
              </h2>
            </header>
            <p class="calendar-modal__description">
              {{
                t('features.choreCreate.confirmDeleteMessage', {
                  title: choreToDelete?.title ?? ''
                })
              }}
            </p>
            <div class="calendar-modal__actions calendar-modal__actions--confirm">
              <button type="button" class="calendar-modal__button" @click="closeDeleteModal">
                {{ t('common.actions.cancel') }}
              </button>
              <button
                type="button"
                class="calendar-modal__button calendar-modal__danger"
                :disabled="isDeleting"
                @click="confirmDelete"
              >
                <span v-if="isDeleting">{{ t('common.state.loading') }}</span>
                <span v-else>{{ t('common.actions.delete') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useChildDashboard } from '../../useChildDashboard';

import type { Chore } from '@/entities/chore';
import { ChoreCreateForm } from '@/features/chore-create';

type CalendarColumn = {
  id: string;
  name: string;
  dateLabel: string;
  date: Date | null;
  isToday: boolean;
  isUnscheduled?: boolean;
  chores: Chore[];
};

const { t, d } = useI18n();

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('uk-UA', { weekday: 'long' });
const WEEK_RANGE_FORMATTER = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' });

const {
  childName,
  chores,
  unscheduledChores,
  isLoading,
  isError,
  isCreateModalOpen,
  modalMode,
  editingChore,
  choreFormRef,
  availableCategories,
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

const baseDate = computed(() => new Date());

const calendarColumns = computed<CalendarColumn[]>(() => {
  const start = getStartOfWeek(baseDate.value);
  const columns: CalendarColumn[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      id: date.toISOString(),
      name: capitalize(WEEKDAY_FORMATTER.format(date)),
      dateLabel: date.getDate().toString(),
      date,
      isToday: isSameDay(date, baseDate.value),
      chores: chores.value.filter((chore) => isSameDayDateString(chore.dueAt, date))
    };
  });

  columns.push({
    id: 'unscheduled',
    name: 'Будь-коли',
    dateLabel: '',
    date: null,
    isToday: false,
    isUnscheduled: true,
    chores: unscheduledChores.value
  });

  return columns;
});

const currentWeekText = computed(() => {
  const datedColumns = calendarColumns.value.filter((column) => column.date);
  const first = datedColumns[0]?.date;
  const last = datedColumns[datedColumns.length - 1]?.date;
  if (!first || !last) return '';
  return `${WEEK_RANGE_FORMATTER.format(first)} – ${WEEK_RANGE_FORMATTER.format(last)}`;
});

const totalPoints = computed(() =>
  chores.value
    .filter((chore) => chore.status === 'completed' || chore.status === 'approved')
    .reduce((sum, chore) => sum + chore.points, 0)
);

const showDetailModal = ref(false);
const selectedChore = ref<Chore | null>(null);
const selectedChoreCategories = computed(
  () =>
    selectedChore.value?.categories.map((category) => category.name).join(', ') || 'Без категорії'
);
const selectedChoreTime = computed(() => {
  if (!selectedChore.value?.dueAt) {
    return 'Будь-коли';
  }
  return d(new Date(selectedChore.value.dueAt), { timeStyle: 'short' });
});
const selectedChoreEmoji = computed(() =>
  selectedChore.value ? getChoreEmoji(selectedChore.value) : '⭐'
);
const isSelectedChoreCompleted = computed(() =>
  selectedChore.value ? isChoreCompleted(selectedChore.value) : false
);

function openChoreDetail(chore: Chore) {
  selectedChore.value = chore;
  showDetailModal.value = true;
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedChore.value = null;
}

function handleEditSelectedChore() {
  if (!selectedChore.value) return;
  openEditModal(selectedChore.value);
  closeDetailModal();
}

function handleDeleteSelectedChore() {
  if (!selectedChore.value) return;
  requestDelete(selectedChore.value);
  closeDetailModal();
}

async function markSelectedChoreComplete() {
  if (!selectedChore.value) return;
  await handleToggleComplete({ chore: selectedChore.value, completed: true });
}

function handleAddChore(column: CalendarColumn) {
  openCreateModal();
  if (!column.date) return;
  const defaultDate = new Date(column.date);
  defaultDate.setHours(9, 0, 0, 0);
  void nextTick(() => {
    setTimeout(() => {
      choreFormRef.value?.setInitialValues({
        dueAt: formatDateTimeLocalInput(defaultDate)
      });
    }, 0);
  });
}

function formatChoreTime(chore: Chore) {
  if (!chore.dueAt) return 'Будь-коли';
  return d(new Date(chore.dueAt), { timeStyle: 'short' });
}

function getPrimaryCategory(chore: Chore) {
  return chore.categories[0]?.name ?? 'Без категорії';
}

function isChoreCompleted(chore: Chore) {
  return chore.status === 'completed' || chore.status === 'approved';
}

function getChoreEmoji(chore: Chore) {
  const map: Record<string, string> = {
    clean: '🧹',
    room: '🧽',
    pet: '🐾',
    music: '🎵',
    study: '📚',
    read: '📖',
    cook: '🍳',
    dish: '🍽️',
    laundry: '🧺',
    sport: '⚽',
    plant: '🌱'
  };

  const source = chore.categories[0]?.name?.toLowerCase() ?? chore.title.toLowerCase();
  const key = Object.keys(map).find((item) => source.includes(item));
  return key ? map[key] : '⭐';
}

function formatDateTimeLocalInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function getStartOfWeek(date: Date) {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  clone.setDate(clone.getDate() + diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameDayDateString(value: string | null, date: Date) {
  if (!value) return false;
  return isSameDay(new Date(value), date);
}

function capitalize(value: string) {
  if (!value.length) return value;
  return value[0].toUpperCase() + value.slice(1);
}
</script>

<style scoped>
.calendar {
  @apply min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4 py-8 sm:px-8;
}

.calendar__content {
  @apply mx-auto flex w-full max-w-6xl flex-col gap-8;
}

.calendar__header {
  @apply flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur-md lg:flex-row lg:items-center lg:justify-between;
}

.calendar__hero {
  @apply flex items-center gap-4;
}

.calendar__avatar {
  @apply grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-4xl;
}

.calendar__eyebrow {
  @apply text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500;
}

.calendar__title {
  @apply text-3xl font-bold text-slate-900;
}

.calendar__subtitle {
  @apply text-sm text-slate-500;
}

.calendar__cta {
  @apply flex flex-col gap-4 lg:items-end;
}

.calendar__points {
  @apply rounded-2xl bg-gradient-to-r from-yellow-200 to-orange-200 px-6 py-4 text-right shadow-md;
}

.calendar__points-value {
  @apply text-3xl font-extrabold text-yellow-700;
}

.calendar__points-label {
  @apply text-xs font-semibold uppercase tracking-widest text-yellow-800;
}

.calendar__actions {
  @apply flex flex-col gap-2 sm:flex-row;
}

.calendar__button {
  @apply inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition;
}

.calendar__button--primary {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-300 hover:-translate-y-0.5;
}

.calendar__button--ghost {
  @apply border border-purple-200 bg-white/80 text-purple-600 hover:bg-white;
}

.calendar__grid-section {
  @apply rounded-3xl bg-white/90 p-4 shadow-xl;
}

.calendar__state {
  @apply py-16 text-center text-slate-500;
}

.calendar__state--error {
  @apply text-rose-500;
}

.calendar__grid {
  @apply grid auto-cols-[minmax(220px,1fr)] grid-flow-col gap-4 overflow-x-auto;
}

.calendar-column {
  @apply flex min-w-[220px] flex-col gap-4 rounded-2xl bg-slate-50 p-4 shadow;
}

.calendar-column__header {
  @apply rounded-2xl p-4 text-white;
}

.calendar-column__header--today {
  @apply bg-gradient-to-r from-purple-500 to-pink-500;
}

.calendar-column__header--default {
  @apply bg-gradient-to-r from-blue-400 to-cyan-400;
}

.calendar-column__day {
  @apply text-sm font-semibold uppercase tracking-widest;
}

.calendar-column__date {
  @apply text-3xl font-extrabold;
}

.calendar-column__badge {
  @apply mt-2 inline-flex rounded-full bg-white/25 px-3 py-1 text-xs font-semibold;
}

.calendar-column__badge--muted {
  @apply bg-white/40;
}

.calendar-column__body {
  @apply flex flex-col gap-3;
}

.calendar-task {
  @apply flex flex-col gap-2 rounded-2xl p-4 text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg;
}

.calendar-task--pending {
  @apply bg-gradient-to-r from-yellow-200 to-orange-200;
}

.calendar-task--done {
  @apply bg-gradient-to-r from-emerald-200 to-green-300;
}

.calendar-task__meta {
  @apply flex flex-col gap-1 text-slate-800;
}

.calendar-task__time {
  @apply text-xs font-semibold uppercase tracking-widest;
}

.calendar-task__title {
  @apply text-base;
}

.calendar-task__emoji {
  @apply text-3xl;
}

.calendar-task__footer {
  @apply flex items-center justify-between text-sm font-semibold text-slate-700;
}

.calendar-task__category {
  @apply rounded-full bg-white/50 px-3 py-1 text-xs uppercase tracking-widest;
}

.calendar-task__points {
  @apply text-purple-700;
}

.calendar-column__empty {
  @apply flex flex-col items-center gap-2 py-6 text-slate-400;
}

.calendar-column__empty-emoji {
  @apply text-3xl;
}

.calendar-column__add {
  @apply flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 py-3 text-sm font-semibold text-purple-600 transition hover:border-purple-400 hover:text-purple-800;
}

.calendar-column__add-icon {
  @apply text-xl;
}

.calendar-modal {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6;
}

.calendar-modal__dialog {
  @apply w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl;
}

.calendar-modal__dialog--detail {
  @apply max-w-xl;
}

.calendar-modal__dialog--form {
  @apply max-w-3xl;
}

.calendar-modal__dialog--confirm {
  @apply max-w-md;
}

.calendar-modal__header {
  @apply mb-6 flex items-start justify-between gap-4;
}

.calendar-modal__hero {
  @apply flex items-center gap-4;
}

.calendar-modal__emoji {
  @apply text-5xl;
}

.calendar-modal__title {
  @apply text-2xl font-bold text-slate-900;
}

.calendar-modal__subtitle {
  @apply text-sm text-slate-500;
}

.calendar-modal__eyebrow {
  @apply text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500;
}

.calendar-modal__close {
  @apply text-3xl text-slate-400 transition hover:text-slate-600;
}

.calendar-modal__info {
  @apply mb-4 grid gap-4 sm:grid-cols-2;
}

.calendar-modal__info-block {
  @apply flex items-center gap-3 rounded-2xl bg-slate-50 p-4;
}

.calendar-modal__info-icon {
  @apply text-2xl;
}

.calendar-modal__info-label {
  @apply text-xs font-semibold uppercase tracking-widest text-slate-500;
}

.calendar-modal__info-value {
  @apply text-lg font-semibold text-slate-900;
}

.calendar-modal__description {
  @apply mb-6 rounded-2xl bg-indigo-50 p-4 text-slate-700;
}

.calendar-modal__actions {
  @apply flex flex-col gap-4;
}

.calendar-modal__cta {
  @apply w-full rounded-2xl bg-gradient-to-r from-green-400 to-green-500 py-4 text-center text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60;
}

.calendar-modal__cta--done {
  @apply bg-transparent text-green-600 shadow-none;
}

.calendar-modal__secondary {
  @apply flex items-center justify-between text-sm text-slate-500;
}

.calendar-modal__danger {
  @apply text-rose-500;
}

.calendar-modal__actions--confirm {
  @apply flex flex-col gap-3 sm:flex-row sm:justify-end;
}

.calendar-modal__button {
  @apply rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-slate-400;
}

.calendar-fade-enter-active,
.calendar-fade-leave-active {
  transition: opacity 0.2s ease;
}

.calendar-fade-enter-from,
.calendar-fade-leave-to {
  opacity: 0;
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
</style>
