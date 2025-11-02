import axios, { AxiosHeaders } from 'axios';

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
  const headers =
    config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
  if (!headers.has('Authorization')) {
    const token = session.activeToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  config.headers = headers;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const session = useSessionStore();
      const rawHeaders = error.config?.headers;
      const authHeaderValue =
        rawHeaders instanceof AxiosHeaders
          ? rawHeaders.get('Authorization')
          : rawHeaders?.Authorization;
      let authHeader: string | undefined;
      if (typeof authHeaderValue === 'string') {
        authHeader = authHeaderValue;
      } else if (Array.isArray(authHeaderValue) && authHeaderValue.length) {
        authHeader = authHeaderValue[0];
      } else {
        authHeader = undefined;
      }
      const requestUrl = error.config?.url ?? '';
      const isKidLoginRequest =
        typeof requestUrl === 'string' && requestUrl.includes('auth/kids/login');
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
