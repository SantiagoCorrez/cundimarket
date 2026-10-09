import { router } from 'expo-router';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth';

/**
 * Llamar o escribir por WhatsApp es solo para usuarios registrados:
 * si no hay sesión, redirige a registrarse en lugar de ejecutar la acción.
 */
export function useContactGuard() {
  const { user } = useAuth();
  return useCallback(
    (action: () => void) => {
      if (!user) {
        router.push({ pathname: '/register', params: { reason: 'contact' } });
        return;
      }
      action();
    },
    [user],
  );
}
