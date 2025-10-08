import { defineStore } from 'pinia';

type Role = 'admin' | 'parent' | 'child';

interface SessionUser {
  id: number;
  type: Role;
  nickname: string;
  parentId: number;
  avatarPath: string | null;
  timezone: string;
  status: 'active' | 'inactive' | (string & {});
}

interface SessionState {
  token: string | null;
  user: SessionUser | null;
  roles: Role[];
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    token: null,
    user: null,
    roles: []
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    hasRole: (state) => (required: string[]) =>
      required.some((role) => state.roles.includes(role as Role)),
    childId: (state) => state.user?.id ?? null
  },
  actions: {
    setSession(payload: { token: string; user: SessionUser; roles?: Role[] }) {
      this.token = payload.token;
      this.user = payload.user;
      this.roles = payload.roles ?? [payload.user.type];
    },
    clearSession() {
      this.token = null;
      this.user = null;
      this.roles = [];
    }
  }
});
