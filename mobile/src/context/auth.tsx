import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { ApiError, api, hasAuthToken, setAuthToken } from '@/api/client';
import { connectivity } from '@/api/connectivity';
import { cachePurgeScope, setCacheScope } from '@/api/offline-cache';
import { purgeOutbox } from '@/api/outbox';
import type { Role, SessionUser } from '@/api/types';
import { MUNICIPALITIES, PILOT_MUNICIPALITY } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';
import { cacheStorage } from '@/utils/cache-storage';
import { googleSignOut } from '@/utils/google-signin';
import { unregisterPush } from '@/utils/push';
import { secureStorage } from '@/utils/secure-storage';

const TOKEN_KEY = 'cundi_token';
/** Copia local del usuario: permite abrir la app con la sesión iniciada aunque no haya conexión. */
const USER_KEY = 'cm:user';
/** Municipio elegido por un visitante sin sesión. */
const GUEST_MUNICIPALITY_KEY = 'cm:municipality';

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
  /** Municipio elegido: el del perfil o, sin sesión, el que el visitante eligió en este dispositivo. */
  municipality: string;
  /** Cambia el municipio (en el perfil si hay sesión; si no, solo en este dispositivo). */
  selectMunicipality: (municipality: string) => Promise<void>;
  /**
   * Inicia sesión con Google ({ idToken }) o Apple ({ identityToken, authorizationCode, fullName }).
   * Si la cuenta es nueva y no se envían los datos de registro (con acceptTerms), devuelve needsSignup.
   */
  loginWithSocial: (
    provider: 'google' | 'apple',
    credentials: Record<string, unknown>,
    signup?: { role: Role; municipality: string; acceptTerms: true },
  ) => Promise<{ needsSignup: true; email: string; name: string } | null>;
  /** Elimina definitivamente la cuenta (con la contraseña, o escribiendo ELIMINAR si es de Google) y cierra la sesión local. */
  deleteAccount: (confirmation: { password?: string; confirm?: string }) => Promise<void>;
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
  await googleSignOut();
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
  const [guestMunicipality, setGuestMunicipality] = useState(PILOT_MUNICIPALITY);

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
      const savedMunicipality = await cacheStorage.getItem(GUEST_MUNICIPALITY_KEY).catch(() => null);
      if (active && savedMunicipality && MUNICIPALITIES.includes(savedMunicipality)) setGuestMunicipality(savedMunicipality);
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

  const value = useMemo<AuthContextValue>(() => {
    async function updateMunicipality(municipality: string) {
      const { token, user: sessionUser } = await api.post<{ token: string; user: SessionUser }>(
        '/api/mobile/auth/municipality',
        { municipality },
      );
      await applySession(token, sessionUser);
    }

    return {
      user,
      loading,
      municipality: user?.municipality ?? guestMunicipality,
      selectMunicipality: async (municipality) => {
        if (user) {
          if (user.municipality !== municipality) await updateMunicipality(municipality);
          return;
        }
        setGuestMunicipality(municipality);
        await cacheStorage.setItem(GUEST_MUNICIPALITY_KEY, municipality);
      },
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
      updateMunicipality,
      loginWithSocial: async (provider, credentials, signup) => {
        const r = await api.post<
          { token: string; user: SessionUser } | { needsSignup: true; email: string; name: string }
        >(`/api/mobile/auth/${provider}`, { ...credentials, ...signup });
        if ('needsSignup' in r) return r;
        await applySession(r.token, r.user);
        return null;
      },
      deleteAccount: async (confirmation) => {
        await api.post('/api/mobile/auth/delete-account', confirmation);
        await wipeLocalSession(user?.id ?? null);
        setUser(null);
      },
      logout: async () => {
        await unregisterPush();
        await wipeLocalSession(user?.id ?? null);
        setUser(null);
      },
    };
  }, [user, loading, guestMunicipality]);

  // Hasta leer la sesión guardada no se muestran pantallas (evita pedir datos como visitante por error).
  if (loading) return <View style={{ flex: 1, backgroundColor: Palette.background }} />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
