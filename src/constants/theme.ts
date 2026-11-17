/**
 * High-contrast colour roles for the app (design doc 5.1, teacher feedback FE#6).
 * Every colour used in the app comes from this table — never hard-code a hex
 * value outside this file.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#EDEEF1',
    text: '#0B0B0F',
    textSecondary: '#3A3E45',
    primary: '#0040A8',
    onPrimary: '#FFFFFF',
    border: '#5A5F68',
    error: '#B3261E',
    success: '#146C2E',
    warning: '#7A4F00',
    warningBackground: '#FFF4D6',
  },
  dark: {
    background: '#000000',
    surface: '#1C1D20',
    text: '#FFFFFF',
    textSecondary: '#D2D5DA',
    primary: '#9EC1FF',
    onPrimary: '#000000',
    border: '#9AA0A8',
    error: '#FF9C94',
    success: '#7EE2A0',
    warning: '#FFD27A',
    warningBackground: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

/** Minimum touch target size, WCAG 2.5.8 (teacher feedback, FE#6). */
export const MinTouchSize = 48;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
