import { createRouter, createWebHistory } from 'vue-router';

import { registerGlobalGuards } from './router-guards';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  }
});

registerGlobalGuards(router);

export { router };
