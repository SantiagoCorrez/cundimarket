import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '@/api/client';
import { reportContent } from '@/api/offline-actions';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';

type TargetType = 'BUSINESS' | 'PROPERTY' | 'SERVICE' | 'JOB';

const REASONS = [
  'Información incorrecta',
  'Contenido inapropiado',
  'Publicación engañosa o fraudulenta',
  'Ya no existe o no está disponible',
];

/** Enlace "Reportar" para denunciar una publicación; el equipo lo revisa en el panel de administración. */
export function ReportButton({ targetType, targetId }: { targetType: TargetType; targetId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState('');
  const [status, setStatus] = useState<'form' | 'sending' | 'done'>('form');
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);

  function close() {
    setOpen(false);
    setStatus('form');
    setDetail('');
    setError(null);
    setQueued(false);
  }

  async function submit() {
    if (!user) return;
    setError(null);
    setStatus('sending');
    try {
      const { queued: wasQueued } = await reportContent(user.id, { targetType, targetId, reason, detail });
      setQueued(wasQueued);
      setStatus('done');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar el reporte.');
      setStatus('form');
    }
  }

  return (
    <>
      <Pressable
        onPress={() => (user ? setOpen(true) : router.push('/login'))}
        style={styles.link}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Reportar publicación">
        <Ionicons name="flag-outline" size={14} color={Palette.inkFaint} />
        <Text style={styles.linkText}>Reportar publicación</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.backdrop} onPress={close}>
            <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
              {status === 'done' ? (
                <View style={{ gap: 12, alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={44} color={Palette.success} />
                  <Text style={styles.title}>{queued ? 'Reporte guardado' : 'Reporte enviado'}</Text>
                  <Text style={styles.text}>
                    {queued
                      ? 'No tienes conexión ahora. Lo enviaremos automáticamente cuando vuelvas a conectarte.'
                      : 'Gracias por ayudarnos a mantener CundiMarket confiable. Revisaremos esta publicación.'}
                  </Text>
                  <Pressable style={styles.primary} onPress={close}>
                    <Text style={styles.primaryText}>Listo</Text>
                  </Pressable>
                </View>
              ) : (
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  <Text style={styles.title}>Reportar publicación</Text>
                  {REASONS.map((r) => (
                    <Pressable key={r} style={[styles.reason, reason === r && styles.reasonActive]} onPress={() => setReason(r)}>
                      <Ionicons name={reason === r ? 'radio-button-on' : 'radio-button-off'} size={20} color={reason === r ? Palette.brand : Palette.inkFaint} />
                      <Text style={styles.reasonText}>{r}</Text>
                    </Pressable>
                  ))}
                  <TextInput
                    value={detail}
                    onChangeText={setDetail}
                    placeholder="Detalles adicionales (opcional)"
                    placeholderTextColor={Palette.textSecondary}
                    multiline
                    maxLength={600}
                    style={styles.input}
                  />
                  {error && <Text style={styles.error}>{error}</Text>}
                  <Pressable style={[styles.danger, status === 'sending' && { opacity: 0.6 }]} onPress={submit} disabled={status === 'sending'}>
                    <Text style={styles.primaryText}>{status === 'sending' ? 'Enviando…' : 'Enviar reporte'}</Text>
                  </Pressable>
                </ScrollView>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center', paddingVertical: 10 },
  linkText: { fontSize: 12.5, color: Palette.inkFaint, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, maxHeight: '90%', backgroundColor: Palette.surface, borderRadius: Radius.card, padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: Palette.text, textAlign: 'center' },
  text: { fontSize: 14, color: Palette.textSecondary, lineHeight: 20, textAlign: 'center' },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: Radius.card - 6, borderWidth: 1, borderColor: Palette.line },
  reasonActive: { borderColor: Palette.brand, backgroundColor: 'rgba(30,144,255,0.06)' },
  reasonText: { flex: 1, fontSize: 14, color: Palette.text },
  input: { minHeight: 70, borderRadius: Radius.card - 6, borderWidth: 1, borderColor: Palette.line, padding: 12, fontSize: 14, color: Palette.text, textAlignVertical: 'top' },
  error: { color: Palette.danger, fontSize: 13, fontWeight: '600' },
  danger: { height: 48, borderRadius: Radius.card, backgroundColor: Palette.danger, alignItems: 'center', justifyContent: 'center' },
  primary: { alignSelf: 'stretch', height: 48, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
