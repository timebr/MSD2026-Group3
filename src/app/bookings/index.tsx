import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch } from 'react-native';

import { SyncStatusBanner } from '@/components/sync-status-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBookings } from '@/hooks/use-bookings';
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
  const { data: bookings, isLoading } = useBookings();
  const locationName = useLocationName();

  return (
    <ThemedView style={styles.container}>
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
  },
});
