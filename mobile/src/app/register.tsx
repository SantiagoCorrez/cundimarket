import { Ionicons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import type { Role } from '@/api/types';
import { MunicipalityPicker } from '@/components/municipality-picker';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui';
import { MUNICIPALITIES, PILOT_MUNICIPALITY } from '@/constants/taxonomy';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { openLegal } from '@/utils/legal';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const params = useLocalSearchParams<{ reason?: string; municipality?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [municipality, setMunicipality] = useState(
    params.municipality && MUNICIPALITIES.includes(params.municipality) ? params.municipality : PILOT_MUNICIPALITY,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [role, setRole] = useState<Role>('CITIZEN');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Completa todos los campos. La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y el tratamiento de datos para continuar.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password, phone, role, municipality });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Palette.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={12}>
          <Ionicons name="close" size={24} color={Palette.text} />
        </Pressable>

        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Únete a CundiMarket para descubrir o publicar en tu municipio.</Text>

        {params.reason === 'contact' && (
          <View style={styles.notice}>
            <Ionicons name="lock-closed" size={18} color={Palette.brandStrong} />
            <Text style={styles.noticeText}>
              Para llamar o escribir por WhatsApp necesitas una cuenta. Solo las personas registradas pueden contactar a los comercios y
              prestadores.
            </Text>
          </View>
        )}

        <View style={styles.roleRow}>
          <RoleChip label="🛍️ Quiero descubrir" active={role === 'CITIZEN'} onPress={() => setRole('CITIZEN')} />
          <RoleChip label="🏪 Tengo un negocio" active={role === 'MERCHANT'} onPress={() => setRole('MERCHANT')} />
        </View>

        <View style={styles.form}>
          <TextInput value={name} onChangeText={setName} placeholder="Nombre completo" placeholderTextColor={Palette.textSecondary} style={styles.input} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            placeholderTextColor={Palette.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Celular (opcional)"
            placeholderTextColor={Palette.textSecondary}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Pressable style={styles.selectField} onPress={() => setPickerOpen(true)}>
            <Ionicons name="location" size={18} color={Palette.brandStrong} />
            <Text style={styles.selectText}>{municipality}</Text>
            {municipality !== PILOT_MUNICIPALITY && <Text style={styles.soonTag}>Próximamente</Text>}
            <Ionicons name="chevron-down" size={18} color={Palette.textSecondary} />
          </Pressable>

          <PasswordInput value={password} onChangeText={setPassword} placeholder="Contraseña (mínimo 6 caracteres)" />
          <PasswordInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repetir contraseña" />

          <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((v) => !v)}>
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.footerLink} onPress={() => openLegal('/terminos')}>
                términos y condiciones
              </Text>
              , las{' '}
              <Text style={styles.footerLink} onPress={() => openLegal('/contenido')}>
                normas de la comunidad
              </Text>{' '}
              y la{' '}
              <Text style={styles.footerLink} onPress={() => openLegal('/privacidad')}>
                política de privacidad
              </Text>
              , y autorizo el tratamiento de mis datos personales.
            </Text>
          </Pressable>

          {error && <Text style={styles.error}>{error}</Text>}
          <Button size="lg" onPress={onSubmit} disabled={loading}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <Link href="/login" replace>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </Link>
        </View>
      </ScrollView>

      <MunicipalityPicker
        visible={pickerOpen}
        current={municipality}
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => {
          setMunicipality(m);
          setPickerOpen(false);
        }}
        onConfirmSoon={(m) => {
          setMunicipality(m);
          setPickerOpen(false);
        }}
        soonConfirmLabel="Registrarme"
      />
    </KeyboardAvoidingView>
  );
}

function RoleChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.roleChip, active && styles.roleChipActive]}>
      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  closeButton: { alignSelf: 'flex-end', height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.backgroundElement },
  title: { fontSize: 26, fontWeight: '800', color: Palette.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: Palette.textSecondary, marginTop: 6 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 16, padding: 12, borderRadius: Radius.card - 6, backgroundColor: 'rgba(30,144,255,0.10)' },
  noticeText: { flex: 1, fontSize: 13, color: Palette.text, lineHeight: 18 },
  roleRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  roleChip: { flex: 1, paddingVertical: 12, borderRadius: Radius.card, alignItems: 'center', backgroundColor: Palette.surface, borderWidth: 1.5, borderColor: Palette.line },
  roleChipActive: { backgroundColor: Palette.brand, borderColor: Palette.brand },
  roleChipText: { fontSize: 13, fontWeight: '700', color: Palette.text },
  roleChipTextActive: { color: '#fff' },
  form: { marginTop: 20, gap: 12 },
  input: {
    height: 50,
    borderRadius: Radius.card,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.line,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Palette.text,
  },
  selectField: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.card,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.line,
    paddingHorizontal: 16,
  },
  selectText: { flex: 1, fontSize: 15, color: Palette.text },
  soonTag: { fontSize: 11.5, fontWeight: '700', color: Palette.textSecondary, backgroundColor: Palette.backgroundElement, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill, overflow: 'hidden' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  checkbox: { height: 22, width: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Palette.line, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: Palette.brand, borderColor: Palette.brand },
  termsText: { flex: 1, fontSize: 13, color: Palette.textSecondary, lineHeight: 18 },
  error: { color: Palette.danger, fontSize: 13, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Palette.textSecondary, fontSize: 14 },
  footerLink: { color: Palette.brandStrong, fontWeight: '700', fontSize: 14 },
});
