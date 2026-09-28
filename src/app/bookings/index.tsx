import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch } from 'react-native';

import { SyncStatusBanner } from '@/components/sync-status-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useMyBookings } from '@/hooks/use-bookings';
import { useLocationName } from '@/hooks/use-cars';
import type { Booking } from '@/models/booking';
import { isSimulatingSyncFailure, setSimulateSyncFailure } from '@/offline/syncManager';

function statusLabel(booking: Booking): string {
  if (booking.syncState === 'pending') return `${booking.status} · waiting to sync`;
  if (booking.syncState === 'failed') return `${booking.status} · sync failed`;
  return booking.status;
}

/** Dev builds only: lets the team demo the failed-sync state (S6b) without a backend. */
function SimulateFailureToggle() {
  const [enabled, setEnabled] = useState(isSimulatingSyncFailure());
  return (
    <ThemedView style={styles.devRow}>
      <ThemedText type="small" themeColor="textSecondary">
        Simulate sync failure (dev)
      </ThemedText>
      <Switch
        value={enabled}
        onValueChange={(value) => {
          setSimulateSyncFailure(value);
          setEnabled(value);
        }}
        accessibilityLabel="Simulate sync failure"
      />
    </ThemedView>
  );
}

export default function BookingsListScreen() {
  const { user, logOut } = useAuth();
  const { data: bookings, isLoading } = useMyBookings();
  const locationName = useLocationName();

  if (!user) {
    // "Tap My Bookings + not logged in" → S3.
    return (
      <ThemedView style={[styles.container, styles.empty]}>
        <ThemedText>Log in to see your bookings.</ThemedText>
        <Pressable
          onPress={() => router.push({ pathname: '/login', params: { mode: 'login' } })}
          accessibilityRole="button"
          accessibilityLabel="Log in"
        >
          <ThemedView type="backgroundSelected" style={styles.button}>
            <ThemedText type="smallBold">Log in or create account</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => logOut()} accessibilityRole="button" accessibilityLabel="Log out">
              <ThemedText>Log out</ThemedText>
            </Pressable>
          ),
        }}
      />
      <SyncStatusBanner />
      <FlatList
        data={bookings}
        keyExtractor={(booking) => booking.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={__DEV__ ? <SimulateFailureToggle /> : null}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/bookings/[id]', params: { id: item.id } }} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View booking from ${item.startDate.slice(0, 10)}`}
            >
              <ThemedView type="backgroundElement" style={styles.row}>
                <ThemedText type="smallBold">
                  {locationName(item.pickupLocationId)} → {locationName(item.dropoffLocationId)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.startDate.slice(0, 10)} – {item.endDate.slice(0, 10)} · {item.price.totalPrice} DKK
                </ThemedText>
                <ThemedText type="small">{statusLabel(item)}</ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <ThemedView style={styles.empty}>
              <ThemedText>No bookings yet.</ThemedText>
            </ThemedView>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
    marginBottom: Spacing.two,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  empty: {
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  button: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
