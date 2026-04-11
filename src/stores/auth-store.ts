'use client';

import { create } from 'zustand';
import { api } from '@/lib/api-client';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  init: () => {
    api.init();
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    api.get<{ id: string; email: string; displayName: string; role: any; isActive: boolean; createdAt: string }>('/auth/me')
      .then((user) => set({ user, isAuthenticated: true, isLoading: false }))
      .catch(() => {
        api.setToken(null);
        set({ isLoading: false });
      });
  },

  login: async (email, password) => {
    const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { email, password });
    api.setToken(data.accessToken);
    api.setRefreshToken(data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (email, password, displayName) => {
    const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', { email, password, displayName });
    api.setToken(data.accessToken);
    api.setRefreshToken(data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: () => {
    const refreshToken = api.getRefreshToken();
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    api.setToken(null);
    api.setRefreshToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
