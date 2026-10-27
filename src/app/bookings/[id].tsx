import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, HelperText, Surface, Text, useTheme } from 'react-native-paper';

import { CarUnavailableError } from '@/api/types';
import { DateField } from '@/components/date-field';
import { PriceSummary } from '@/components/price-summary';
import { Spacing } from '@/constants/theme';
import { calculatePrice } from '@/domain/pricing';
import { useBooking, useCancelBooking, useUpdateBooking } from '@/hooks/use-bookings';
import { useCar, useInsurance, useLocationName } from '@/hooks/use-cars';
import { useIsOnline } from '@/offline/connectivity';
import { requestSync } from '@/offline/syncManager';
import { bookingDatesSchema, type BookingDatesValues } from '@/validation/booking';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: booking, isLoading } = useBooking(id);
  const { data: car } = useCar(booking?.carId);
  const { data: insuranceOptions = [] } = useInsurance();
  const locationName = useLocationName();
  const isOnline = useIsOnline();
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingDatesValues>({
    resolver: zodResolver(bookingDatesSchema),
    defaultValues: { startDate: '', endDate: '' },
  });

  useEffect(() => {
    if (booking) {
      reset({ startDate: booking.startDate.slice(0, 10), endDate: booking.endDate.slice(0, 10) });
    }
  }, [booking, reset]);

  if (isLoading) {
    return (
      <Surface style={styles.center} elevation={0}>
        <ActivityIndicator />
        <Text variant="bodyMedium">Loading…</Text>
      </Surface>
    );
  }

  if (!booking) {
    return (
      <Surface style={styles.center} elevation={0}>
        <Text variant="bodyLarge">Booking not found.</Text>
      </Surface>
    );
  }

  const onSaveDates = async (dates: BookingDatesValues) => {
    if (!car) return;
    setSaveError(null);
    // New dates mean a new price; recalculated with the same rules as booking.
    const price = calculatePrice({
      car,
      insurance: insuranceOptions.find((option) => option.id === booking.insuranceId),
      startDate: dates.startDate,
      endDate: dates.endDate,
      pickupLocationId: booking.pickupLocationId,
      dropoffLocationId: booking.dropoffLocationId,
    });
    try {
      await updateBooking.mutateAsync({ id: booking.id, patch: { ...dates, price } });
      setEditing(false);
    } catch (error) {
      setSaveError(
        error instanceof CarUnavailableError
          ? 'The car is already booked for some of those dates.'
          : "Couldn't save the new dates. Please try again.",
      );
    }
  };

  const onCancel = () => {
    Alert.alert('Cancel booking', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep booking', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          await cancelBooking.mutateAsync(booking.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Surface style={styles.container} elevation={0}>
      <ScrollView contentContainerStyle={styles.content}>
        {car && (
          <Text variant="headlineSmall" style={styles.bold}>
            {car.brand} {car.model}
          </Text>
        )}

        <Card mode="contained" style={styles.section}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleSmall" style={styles.bold}>
              Status
            </Text>
            <Text variant="bodyMedium">
              {booking.status}
              {booking.syncState === 'pending' ? ' · waiting to sync' : ''}
              {booking.syncState === 'failed' ? ' · sync failed' : ''}
            </Text>
            {booking.syncState === 'failed' && isOnline && (
              <Button
                mode="text"
                compact
                onPress={() => requestSync()}
                accessibilityRole="button"
                accessibilityLabel="Retry sync"
                style={styles.retryButton}
              >
                Retry
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card mode="contained" style={styles.section}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleSmall" style={styles.bold}>
              Route
            </Text>
            <Text variant="bodyMedium">
              {locationName(booking.pickupLocationId)} → {locationName(booking.dropoffLocationId)}
            </Text>
          </Card.Content>
        </Card>

        <Card mode="contained" style={styles.section}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleSmall" style={styles.bold}>
              Dates
            </Text>
            {!editing ? (
              <Text variant="bodyMedium">
                {booking.startDate.slice(0, 10)} – {booking.endDate.slice(0, 10)}
              </Text>
            ) : (
              <View style={styles.editFields}>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DateField value={field.value} onChange={field.onChange} accessibilityLabel="Pick-up date" />
                  )}
                />
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DateField value={field.value} onChange={field.onChange} accessibilityLabel="Return date" />
                  )}
                />
              </View>
            )}
            {(errors.startDate || errors.endDate) && (
              <HelperText type="error" padding="none">
                {errors.startDate?.message || errors.endDate?.message}
              </HelperText>
            )}
            {saveError && (
              <HelperText type="error" padding="none">
                {saveError}
              </HelperText>
            )}
          </Card.Content>
        </Card>

        <PriceSummary price={booking.price} />

        {booking.status !== 'cancelled' && (
          <View style={styles.actions}>
            {editing ? (
              <Button
                mode="contained"
                onPress={handleSubmit(onSaveDates)}
                accessibilityRole="button"
                accessibilityLabel="Save dates"
                style={styles.actionButton}
              >
                Save dates
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => setEditing(true)}
                accessibilityRole="button"
                accessibilityLabel="Modify dates"
                style={styles.actionButton}
              >
                Modify dates
              </Button>
            )}

            <Button
              mode="outlined"
              textColor={theme.colors.error}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel booking"
              style={styles.actionButton}
            >
              Cancel booking
            </Button>
          </View>
        )}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    borderRadius: Spacing.three,
  },
  cardContent: {
    gap: Spacing.one,
  },
  bold: {
    fontWeight: '700',
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  editFields: {
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
