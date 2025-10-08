import type { Router } from 'vue-router';

import { useSessionStore } from '@/shared/session';

export function registerGlobalGuards(router: Router) {
  router.beforeEach((to) => {
    const session = useSessionStore();

    if (to.meta.requiresAuth && !session.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (Array.isArray(to.meta.roles) && !session.hasRole(to.meta.roles as string[])) {
      return { name: 'child-dashboard' };
    }

    if (to.meta.guestOnly && session.isAuthenticated) {
      return { name: 'child-dashboard' };
    }

    return true;
  });
}
