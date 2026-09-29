import '@/global.css';
import { Platform } from 'react-native';
import { AppColors } from './colors';

export const Colors = AppColors;

export type ThemeColor = keyof typeof AppColors.light;

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
});

export const Typography = {
  xs: 11,     // Badges, captions, timestamps, meta counts
  sm: 13,     // Secondary text, sub-labels, category labels
  base: 14,   // Body text, form inputs, search bar
  md: 16,     // Item card titles, buttons, section headings
  lg: 18,     // Modal titles, dialog headings
  xl: 22,     // Screen main titles
} as const;

export const Spacing = {
  zero: 0,
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 16,
  full: 9999,
} as const;

export const Shadows = {
  subtle: Platform.select({
    ios: {
      shadowColor: '#183B4E',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: '0 1px 2px rgba(24, 59, 78, 0.04)',
    },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#183B4E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 4px rgba(24, 59, 78, 0.06)',
    },
    default: {},
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#183B4E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 4px rgba(24, 59, 78, 0.12)',
    },
    default: {},
  }),
  tag: Platform.select({
    ios: {
      shadowColor: '#183B4E',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: '0 1px 2px rgba(24, 59, 78, 0.04)',
    },
    default: {},
  }),
};

export const ScreenPadding = 20;
export const BottomTabInset = Platform.select({ ios: 20, android: 16, web: 0 }) ?? 0;
export const MaxContentWidth = 720;
