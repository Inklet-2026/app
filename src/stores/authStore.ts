import { create } from "zustand";
import { api, setAuthToken } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, user } = await api.login(email, password);
      setAuthToken(token);
      set({ token, user, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Login failed");
    }
  },
  logout: () => { setAuthToken(null); set({ user: null, token: null }); },
  loadToken: (token) => {
    setAuthToken(token);
    set({ token });
    api.getUser().then((user) => set({ user })).catch(() => {
      setAuthToken(null);
      set({ token: null });
    });
  },
}));
