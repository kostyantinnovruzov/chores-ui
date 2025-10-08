import { defineStore } from 'pinia';

type Role = 'admin' | 'parent' | 'child';

interface ParentUser {
  id: number;
  type: Role;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  timezone: string | null;
  status: 'active' | 'inactive' | (string & {});
}

interface ChildUser {
  id: number;
  type: Extract<Role, 'child'>;
  nickname: string;
  parentId: number;
  avatarPath: string | null;
  timezone: string;
  status: 'active' | 'inactive' | (string & {});
}

interface SessionState {
  parent: {
    token: string | null;
    user: ParentUser | null;
  };
  child: {
    token: string | null;
    user: ChildUser | null;
  };
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    parent: {
      token: null,
      user: null
    },
    child: {
      token: null,
      user: null
    }
  }),
  getters: {
    parentToken: (state) => state.parent.token,
    childToken: (state) => state.child.token,
    activeToken: (state) => state.child.token ?? state.parent.token ?? null,
    isParentAuthenticated: (state) => Boolean(state.parent.token),
    isChildAuthenticated: (state) => Boolean(state.child.token),
    isAuthenticated(): boolean {
      return this.isChildAuthenticated || this.isParentAuthenticated;
    },
    roles: (state): Role[] => {
      const roles: Role[] = [];
      const parentRole = state.parent.user?.type;
      if (parentRole) {
        roles.push(parentRole);
      }
      if (state.child.user) {
        roles.push('child');
      }
      return roles;
    },
    hasRole(): (required: string[]) => boolean {
      return (required: string[]) =>
        required.some((role) => this.roles.includes(role as Role));
    },
    childId: (state) => state.child.user?.id ?? null
  },
  actions: {
    setParentSession(payload: { token: string; user: ParentUser }) {
      this.parent = {
        token: payload.token,
        user: payload.user
      };
    },
    clearParentSession() {
      this.parent = {
        token: null,
        user: null
      };
    },
    setChildSession(payload: { token: string; user: ChildUser }) {
      this.child = {
        token: payload.token,
        user: payload.user
      };
    },
    clearChildSession() {
      this.child = {
        token: null,
        user: null
      };
    },
    clearAll() {
      this.clearChildSession();
      this.clearParentSession();
    }
  }
});
