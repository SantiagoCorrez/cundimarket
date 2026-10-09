import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COMING_SOON, MUNICIPALITIES, PILOT_MUNICIPALITY } from '@/constants/taxonomy';
import { Palette, Radius } from '@/constants/theme';

type Props = {
  visible: boolean;
  /** Municipio actualmente seleccionado (se marca en la lista). */
  current?: string;
  onClose: () => void;
  /** Se elige un municipio habilitado (hoy solo Mosquera). */
  onSelect: (municipality: string) => void;
  /** El usuario confirma un municipio que aún no está habilitado ("Próximamente"). */
  onConfirmSoon: (municipality: string) => void;
  /** Texto del botón principal del aviso "Próximamente" (p. ej. "Registrarme"). */
  soonConfirmLabel: string;
};

/**
 * Selector de municipio. Permite elegir cualquiera del listado; los que aún no están
 * habilitados muestran un aviso informativo de "Próximamente" (no un error) que no bloquea el registro.
 */
export function MunicipalityPicker({ visible, current, onClose, onSelect, onConfirmSoon, soonConfirmLabel }: Props) {
  const [pending, setPending] = useState<string | null>(null);

  function close() {
    setPending(null);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {pending ? (
            <View style={{ gap: 14 }}>
              <Text style={styles.soonTitle}>{COMING_SOON.title}</Text>
              <View style={styles.soonChip}>
                <Text style={styles.soonChipText}>{pending}</Text>
              </View>
              <Text style={styles.soonBody}>{COMING_SOON.body}</Text>
              <Pressable
                style={styles.primary}
                onPress={() => {
                  const municipality = pending;
                  setPending(null);
                  onConfirmSoon(municipality);
                }}>
                <Text style={styles.primaryText}>{soonConfirmLabel}</Text>
              </Pressable>
              <Pressable style={styles.secondary} onPress={() => setPending(null)}>
                <Text style={styles.secondaryText}>Elegir otro municipio</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Elige tu municipio</Text>
              <Text style={styles.subtitle}>
                Hoy CundiMarket está habilitado en {PILOT_MUNICIPALITY}. Los demás municipios llegarán pronto.
              </Text>
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {MUNICIPALITIES.map((m) => {
                  const enabled = m === PILOT_MUNICIPALITY;
                  return (
                    <Pressable
                      key={m}
                      style={styles.row}
                      onPress={() => {
                        if (enabled) {
                          onSelect(m);
                        } else {
                          setPending(m);
                        }
                      }}>
                      <Ionicons
                        name={m === current ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={m === current ? Palette.brand : Palette.inkFaint}
                      />
                      <Text style={styles.rowText}>{m}</Text>
                      <Text style={[styles.tag, enabled && styles.tagOn]}>{enabled ? 'Disponible' : 'Próximamente'}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, backgroundColor: Palette.surface, borderRadius: Radius.card, padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: Palette.text },
  subtitle: { fontSize: 13, color: Palette.textSecondary, marginTop: 4, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Palette.line },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: Palette.text },
  tag: { fontSize: 11.5, fontWeight: '700', color: Palette.textSecondary, backgroundColor: Palette.backgroundElement, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill, overflow: 'hidden' },
  tagOn: { color: Palette.success, backgroundColor: 'rgba(31,170,89,0.12)' },
  soonTitle: { fontSize: 19, fontWeight: '800', color: Palette.text, lineHeight: 25 },
  soonChip: { alignSelf: 'flex-start', backgroundColor: Palette.backgroundElement, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill },
  soonChipText: { fontSize: 13, fontWeight: '700', color: Palette.text },
  soonBody: { fontSize: 14, color: Palette.textSecondary, lineHeight: 21 },
  primary: { height: 50, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondary: { height: 46, borderRadius: Radius.card, borderWidth: 1.5, borderColor: Palette.line, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: Palette.text, fontWeight: '700', fontSize: 14.5 },
});
