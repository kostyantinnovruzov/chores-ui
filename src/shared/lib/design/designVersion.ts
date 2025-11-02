import { computed, ref } from 'vue';

import {
  DEFAULT_DESIGN_VERSION,
  DESIGN_VERSION_STORAGE_KEY,
  DESIGN_VERSIONS,
  type DesignVersion
} from '@/shared/config/design-version';
import { resolveExperimentVariant } from '@/shared/lib/experiments/assignment';

interface InitializeOptions {
  envVersion?: string | null;
  experimentKey?: string | null;
  storage?: Storage;
}

const currentDesignVersion = ref<DesignVersion>(DEFAULT_DESIGN_VERSION);

const LEGACY_VERSION_MAP: Partial<Record<DesignVersion, DesignVersion>> = {
  v1: 'v2'
};

function normalizeVersion(candidate?: string | null): DesignVersion | null {
  if (!candidate) return null;
  const normalized = candidate.trim().toLowerCase();
  if (!DESIGN_VERSIONS.includes(normalized as DesignVersion)) return null;
  const mapped = LEGACY_VERSION_MAP[normalized as DesignVersion] ?? (normalized as DesignVersion);
  return mapped;
}

function resolveFromStorage(storage?: Storage): DesignVersion | null {
  if (!storage) return null;
  try {
    const stored = storage.getItem(DESIGN_VERSION_STORAGE_KEY);
    return normalizeVersion(stored);
  } catch {
    return null;
  }
}

function persist(version: DesignVersion, storage?: Storage) {
  if (!storage) return;
  try {
    storage.setItem(DESIGN_VERSION_STORAGE_KEY, version);
  } catch {
    // ignore storage errors (quota, disabled storage, etc.)
  }
}

export function initializeDesignVersion(options: InitializeOptions = {}) {
  const storage =
    options.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);

  const envVersion =
    normalizeVersion(options.envVersion) ??
    normalizeVersion(import.meta.env.VITE_UI_VERSION as string | undefined);

  if (envVersion) {
    setDesignVersion(envVersion, { storage });
    return;
  }

  const stored = resolveFromStorage(storage);
  if (stored) {
    setDesignVersion(stored, { storage });
    return;
  }

  const experimentKey = options.experimentKey ?? 'ui:design-version';
  const experimentVariant = resolveExperimentVariant({
    key: experimentKey,
    variants: DESIGN_VERSIONS,
    defaultVariant: DEFAULT_DESIGN_VERSION,
    storage
  });

  setDesignVersion(experimentVariant, { storage });
}

export function setDesignVersion(
  version: DesignVersion,
  options: { persist?: boolean; storage?: Storage } = {}
) {
  currentDesignVersion.value = version;
  if (options.persist !== false) {
    persist(
      version,
      options.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined)
    );
  }
}

export function useDesignVersion() {
  return computed(() => currentDesignVersion.value);
}

export function getDesignVersion(): DesignVersion {
  return currentDesignVersion.value;
}

export function isDesignVersion(version: DesignVersion) {
  return currentDesignVersion.value === version;
}

export const AVAILABLE_DESIGN_VERSIONS = [...DESIGN_VERSIONS];
