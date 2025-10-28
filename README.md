# Frontend Standard — Vue 3 + TypeScript + Vite

Authoritative guide for building and maintaining a scalable single-repository Vue 3 application. Follow these conventions to keep the codebase consistent, testable, and easy to onboard.

## Folder Structure (Authoritative)

```
src/
  app/              # app bootstrap: providers, router, styles, global guards
  pages/            # route-level pages (lazy-loaded)
  widgets/          # UI compositions mixing multiple features/entities
  features/         # user actions (create-chore, redeem-reward, ...)
  entities/         # domain units (chore, child, reward, ...)
  shared/           # design system, api client, config, lib, i18n
```

### Layer Responsibilities & Import Boundaries

| Layer    | Owns                                                           | May import from                             | Public API rule                                                |
|----------|----------------------------------------------------------------|---------------------------------------------|----------------------------------------------------------------|
| `shared` | design tokens, UI kit, configs, utils, API clients, i18n      | `shared` only                               | Expose via `shared/index.ts`; upstream layers import from there |
| `entities` | domain models, DTO mappers, API hooks, presentational UI     | `shared`                                    | Each entity folder has `entities/<name>/index.ts` exporting allowed surface |
| `features` | actions that combine entities (mutations, flows, forms)     | `features` (self), `entities`, `shared`     | Expose via `features/<name>/index.ts`; pages/widgets import only via index |
| `widgets` | composite UI blocks combining multiple features/entities     | `widgets` (self), `features`, `entities`, `shared` | Export through `widgets/index.ts`                                  |
| `pages`  | route-level screens, data orchestration for routes            | All lower layers (`widgets`, `features`, `entities`, `shared`) | `pages/index.ts` exports route components and lazy loaders |
| `app`    | bootstrap, router, providers, global styles/guards            | All layers                                  | Keep `app/index.ts` as the single entry when bootstrapping |

**Import policy:** never deep-import internal files across layers. Every layer must export a public surface from its `index.ts` and consumers import from that file only.

### Scaffolding Templates

Provide a simple CLI (Plop or custom script) to scaffold entities and features:

- `pnpm plop entity` → prompts for `EntityName` (PascalCase) and optional REST endpoint.
  - Creates:
    - `src/entities/<entity>/index.ts`
    - `src/entities/<entity>/api/use<Entity>Query.ts`
    - `src/entities/<entity>/model/<entity>.ts`
    - `src/entities/<entity>/ui/<Entity>Card.vue`
    - Adds export to `src/entities/index.ts`
- `pnpm plop feature` → prompts for `FeatureName` (kebab-case) and related entity.
  - Creates:
    - `src/features/<feature>/index.ts`
    - `src/features/<feature>/model/use<Feature>Model.ts`
    - `src/features/<feature>/ui/<FeatureComponent>.vue`
    - `src/features/<feature>/lib/validation.ts`
    - Adds export to `src/features/index.ts`

Templates should include TypeScript aliases (`@/`) automatically and enforce Composition API patterns.

## Routing & Navigation

### Router Setup

- Use Vue Router with lazy-loaded route components from `pages/`.
- Define routes in `src/app/routes.ts`. Keep meta fields for auth, role-based access, and layout hints.
- Implement global guards in `src/app/router-guards.ts` (auth, RBAC, locale redirects).
- Enable scroll behavior to restore saved positions and handle anchor links.

```ts
// src/app/routes.ts
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home'),
    meta: { requiresAuth: true, roles: ['parent', 'child'] }
  },
  {
    path: '/chores/:choreId',
    name: 'chore-details',
    component: () => import('@/pages/chore-details'),
    props: (route) => ({ choreId: route.params.choreId as string }),
    meta: { requiresAuth: true, roles: ['parent', 'child'] }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/pages/admin-dashboard'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login'),
    meta: { guestOnly: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found')
  }
];
```

```ts
// src/app/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { registerGlobalGuards } from './router-guards';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  }
});

registerGlobalGuards(router);

export { router };
```

```ts
// src/app/router-guards.ts
import type { Router } from 'vue-router';
import { useSessionStore } from '@/shared/session';

export function registerGlobalGuards(router: Router) {
  router.beforeEach(async (to) => {
    const session = useSessionStore();

    if (to.meta.requiresAuth && !session.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (to.meta.roles && !session.allowedRoles(to.meta.roles as string[])) {
      return { name: 'home' };
    }

    if (to.meta.guestOnly && session.isAuthenticated) {
      return { name: 'home' };
    }

    return true;
  });
}
```

