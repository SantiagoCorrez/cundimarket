import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL, ApiError, api } from '@/api/client';
import { cacheRemove } from '@/api/offline-cache';
import { Palette, Radius } from '@/constants/theme';

/**
 * Panel "Tu publicación" para el dueño de una vacante, un servicio o un inmueble.
 * - Editar abre el formulario del sitio web (donde ya se publica) y al cerrarlo recarga los datos.
 * - Eliminar se hace en la app (con confirmación) y requiere conexión.
 */
export function OwnerActions({
  kind,
  id,
  title,
  onChanged,
  admin = false,
}: {
  kind: 'job' | 'service' | 'property';
  id: string;
  title: string;
  /** Se llama al volver del editor web para recargar la publicación. */
  onChanged: () => void;
  /** Un administrador gestionando una publicación (se muestra "Administrar publicación"). */
  admin?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const section = { job: 'empleo', service: 'servicios', property: 'espacios' }[kind];

  async function edit() {
    await WebBrowser.openBrowserAsync(`${API_BASE_URL}/${section}/${id}/editar`);
    onChanged();
  }

  function confirmDelete() {
    Alert.alert('Eliminar publicación', `¿Eliminar "${title}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: remove },
    ]);
  }

  async function remove() {
    setBusy(true);
    try {
      await api.delete(`/api/mobile/${section}/${id}`);
      await cacheRemove(`/api/mobile/${section}/${id}`);
      router.back();
    } catch (e) {
      Alert.alert('No se pudo eliminar', e instanceof ApiError ? e.message : 'Inténtalo de nuevo en unos segundos.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{admin ? 'Administrar publicación' : 'Tu publicación'}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={edit} accessibilityRole="button">
          <Ionicons name="create-outline" size={16} color={Palette.text} />
          <Text style={styles.buttonText}>Editar</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.danger, busy && { opacity: 0.5 }]}
          onPress={confirmDelete}
          disabled={busy}
          accessibilityRole="button">
          <Ionicons name="trash-outline" size={16} color={Palette.danger} />
          <Text style={[styles.buttonText, { color: Palette.danger }]}>{busy ? 'Eliminando…' : 'Eliminar'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 18, padding: 14, gap: 10, backgroundColor: Palette.surface, borderRadius: Radius.card, borderWidth: 1, borderColor: Palette.line },
  title: { fontSize: 14, fontWeight: '700', color: Palette.text },
  row: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, height: 44, borderRadius: Radius.card - 6, borderWidth: 1, borderColor: Palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Palette.surface },
  danger: { borderColor: 'rgba(226,59,59,0.3)' },
  buttonText: { fontSize: 14, fontWeight: '700', color: Palette.text },
});
