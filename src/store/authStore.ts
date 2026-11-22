import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, TOKEN_KEY } from '@/utils/api';
import type { User } from '@/utils/api';

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;

  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateMe: (patch: Partial<Pick<User, 'nickname' | 'avatar'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem(TOKEN_KEY),
      user: null,
      hydrated: false,

      login: async (username, password) => {
        const data = await authApi.login(username, password);
        localStorage.setItem(TOKEN_KEY, data.token);
        set({ token: data.token, user: data.user, hydrated: true });
        return data.user;
      },

      register: async (username, password) => {
        await authApi.register(username, password);
        const data = await authApi.login(username, password);
        localStorage.setItem(TOKEN_KEY, data.token);
        set({ token: data.token, user: data.user, hydrated: true });
        return data.user;
      },

      logout: async () => {
        try { await authApi.logout(); } catch { /* 401 就忽略 */ }
        localStorage.removeItem(TOKEN_KEY);
        set({ token: null, user: null });
      },

      fetchMe: async () => {
        if (!useAuthStore.getState().token) return;
        try {
          const user = await authApi.info();
          set({ user, hydrated: true });
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          set({ token: null, user: null, hydrated: true });
        }
      },

      updateMe: async (patch) => {
        const user = await authApi.updateProfile(patch);
        set({ user });
      }
    }),
    {
      name: 'memorize-words:auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.fetchMe();
      }
    }
  )
);