**URL patterns:** use kebab-case slugs or UUIDs in path params. Parse query params with `useRouteQuery` or dedicated helpers in `shared/lib/router`. Always sanitize navigation targets and centralize external link handling.

## State Management

- **Vue Query (@tanstack/vue-query):** use for server state, caching, pagination, and background refetch.
- **Pinia:** keep minimal global UI state (session/user, feature flags, layout toggles). Avoid storing server data that belongs in Vue Query.

### Query Key Conventions

`['resource', resourceId, { filters }]` — use tuples, keep stable ordering. Define constants in each entity (`entities/chore/api/query-keys.ts`).

### Vue Query Example

```ts
// src/entities/chore/api/useChoreListQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { choreApi } from './chore-api';
import type { Chore } from '../model/chore';

export function useChoreListQuery(childId: string) {
  return useQuery({
    queryKey: ['chores', childId],
    queryFn: () => choreApi.fetchList({ childId }),
    staleTime: 1000 * 60,
    keepPreviousData: true
  });
}

export function useCompleteChoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: choreApi.complete,
    onMutate: async ({ choreId }) => {
      await queryClient.cancelQueries({ queryKey: ['chores'] });
      const previous = queryClient.getQueriesData<Chore[]>({ queryKey: ['chores'] });
      queryClient.setQueryData<Chore[]>(['chores'], (old = []) =>
        old.map((chore) => (chore.id === choreId ? { ...chore, status: 'completed' } : chore))
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.childId] });
    }
  });
}
```

### Minimal Pinia Store

```ts
// src/shared/session/index.ts
import { defineStore } from 'pinia';

type Role = 'admin' | 'parent' | 'child';

interface SessionState {
  token: string | null;
  roles: Role[];
  userId: string | null;
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    token: null,
    roles: [],
    userId: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    allowedRoles: (state) => (required: Role[]) => required.some((role) => state.roles.includes(role))
  },
  actions: {
    setSession(payload: { token: string; roles: Role[]; userId: string }) {
      this.token = payload.token;
      this.roles = payload.roles;
      this.userId = payload.userId;
    },
    clearSession() {
      this.token = null;
      this.roles = [];
      this.userId = null;
    }
  }
});
```

## API Layer & Contracts

- Single Axios instance in `shared/api/http.ts`.
- Interceptors handle base URL, auth headers, CSRF/token refresh, error normalization.
- Types generated via `openapi-typescript` script (`pnpm api:generate`). Keep generated files under `src/shared/api/generated/`.
- Map API errors to user-facing notifications via `shared/lib/notifications`.

```ts
// src/shared/api/http.ts
import axios from 'axios';
import { useSessionStore } from '@/shared/session';
import { notifyError } from '@/shared/lib/notifications';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000
});

http.interceptors.request.use((config) => {
  const session = useSessionStore();
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      useSessionStore().clearSession();
    }
    if (status >= 500) {
      notifyError('Something went wrong. Please try again.');
    }
    return Promise.reject(error);
  }
);
```

### OpenAPI Code Generation

- Script `pnpm api:generate`:

```json
// package.json (excerpt)
{
  "scripts": {
    "api:generate": "openapi-typescript http://localhost:8000/api/documentation/docs?api-docs.json --output src/shared/api/generated/schema.ts && tsx scripts/generate-api-client.ts"
  }
}
```

`scripts/generate-api-client.ts` should build lightweight wrappers leveraging the generated types for type-safe Axios calls.

### Entity API Example

```
src/entities/chore/
  api/
    chore-api.ts
    useChoreListQuery.ts
  model/
    chore.ts
  ui/
    ChoreCard.vue
  index.ts
```

```ts
// src/entities/chore/api/chore-api.ts
import { http } from '@/shared/api/http';
import type { paths } from '@/shared/api/generated/schema';

type ChoreListResponse = paths['/chores']['get']['responses']['200']['content']['application/json'];
type CompleteChoreRequest = paths['/chores/{id}/complete']['post']['requestBody']['content']['application/json'];

export const choreApi = {
  async fetchList(params: { childId: string }): Promise<ChoreListResponse> {
    const { data } = await http.get('/chores', { params });
    return data;
  },
  async complete(payload: CompleteChoreRequest & { childId: string }) {
    const { data } = await http.post(`/chores/${payload.id}/complete`, payload);
    return data;
  }
};
```

