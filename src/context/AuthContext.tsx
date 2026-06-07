import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/migration';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (displayName: string, username: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try { return { user: null, loading: !!localStorage.getItem('auth_token') }; }
    catch { return { user: null, loading: false }; }
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) return;
    apiClient.me()
      .then((user) => setState({ user, loading: false }))
      .catch(() => {
        localStorage.removeItem('auth_token');
        setState({ user: null, loading: false });
      });
  }, []);

  const login = async (username: string, password: string) => {
    const { token, user } = await apiClient.login(username, password);
    localStorage.setItem('auth_token', token);
    setState({ user, loading: false });
  };

  const register = async (displayName: string, username: string, password: string) => {
    const { token, user } = await apiClient.register(displayName, username, password);
    localStorage.setItem('auth_token', token);
    setState({ user, loading: false });
  };

  const loginWithGoogle = async (credential: string) => {
    const { token, user } = await apiClient.googleAuth(credential);
    localStorage.setItem('auth_token', token);
    setState({ user, loading: false });
  };

  const logout = () => {
    apiClient.logout();
    localStorage.removeItem('auth_token');
    setState({ user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
