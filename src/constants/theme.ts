import '@/global.css';
import { Platform } from 'react-native';
import { AppColors } from './colors';

export const Colors = AppColors;

export type ThemeColor = keyof typeof AppColors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier New',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: 'Plus Jakarta Sans, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Newsreader, Georgia, "Times New Roman", serif',
    rounded: 'Plus Jakarta Sans, Inter, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
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
  lg: 19,     // Modal titles, dialog headings, card headers
  xl: 24,     // Screen masthead & main titles
  display: 28, // Hero masthead title
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
  xl: 18,
  full: 9999,
} as const;

export const Shadows = {
  subtle: Platform.select({
    ios: {
      shadowColor: '#1E3A2B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: '0 1px 3px rgba(30, 58, 43, 0.05)',
    },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#1E3A2B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 5,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 6px rgba(30, 58, 43, 0.06)',
    },
    default: {},
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#1E3A2B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 5px rgba(30, 58, 43, 0.14)',
    },
    default: {},
  }),
  tag: Platform.select({
    ios: {
      shadowColor: '#1E3A2B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: '0 1px 2px rgba(30, 58, 43, 0.04)',
    },
    default: {},
  }),
};

export const ScreenPadding = 20;
export const BottomTabInset = Platform.select({ ios: 20, android: 16, web: 0 }) ?? 0;
export const MaxContentWidth = 1140;
