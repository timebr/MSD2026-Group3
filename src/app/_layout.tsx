import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { asyncStoragePersister, queryClient } from '@/api/queryClient';
import { useAutoSync } from '@/offline/syncManager';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  // Kicks off a sync pass on launch and whenever connectivity returns (NFR2).
  useAutoSync();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Available cars' }} />
      <Stack.Screen name="car/[id]" options={{ title: 'Car details' }} />
      <Stack.Screen name="booking/[carId]" options={{ title: 'Book this car' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="bookings/index" options={{ title: 'My bookings' }} />
      <Stack.Screen name="bookings/[id]" options={{ title: 'Booking details' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
