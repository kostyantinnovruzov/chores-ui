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

interface SessionPair<TUser> {
  token: string | null;
  user: TUser | null;
}

interface SessionState {
  parent: SessionPair<ParentUser>;
  child: SessionPair<ChildUser>;
}

const STORAGE_KEYS = {
  parent: 'session.parent',
  child: 'session.child'
} as const;

function loadFromStorage<TUser>(key: string): SessionPair<TUser> {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as SessionPair<TUser>;
    return {
      token: parsed?.token ?? null,
      user: parsed?.user ?? null
    };
  } catch {
    window.localStorage.removeItem(key);
    return { token: null, user: null };
  }
}

function saveToStorage<TUser>(key: string, value: SessionPair<TUser>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function clearStorage(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    parent: loadFromStorage<ParentUser>(STORAGE_KEYS.parent),
    child: loadFromStorage<ChildUser>(STORAGE_KEYS.child)
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
      return (required: string[]) => required.some((role) => this.roles.includes(role as Role));
    },
    childId: (state) => state.child.user?.id ?? null
  },
  actions: {
    setParentSession(payload: { token: string; user: ParentUser }) {
      this.parent = {
        token: payload.token,
        user: payload.user
      };
      saveToStorage(STORAGE_KEYS.parent, this.parent);
    },
    clearParentSession() {
      this.parent = {
        token: null,
        user: null
      };
      clearStorage(STORAGE_KEYS.parent);
    },
    setChildSession(payload: { token: string; user: ChildUser }) {
      this.child = {
        token: payload.token,
        user: payload.user
      };
      saveToStorage(STORAGE_KEYS.child, this.child);
    },
    clearChildSession() {
      this.child = {
        token: null,
        user: null
      };
      clearStorage(STORAGE_KEYS.child);
    },
    clearAll() {
      this.clearChildSession();
      this.clearParentSession();
    }
  }
});
