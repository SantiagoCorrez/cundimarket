import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import type { Role } from '@/api/types';
import { MunicipalityPicker } from '@/components/municipality-picker';
import { PILOT_MUNICIPALITY, USER_TYPES } from '@/constants/taxonomy';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { AppleAuthentication, AppleSignInError, appleSignInAvailable, getAppleCredentials } from '@/utils/apple-signin';
import { GoogleSignInError, getGoogleIdToken, googleSignInAvailable } from '@/utils/google-signin';
import { openLegal } from '@/utils/legal';

type Provider = 'google' | 'apple';

/**
 * Botones "Continuar con Apple" (solo iOS) y "Continuar con Google" para iniciar sesión o crear cuenta.
 * Si la cuenta es nueva, pide el tipo de perfil, el municipio y la aceptación de los términos antes de
 * crearla. Cada botón se oculta si el proveedor no está disponible o configurado; si no hay ninguno,
 * no se muestra nada (tampoco el separador).
 */
export function SocialSignIn({ onSuccess }: { onSuccess: () => void }) {
  const { loginWithSocial, municipality: selectedMunicipality } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signup, setSignup] = useState<{ provider: Provider; credentials: Record<string, unknown>; email: string } | null>(null);
  const [role, setRole] = useState<Role>('CITIZEN');
  const [municipality, setMunicipality] = useState(selectedMunicipality || PILOT_MUNICIPALITY);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [terms, setTerms] = useState(false);

  useEffect(() => {
    let active = true;
    appleSignInAvailable().then((ok) => active && setAppleAvailable(ok));
    return () => {
      active = false;
    };
  }, []);

  if (!appleAvailable && !googleSignInAvailable) return null;

  async function start(provider: Provider) {
    setError(null);
    setBusy(provider);
    try {
      let credentials: Record<string, unknown> | null;
      if (provider === 'apple') {
        credentials = await getAppleCredentials();
      } else {
        const idToken = await getGoogleIdToken();
        credentials = idToken ? { idToken } : null;
      }
      if (!credentials) return; // canceló
      const result = await loginWithSocial(provider, credentials);
      if (result?.needsSignup) setSignup({ provider, credentials, email: result.email });
      else onSuccess();
    } catch (e) {
      const known = e instanceof GoogleSignInError || e instanceof AppleSignInError || e instanceof ApiError;
      setError(known ? (e as Error).message : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setBusy(null);
    }
  }

  async function finish() {
    if (!signup) return;
    if (!terms) {
      setError('Debes aceptar los términos y el tratamiento de datos para continuar.');
      return;
    }
    setError(null);
    setBusy(signup.provider);
    try {
      await loginWithSocial(signup.provider, signup.credentials, { role, municipality, acceptTerms: true });
      setSignup(null);
      onSuccess();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.dividerLine} />
      </View>
      {appleAvailable && AppleAuthentication && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={Radius.card}
          style={[styles.appleButton, busy !== null && { opacity: 0.6 }]}
          onPress={() => busy === null && start('apple')}
        />
      )}
      {googleSignInAvailable && (
        <Pressable style={[styles.button, busy !== null && { opacity: 0.6 }]} onPress={() => start('google')} disabled={busy !== null} accessibilityRole="button">
          {busy === 'google' && !signup ? <ActivityIndicator color={Palette.text} /> : <Ionicons name="logo-google" size={18} color="#4285F4" />}
          <Text style={styles.buttonText}>Continuar con Google</Text>
        </Pressable>
      )}
      {error && !signup && <Text style={styles.error}>{error}</Text>}

      <Modal visible={!!signup} transparent animationType="fade" onRequestClose={() => busy === null && setSignup(null)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Completa tu registro</Text>
              <Text style={styles.text}>
                Crearemos tu cuenta con <Text style={styles.bold}>{signup?.email}</Text>.
              </Text>

              <View style={styles.roleRow}>
                {(['CITIZEN', 'MERCHANT'] as const).map((r) => (
                  <Pressable key={r} style={[styles.role, role === r && styles.roleActive]} onPress={() => setRole(r)}>
                    <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                      {USER_TYPES[r].emoji} {USER_TYPES[r].label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
                <Ionicons name="location" size={18} color={Palette.brandStrong} />
                <Text style={styles.selectText}>{municipality}</Text>
                {municipality !== PILOT_MUNICIPALITY && <Text style={styles.soon}>Próximamente</Text>}
                <Ionicons name="chevron-down" size={18} color={Palette.textSecondary} />
              </Pressable>

              <Pressable style={styles.termsRow} onPress={() => setTerms((v) => !v)}>
                <View style={[styles.checkbox, terms && styles.checkboxOn]}>
                  {terms && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={styles.termsText}>
                  Acepto los{' '}
                  <Text style={styles.link} onPress={() => openLegal('/terminos')}>términos y condiciones</Text>, las{' '}
                  <Text style={styles.link} onPress={() => openLegal('/contenido')}>normas de la comunidad</Text> y la{' '}
                  <Text style={styles.link} onPress={() => openLegal('/privacidad')}>política de privacidad</Text>, y autorizo el
                  tratamiento de mis datos personales.
                </Text>
              </Pressable>

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable style={[styles.primary, busy !== null && { opacity: 0.6 }]} onPress={finish} disabled={busy !== null}>
                <Text style={styles.primaryText}>{busy ? 'Creando cuenta…' : 'Crear cuenta'}</Text>
              </Pressable>
              <Pressable style={styles.cancel} onPress={() => setSignup(null)} disabled={busy !== null}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
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
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Palette.line },
  dividerText: { fontSize: 12, color: Palette.inkFaint },
  appleButton: { width: '100%', height: 50 },
  button: {
    height: 50,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Palette.line,
    backgroundColor: Palette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: { fontSize: 15, fontWeight: '700', color: Palette.text },
  error: { color: Palette.danger, fontSize: 13, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, maxHeight: '92%', backgroundColor: Palette.surface, borderRadius: Radius.card, padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: Palette.text },
  text: { fontSize: 14, color: Palette.textSecondary, lineHeight: 20 },
  bold: { fontWeight: '700', color: Palette.text },
  roleRow: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: Radius.card, backgroundColor: Palette.backgroundElement },
  role: { flex: 1, height: 44, borderRadius: Radius.card - 6, alignItems: 'center', justifyContent: 'center' },
  roleActive: { backgroundColor: Palette.brand },
  roleText: { fontSize: 13, fontWeight: '700', color: Palette.textSecondary },
  roleTextActive: { color: Palette.brandInk },
  select: { height: 50, borderRadius: Radius.card, borderWidth: 1, borderColor: Palette.line, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  selectText: { flex: 1, fontSize: 15, color: Palette.text, fontWeight: '600' },
  soon: { fontSize: 11, fontWeight: '700', color: Palette.textSecondary, backgroundColor: Palette.backgroundElement, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, overflow: 'hidden' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { height: 22, width: 22, borderRadius: 6, borderWidth: 2, borderColor: Palette.line, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: Palette.brandStrong, borderColor: Palette.brandStrong },
  termsText: { flex: 1, fontSize: 13, color: Palette.textSecondary, lineHeight: 19 },
  link: { color: Palette.text, fontWeight: '700', textDecorationLine: 'underline' },
  primary: { height: 50, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: Palette.brandInk, fontWeight: '800', fontSize: 15 },
  cancel: { height: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: Palette.textSecondary, fontWeight: '700', fontSize: 14 },
});
