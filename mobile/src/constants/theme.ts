/**
 * Paleta de CundiMarket — replica los tokens de `app/globals.css` de la web
 * (azul cundinamarqués vibrante + negro tinta, tarjetas redondeadas).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0f1419',
    background: '#f3f4f6',
    backgroundElement: '#eef0f3',
    backgroundSelected: '#e6e8ec',
    textSecondary: '#5b6470',
    surface: '#ffffff',
    line: '#e6e8ec',
    inkFaint: '#9aa3af',
  },
  dark: {
    text: '#f3f4f6',
    background: '#0f1419',
    backgroundElement: '#1a2028',
    backgroundSelected: '#232a33',
    textSecondary: '#9aa3af',
    surface: '#161c24',
    line: '#232a33',
    inkFaint: '#6b7480',
  },
} as const;

/** Colores de marca, iguales en claro/oscuro (calcados de --color-brand en globals.css). */
export const Brand = {
  brand: '#1e90ff',
  brandStrong: '#1668d6',
  brandInk: '#0a1b2e',
  ink: '#0f1419',
  success: '#1faa59',
  warn: '#f0a500',
  danger: '#e23b3b',
  info: '#2f80ed',
  white: '#ffffff',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  card: 20,
  pill: 999,
  hero: 32,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Paleta plana (modo claro fijo) que usan las pantallas de CundiMarket.
 * El diseño web no implementa modo oscuro; replicamos el mismo criterio aquí.
 */
export const Palette = {
  ...Colors.light,
  ...Brand,
} as const;
