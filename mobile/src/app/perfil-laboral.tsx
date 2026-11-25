import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, api } from '@/api/client';
import { LoadError } from '@/components/load-error';
import { Button, EmptyState, ScreenHeader } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useApiQuery } from '@/hooks/use-api-query';

type Candidate = { experience: string; skills: string; education: string; hasCv: boolean };

const FIELDS = [
  { key: 'experience', label: 'Experiencia laboral', placeholder: 'Cuéntanos tu experiencia.', lines: 5, max: 4000 },
  { key: 'skills', label: 'Habilidades', placeholder: 'Ej: trabajo en equipo, manejo de caja', lines: 2, max: 1000 },
  { key: 'education', label: 'Formación académica', placeholder: 'Ej: Bachiller, Técnico…', lines: 2, max: 1000 },
] as const;

/** Perfil laboral del usuario: lo que ve el empleador cuando se postula a una vacante. */
export default function CandidateScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, failed, reload } = useApiQuery<{ candidate: Candidate }>(user ? '/api/mobile/candidate' : null);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Mi perfil laboral" />
      {!user ? (
        <View style={{ padding: 24, gap: 16 }}>
          <EmptyState icon="👤" title="Inicia sesión" subtitle="Así podrás crear tu perfil laboral y postularte." />
          <Button onPress={() => router.push('/login')}>Iniciar sesión</Button>
        </View>
      ) : data ? (
        <CandidateForm candidate={data.candidate} />
      ) : failed ? (
        <LoadError onRetry={reload} what="tu perfil laboral" />
      ) : (
        <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
      )}
    </View>
  );
}

function CandidateForm({ candidate }: { candidate: Candidate }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [values, setValues] = useState({ experience: candidate.experience, skills: candidate.skills, education: candidate.education });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.post('/api/mobile/candidate', values);
      // Refresca la copia guardada para que al volver a entrar se vea lo último.
      await api.get('/api/mobile/candidate').catch(() => undefined);
      Alert.alert('Perfil guardado', 'Los empleadores de las vacantes a las que te postules verán esta información.');
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof ApiError ? e.message : 'Inténtalo de nuevo en unos segundos.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.notice}>
          Solo lo ven los empleadores de las vacantes a las que te postulas, junto con tu nombre y tus datos de contacto ({user?.email}
          ).
        </Text>
        {FIELDS.map((f) => (
          <View key={f.key} style={{ gap: 6 }}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              value={values[f.key]}
              onChangeText={(text) => setValues((v) => ({ ...v, [f.key]: text }))}
              placeholder={f.placeholder}
              placeholderTextColor={Palette.textSecondary}
              multiline
              maxLength={f.max}
              accessibilityLabel={f.label}
              style={[styles.input, { minHeight: 24 * f.lines + 24 }]}
            />
          </View>
        ))}
        <Text style={styles.hint}>
          {candidate.hasCv ? 'Ya tienes una hoja de vida adjunta. ' : ''}Puedes adjuntar tu hoja de vida desde cundimarket.online, en Mi perfil
          laboral.
        </Text>
        <Button size="lg" onPress={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar perfil'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  notice: { fontSize: 13.5, color: Palette.text, lineHeight: 19, backgroundColor: 'rgba(30,144,255,0.1)', padding: 12, borderRadius: Radius.card - 6 },
  label: { fontSize: 14, fontWeight: '700', color: Palette.text },
  input: { borderRadius: Radius.card - 6, borderWidth: 1, borderColor: Palette.line, backgroundColor: Palette.surface, padding: 12, fontSize: 15, color: Palette.text, textAlignVertical: 'top' },
  hint: { fontSize: 12.5, color: Palette.inkFaint, lineHeight: 18 },
});
