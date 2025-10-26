import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import AppRoot from './AppRoot.vue';
import { router } from './router';

import { createI18nInstance } from '@/shared/i18n';
import { initializeDesignVersion } from '@/shared/lib/design';

import '@/app/styles/index.css';

const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
        placeholderData: (previousData: unknown) => previousData
      },
      mutations: {
        retry: 0
      }
    }
  }
};

export function bootstrapApp() {
  initializeDesignVersion();

  const app = createApp(AppRoot);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);
  app.use(VueQueryPlugin, vueQueryOptions);
  app.use(createI18nInstance());

  app.mount('#app');
}
