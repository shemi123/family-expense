import { create } from 'zustand';
import { AuthResponse, Role } from '../types/auth';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  familyId: string;
  familyName: string;
  currency: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const STORAGE_KEY_TOKEN = 'family_budget_token';
const STORAGE_KEY_USER = 'family_budget_user';

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
  const storedUser = localStorage.getItem(STORAGE_KEY_USER);

  let initialUser: AuthUser | null = null;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }

  return {
    token: storedToken,
    user: initialUser,
    isAuthenticated: !!storedToken,
    login: (data: AuthResponse) => {
      const user: AuthUser = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        familyId: data.familyId,
        familyName: data.familyName,
        currency: data.currency,
      };
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ token: data.token, user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
