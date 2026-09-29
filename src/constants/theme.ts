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
  web: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    rounded: 'system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
});

export const Spacing = {
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
  xs: 3,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const Shadows = {
  tag: Platform.select({
    ios: {
      shadowColor: '#1A2E3B',
      shadowOffset: { width: 0, height: 1.5 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 1px 3px rgba(26, 46, 59, 0.06), 0 1px 2px rgba(26, 46, 59, 0.04)',
    },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#1A2E3B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 5,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: '0 2px 6px rgba(26, 46, 59, 0.07), 0 1px 2px rgba(26, 46, 59, 0.04)',
    },
    default: {},
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#1A2E3B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: '0 2px 6px rgba(26, 46, 59, 0.16)',
    },
    default: {},
  }),
};

export const BottomTabInset = Platform.select({ ios: 20, android: 16, web: 0 }) ?? 0;
export const MaxContentWidth = 720;
