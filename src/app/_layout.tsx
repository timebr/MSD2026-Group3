import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
// Since SDK 56, expo-router owns these re-exports of the React Navigation
// theming primitives; importing from @react-navigation/native is an error.
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { persistOptions, queryClient } from '@/api/queryClient';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useAutoSync } from '@/offline/syncManager';

SplashScreen.preventAutoHideAsync();

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

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
