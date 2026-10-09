import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { PasswordInput } from '@/components/password-input';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';

type Step = 'confirm' | 'done';

/**
 * Eliminación de cuenta dentro de la app (requisito de App Store 5.1.1(v)):
 * explica qué se borra, pide la contraseña como confirmación y termina con una pantalla de confirmación.
 */
export function DeleteAccountModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user, deleteAccount } = useAuth();
  const [step, setStep] = useState<Step>('confirm');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setStep('confirm');
    setPassword('');
    setError(null);
    setLoading(false);
  }

  function close() {
    onClose();
    reset();
  }

  async function onDelete() {
    setError(null);
    setLoading(true);
    try {
      await deleteAccount(password);
      // La sesión ya se cerró; el aviso final se muestra aunque desaparezca el perfil de fondo.
      setStep('done');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar la cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={step === 'done' ? close : loading ? undefined : close}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={step === 'confirm' && !loading ? close : undefined}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            {step === 'confirm' ? (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                <View style={styles.iconWrap}>
                  <Ionicons name="trash" size={26} color={Palette.danger} />
                </View>
                <Text style={styles.title}>Eliminar mi cuenta</Text>
                <Text style={styles.text}>
                  Se borrarán de forma <Text style={styles.bold}>definitiva</Text> tu cuenta
                  {user ? ` (${user.email})` : ''} y todo lo asociado:
                </Text>
                <View style={{ gap: 6 }}>
                  {[
                    'Tus datos personales (nombre, correo, teléfono y municipio).',
                    'Tus favoritos, calificaciones y reportes.',
                    'Tu perfil laboral y tus postulaciones guardadas.',
                    'Los negocios, inmuebles, servicios y vacantes que hayas publicado.',
                  ].map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={[styles.text, { flex: 1 }]}>{item}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.text}>Esta acción no se puede deshacer. Escribe tu contraseña para confirmar:</Text>
                <PasswordInput value={password} onChangeText={setPassword} placeholder="Tu contraseña" autoComplete="current-password" />
                {error && <Text style={styles.error}>{error}</Text>}
                <Pressable
                  style={[styles.danger, (!password || loading) && { opacity: 0.5 }]}
                  disabled={!password || loading}
                  onPress={onDelete}>
                  <Text style={styles.dangerText}>{loading ? 'Eliminando…' : 'Eliminar mi cuenta definitivamente'}</Text>
                </Pressable>
                <Pressable style={styles.cancel} onPress={close} disabled={loading}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
              </ScrollView>
            ) : (
              <View style={{ gap: 14, alignItems: 'center' }}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(31,170,89,0.12)' }]}>
                  <Ionicons name="checkmark-circle" size={30} color={Palette.success} />
                </View>
                <Text style={styles.title}>Tu cuenta fue eliminada</Text>
                <Text style={[styles.text, { textAlign: 'center' }]}>
                  Eliminamos tu cuenta y los datos asociados. Gracias por haber sido parte de CundiMarket; si quieres volver, siempre
                  podrás crear una cuenta nueva.
                </Text>
                <Pressable style={styles.primary} onPress={close}>
                  <Text style={styles.primaryText}>Entendido</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, maxHeight: '92%', backgroundColor: Palette.surface, borderRadius: Radius.card, padding: 20 },
  iconWrap: { alignSelf: 'center', height: 52, width: 52, borderRadius: 26, backgroundColor: 'rgba(226,59,59,0.12)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: Palette.text, textAlign: 'center' },
  text: { fontSize: 14, color: Palette.textSecondary, lineHeight: 20 },
  bold: { fontWeight: '800', color: Palette.text },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bullet: { fontSize: 14, color: Palette.textSecondary, lineHeight: 20 },
  error: { color: Palette.danger, fontSize: 13, fontWeight: '600' },
  danger: { height: 50, borderRadius: Radius.card, backgroundColor: Palette.danger, alignItems: 'center', justifyContent: 'center' },
  dangerText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancel: { height: 46, borderRadius: Radius.card, borderWidth: 1.5, borderColor: Palette.line, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: Palette.text, fontWeight: '700', fontSize: 14.5 },
  primary: { alignSelf: 'stretch', height: 50, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
