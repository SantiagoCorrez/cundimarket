import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, setAuthToken } from '@/api/client';
import type { Role, SessionUser } from '@/api/types';
import { secureStorage } from '@/utils/secure-storage';

const TOKEN_KEY = 'cundi_token';

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    municipality?: string;
    role?: Role;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await secureStorage.getItem(TOKEN_KEY);
      if (token) {
        setAuthToken(token);
        try {
          const { user: me } = await api.get<{ user: SessionUser }>('/api/mobile/auth/me');
          setUser(me);
        } catch {
          await secureStorage.removeItem(TOKEN_KEY);
          setAuthToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function applySession(token: string, sessionUser: SessionUser) {
    await secureStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(sessionUser);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const { token, user: sessionUser } = await api.post<{ token: string; user: SessionUser }>(
          '/api/mobile/auth/login',
          { email, password },
        );
        await applySession(token, sessionUser);
      },
      register: async (input) => {
        const { token, user: sessionUser } = await api.post<{ token: string; user: SessionUser }>(
          '/api/mobile/auth/register',
          input,
        );
        await applySession(token, sessionUser);
      },
      logout: async () => {
        await secureStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
