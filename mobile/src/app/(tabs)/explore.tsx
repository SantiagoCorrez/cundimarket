import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';

const MODULES = [
  { key: 'comercios', title: 'Comercios', subtitle: 'Restaurantes, tiendas, salud, tecnología y más', icon: '🏪', href: '/comercios' as const },
  { key: 'espacios', title: 'CundiEspacios', subtitle: 'Arriendo, venta y permuta de inmuebles', icon: '🏠', href: '/espacios' as const },
  { key: 'servicios', title: 'CundiServicios', subtitle: 'Prestadores de servicios verificados', icon: '🛠️', href: '/servicios' as const },
  { key: 'empleo', title: 'CundiEmpleo', subtitle: 'Vacantes en tu municipio', icon: '💼', href: '/empleo' as const },
  { key: 'emergency', title: 'Canales de atención', subtitle: 'Líneas de emergencia municipales', icon: '🚨', href: '/emergency' as const },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Palette.background }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, gap: 12 }}>
      <Text style={styles.title}>Explorar</Text>
      <Text style={styles.subtitle}>Todos los módulos de CundiMarket en un solo lugar.</Text>
      {MODULES.map((m) => (
        <Pressable key={m.key} onPress={() => router.push(m.href)}>
          <Card style={styles.moduleCard}>
            <View style={styles.moduleIcon}>
              <Text style={{ fontSize: 26 }}>{m.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>{m.title}</Text>
              <Text style={styles.moduleSubtitle}>{m.subtitle}</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: Palette.text },
  subtitle: { fontSize: 14, color: Palette.textSecondary, marginBottom: 4 },
  moduleCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moduleIcon: {
    height: 52,
    width: 52,
    borderRadius: Radius.card - 6,
    backgroundColor: Palette.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitle: { fontSize: 16, fontWeight: '700', color: Palette.text },
  moduleSubtitle: { fontSize: 12.5, color: Palette.textSecondary, marginTop: 2 },
});
