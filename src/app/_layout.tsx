import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
// Since SDK 56, expo-router owns these re-exports of the React Navigation
// theming primitives; importing from @react-navigation/native is an error.
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { type ComponentProps, useEffect } from 'react';
import { Text, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { persistOptions, queryClient } from '@/api/queryClient';
import { navigationDarkTheme, navigationLightTheme, paperDarkTheme, paperLightTheme } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useAutoSync } from '@/offline/syncManager';

SplashScreen.preventAutoHideAsync();

const ICON_GLYPHS: Record<string, string> = {
  check: '✓',
  'sort-ascending': '↑',
  'sort-descending': '↓',
  calendar: '📅',
  close: '✕',
  'close-circle': '✕',
};

const paperSettings: ComponentProps<typeof PaperProvider>['settings'] = {
  icon: ({ name, color, size, testID }) => (
    <Text
      selectable={false}
      testID={testID}
      style={{ color, fontSize: size * 0.8, lineHeight: size, textAlign: 'center' }}
    >
      {ICON_GLYPHS[String(name)] ?? '•'}
    </Text>
  ),
};

function AppShell() {
  // Kicks off a sync pass on launch and whenever connectivity returns (NFR2).
  useAutoSync();
  const { ready, user, isGuest } = useAuth();
  const hasEntered = user !== null || isGuest;

  // Keep the splash screen up until we know whether someone is logged in, so
  // the welcome screen doesn't flash for returning users.
  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      {/*
        The welcome screen (S3) and the rest of the app are guarded by who is
        using the app, so choosing "Continue as guest" or logging in only has to
        update useAuth() and the router moves to the right screen by itself.
      */}
      <Stack.Protected guard={!hasEntered}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={hasEntered}>
        <Stack.Screen name="index" options={{ title: 'Available cars' }} />
        <Stack.Screen name="car/[id]" options={{ title: 'Car details' }} />
        <Stack.Screen name="booking/[carId]" options={{ title: 'Book this car' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="bookings/index" options={{ title: 'My bookings' }} />
        <Stack.Screen name="bookings/[id]" options={{ title: 'Booking details' }} />
      </Stack.Protected>
      <Stack.Screen name="login" options={{ title: 'Account' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <SafeAreaProvider>
        <PaperProvider theme={isDark ? paperDarkTheme : paperLightTheme} settings={paperSettings}>
          <ThemeProvider value={isDark ? navigationDarkTheme : navigationLightTheme}>
            <AuthProvider>
              <AppShell />
            </AuthProvider>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
