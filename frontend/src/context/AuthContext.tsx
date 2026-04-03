import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "../types";
import { authApi } from "../lib/api";
import { getToken, setToken, setStoredUser, getStoredUser, clearAuth } from "../lib/storage";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = getToken();
    const stored = getStoredUser();
    let user: User | null = null;
    try {
      if (stored) user = JSON.parse(stored);
    } catch {}
    return {
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading: !!token,
    };
  });

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getProfile();
      const user = res.data as User;
      setStoredUser(user);
      setState((s) => ({ ...s, user, isAuthenticated: true, isLoading: false }));
    } catch {
      clearAuth();
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    if (state.token) {
      refreshUser();
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user, token } = res.data;
    setToken(token);
    setStoredUser(user);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await authApi.register(email, password, name);
    const { user, token } = res.data;
    setToken(token);
    setStoredUser(user);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    clearAuth();
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
