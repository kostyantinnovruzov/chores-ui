import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'child-dashboard',
    component: () => import('@/pages/dashboard-child'),
    meta: { requiresChildAuth: true }
  },
  {
    path: '/parent/login',
    name: 'parent-login',
    component: () => import('@/pages/login-parent'),
    meta: { parentGuestOnly: true }
  },
  {
    path: '/child/login',
    name: 'child-login',
    component: () => import('@/pages/login'),
    meta: { requiresParentAuth: true, childGuestOnly: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found')
  }
];
