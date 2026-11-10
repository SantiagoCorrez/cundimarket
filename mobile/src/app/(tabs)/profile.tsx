import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/api/client';
import type { Business } from '@/api/types';
import { BusinessCard } from '@/components/cards';
import { DeleteAccountModal } from '@/components/delete-account-modal';
import { MunicipalityPicker } from '@/components/municipality-picker';
import { Button, Card, Logo } from '@/components/ui';
import { PILOT_MUNICIPALITY } from '@/constants/taxonomy';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useConnectivity } from '@/context/connectivity';
import { useApiQuery } from '@/hooks/use-api-query';
import { openLegal } from '@/utils/legal';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateMunicipality } = useAuth();
  const { pending } = useConnectivity();
  const { data: favoritesData, failed: favoritesFailed } = useApiQuery<{ favorites: Business[] }>(user ? '/api/mobile/favorites' : null);
  // Si no se pudo cargar y no hay copia guardada, se muestra la lista vacía.
  const favorites: Business[] | null = favoritesData?.favorites ?? (favoritesFailed ? [] : null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function saveMunicipality(municipality: string, notify: boolean) {
    setPickerOpen(false);
    try {
      await updateMunicipality(municipality);
      if (notify) Alert.alert('¡Listo!', `Te avisaremos cuando CundiMarket esté disponible en ${municipality}.`);
    } catch {
      Alert.alert('No se pudo guardar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  if (!user) {
    return (
      <>
        <View style={[styles.loggedOut, { paddingTop: insets.top }]}>
          <View style={styles.loggedOutIcon}>
            <Ionicons name="person" size={36} color={Palette.inkFaint} />
          </View>
          <Text style={styles.loggedOutTitle}>Tu cuenta</Text>
          <Text style={styles.loggedOutSubtitle}>
            Inicia sesión para guardar favoritos, calificar negocios y publicar.
          </Text>
          <View style={{ width: '100%', maxWidth: 320, marginTop: 24, gap: 10 }}>
            <Button size="lg" onPress={() => router.push('/login')}>
              Iniciar sesión
            </Button>
            <Button size="lg" variant="outline" onPress={() => router.push('/register')}>
              Crear cuenta
            </Button>
          </View>
          <Pressable onPress={() => openLegal('/politicas')} accessibilityRole="link" style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Términos y políticas</Text>
          </Pressable>
        </View>
        {/* Sigue montado tras eliminar la cuenta para poder mostrar la confirmación final. */}
        <DeleteAccountModal visible={deleteOpen} onClose={() => setDeleteOpen(false)} />
      </>
    );
  }

  const roleLabel = user.role === 'ADMIN' ? 'Administrador' : user.role === 'MERCHANT' ? '🏪 Tengo un negocio' : '🛍️ Quiero descubrir';

  return (
    <>
    <ScrollView style={{ flex: 1, backgroundColor: Palette.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <Logo name={user.name} size={64} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
          <Text style={styles.role}>
            📍 {user.municipality} · {roleLabel}
          </Text>
        </View>
      </View>

      <View style={styles.links}>
        {user.role === 'MERCHANT' && (
          <ProfileLink icon="storefront" label="Mi negocio" onPress={() => WebBrowser.openBrowserAsync(`${API_BASE_URL}/merchant`)} />
        )}
        {(user.role === 'MERCHANT' || user.role === 'ADMIN') && (
          <ProfileLink
            icon="clipboard"
            label="Mis vacantes y servicios"
            onPress={() => WebBrowser.openBrowserAsync(`${API_BASE_URL}/mis-publicaciones`)}
          />
        )}
        {user.role === 'ADMIN' && (
          <ProfileLink icon="shield-checkmark" label="Panel administrativo" onPress={() => WebBrowser.openBrowserAsync(`${API_BASE_URL}/admin`)} />
        )}
        <ProfileLink
          icon="location"
          label={user.municipality === PILOT_MUNICIPALITY ? `Municipio: ${user.municipality}` : `Municipio: ${user.municipality} (próximamente)`}
          onPress={() => setPickerOpen(true)}
        />
        <ProfileLink icon="briefcase" label="Mi perfil laboral" onPress={() => WebBrowser.openBrowserAsync(`${API_BASE_URL}/empleo/perfil`)} />
        <ProfileLink icon="document-text" label="Términos y políticas" onPress={() => openLegal('/politicas')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="heart" size={16} color={Palette.danger} /> Mis favoritos
        </Text>
        {favorites === null ? (
          <ActivityIndicator color={Palette.brand} style={{ marginTop: 12 }} />
        ) : favorites.length ? (
          <View style={{ gap: 10, marginTop: 10 }}>
            {favorites.map((b) => (
              <BusinessCard key={b.id} b={b} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Aún no tienes negocios favoritos.</Text>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Button
          variant="outline"
          style={{ borderColor: 'rgba(226,59,59,0.3)' }}
          onPress={() =>
            Alert.alert(
              'Cerrar sesión',
              pending > 0
                ? `Tienes ${pending} ${pending === 1 ? 'cambio sin enviar' : 'cambios sin enviar'} por falta de conexión. Si cierras sesión ahora se perderán. ¿Salir de todos modos?`
                : '¿Seguro que quieres salir de tu cuenta?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
              ],
            )
          }>
          <Ionicons name="log-out-outline" size={18} color={Palette.danger} />
          <Text style={{ color: Palette.danger, fontWeight: '700', fontSize: 15 }}>Cerrar sesión</Text>
        </Button>
        <Pressable style={styles.deleteLink} onPress={() => setDeleteOpen(true)} accessibilityRole="button">
          <Ionicons name="trash-outline" size={16} color={Palette.danger} />
          <Text style={styles.deleteLinkText}>Eliminar mi cuenta</Text>
        </Pressable>
      </View>

      <MunicipalityPicker
        visible={pickerOpen}
        current={user.municipality}
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => saveMunicipality(m, false)}
        onConfirmSoon={(m) => saveMunicipality(m, true)}
        soonConfirmLabel="Avisarme cuando esté disponible"
      />
    </ScrollView>
    <DeleteAccountModal visible={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}

function ProfileLink({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.linkCard}>
        <View style={styles.linkIcon}>
          <Ionicons name={icon} size={18} color={Palette.text} />
        </View>
        <Text style={styles.linkLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={Palette.inkFaint} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loggedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Palette.background },
  loggedOutIcon: { height: 80, width: 80, borderRadius: 40, backgroundColor: Palette.backgroundElement, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loggedOutTitle: { fontSize: 20, fontWeight: '800', color: Palette.text },
  loggedOutSubtitle: { fontSize: 14, color: Palette.textSecondary, textAlign: 'center', marginTop: 6, maxWidth: 280 },
  hero: { backgroundColor: Palette.ink, borderBottomLeftRadius: Radius.hero, borderBottomRightRadius: Radius.hero, paddingHorizontal: 20, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { color: '#fff', fontSize: 20, fontWeight: '800' },
  email: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
  role: { color: Palette.brand, fontSize: 12, fontWeight: '700', marginTop: 4 },
  links: { padding: 16, gap: 8 },
  legalLink: { marginTop: 28, paddingVertical: 8 },
  legalLinkText: { fontSize: 13, fontWeight: '600', color: Palette.textSecondary, textDecorationLine: 'underline' },
  deleteLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, marginTop: 6 },
  deleteLinkText: { color: Palette.danger, fontWeight: '600', fontSize: 14 },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  linkIcon: { height: 40, width: 40, borderRadius: Radius.card - 8, backgroundColor: Palette.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { flex: 1, fontWeight: '600', color: Palette.text, fontSize: 14.5 },
  section: { padding: 16, paddingTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Palette.text },
  emptyText: { fontSize: 13, color: Palette.textSecondary, marginTop: 8 },
});
