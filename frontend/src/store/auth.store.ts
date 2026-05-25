import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'STUDENT' | 'HEAD_DEPARTMENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      
      login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
      
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      
      setToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
