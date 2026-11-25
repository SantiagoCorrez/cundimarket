import { useEffect } from 'react';

import { useAuth } from '@/context/auth';
import { registerForPush, usePushNavigation } from '@/utils/push';

/**
 * Registra el dispositivo para push cuando hay sesión. Solo pide permiso a quienes publican
 * (son quienes reciben avisos de postulaciones); a los demás no se les interrumpe.
 */
export function PushManager() {
  const { user } = useAuth();
  const userId = user?.id;
  const publishes = user?.role === 'MERCHANT' || user?.role === 'ADMIN';

  useEffect(() => {
    if (userId) void registerForPush({ ask: publishes });
  }, [userId, publishes]);

  usePushNavigation(!!userId);
  return null;
}
