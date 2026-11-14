import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { MunicipalityPicker } from '@/components/municipality-picker';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';

/**
 * Botón "📍 Municipio ▾" que abre el selector. Cambia el municipio elegido (perfil o visitante),
 * del que dependen las líneas de atención y las noticias.
 */
export function MunicipalityChip() {
  const { municipality, selectMunicipality } = useAuth();
  const [open, setOpen] = useState(false);

  async function choose(m: string) {
    setOpen(false);
    try {
      await selectMunicipality(m);
    } catch {
      Alert.alert('No se pudo cambiar el municipio', 'Revisa tu conexión e inténtalo de nuevo.');
    }
  }

  return (
    <>
      <Pressable style={styles.chip} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`Municipio: ${municipality}. Cambiar`}>
        <Ionicons name="location" size={15} color={Palette.brandStrong} />
        <Text style={styles.text} numberOfLines={1}>
          {municipality}
        </Text>
        <Ionicons name="chevron-down" size={14} color={Palette.textSecondary} />
      </Pressable>
      <MunicipalityPicker
        visible={open}
        current={municipality}
        onClose={() => setOpen(false)}
        onSelect={choose}
        onConfirmSoon={choose}
        soonConfirmLabel="Ver información de este municipio"
      />
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    height: 38,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  text: { fontSize: 14, fontWeight: '700', color: Palette.text, flexShrink: 1 },
});
