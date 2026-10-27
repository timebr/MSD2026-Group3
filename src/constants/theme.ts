/**
 * Below are the colors and Material Design 3 themes (React Native Paper) used in the app.
 */

import '@/global.css';

import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from 'expo-router';
import { Platform } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const Colors = {
  light: {
    text: '#191C20',
    background: '#F8F9FF',
    backgroundElement: '#ECEEF4',
    backgroundSelected: '#005AC1',
    textSecondary: '#44474F',
  },
  dark: {
    text: '#E2E2E9',
    background: '#111318',
    backgroundElement: '#1D2024',
    backgroundSelected: '#2563EB',
    textSecondary: '#C4C6D0',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#005AC1',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D8E2FF',
    onPrimaryContainer: '#001A41',
    secondary: '#005AC1',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#005AC1',
    onSecondaryContainer: '#FFFFFF',
    tertiary: '#006874',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#97F0FF',
    onTertiaryContainer: '#001F24',
    background: Colors.light.background,
    onBackground: Colors.light.text,
    surface: '#FFFFFF',
    onSurface: Colors.light.text,
    surfaceVariant: Colors.light.backgroundElement,
    onSurfaceVariant: Colors.light.textSecondary,
    outline: '#74777F',
    outlineVariant: '#C4C6D0',
  },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    onPrimary: '#001A41',
    primaryContainer: '#1D4ED8',
    onPrimaryContainer: '#FFFFFF',
    secondary: '#60A5FA',
    onSecondary: '#001A41',
    secondaryContainer: '#2563EB',
    onSecondaryContainer: '#FFFFFF',
    tertiary: '#4FD8EB',
    onTertiary: '#00363D',
    tertiaryContainer: '#004F58',
    onTertiaryContainer: '#97F0FF',
    background: Colors.dark.background,
    onBackground: Colors.dark.text,
    surface: '#191C20',
    onSurface: Colors.dark.text,
    surfaceVariant: Colors.dark.backgroundElement,
    onSurfaceVariant: Colors.dark.textSecondary,
    outline: '#8E9099',
    outlineVariant: '#44474F',
  },
};

export const navigationLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: paperLightTheme.colors.primary,
    background: paperLightTheme.colors.background,
    card: paperLightTheme.colors.surface,
    text: paperLightTheme.colors.onSurface,
    border: paperLightTheme.colors.outlineVariant,
  },
};

export const navigationDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: paperDarkTheme.colors.primary,
    background: paperDarkTheme.colors.background,
    card: paperDarkTheme.colors.surface,
    text: paperDarkTheme.colors.onSurface,
    border: paperDarkTheme.colors.outlineVariant,
  },
};

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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
