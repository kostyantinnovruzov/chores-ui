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
    if (status && status >= 500) {
      notifyError('Something went wrong. Please try again.');
    }
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error('Request failed'));
  }
);