```ts
// src/entities/chore/model/chore.ts
export interface Chore {
  id: string;
  title: string;
  dueTime: string;
  points: number;
  status: 'pending' | 'completed' | 'approved';
}
```

```vue
<!-- src/entities/chore/ui/ChoreCard.vue -->
<template>
  <article class="chore-card" data-test-id="chore-card">
    <header>
      <h3>{{ chore.title }}</h3>
      <span>{{ chore.points }} pts</span>
    </header>
    <p>{{ chore.dueTime }}</p>
    <slot name="actions" />
  </article>
</template>

<script setup lang="ts">
import type { Chore } from '../model/chore';

defineProps<{
  chore: Chore;
}>();
</script>

<style scoped>
.chore-card {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--surface);
}
</style>
```

```ts
// src/entities/chore/index.ts
export * from './api/chore-api';
export * from './api/useChoreListQuery';
export * from './model/chore';
export { default as ChoreCard } from './ui/ChoreCard.vue';
```

## Feature Example

```
src/features/chore-create/
  index.ts
  model/
    useChoreCreateModel.ts
  ui/
    ChoreCreateForm.vue
  lib/
    validation.ts
```

```ts
// src/features/chore-create/lib/validation.ts
import { z } from 'zod';

export const choreCreateSchema = z.object({
  title: z.string().min(2),
  dueTime: z.string(),
  points: z.number().int().positive()
});

export type ChoreCreateInput = z.infer<typeof choreCreateSchema>;
```

```ts
// src/features/chore-create/model/useChoreCreateModel.ts
import { useForm } from '@vueuse/form';
import { choreCreateSchema } from '../lib/validation';
import { useCompleteChoreMutation } from '@/entities/chore';

export function useChoreCreateModel(childId: string) {
  const mutation = useCompleteChoreMutation();

  const form = useForm({
    validationSchema: choreCreateSchema,
    initialValues: {
      title: '',
      dueTime: '',
      points: 5
    },
    onSubmit: async (values) => {
      await mutation.mutateAsync({ ...values, childId });
    }
  });

  return {
    form,
    isSubmitting: mutation.isLoading,
    error: mutation.error
  };
}
```

```vue
<!-- src/features/chore-create/ui/ChoreCreateForm.vue -->
<template>
  <form @submit.prevent="form.submit()" data-test-id="chore-create-form">
    <label>
      Title
      <input v-model="form.values.title" type="text" required />
      <span v-if="form.errors.title">{{ form.errors.title }}</span>
    </label>
    <label>
      Due Time
      <input v-model="form.values.dueTime" type="time" required />
      <span v-if="form.errors.dueTime">{{ form.errors.dueTime }}</span>
    </label>
    <label>
      Points
      <input v-model.number="form.values.points" type="number" min="1" required />
      <span v-if="form.errors.points">{{ form.errors.points }}</span>
    </label>
    <button type="submit" :disabled="isSubmitting">
      <span v-if="isSubmitting">Saving...</span>
      <span v-else>Create Chore</span>
    </button>
    <p v-if="error" role="alert">{{ error.message }}</p>
  </form>
</template>

<script setup lang="ts">
import { useChoreCreateModel } from '../model/useChoreCreateModel';

const props = defineProps<{
  childId: string;
}>();

const { form, isSubmitting, error } = useChoreCreateModel(props.childId);
</script>
```

```ts
// src/features/chore-create/index.ts
export { default as ChoreCreateForm } from './ui/ChoreCreateForm.vue';
export * from './model/useChoreCreateModel';
```

## UI System

- Store base components and headless primitives in `shared/ui`.
- Favor accessible, headless components (e.g., `Dialog`, `Toggle`) with style wrappers in features/widgets.
- Maintain theme tokens in `shared/ui/tokens.ts`. Support light/dark via CSS variables.

### Design Versioning & Experiments

