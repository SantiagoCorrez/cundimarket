import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ConnectivityFrame } from '@/components/connectivity-frame';
import { Palette } from '@/constants/theme';
import { AuthProvider } from '@/context/auth';
import { ConnectivityProvider } from '@/context/connectivity';

// CundiMarket no implementa modo oscuro (igual que la web); forzamos el tema claro.
const AppTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Palette.background, card: Palette.surface, text: Palette.text },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ConnectivityProvider>
        <ThemeProvider value={AppTheme}>
          <StatusBar style="dark" />
          <ConnectivityFrame>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.background } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" options={{ presentation: 'modal' }} />
              <Stack.Screen name="register" options={{ presentation: 'modal' }} />
            </Stack>
          </ConnectivityFrame>
        </ThemeProvider>
      </ConnectivityProvider>
    </AuthProvider>
  );
}
