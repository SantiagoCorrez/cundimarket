import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Palette } from '@/constants/theme';
import { AuthProvider } from '@/context/auth';

SplashScreen.preventAutoHideAsync();

// CundiMarket no implementa modo oscuro (igual que la web); forzamos el tema claro.
const AppTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Palette.background, card: Palette.surface, text: Palette.text },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={AppTheme}>
        <AnimatedSplashOverlay />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="register" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