- Core version registry lives in `shared/config/design-version.ts`; the active version is resolved by `shared/lib/design/designVersion.ts`.
- Call `initializeDesignVersion()` once during app bootstrap (`src/app/index.ts`) so `VITE_UI_VERSION`, persisted overrides, or experiment assignments decide which UI version renders.
- A/B helpers sit in `shared/lib/experiments/` (`resolveExperimentVariant`, `useExperimentVariant`). They persist bucket assignments to `localStorage`.
- Feature UIs expose stable presenters while concrete markup lives under `variants/v*`. Example:
  ```
  features/auth-kid/ui/
    login-form/
      KidLoginForm.presenter.vue  // reads design version, delegates to variants
      variants/
        v1/KidLoginForm.vue
    profile-picker/
      KidProfilePicker.presenter.vue
      variants/
        KidProfilePicker.v1.vue
  ```
  Adding `v2`/`v3` means creating new variant folders and wiring them in the presenter `variantMap`.
- Keep presenter contracts identical to avoid page-level churn; toggle the design by switching the global version (`setDesignVersion('v2')`) or feature-flagging via experiments.

### Accessibility Checklist

- All interactive elements must be reachable via keyboard (`Tab` order, `Enter`/`Space` triggers).
- Provide `aria-*` attributes, labels, and focus traps for modals.
- Use logical heading hierarchy and skip links.
- Include visible focus states and adhere to WCAG 2.1 AA contrast.

### I18n Conventions

- Use `vue-i18n` with message keys following `layer.scope.message` (e.g., `features.choreCreate.submitButton`).
- Lazy-load locale messages via dynamic imports in `app/i18n.ts`.
- Keep locale-specific copy in `src/shared/i18n/locales/<locale>.json`. Never hardcode strings in components.

## Forms & Validation

- Use `@vueuse/form` or `vee-validate` with schema validation (`zod` preferred).
- Control inputs via `v-model` with typed refs; disable submit while pending.
- Centralize form helpers in `shared/lib/forms`.

```ts
// src/shared/lib/forms/submit.ts
export async function submitWithToast<T>(submit: () => Promise<T>, message: string) {
  try {
    await submit();
    // display success toast
  } catch (error) {
    // display error toast
    throw error;
  }
}
```

## Testing Strategy

- **Unit (Vitest + Vue Test Utils):** entities models, utilities. Location: `src/**/__tests__/`.
- **Integration:** feature UI with MSW to stub API responses.
- **E2E (Playwright or Cypress):** critical user journeys (auth, chore completion, rewards).
- Use `data-test-id` attributes for stable selectors.
- Tag slow E2E tests with `@slow` to segregate in CI.

```ts
// vitest.config.ts (excerpt)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/shared/tests/setup.ts']
  }
});
```

```ts
// src/entities/chore/__tests__/chore.test.ts
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/vue';
import { ChoreCard } from '@/entities/chore';

describe('ChoreCard', () => {
  it('shows title and points', () => {
    const { getByText } = render(ChoreCard, {
      props: {
        chore: { id: '1', title: 'Clean Room', dueTime: '08:00', points: 10, status: 'pending' }
      }
    });
    expect(getByText('Clean Room')).toBeTruthy();
    expect(getByText('10 pts')).toBeTruthy();
  });
});
```

```ts
// tests/e2e/smoke.spec.ts (Playwright example)
import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('parent can log in and view chores', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="email"]', 'parent@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page.getByTestId('chore-card').first()).toBeVisible();
  });
});
```

## Performance & DX

- Lazy load routes and heavy widgets. Prefetch on hover via `router.prefetch`.
- Use `<Suspense>` for async components; memoize heavy computations with `computed`.
- Add ESLint rule to prevent large module imports (`no-restricted-imports` listing `lodash` default).
- Analyze bundles with `pnpm analyze` using `rollup-plugin-visualizer`.
- Maintain `.env`, `.env.stage`, `.env.prod`; commit `.env.example` only.

## Security & Privacy

