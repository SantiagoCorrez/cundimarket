import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { EmergencyContact } from '@/api/types';
import { LoadError } from '@/components/load-error';
import { Card, ScreenHeader } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useApiQuery } from '@/hooks/use-api-query';
import { telUrl } from '@/utils/format';

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const { data, failed, reload } = useApiQuery<{ contacts: EmergencyContact[] }>('/api/mobile/emergency');
  const contacts = data?.contacts ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Canales de atención" />
      {contacts === null ? (
        failed ? (
          <LoadError onRetry={reload} what="la lista de canales de atención" />
        ) : (
          <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
        )
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}
          ListHeaderComponent={
            <Text style={styles.intro}>
              Toca un servicio para llamar directamente. Líneas de atención del municipio de Mosquera.
            </Text>
          }
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <View style={styles.icon}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
              <Pressable style={styles.callButton} onPress={() => Linking.openURL(telUrl(item.phone))}>
                <Ionicons name="call" size={16} color="#fff" />
                <Text style={styles.callText}>Llamar</Text>
              </Pressable>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13.5, color: Palette.textSecondary, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { height: 48, width: 48, borderRadius: Radius.card - 6, backgroundColor: 'rgba(226,59,59,0.12)', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14.5, fontWeight: '700', color: Palette.text },
  phone: { fontSize: 13, color: Palette.textSecondary, marginTop: 2 },
  callButton: { height: 40, paddingHorizontal: 14, borderRadius: Radius.card - 6, backgroundColor: Palette.ink, flexDirection: 'row', alignItems: 'center', gap: 6 },
  callText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
