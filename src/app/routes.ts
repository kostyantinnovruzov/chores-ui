import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'child-dashboard',
    component: () => import('@/pages/dashboard-child'),
    meta: { requiresAuth: true, roles: ['child'] }
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
