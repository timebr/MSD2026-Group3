import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { CarUnavailableError } from '@/api/types';
import { Button } from '@/components/button';
import { DateField } from '@/components/date-field';
import { PriceSummary } from '@/components/price-summary';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { calculatePrice } from '@/domain/pricing';
import { useBooking, useCancelBooking, useUpdateBooking } from '@/hooks/use-bookings';
import { useCar, useInsurance, useLocationName } from '@/hooks/use-cars';
import { useIsOnline } from '@/offline/connectivity';
import { requestSync } from '@/offline/syncManager';
import { bookingDatesSchema, type BookingDatesValues } from '@/validation/booking';

/** S7 Booking management: view status, modify dates, or cancel a booking. */
export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      <ThemedView style={styles.center}>
        <ThemedText>Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (!booking) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Booking not found.</ThemedText>
      </ThemedView>
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
    <ScrollView contentContainerStyle={styles.content}>
      {car && (
        <ThemedText type="title">
          {car.brand} {car.model}
        </ThemedText>
      )}

      <ThemedView type="surface" style={styles.section}>
        <ThemedText type="smallBold">Status</ThemedText>
        <StatusBadge
          status={booking.syncState}
          label={`${booking.status}${
            booking.syncState === 'pending'
              ? ' · waiting to sync'
              : booking.syncState === 'failed'
                ? ' · sync failed'
                : ''
          }`}
        />
        {booking.syncState === 'failed' && isOnline && (
          <Button
            label="Retry"
            variant="secondary"
            onPress={() => requestSync()}
            accessibilityLabel="Retry sync"
            style={styles.inlineButton}
          />
        )}
      </ThemedView>

      <ThemedView type="surface" style={styles.section}>
        <ThemedText type="smallBold">Route</ThemedText>
        <ThemedText type="small">
          {locationName(booking.pickupLocationId)} → {locationName(booking.dropoffLocationId)}
        </ThemedText>
      </ThemedView>

      <ThemedView type="surface" style={styles.section}>
        <ThemedText type="smallBold">Dates</ThemedText>
        {!editing ? (
          <ThemedText type="small">
            {booking.startDate.slice(0, 10)} – {booking.endDate.slice(0, 10)}
          </ThemedText>
        ) : (
          <ThemedView style={styles.editFields}>
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
          </ThemedView>
        )}
        {(errors.startDate || errors.endDate) && (
          <ThemedText type="small" themeColor="error">
            {errors.startDate?.message || errors.endDate?.message}
          </ThemedText>
        )}
        {saveError && (
          <ThemedText type="small" themeColor="error">
            {saveError}
          </ThemedText>
        )}
      </ThemedView>

      <PriceSummary price={booking.price} />

      {booking.status !== 'cancelled' && (
        <ThemedView style={styles.actions}>
          {editing ? (
            <Button
              label="Save dates"
              variant="primary"
              onPress={handleSubmit(onSaveDates)}
              style={styles.actionButton}
            />
          ) : (
            <Button
              label="Modify dates"
              variant="primary"
              onPress={() => setEditing(true)}
              style={styles.actionButton}
            />
          )}

          <Button label="Cancel booking" variant="danger" onPress={onCancel} style={styles.actionButton} />
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
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
  inlineButton: {
    alignSelf: 'flex-start',
  },
});
