import { ref } from 'vue';

const STORAGE_KEY = 'ui:experiments';

export interface ExperimentConfig<TVariant extends string> {
  key: string;
  variants: readonly TVariant[];
  defaultVariant: TVariant;
  storage?: Storage;
}

export type ExperimentAssignments<TVariant extends string> = Record<string, TVariant>;

function readAssignments(storage?: Storage): ExperimentAssignments<string> {
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ExperimentAssignments<string>;
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function persistAssignments(assignments: ExperimentAssignments<string>, storage?: Storage) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    // ignore quota failures
  }
}

function normalizeVariant<TVariant extends string>(
  variant: string | undefined,
  variants: readonly TVariant[],
  fallback: TVariant
): TVariant {
  return variants.includes(variant as TVariant) ? (variant as TVariant) : fallback;
}

export function resolveExperimentVariant<TVariant extends string>(
  config: ExperimentConfig<TVariant>
): TVariant {
  const storage =
    config.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);

  const assignments = readAssignments(storage);
  const stored = assignments[config.key];
  if (stored) {
    return normalizeVariant(stored, config.variants, config.defaultVariant);
  }

  const randomIndex = Math.floor(Math.random() * config.variants.length);
  const assigned = config.variants[randomIndex] ?? config.defaultVariant;

  assignments[config.key] = assigned;
  persistAssignments(assignments, storage);

  return assigned;
}

export function useExperimentVariant<TVariant extends string>(config: ExperimentConfig<TVariant>) {
  const variant = ref(resolveExperimentVariant(config));
  return variant;
}
