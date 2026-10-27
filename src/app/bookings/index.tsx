import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Surface, Switch, Text, useTheme } from 'react-native-paper';

import { SyncStatusBanner } from '@/components/sync-status-banner';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/pricing';
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
  const theme = useTheme();
  const [enabled, setEnabled] = useState(isSimulatingSyncFailure());
  return (
    <View style={styles.devRow}>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Simulate sync failure (dev)
      </Text>
      <Switch
        value={enabled}
        onValueChange={(value) => {
          setSimulateSyncFailure(value);
          setEnabled(value);
        }}
        accessibilityLabel="Simulate sync failure"
      />
    </View>
  );
}

export default function BookingsListScreen() {
  const theme = useTheme();
  const { user, logOut } = useAuth();
  const { data: bookings, isLoading } = useMyBookings();
  const locationName = useLocationName();

  if (!user) {
    // "Tap My Bookings + not logged in" → S3.
    return (
      <Surface style={[styles.container, styles.empty]} elevation={0}>
        <Text variant="bodyLarge">Log in to see your bookings.</Text>
        <Button
          mode="contained"
          onPress={() => router.push({ pathname: '/login', params: { mode: 'login' } })}
          accessibilityRole="button"
          accessibilityLabel="Log in"
          contentStyle={styles.buttonContent}
        >
          Log in or create account
        </Button>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container} elevation={0}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              mode="text"
              compact
              onPress={() => logOut()}
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              Log out
            </Button>
          ),
        }}
      />
      <View style={styles.bannerWrapper}>
        <SyncStatusBanner />
      </View>
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
              <Card mode="elevated" style={styles.row}>
                <Card.Content style={styles.rowContent}>
                  <Text variant="titleMedium" style={styles.bold}>
                    {locationName(item.pickupLocationId)} → {locationName(item.dropoffLocationId)}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.startDate.slice(0, 10)} – {item.endDate.slice(0, 10)} · {formatMoney(item.price.totalPrice)}
                  </Text>
                  <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                    {statusLabel(item)}
                  </Text>
                </Card.Content>
              </Card>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text variant="bodyLarge">No bookings yet.</Text>
            </View>
          ) : null
        }
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerWrapper: {
    paddingHorizontal: Spacing.three,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
    marginBottom: Spacing.two,
  },
  rowContent: {
    gap: Spacing.half,
  },
  bold: {
    fontWeight: '700',
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
    justifyContent: 'center',
    gap: Spacing.three,
  },
  buttonContent: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
});
