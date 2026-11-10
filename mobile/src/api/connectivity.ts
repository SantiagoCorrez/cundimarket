/**
 * Estado de conexión de la app, fuera de React para poder usarlo desde el cliente HTTP.
 *
 * "online" = el dispositivo tiene red (expo-network) Y el servidor respondió en la última petición.
 * Cuando se recupera la conexión se avisa a los suscriptores (reenviar cola) y se incrementa `tick`,
 * que las pantallas usan para volver a pedir sus datos.
 */
export type ConnectivitySnapshot = {
  deviceOnline: boolean;
  reachable: boolean;
  online: boolean;
  /** Se incrementa cada vez que vuelve la conexión. */
  tick: number;
  /** Acciones guardadas sin conexión que aún no se enviaron. */
  pending: number;
  /** true durante unos segundos después de recuperar la conexión. */
  recovered: boolean;
};

const state = { deviceOnline: true, reachable: true, tick: 0, pending: 0, recovered: false };

function build(): ConnectivitySnapshot {
  return { ...state, online: state.deviceOnline && state.reachable };
}

let snapshot = build();
const listeners = new Set<() => void>();
const recoverHandlers = new Set<() => void>();
let recoveredTimer: ReturnType<typeof setTimeout> | undefined;

function emit(wasOnline: boolean) {
  snapshot = build();
  const nowOnline = snapshot.online;
  if (!wasOnline && nowOnline) {
    state.tick += 1;
    state.recovered = true;
    snapshot = build();
    if (recoveredTimer) clearTimeout(recoveredTimer);
    recoveredTimer = setTimeout(() => {
      state.recovered = false;
      snapshot = build();
      listeners.forEach((l) => l());
    }, 3000);
    recoverHandlers.forEach((h) => h());
  } else if (wasOnline && !nowOnline) {
    state.recovered = false;
    snapshot = build();
  }
  listeners.forEach((l) => l());
}

export const connectivity = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => snapshot,
  /** Registra un callback que se ejecuta al pasar de sin conexión a con conexión. */
  onRecover(handler: () => void) {
    recoverHandlers.add(handler);
    return () => {
      recoverHandlers.delete(handler);
    };
  },
  setDeviceOnline(value: boolean) {
    if (state.deviceOnline === value) return;
    const was = snapshot.online;
    state.deviceOnline = value;
    emit(was);
  },
  /** El cliente HTTP informa si la última petición llegó al servidor. */
  reportRequest(ok: boolean) {
    if (state.reachable === ok) return;
    const was = snapshot.online;
    state.reachable = ok;
    emit(was);
  },
  setPending(count: number) {
    if (state.pending === count) return;
    state.pending = count;
    snapshot = build();
    listeners.forEach((l) => l());
  },
};
