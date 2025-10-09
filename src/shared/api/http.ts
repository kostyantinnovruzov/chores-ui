import axios from 'axios';

import { getEnv } from '@/shared/config/env';
import { notifyError } from '@/shared/lib/notifications';
import { useSessionStore } from '@/shared/session';

const { apiUrl } = getEnv();

export const http = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 10_000,
  headers: {
    Accept: 'application/json'
  }
});

http.interceptors.request.use((config) => {
  const session = useSessionStore();
  if (!config.headers?.Authorization) {
    const token = session.activeToken;
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const session = useSessionStore();
      const authHeader: string | undefined = error.config?.headers?.Authorization;
      const requestUrl = error.config?.url ?? '';
      const isKidLoginRequest = typeof requestUrl === 'string' && requestUrl.includes('auth/kids/login');
      const parentToken = session.parentToken;
      const childToken = session.childToken;

      if (authHeader && parentToken && authHeader.includes(parentToken)) {
        if (!isKidLoginRequest) {
          session.clearAll();
        }
      } else if (authHeader && childToken && authHeader.includes(childToken)) {
        session.clearChildSession();
      } else if (!isKidLoginRequest) {
        session.clearAll();
      }
    }
    if (status && status >= 500) {
      notifyError('Something went wrong. Please try again.');
    }
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error('Request failed'));
  }
);
