export const DESIGN_VERSIONS = ['v1', 'v2', 'v3'] as const;

export type DesignVersion = (typeof DESIGN_VERSIONS)[number];

export const DEFAULT_DESIGN_VERSION: DesignVersion = 'v2';

export const DESIGN_VERSION_STORAGE_KEY = 'ui:design-version';
