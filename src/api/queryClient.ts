import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient, type Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { AppState, Platform } from 'react-native';

import { bookingKeys } from '@/api/queryKeys';

const DAY_MS = 24 * 60 * 60 * 1000;

// React Native has no browser `online`/`focus` events, so TanStack Query
// has to be told about connectivity and app foregrounding explicitly.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  }),
);

if (Platform.OS !== 'web') {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (status) => handleFocus(status === 'active'));
    return () => subscription.remove();
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Catalog refreshes after 5 minutes, on app foreground and on reconnect.
      staleTime: 5 * 60 * 1000,
      // Must be at least the persister's maxAge, otherwise restored entries
      // are garbage-collected straight away.
      gcTime: DAY_MS,
      retry: 2,
      // Try once even when offline (the data may be local), then pause retries
      // until the connection is back instead of failing.
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Booking writes are local-first and must never wait for the network.
      networkMode: 'always',
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'msd2026-group3-query-cache',
});

function isBookingQuery(query: Query): boolean {
  return query.queryKey[0] === bookingKeys.all[0];
}

// Cached query results survive app restarts, so already-fetched cars stay
// browsable offline (NFR1).
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  maxAge: DAY_MS,
  // Bump whenever the shape of cached data changes (e.g. a field on Car), so
  // old-shaped data from a previous app version isn't restored. Bookings
  // aren't in this cache; their shape is versioned by STORAGE_KEY in
  // src/api/local/bookingRepository.ts instead.
  buster: 'v3',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.state.status === 'success' && !isBookingQuery(query),
  },
};
