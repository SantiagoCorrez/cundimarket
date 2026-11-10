import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { useConnectivity } from '@/context/connectivity';

/** Estado de "no se pudo cargar": explica si es por falta de conexión y permite reintentar. */
export function LoadError({ onRetry, what = 'esta información' }: { onRetry: () => void; what?: string }) {
  const { online } = useConnectivity();

  return (
    <View style={styles.wrap}>
      <Ionicons name={online ? 'alert-circle-outline' : 'cloud-offline-outline'} size={44} color={Palette.inkFaint} />
      <Text style={styles.title}>{online ? 'No pudimos cargar esto' : 'Sin conexión'}</Text>
      <Text style={styles.text}>
        {online
          ? 'Algo salió mal. Inténtalo de nuevo en un momento.'
          : `Aún no tienes ${what} guardada en este dispositivo. Conéctate a internet para verla; después podrás consultarla sin conexión.`}
      </Text>
      <Button variant="outline" onPress={onRetry}>
        Reintentar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  title: { fontSize: 17, fontWeight: '800', color: Palette.text },
  text: { fontSize: 14, color: Palette.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
});
