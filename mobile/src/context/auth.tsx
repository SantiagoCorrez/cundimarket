import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { ApiError, api, hasAuthToken, setAuthToken } from '@/api/client';
import { connectivity } from '@/api/connectivity';
import { cachePurgeScope, setCacheScope } from '@/api/offline-cache';
import { purgeOutbox } from '@/api/outbox';
import type { Role, SessionUser } from '@/api/types';
import { Palette } from '@/constants/theme';
import { cacheStorage } from '@/utils/cache-storage';
import { secureStorage } from '@/utils/secure-storage';

const TOKEN_KEY = 'cundi_token';
/** Copia local del usuario: permite abrir la app con la sesión iniciada aunque no haya conexión. */
const USER_KEY = 'cm:user';

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
  updateMunicipality: (municipality: string) => Promise<void>;
  /** Elimina definitivamente la cuenta (pide la contraseña) y cierra la sesión local. */
  deleteAccount: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readStoredUser(): Promise<SessionUser | null> {
  try {
    const raw = await cacheStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

/** Quita todo rastro local de la sesión: token, usuario, caché y acciones pendientes. */
async function wipeLocalSession(userId: string | null) {
  await secureStorage.removeItem(TOKEN_KEY);
  await cacheStorage.removeItem(USER_KEY);
  setAuthToken(null);
  setCacheScope(null);
  if (userId) {
    await cachePurgeScope(userId);
    await purgeOutbox(userId);
  }
  connectivity.setPending(0);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    /** Confirma con el servidor que la sesión sigue vigente. Sin conexión conserva la sesión guardada. */
    async function validate() {
      try {
        const { user: me } = await api.get<{ user: SessionUser }>('/api/mobile/auth/me', { cache: false });
        if (!active) return;
        setCacheScope(me.id);
        await cacheStorage.setItem(USER_KEY, JSON.stringify(me));
        setUser(me);
      } catch (e) {
        // Solo se cierra la sesión si el servidor dice que ya no es válida; un fallo de red no cierra nada.
        if (active && e instanceof ApiError && (e.status === 401 || e.status === 404)) {
          const stored = await readStoredUser();
          await wipeLocalSession(stored?.id ?? null);
          setUser(null);
        }
      }
    }

    (async () => {
      const token = await secureStorage.getItem(TOKEN_KEY);
      if (token) {
        setAuthToken(token);
        const stored = await readStoredUser();
        if (stored && active) {
          setCacheScope(stored.id);
          setUser(stored);
        }
      }
      if (active) setLoading(false);
      if (token) void validate();
    })();

    // Tras estar sin conexión, vuelve a validar (por si la sesión venció o no había copia local).
    const off = connectivity.onRecover(() => {
      if (hasAuthToken()) void validate();
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  async function applySession(token: string, sessionUser: SessionUser) {
    await secureStorage.setItem(TOKEN_KEY, token);
    await cacheStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setAuthToken(token);
    setCacheScope(sessionUser.id);
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
      updateMunicipality: async (municipality) => {
        const { token, user: sessionUser } = await api.post<{ token: string; user: SessionUser }>(
          '/api/mobile/auth/municipality',
          { municipality },
        );
        await applySession(token, sessionUser);
      },
      deleteAccount: async (password) => {
        await api.post('/api/mobile/auth/delete-account', { password });
        await wipeLocalSession(user?.id ?? null);
        setUser(null);
      },
      logout: async () => {
        await wipeLocalSession(user?.id ?? null);
        setUser(null);
      },
    }),
    [user, loading],
  );

  // Hasta leer la sesión guardada no se muestran pantallas (evita pedir datos como visitante por error).
  if (loading) return <View style={{ flex: 1, backgroundColor: Palette.background }} />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
