import type { Router } from 'vue-router';

import { useSessionStore } from '@/shared/session';

export function registerGlobalGuards(router: Router) {
  router.beforeEach((to) => {
    const session = useSessionStore();

    if (to.meta.requiresParentAuth && !session.isParentAuthenticated) {
      return { name: 'parent-login', query: { redirect: to.fullPath } };
    }

    if (to.meta.parentGuestOnly && session.isParentAuthenticated) {
      if (session.isChildAuthenticated) {
        return { name: 'child-dashboard' };
      }
      return { name: 'child-login' };
    }

    if (to.meta.requiresChildAuth && !session.isChildAuthenticated) {
      const redirect = { redirect: to.fullPath };
      if (session.isParentAuthenticated) {
        return { name: 'child-login', query: redirect };
      }
      return { name: 'parent-login', query: redirect };
    }

    if (to.meta.childGuestOnly && session.isChildAuthenticated) {
      return { name: 'child-dashboard' };
    }

    return true;
  });
}