- Prefer HTTP-only cookies for auth tokens; if using bearer tokens, store in memory and refresh silently.
- Sanitize user-entered HTML with `DOMPurify` before rendering.
- Mitigate CSRF via backend-provided tokens and same-site cookies.
- Do not log PII; scrub emails/IDs before sending to observability tools.
- Content Security Policy minimal baseline:

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' https://api.example.com;
```

## Styling

- Option A: Tailwind (`tailwind.config.js` aligned with design tokens). Co-locate component styles via utility classes.
- Option B: PostCSS modules + CSS variables (`shared/ui/styles/tokens.css`).
- Global reset (`shared/ui/styles/reset.css`) imported in `app/index.ts`.
- Use BEM or utility-first pattern consistently. Support dark mode via `class="dark"` toggle or media query.

## Linting, Formatting & Git Hygiene

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: ['@vue/eslint-config-typescript', '@vue/eslint-config-prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [{ name: '@/shared', importNames: ['default'], message: 'Import named exports instead.' }]
      }
    ],
    'import/order': [
      'error',
      { groups: [['builtin', 'external'], ['internal']], 'newlines-between': 'always' }
    ]
  }
};
```

```json
// .prettierrc
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "none",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

```js
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'chore', 'refactor', 'test', 'build', 'ci', 'perf', 'revert', 'style']
    ]
  }
};
```

- Husky hooks:
  - `pre-commit`: `pnpm lint-staged`
  - `commit-msg`: `pnpm commitlint --edit $1`
- `lint-staged` example:

```json
{
  "lint-staged": {
    "*.{ts,tsx,vue}": ["pnpm eslint --fix", "pnpm prettier --write"],
    "*.{js,json,md,css}": ["pnpm prettier --write"]
  }
}
```

- Conventional commits: `feat(chore): add streak badge`, `fix(auth): handle expired session`.

## CI (Lightweight)

Minimal GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test -- --runInBand
      - run: pnpm build
      - run: pnpm test:e2e -- --project smoke --headless
```

## Readability & Documentation

- README should include stack overview, scripts, environment setup, scaffolding instructions, testing guide, release notes link.
- Use ADRs in `docs/adrs/` when making significant architectural decisions (e.g., switching state management approach).

### README Skeleton

```md
# Kids Chores Vue SPA

## Stack
Vue 3, TypeScript, Vite, Vue Router, Pinia, Vue Query, Tailwind, Vitest, Playwright.

## Scripts
- `pnpm dev`: start dev server
- `pnpm build`: production build
- `pnpm test`: unit/integration tests
- `pnpm test:e2e`: Playwright smoke suite
- `pnpm lint`: ESLint
- `pnpm typecheck`: vue-tsc type check

## Environment
Copy `.env.example` to `.env.local` and fill API credentials.

## Scaffolding
- `pnpm plop entity`
- `pnpm plop feature`

## Testing
Describe fast unit tests vs slow E2E conventions.

## Release Notes
Link to changelog.
```

## MSW Handler Example

```ts
// src/shared/tests/msw/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/chores', () =>
    HttpResponse.json([
      { id: '1', title: 'Clean Room', dueTime: '08:00', points: 10, status: 'pending' }
    ])
  )
];
```

## .env Example & Vite Config

```env
# .env.example
VITE_APP_NAME=KidsChores
VITE_API_URL=http://localhost:8000/api
VITE_SENTRY_DSN=
VITE_STRIPE_PUBLIC_KEY=
```

```ts
// vite.config.ts (excerpt)
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@headlessui/vue']
        }
      }
    }
  }
});
```

## Checklists

### Add a New Entity
- [ ] Scaffold via `pnpm plop entity`
- [ ] Define model interfaces and API types
- [ ] Expose public API through `entities/<name>/index.ts`
- [ ] Add unit tests and MSW handlers
- [ ] Document i18n strings and add to locales

### Add a New Feature
- [ ] Scaffold via `pnpm plop feature`
- [ ] Implement schema validation and form states
- [ ] Use Vue Query mutations for server updates
- [ ] Add integration test with MSW
- [ ] Update README or doc if user-facing change

### Before Merging
- [ ] `pnpm lint && pnpm test && pnpm typecheck`
- [ ] Ensure accessibility review (keyboard + screen reader sanity)
- [ ] Verify translations updated
- [ ] Confirm stories/docs updated (if using Storybook)
- [ ] Provide Conventional Commit message

## Quick Start

1. `corepack enable && pnpm install`
2. Copy `.env.example` to `.env.local` and configure API URL.
3. `pnpm dev -- --host` to start the app.
4. `pnpm api:generate` to sync OpenAPI types.
5. `pnpm test` for unit tests; `pnpm test:e2e` for smoke suite.
6. `pnpm plop entity` or `pnpm plop feature` to scaffold new modules.
7. Run `pnpm lint` and `pnpm typecheck` before pushing.
