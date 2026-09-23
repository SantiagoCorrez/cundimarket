import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Palette.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={12}>
          <Ionicons name="close" size={24} color={Palette.text} />
        </Pressable>

        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Entra para guardar favoritos, calificar y publicar en CundiMarket.</Text>

        <View style={styles.form}>
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
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={Palette.textSecondary}
            secureTextEntry
            style={styles.input}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button size="lg" onPress={onSubmit} disabled={loading || !email || !password}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <Link href="/register" replace>
            <Text style={styles.footerLink}>Regístrate</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  closeButton: { alignSelf: 'flex-end', height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.backgroundElement },
  title: { fontSize: 26, fontWeight: '800', color: Palette.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: Palette.textSecondary, marginTop: 6 },
  form: { marginTop: 28, gap: 12 },
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
  error: { color: Palette.danger, fontSize: 13, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Palette.textSecondary, fontSize: 14 },
  footerLink: { color: Palette.brandStrong, fontWeight: '700', fontSize: 14 },
});
