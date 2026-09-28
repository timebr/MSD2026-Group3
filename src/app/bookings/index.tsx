import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { SyncStatusBanner } from '@/components/sync-status-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBookings } from '@/hooks/use-bookings';
import type { Booking } from '@/models/booking';

function statusLabel(booking: Booking): string {
  if (booking.syncState === 'pending') return `${booking.status} · syncing…`;
  if (booking.syncState === 'failed') return `${booking.status} · sync failed`;
  return booking.status;
}

export default function BookingsListScreen() {
  const { data: bookings, isLoading } = useBookings();

  return (
    <ThemedView style={styles.container}>
      <SyncStatusBanner />
      <FlatList
        data={bookings}
        keyExtractor={(booking) => booking.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/bookings/[id]', params: { id: item.id } }} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel={`View booking ${item.id}`}>
              <ThemedView type="backgroundElement" style={styles.row}>
                <ThemedText type="smallBold">
                  {item.pickupLocation} → {item.dropoffLocation}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.startDate.slice(0, 10)} – {item.endDate.slice(0, 10)}
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
  empty: {
    padding: Spacing.four,
    alignItems: 'center',
  },
});
